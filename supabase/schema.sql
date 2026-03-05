CREATE TABLE api_keys (id uuid NOT NULL, user_id uuid NOT NULL, key text NOT NULL, name text NOT NULL, prefix text NOT NULL, is_active boolean, rate_limit integer, requests_used integer, last_reset_at timestamp with time zone, created_at timestamp with time zone, updated_at timestamp with time zone);
CREATE TABLE daily_usage (api_key_id uuid NOT NULL, created_at timestamp with time zone, error_count integer, success_count integer, tokens_used integer, requests_count integer, date date NOT NULL, user_id uuid NOT NULL, id uuid NOT NULL);
CREATE TABLE promo_codes (duration_days integer NOT NULL, id uuid NOT NULL, code text NOT NULL, plan_type text NOT NULL, max_uses integer, used_count integer, is_active boolean, created_by uuid, created_at timestamp with time zone, updated_at timestamp with time zone);
CREATE TABLE promo_redemptions (expires_at timestamp with time zone NOT NULL, promo_code_id uuid NOT NULL, id uuid NOT NULL, redeemed_at timestamp with time zone, user_id uuid NOT NULL);
CREATE TABLE request_logs (model text NOT NULL, api_key_id uuid NOT NULL, id uuid NOT NULL, user_agent text, created_at timestamp with time zone, ip_address text, error_message text, tokens_used integer, latency_ms integer, status integer NOT NULL, endpoint text NOT NULL, user_id uuid NOT NULL);
CREATE TABLE user_settings (plan_expires_at timestamp with time zone, is_admin boolean, created_at timestamp with time zone, updated_at timestamp with time zone, plan text, email_notifications boolean, theme text, user_id uuid NOT NULL, id uuid NOT NULL);
CREATE OR REPLACE FUNCTION public.check_expired_plans()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
                                                                                                                                                                                        BEGIN
                                                                                                                                                                                          UPDATE user_settings
                                                                                                                                                                                            SET 
                                                                                                                                                                                                plan = 'free',
                                                                                                                                                                                                    plan_expires_at = NULL
                                                                                                                                                                                                      WHERE 
                                                                                                                                                                                                          plan IN ('pro', 'enterprise')
                                                                                                                                                                                                              AND plan_expires_at IS NOT NULL
                                                                                                                                                                                                                  AND plan_expires_at < NOW();

                                                                                                                                                                                                                    UPDATE api_keys
                                                                                                                                                                                                                      SET 
                                                                                                                                                                                                                          rate_limit = 100,
                                                                                                                                                                                                                              requests_used = 0
                                                                                                                                                                                                                                WHERE user_id IN (
                                                                                                                                                                                                                                    SELECT user_id 
                                                                                                                                                                                                                                        FROM user_settings 
                                                                                                                                                                                                                                            WHERE plan = 'free'
                                                                                                                                                                                                                                              );
                                                                                                                                                                                                                                              END;
                                                                                                                                                                                                                                              $function$


CREATE OR REPLACE FUNCTION public.create_user_settings()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
                                                                                                                                                                                                                                              BEGIN
                                                                                                                                                                                                                                                INSERT INTO public.user_settings (user_id)
                                                                                                                                                                                                                                                  VALUES (NEW.id);
                                                                                                                                                                                                                                                    RETURN NEW;
                                                                                                                                                                                                                                                    EXCEPTION WHEN OTHERS THEN
                                                                                                                                                                                                                                                      RAISE WARNING 'Failed to create user settings: %', SQLERRM;
                                                                                                                                                                                                                                                        RETURN NEW;
                                                                                                                                                                                                                                                        END;
                                                                                                                                                                                                                                                        $function$


CREATE OR REPLACE FUNCTION public.get_user_rate_limit(p_user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
                                                                                                                                                                DECLARE
                                                                                                                                                                  v_plan TEXT;
                                                                                                                                                                  BEGIN
                                                                                                                                                                    SELECT plan INTO v_plan
                                                                                                                                                                      FROM user_settings
                                                                                                                                                                        WHERE user_id = p_user_id;

                                                                                                                                                                          RETURN CASE v_plan
                                                                                                                                                                              WHEN 'enterprise' THEN 800
                                                                                                                                                                                  WHEN 'pro' THEN 400
                                                                                                                                                                                      ELSE 100
                                                                                                                                                                                        END;
                                                                                                                                                                                        END;
                                                                                                                                                                                        $function$


CREATE OR REPLACE FUNCTION public.increment_request_count(api_key_text text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
                                                                                                                                                          BEGIN
                                                                                                                                                            UPDATE api_keys
                                                                                                                                                              SET requests_used = requests_used + 1
                                                                                                                                                                WHERE key = api_key_text AND is_active = true;
                                                                                                                                                                END;
                                                                                                                                                                $function$


CREATE OR REPLACE FUNCTION public.reset_rate_limits()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
                                                                                                                                              BEGIN
                                                                                                                                                UPDATE api_keys
                                                                                                                                                  SET requests_used = 0,
                                                                                                                                                        last_reset_at = NOW()
                                                                                                                                                          WHERE last_reset_at < NOW() - INTERVAL '24 hours';
                                                                                                                                                          END;
                                                                                                                                                          $function$


CREATE OR REPLACE FUNCTION public.sync_api_key_rate_limits()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
                                                                                                                                                                                        BEGIN
                                                                                                                                                                                          UPDATE api_keys
                                                                                                                                                                                            SET rate_limit = CASE 
                                                                                                                                                                                                WHEN us.plan = 'enterprise' THEN 4000
                                                                                                                                                                                                    WHEN us.plan = 'pro' THEN 1400
                                                                                                                                                                                                        ELSE 400
                                                                                                                                                                                                          END,
                                                                                                                                                                                                            requests_used = 0
                                                                                                                                                                                                              FROM user_settings us
                                                                                                                                                                                                                WHERE api_keys.user_id = us.user_id;
                                                                                                                                                                                                                END;
                                                                                                                                                                                                                $function$


CREATE OR REPLACE FUNCTION public.sync_user_plan_rate_limit()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
                                                                                                                                                                                                                                                                      BEGIN
                                                                                                                                                                                                                                                                        UPDATE api_keys
                                                                                                                                                                                                                                                                          SET 
                                                                                                                                                                                                                                                                              rate_limit = CASE 
                                                                                                                                                                                                                                                                                    WHEN NEW.plan = 'enterprise' THEN 4000
                                                                                                                                                                                                                                                                                          WHEN NEW.plan = 'pro' THEN 1400
                                                                                                                                                                                                                                                                                                ELSE 400
                                                                                                                                                                                                                                                                                                    END,
                                                                                                                                                                                                                                                                                                        requests_used = 0
                                                                                                                                                                                                                                                                                                          WHERE user_id = NEW.user_id;
                                                                                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                                                                              RETURN NEW;
                                                                                                                                                                                                                                                                                                              END;
                                                                                                                                                                                                                                                                                                              $function$


CREATE OR REPLACE FUNCTION public.update_promo_code_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
                                                                                                                                    BEGIN
                                                                                                                                      NEW.updated_at = NOW();
                                                                                                                                        RETURN NEW;
                                                                                                                                        END;

CREATE UNIQUE INDEX api_keys_pkey ON public.api_keys USING btree (id);
CREATE UNIQUE INDEX api_keys_key_key ON public.api_keys USING btree (key);
CREATE INDEX idx_api_keys_user_id ON public.api_keys USING btree (user_id);
CREATE INDEX idx_api_keys_key ON public.api_keys USING btree (key);
CREATE INDEX idx_api_keys_is_active ON public.api_keys USING btree (is_active);
CREATE UNIQUE INDEX request_logs_pkey ON public.request_logs USING btree (id);
CREATE INDEX idx_request_logs_api_key_id ON public.request_logs USING btree (api_key_id);
CREATE INDEX idx_request_logs_user_id ON public.request_logs USING btree (user_id);
CREATE INDEX idx_request_logs_created_at ON public.request_logs USING btree (created_at DESC);
CREATE INDEX idx_request_logs_model ON public.request_logs USING btree (model);
CREATE UNIQUE INDEX daily_usage_pkey ON public.daily_usage USING btree (id);
CREATE UNIQUE INDEX daily_usage_api_key_id_date_key ON public.daily_usage USING btree (api_key_id, date);
CREATE INDEX idx_daily_usage_api_key_id ON public.daily_usage USING btree (api_key_id);
CREATE INDEX idx_daily_usage_user_id ON public.daily_usage USING btree (user_id);
CREATE INDEX idx_daily_usage_date ON public.daily_usage USING btree (date DESC);
CREATE INDEX idx_promo_codes_code ON public.promo_codes USING btree (code);
CREATE INDEX idx_promo_codes_is_active ON public.promo_codes USING btree (is_active);
CREATE UNIQUE INDEX promo_codes_pkey ON public.promo_codes USING btree (id);
CREATE UNIQUE INDEX promo_codes_code_key ON public.promo_codes USING btree (code);
CREATE UNIQUE INDEX promo_redemptions_pkey ON public.promo_redemptions USING btree (id);
CREATE UNIQUE INDEX promo_redemptions_promo_code_id_user_id_key ON public.promo_redemptions USING btree (promo_code_id, user_id);
CREATE INDEX idx_promo_redemptions_user_id ON public.promo_redemptions USING btree (user_id);
CREATE INDEX idx_promo_redemptions_expires_at ON public.promo_redemptions USING btree (expires_at);
CREATE UNIQUE INDEX user_settings_pkey ON public.user_settings USING btree (id);
CREATE UNIQUE INDEX user_settings_user_id_key ON public.user_settings USING btree (user_id);
CREATE INDEX idx_user_settings_user_id ON public.user_settings USING btree (user_id);
CREATE INDEX idx_user_settings_plan ON public.user_settings USING btree (plan);
CREATE INDEX idx_user_settings_plan_expires_at ON public.user_settings USING btree (plan_expires_at);
CREATE INDEX idx_user_settings_is_admin ON public.user_settings USING btree (is_admin) WHERE (is_admin = true);
update_api_keys_updated_at ON api_keys - EXECUTE FUNCTION update_updated_at_column()
update_user_settings_updated_at ON user_settings - EXECUTE FUNCTION update_updated_at_column()
trigger_update_promo_codes_updated_at ON promo_codes - EXECUTE FUNCTION update_promo_code_updated_at()

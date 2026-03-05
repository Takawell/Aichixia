CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  prefix text NOT NULL,
  is_active boolean DEFAULT true,
  rate_limit integer DEFAULT 100,
  requests_used integer DEFAULT 0,
  last_reset_at timestamp with time zone DEFAULT NOW(),
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_usage (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_key_id uuid NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  requests_count integer DEFAULT 0,
  tokens_used integer DEFAULT 0,
  success_count integer DEFAULT 0,
  error_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT NOW(),
  UNIQUE(api_key_id, date)
);

CREATE TABLE IF NOT EXISTS promo_codes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code text UNIQUE NOT NULL,
  plan_type text NOT NULL,
  duration_days integer NOT NULL,
  max_uses integer,
  used_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS promo_redemptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  promo_code_id uuid NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  redeemed_at timestamp with time zone DEFAULT NOW(),
  expires_at timestamp with time zone NOT NULL,
  UNIQUE(promo_code_id, user_id)
);

CREATE TABLE IF NOT EXISTS request_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_key_id uuid NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model text NOT NULL,
  endpoint text NOT NULL,
  status integer NOT NULL,
  latency_ms integer,
  tokens_used integer DEFAULT 0,
  error_message text,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text DEFAULT 'free',
  plan_expires_at timestamp with time zone,
  is_admin boolean DEFAULT false,
  email_notifications boolean DEFAULT true,
  theme text DEFAULT 'system',
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS api_keys_pkey ON public.api_keys USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS api_keys_key_key ON public.api_keys USING btree (key);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON public.api_keys USING btree (key);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON public.api_keys USING btree (is_active);

CREATE UNIQUE INDEX IF NOT EXISTS request_logs_pkey ON public.request_logs USING btree (id);
CREATE INDEX IF NOT EXISTS idx_request_logs_api_key_id ON public.request_logs USING btree (api_key_id);
CREATE INDEX IF NOT EXISTS idx_request_logs_user_id ON public.request_logs USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_request_logs_created_at ON public.request_logs USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_request_logs_model ON public.request_logs USING btree (model);

CREATE UNIQUE INDEX IF NOT EXISTS daily_usage_pkey ON public.daily_usage USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS daily_usage_api_key_id_date_key ON public.daily_usage USING btree (api_key_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_usage_api_key_id ON public.daily_usage USING btree (api_key_id);
CREATE INDEX IF NOT EXISTS idx_daily_usage_user_id ON public.daily_usage USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_daily_usage_date ON public.daily_usage USING btree (date DESC);

CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON public.promo_codes USING btree (code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_is_active ON public.promo_codes USING btree (is_active);
CREATE UNIQUE INDEX IF NOT EXISTS promo_codes_pkey ON public.promo_codes USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS promo_codes_code_key ON public.promo_codes USING btree (code);

CREATE UNIQUE INDEX IF NOT EXISTS promo_redemptions_pkey ON public.promo_redemptions USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS promo_redemptions_promo_code_id_user_id_key ON public.promo_redemptions USING btree (promo_code_id, user_id);
CREATE INDEX IF NOT EXISTS idx_promo_redemptions_user_id ON public.promo_redemptions USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_promo_redemptions_expires_at ON public.promo_redemptions USING btree (expires_at);

CREATE UNIQUE INDEX IF NOT EXISTS user_settings_pkey ON public.user_settings USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS user_settings_user_id_key ON public.user_settings USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_plan ON public.user_settings USING btree (plan);
CREATE INDEX IF NOT EXISTS idx_user_settings_plan_expires_at ON public.user_settings USING btree (plan_expires_at);
CREATE INDEX IF NOT EXISTS idx_user_settings_is_admin ON public.user_settings USING btree (is_admin) WHERE (is_admin = true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_promo_code_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_user_settings()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to create user settings: %', SQLERRM;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_rate_limit(p_user_id uuid)
RETURNS integer LANGUAGE plpgsql AS $$
DECLARE
  v_plan TEXT;
BEGIN
  SELECT plan INTO v_plan
  FROM user_settings
  WHERE user_id = p_user_id;

  RETURN CASE v_plan
    WHEN 'enterprise' THEN 1000
    WHEN 'pro' THEN 400
    ELSE 100
  END;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_request_count(api_key_text text)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE api_keys
  SET requests_used = requests_used + 1
  WHERE key = api_key_text AND is_active = true;
END;
$$;

CREATE OR REPLACE FUNCTION public.reset_rate_limits()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE api_keys
  SET requests_used = 0,
      last_reset_at = NOW()
  WHERE last_reset_at < NOW() - INTERVAL '24 hours';
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_api_key_rate_limits()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE api_keys
  SET rate_limit = CASE
    WHEN us.plan = 'enterprise' THEN 1000
    WHEN us.plan = 'pro' THEN 400
    ELSE 100
  END
  FROM user_settings us
  WHERE api_keys.user_id = us.user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_user_plan_rate_limit()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE api_keys
  SET rate_limit = CASE
    WHEN NEW.plan = 'enterprise' THEN 1000
    WHEN NEW.plan = 'pro' THEN 400
    ELSE 100
  END,
  requests_used = 0
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_expired_plans()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE user_settings
  SET plan = 'free',
      plan_expires_at = NULL
  WHERE plan IN ('pro', 'enterprise')
    AND plan_expires_at IS NOT NULL
    AND plan_expires_at < NOW();

  UPDATE api_keys
  SET rate_limit = 100
  WHERE user_id IN (
    SELECT user_id FROM user_settings WHERE plan = 'free'
  );
END;
$$;

DROP TRIGGER IF EXISTS update_api_keys_updated_at ON api_keys;
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_promo_codes_updated_at ON promo_codes;
CREATE TRIGGER trigger_update_promo_codes_updated_at
  BEFORE UPDATE ON promo_codes
  FOR EACH ROW EXECUTE FUNCTION update_promo_code_updated_at();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_settings();

DROP TRIGGER IF EXISTS on_user_plan_changed ON user_settings;
CREATE TRIGGER on_user_plan_changed
  AFTER UPDATE OF plan ON user_settings
  FOR EACH ROW EXECUTE FUNCTION sync_user_plan_rate_limit();

SELECT cron.schedule('check-expired-plans', '*/15 * * * *', $$SELECT check_expired_plans();$$);

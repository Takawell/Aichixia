import type { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const supabaseAdmin = getServiceSupabase();
    
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token', details: authError?.message });
    }

    if (req.method === 'GET') {
      try {
        const { data: settings, error: settingsError } = await supabaseAdmin
          .from('user_settings')
          .select('plan, plan_expires_at, is_admin')
          .eq('user_id', user.id)
          .single();

        if (settingsError) throw settingsError;

        return res.status(200).json({
          profile: {
            email: user.email,
            display_name: user.user_metadata?.display_name || null,
            avatar_url: user.user_metadata?.avatar_url || null,
          },
          settings: {
            plan: settings?.plan || 'free',
            plan_expires_at: settings?.plan_expires_at || null,
            is_admin: settings?.is_admin || false,
          },
        });
      } catch (error: any) {
        console.error('GET Profile Error:', error);
        return res.status(500).json({ error: error.message });
      }
    }

    if (req.method === 'PATCH') {
      try {
        const { display_name, avatar_url } = req.body;

        if (!display_name && !avatar_url) {
          return res.status(400).json({ error: 'No data to update' });
        }

        const updates: any = {};
        if (display_name !== undefined) updates.display_name = display_name;
        if (avatar_url !== undefined) updates.avatar_url = avatar_url;

        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
          user_metadata: updates,
        });

        if (error) throw error;

        return res.status(200).json({
          message: 'Profile updated successfully',
          profile: {
            display_name: data.user?.user_metadata?.display_name || null,
            avatar_url: data.user?.user_metadata?.avatar_url || null,
          },
        });
      } catch (error: any) {
        console.error('PATCH Profile Error:', error);
        return res.status(500).json({ error: error.message });
      }
    }

    if (req.method === 'POST') {
      try {
        const { promo_code } = req.body;

        if (!promo_code?.trim()) {
          return res.status(400).json({ error: 'Promo code is required' });
        }

        const { data: promo, error: promoError } = await supabaseAdmin
          .from('promo_codes')
          .select('*')
          .eq('code', promo_code.toUpperCase())
          .eq('is_active', true)
          .single();

        if (promoError || !promo) {
          return res.status(404).json({ error: 'Invalid or inactive promo code' });
        }

        if (promo.used_count >= promo.max_uses) {
          return res.status(400).json({ error: 'Promo code has reached max uses' });
        }

        const { data: existingRedemption } = await supabaseAdmin
          .from('promo_redemptions')
          .select('id')
          .eq('promo_code_id', promo.id)
          .eq('user_id', user.id)
          .single();

        if (existingRedemption) {
          return res.status(400).json({ error: 'You have already redeemed this promo code' });
        }

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + promo.duration_days);

        const { error: redemptionError } = await supabaseAdmin
          .from('promo_redemptions')
          .insert({
            promo_code_id: promo.id,
            user_id: user.id,
            expires_at: expiresAt.toISOString(),
          });

        if (redemptionError) throw redemptionError;

        const { error: updatePromoError } = await supabaseAdmin
          .from('promo_codes')
          .update({ used_count: promo.used_count + 1 })
          .eq('id', promo.id);

        if (updatePromoError) throw updatePromoError;

        const { error: updateSettingsError } = await supabaseAdmin
          .from('user_settings')
          .update({
            plan: promo.plan_type,
            plan_expires_at: expiresAt.toISOString(),
          })
          .eq('user_id', user.id);

        if (updateSettingsError) throw updateSettingsError;

        const newRateLimit = promo.plan_type === 'enterprise' ? 10000 : promo.plan_type === 'pro' ? 4000 : 1000;

        const { error: updateKeysError } = await supabaseAdmin
          .from('api_keys')
          .update({ rate_limit: newRateLimit, requests_used: 0 })
          .eq('user_id', user.id);

        if (updateKeysError) throw updateKeysError;

        return res.status(200).json({
          message: 'Promo code redeemed successfully',
          plan: promo.plan_type,
          expires_at: expiresAt.toISOString(),
        });
      } catch (error: any) {
        console.error('POST Redeem Error:', error);
        return res.status(500).json({ error: error.message });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Profile API Critical Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

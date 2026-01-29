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
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('user_settings')
      .select('is_admin')
      .eq('user_id', user.id)
      .single();

    if (settingsError || !settings?.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { type } = req.query;

    if (req.method === 'GET') {
      try {
        if (type === 'promo-codes') {
          const { data: promoCodes, error } = await supabaseAdmin
            .from('promo_codes')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;
          return res.status(200).json({ promoCodes });
        }

        if (type === 'redemptions') {
          const { data: redemptions, error } = await supabaseAdmin
            .from('promo_redemptions')
            .select(`
              *,
              promo_codes(code, plan_type)
            `)
            .order('redeemed_at', { ascending: false });

          if (error) throw error;

          const redemptionsWithEmail = await Promise.all(
            redemptions.map(async (r: any) => {
              const { data: { user: redeemedUser } } = await supabaseAdmin.auth.admin.getUserById(r.user_id);
              return {
                ...r,
                user_email: redeemedUser?.email || 'Unknown',
              };
            })
          );

          return res.status(200).json({ redemptions: redemptionsWithEmail });
        }

        if (type === 'users') {
          const { data: userSettings, error } = await supabaseAdmin
            .from('user_settings')
            .select('user_id, plan, plan_expires_at, is_admin, created_at')
            .order('created_at', { ascending: false });

          if (error) throw error;

          const usersWithDetails = await Promise.all(
            userSettings.map(async (setting: any) => {
              const { data: { user: userData } } = await supabaseAdmin.auth.admin.getUserById(setting.user_id);
              const { data: keys } = await supabaseAdmin
                .from('api_keys')
                .select('id, is_active')
                .eq('user_id', setting.user_id);

              return {
                user_id: setting.user_id,
                email: userData?.email || 'Unknown',
                display_name: userData?.user_metadata?.display_name || null,
                avatar_url: userData?.user_metadata?.avatar_url || null,
                plan: setting.plan,
                plan_expires_at: setting.plan_expires_at,
                is_admin: setting.is_admin,
                active_keys: keys?.filter(k => k.is_active).length || 0,
                created_at: setting.created_at,
              };
            })
          );

          return res.status(200).json({ users: usersWithDetails });
        }

        return res.status(400).json({ error: 'Invalid type parameter' });
      } catch (error: any) {
        console.error('GET Admin Error:', error);
        return res.status(500).json({ error: error.message });
      }
    }

    if (req.method === 'POST') {
      try {
        const { code, plan_type, duration_days, max_uses } = req.body;

        if (!code || !plan_type || !duration_days || !max_uses) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!['pro', 'enterprise'].includes(plan_type)) {
          return res.status(400).json({ error: 'Invalid plan type' });
        }

        const { data: newPromo, error } = await supabaseAdmin
          .from('promo_codes')
          .insert({
            code: code.toUpperCase(),
            plan_type,
            duration_days: parseInt(duration_days),
            max_uses: parseInt(max_uses),
            created_by: user.id,
          })
          .select()
          .single();

        if (error) throw error;

        return res.status(201).json({ 
          message: 'Promo code created successfully',
          promoCode: newPromo 
        });
      } catch (error: any) {
        console.error('POST Admin Error:', error);
        return res.status(500).json({ error: error.message });
      }
    }

    if (req.method === 'PATCH') {
      try {
        const { action, promo_id, user_id, plan, plan_expires_at, is_active } = req.body;

        if (action === 'update-promo') {
          if (!promo_id) {
            return res.status(400).json({ error: 'promo_id is required' });
          }

          const updates: any = {};
          if (is_active !== undefined) updates.is_active = is_active;

          const { error } = await supabaseAdmin
            .from('promo_codes')
            .update(updates)
            .eq('id', promo_id);

          if (error) throw error;

          return res.status(200).json({ message: 'Promo code updated successfully' });
        }

        if (action === 'update-user-plan') {
          if (!user_id || !plan) {
            return res.status(400).json({ error: 'user_id and plan are required' });
          }

          const { error: settingsError } = await supabaseAdmin
            .from('user_settings')
            .update({
              plan,
              plan_expires_at: plan_expires_at || null,
            })
            .eq('user_id', user_id);

          if (settingsError) throw settingsError;

          const newRateLimit = plan === 'enterprise' ? 10000 : plan === 'pro' ? 4000 : 1000;

          const { error: keysError } = await supabaseAdmin
            .from('api_keys')
            .update({ rate_limit: newRateLimit })
            .eq('user_id', user_id);

          if (keysError) throw keysError;

          return res.status(200).json({ message: 'User plan updated successfully' });
        }

        return res.status(400).json({ error: 'Invalid action' });
      } catch (error: any) {
        console.error('PATCH Admin Error:', error);
        return res.status(500).json({ error: error.message });
      }
    }

    if (req.method === 'DELETE') {
      try {
        const { promo_id } = req.body;

        if (!promo_id) {
          return res.status(400).json({ error: 'promo_id is required' });
        }

        const { error } = await supabaseAdmin
          .from('promo_codes')
          .update({ is_active: false })
          .eq('id', promo_id);

        if (error) throw error;

        return res.status(200).json({ message: 'Promo code deactivated successfully' });
      } catch (error: any) {
        console.error('DELETE Admin Error:', error);
        return res.status(500).json({ error: error.message });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Admin API Critical Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

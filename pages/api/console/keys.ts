import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";
import { createApiKey, getUserKeys, revokeApiKey, updateApiKeyName } from "@/lib/console-utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  if (req.method === 'GET') {
    const keys = await getUserKeys(user.id);
    return res.status(200).json({ keys });
  }

  if (req.method === 'POST') {
    const { name } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Name is required' });
    }

    const newKey = await createApiKey(user.id, name);

    if (!newKey) {
      return res.status(500).json({ error: 'Failed to create API key' });
    }

    return res.status(201).json({ key: newKey });
  }

  if (req.method === 'DELETE') {
    const { keyId } = req.body;

    if (!keyId) {
      return res.status(400).json({ error: 'keyId is required' });
    }

    const success = await revokeApiKey(user.id, keyId);

    if (!success) {
      return res.status(500).json({ error: 'Failed to revoke key' });
    }

    return res.status(200).json({ success: true });
  }

  if (req.method === 'PATCH') {
    const { keyId, name } = req.body;

    if (!keyId || !name) {
      return res.status(400).json({ error: 'keyId and name are required' });
    }

    const success = await updateApiKeyName(user.id, keyId, name);

    if (!success) {
      return res.status(500).json({ error: 'Failed to update key name' });
    }

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

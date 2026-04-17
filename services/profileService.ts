import { supabase } from '@/lib/supabase';
import type { DBProfile } from '@/lib/types';

export const ProfileService = {
  async getProfile(userId: string): Promise<{ data: DBProfile | null; error: string | null }> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data: data as DBProfile | null, error: error?.message ?? null };
  },

  async upsertProfile(profile: Partial<DBProfile> & { id: string }): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('user_profiles')
      .upsert(profile, { onConflict: 'id' });
    return { error: error?.message ?? null };
  },

  async updateProfile(userId: string, updates: Partial<DBProfile>): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId);
    return { error: error?.message ?? null };
  },

  async searchUsers(query: string, limit = 20): Promise<{ data: DBProfile[]; error: string | null }> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(limit);
    return { data: (data as DBProfile[]) ?? [], error: error?.message ?? null };
  },

  async getFeaturedSellers(limit = 10): Promise<{ data: DBProfile[]; error: string | null }> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('is_seller', true)
      .order('followers_count', { ascending: false })
      .limit(limit);
    return { data: (data as DBProfile[]) ?? [], error: error?.message ?? null };
  },

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();
    return !!data;
  },

  async follow(followerId: string, followingId: string): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: followerId, following_id: followingId });
    return { error: error?.message ?? null };
  },

  async unfollow(followerId: string, followingId: string): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);
    return { error: error?.message ?? null };
  },
};

import { supabase } from '@/lib/supabase';
import { DbProfile } from '@/lib/types';

export const ProfileService = {
  // Get profile by user id
  async get(userId: string): Promise<DbProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) return null;
    return data as DbProfile;
  },

  // Upsert profile after login
  async upsert(userId: string, fields: Partial<DbProfile>): Promise<DbProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({ id: userId, ...fields }, { onConflict: 'id' })
      .select()
      .single();
    if (error) { console.error('ProfileService.upsert:', error.message); return null; }
    return data as DbProfile;
  },

  // Update profile
  async update(userId: string, fields: Partial<DbProfile>): Promise<DbProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(fields)
      .eq('id', userId)
      .select()
      .single();
    if (error) { console.error('ProfileService.update:', error.message); return null; }
    return data as DbProfile;
  },

  // Search profiles by username
  async search(query: string): Promise<DbProfile[]> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .ilike('username', `%${query}%`)
      .limit(20);
    if (error) return [];
    return (data || []) as DbProfile[];
  },

  // Get followers/following counts
  async getFollowStatus(currentUserId: string, targetUserId: string): Promise<boolean> {
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentUserId)
      .eq('following_id', targetUserId)
      .single();
    return !!data;
  },

  async follow(followerId: string, followingId: string): Promise<boolean> {
    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: followerId, following_id: followingId });
    if (error) return false;
    // Update counts
    await supabase.rpc('increment', { table: 'user_profiles', id: followerId, column: 'following_count', amount: 1 });
    await supabase.rpc('increment', { table: 'user_profiles', id: followingId, column: 'followers_count', amount: 1 });
    return true;
  },

  async unfollow(followerId: string, followingId: string): Promise<boolean> {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);
    return !error;
  },
};

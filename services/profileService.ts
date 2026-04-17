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

  // Upsert profile after login / sign-up
  async upsert(userId: string, fields: Partial<DbProfile>): Promise<DbProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({ id: userId, ...fields }, { onConflict: 'id' })
      .select()
      .single();
    if (error) {
      console.error('ProfileService.upsert:', error.message);
      return null;
    }
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
    if (error) {
      console.error('ProfileService.update:', error.message);
      return null;
    }
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

  // Check if currentUser follows targetUser
  async getFollowStatus(currentUserId: string, targetUserId: string): Promise<boolean> {
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentUserId)
      .eq('following_id', targetUserId)
      .maybeSingle();
    return !!data;
  },

  // Follow a user — updates counts via raw SQL increment (no custom RPC needed)
  async follow(followerId: string, followingId: string): Promise<boolean> {
    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: followerId, following_id: followingId });
    if (error) return false;

    // Increment following_count for follower
    await supabase.rpc('increment_count', {
      p_table: 'user_profiles',
      p_id: followerId,
      p_column: 'following_count',
      p_amount: 1,
    }).then(() => {}).catch(() => {
      // Fallback: manual increment
      supabase.from('user_profiles').select('following_count').eq('id', followerId).single()
        .then(({ data }) => {
          if (data) {
            supabase.from('user_profiles')
              .update({ following_count: ((data as any).following_count || 0) + 1 })
              .eq('id', followerId);
          }
        });
    });

    // Increment followers_count for the person being followed
    await supabase.rpc('increment_count', {
      p_table: 'user_profiles',
      p_id: followingId,
      p_column: 'followers_count',
      p_amount: 1,
    }).then(() => {}).catch(() => {
      supabase.from('user_profiles').select('followers_count').eq('id', followingId).single()
        .then(({ data }) => {
          if (data) {
            supabase.from('user_profiles')
              .update({ followers_count: ((data as any).followers_count || 0) + 1 })
              .eq('id', followingId);
          }
        });
    });

    return true;
  },

  async unfollow(followerId: string, followingId: string): Promise<boolean> {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);
    if (error) return false;

    // Decrement counts (manual fallback — no custom RPC required)
    const [followerRes, followingRes] = await Promise.all([
      supabase.from('user_profiles').select('following_count').eq('id', followerId).single(),
      supabase.from('user_profiles').select('followers_count').eq('id', followingId).single(),
    ]);
    if (followerRes.data) {
      await supabase.from('user_profiles')
        .update({ following_count: Math.max(0, ((followerRes.data as any).following_count || 1) - 1) })
        .eq('id', followerId);
    }
    if (followingRes.data) {
      await supabase.from('user_profiles')
        .update({ followers_count: Math.max(0, ((followingRes.data as any).followers_count || 1) - 1) })
        .eq('id', followingId);
    }

    return true;
  },
};

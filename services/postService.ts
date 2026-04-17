import { supabase } from '@/lib/supabase';
import { DbPost } from '@/lib/types';

export const PostService = {
  // Feed posts — filtered by delivery_type based on user country
  async getFeed(options: {
    category?: string;
    userCountry?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<DbPost[]> {
    const { category, userCountry, page = 0, pageSize = 10 } = options;
    let query = supabase
      .from('posts')
      .select('*, user_profiles(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (category && category !== 'foryou') {
      query = query.ilike('category', `%${category}%`);
    }

    const { data, error } = await query;
    if (error) { console.error('PostService.getFeed:', error.message); return []; }
    return (data || []) as DbPost[];
  },

  // Get single post
  async getById(postId: string): Promise<DbPost | null> {
    const { data, error } = await supabase
      .from('posts')
      .select('*, user_profiles(*)')
      .eq('id', postId)
      .single();
    if (error) return null;
    return data as DbPost;
  },

  // Get posts by user
  async getByUser(userId: string): Promise<DbPost[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data || []) as DbPost[];
  },

  // Create post
  async create(post: Partial<DbPost>): Promise<DbPost | null> {
    const { data, error } = await supabase
      .from('posts')
      .insert(post)
      .select()
      .single();
    if (error) { console.error('PostService.create:', error.message); return null; }
    // Increment user posts_count
    if (post.user_id) {
      await supabase
        .from('user_profiles')
        .update({ posts_count: supabase.rpc as any })
        .eq('id', post.user_id);
    }
    return data as DbPost;
  },

  // Delete post
  async delete(postId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('posts')
      .update({ is_active: false })
      .eq('id', postId)
      .eq('user_id', userId);
    return !error;
  },

  // Search posts
  async search(query: string): Promise<DbPost[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*, user_profiles(*)')
      .or(`drop_title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
      .eq('is_active', true)
      .limit(30);
    if (error) return [];
    return (data || []) as DbPost[];
  },

  // Search by hashtag
  async searchByHashtag(tag: string): Promise<DbPost[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*, user_profiles(*)')
      .contains('hashtags', [tag])
      .eq('is_active', true)
      .limit(20);
    if (error) return [];
    return (data || []) as DbPost[];
  },

  // Like / unlike post
  async toggleLike(postId: string, userId: string): Promise<{ liked: boolean; count: number }> {
    // Check existing
    const { data: existing } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Unlike
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId);
      const { data: post } = await supabase
        .from('posts')
        .update({ likes_count: supabase.rpc as any })
        .eq('id', postId)
        .select('likes_count')
        .single();
      // decrement manually
      const { data: curr } = await supabase.from('posts').select('likes_count').eq('id', postId).single();
      const newCount = Math.max(0, ((curr as any)?.likes_count || 1) - 1);
      await supabase.from('posts').update({ likes_count: newCount }).eq('id', postId);
      return { liked: false, count: newCount };
    } else {
      // Like
      await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
      const { data: curr } = await supabase.from('posts').select('likes_count').eq('id', postId).single();
      const newCount = ((curr as any)?.likes_count || 0) + 1;
      await supabase.from('posts').update({ likes_count: newCount }).eq('id', postId);
      return { liked: true, count: newCount };
    }
  },

  // Check if liked
  async isLiked(postId: string, userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();
    return !!data;
  },

  // Save / unsave
  async toggleSave(postId: string, userId: string): Promise<boolean> {
    const { data: existing } = await supabase
      .from('post_saves')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      await supabase.from('post_saves').delete().eq('post_id', postId).eq('user_id', userId);
      return false;
    } else {
      await supabase.from('post_saves').insert({ post_id: postId, user_id: userId });
      return true;
    }
  },

  // Record view
  async recordView(postId: string, userId?: string): Promise<void> {
    await supabase.from('post_views').insert({
      post_id: postId,
      user_id: userId || null,
    });
  },

  // Get Shorts (video posts)
  async getShorts(): Promise<DbPost[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*, user_profiles(*)')
      .eq('post_type', 'video')
      .eq('is_active', true)
      .order('views_count', { ascending: false })
      .limit(20);
    if (error) return [];
    return (data || []) as DbPost[];
  },
};

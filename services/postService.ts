import { supabase } from '@/lib/supabase';
import type { DBPost } from '@/lib/types';

export const PostService = {
  async getFeed(options?: {
    category?: string;
    userId?: string;
    deliveryType?: string[];
    userCountry?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: DBPost[]; error: string | null }> {
    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;

    let query = supabase
      .from('posts')
      .select('*, user_profiles(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (options?.category && options.category !== 'foryou') {
      query = query.ilike('category', `%${options.category}%`);
    }

    const { data, error } = await query;
    return { data: (data as DBPost[]) ?? [], error: error?.message ?? null };
  },

  async getPostById(postId: string): Promise<{ data: DBPost | null; error: string | null }> {
    const { data, error } = await supabase
      .from('posts')
      .select('*, user_profiles(*)')
      .eq('id', postId)
      .single();
    return { data: data as DBPost | null, error: error?.message ?? null };
  },

  async getUserPosts(userId: string, limit = 30): Promise<{ data: DBPost[]; error: string | null }> {
    const { data, error } = await supabase
      .from('posts')
      .select('*, user_profiles(*)')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data: (data as DBPost[]) ?? [], error: error?.message ?? null };
  },

  async getShorts(limit = 20): Promise<{ data: DBPost[]; error: string | null }> {
    const { data, error } = await supabase
      .from('posts')
      .select('*, user_profiles(*)')
      .eq('post_type', 'video')
      .eq('is_active', true)
      .order('views_count', { ascending: false })
      .limit(limit);
    return { data: (data as DBPost[]) ?? [], error: error?.message ?? null };
  },

  async createPost(post: Omit<DBPost, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'comments_count' | 'saves_count' | 'views_count' | 'quantity_sold'>): Promise<{ data: DBPost | null; error: string | null }> {
    const { data, error } = await supabase
      .from('posts')
      .insert(post)
      .select('*, user_profiles(*)')
      .single();
    return { data: data as DBPost | null, error: error?.message ?? null };
  },

  async updatePost(postId: string, updates: Partial<DBPost>): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('posts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', postId);
    return { error: error?.message ?? null };
  },

  async deletePost(postId: string): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('posts')
      .update({ is_active: false })
      .eq('id', postId);
    return { error: error?.message ?? null };
  },

  async likePost(userId: string, postId: string): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('post_likes')
      .insert({ user_id: userId, post_id: postId });
    return { error: error?.message ?? null };
  },

  async unlikePost(userId: string, postId: string): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);
    return { error: error?.message ?? null };
  },

  async isLiked(userId: string, postId: string): Promise<boolean> {
    const { data } = await supabase
      .from('post_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle();
    return !!data;
  },

  async savePost(userId: string, postId: string): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('post_saves')
      .insert({ user_id: userId, post_id: postId });
    return { error: error?.message ?? null };
  },

  async unsavePost(userId: string, postId: string): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('post_saves')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);
    return { error: error?.message ?? null };
  },

  async isSaved(userId: string, postId: string): Promise<boolean> {
    const { data } = await supabase
      .from('post_saves')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle();
    return !!data;
  },

  async recordView(userId: string | null, postId: string): Promise<void> {
    await supabase
      .from('post_views')
      .insert({ user_id: userId, post_id: postId });
    await supabase
      .from('posts')
      .update({ views_count: supabase.rpc as any })
      .eq('id', postId);
  },

  async search(query: string, limit = 30): Promise<{ data: DBPost[]; error: string | null }> {
    const { data, error } = await supabase
      .from('posts')
      .select('*, user_profiles(*)')
      .eq('is_active', true)
      .or(`drop_title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
      .limit(limit);
    return { data: (data as DBPost[]) ?? [], error: error?.message ?? null };
  },

  async getSavedPosts(userId: string): Promise<{ data: DBPost[]; error: string | null }> {
    const { data, error } = await supabase
      .from('post_saves')
      .select('post_id, posts(*, user_profiles(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    const posts = (data ?? []).map((row: any) => row.posts).filter(Boolean);
    return { data: posts as DBPost[], error: error?.message ?? null };
  },
};

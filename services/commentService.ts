import { supabase } from '@/lib/supabase';
import type { DBComment } from '@/lib/types';

export const CommentService = {
  async getComments(postId: string): Promise<{ data: DBComment[]; error: string | null }> {
    const { data, error } = await supabase
      .from('comments')
      .select('*, user_profiles(*)')
      .eq('post_id', postId)
      .is('parent_id', null)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50);
    return { data: (data as DBComment[]) ?? [], error: error?.message ?? null };
  },

  async getReplies(commentId: string): Promise<{ data: DBComment[]; error: string | null }> {
    const { data, error } = await supabase
      .from('comments')
      .select('*, user_profiles(*)')
      .eq('parent_id', commentId)
      .order('created_at', { ascending: true })
      .limit(20);
    return { data: (data as DBComment[]) ?? [], error: error?.message ?? null };
  },

  async addComment(comment: {
    post_id: string;
    user_id: string;
    text: string;
    parent_id?: string | null;
  }): Promise<{ data: DBComment | null; error: string | null }> {
    const { data, error } = await supabase
      .from('comments')
      .insert(comment)
      .select('*, user_profiles(*)')
      .single();

    if (!error) {
      // Increment post comment count
      await supabase.rpc('increment_comment_count', { post_id: comment.post_id }).catch(() => {});
    }

    return { data: data as DBComment | null, error: error?.message ?? null };
  },

  async deleteComment(commentId: string): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);
    return { error: error?.message ?? null };
  },

  async likeComment(userId: string, commentId: string): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('comment_likes')
      .insert({ user_id: userId, comment_id: commentId });
    if (!error) {
      await supabase
        .from('comments')
        .update({ likes_count: supabase.rpc as any })
        .eq('id', commentId);
    }
    return { error: error?.message ?? null };
  },

  async pinComment(commentId: string, pinned: boolean): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('comments')
      .update({ is_pinned: pinned })
      .eq('id', commentId);
    return { error: error?.message ?? null };
  },
};

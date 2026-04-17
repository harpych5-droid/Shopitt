import { supabase } from '@/lib/supabase';
import { DbComment } from '@/lib/types';

export const CommentService = {
  // Get comments for a post (top-level)
  async getForPost(postId: string): Promise<DbComment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select('*, user_profiles(*)')
      .eq('post_id', postId)
      .is('parent_id', null)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) { console.error('CommentService.getForPost:', error.message); return []; }

    // Fetch replies for each top-level comment
    const comments = (data || []) as DbComment[];
    const withReplies = await Promise.all(
      comments.map(async (c) => {
        const { data: replies } = await supabase
          .from('comments')
          .select('*, user_profiles(*)')
          .eq('parent_id', c.id)
          .order('created_at', { ascending: true })
          .limit(10);
        return { ...c, replies: (replies || []) as DbComment[] };
      })
    );
    return withReplies;
  },

  // Add comment
  async add(postId: string, userId: string, text: string, parentId?: string): Promise<DbComment | null> {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: userId,
        text,
        parent_id: parentId || null,
      })
      .select('*, user_profiles(*)')
      .single();
    if (error) { console.error('CommentService.add:', error.message); return null; }

    // Increment post comments_count
    const { data: post } = await supabase.from('posts').select('comments_count').eq('id', postId).single();
    if (post) {
      await supabase.from('posts').update({ comments_count: (post as any).comments_count + 1 }).eq('id', postId);
    }
    return data as DbComment;
  },

  // Delete comment
  async delete(commentId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId);
    return !error;
  },

  // Like / unlike comment
  async toggleLike(commentId: string, userId: string): Promise<{ liked: boolean; count: number }> {
    const { data: existing } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single();

    const { data: curr } = await supabase.from('comments').select('likes_count').eq('id', commentId).single();
    const currentCount = (curr as any)?.likes_count || 0;

    if (existing) {
      await supabase.from('comment_likes').delete().eq('comment_id', commentId).eq('user_id', userId);
      const newCount = Math.max(0, currentCount - 1);
      await supabase.from('comments').update({ likes_count: newCount }).eq('id', commentId);
      return { liked: false, count: newCount };
    } else {
      await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: userId });
      const newCount = currentCount + 1;
      await supabase.from('comments').update({ likes_count: newCount }).eq('id', commentId);
      return { liked: true, count: newCount };
    }
  },
};

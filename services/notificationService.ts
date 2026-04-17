import { supabase } from '@/lib/supabase';
import { DbNotification } from '@/lib/types';

export const NotificationService = {
  async getForUser(userId: string): Promise<DbNotification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) return [];
    return (data || []) as DbNotification[];
  },

  async markRead(notifId: string): Promise<void> {
    await supabase.from('notifications').update({ read: true }).eq('id', notifId);
  },

  async markAllRead(userId: string): Promise<void> {
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId);
  },

  async getUnreadCount(userId: string): Promise<number> {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);
    return count || 0;
  },

  async create(params: {
    userId: string;
    type: DbNotification['type'];
    title: string;
    body: string;
    relatedId?: string;
    relatedType?: string;
    avatarUrl?: string;
  }): Promise<void> {
    await supabase.from('notifications').insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      related_id: params.relatedId || null,
      related_type: params.relatedType || null,
      avatar_url: params.avatarUrl || null,
      read: false,
    });
  },
};

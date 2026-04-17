import { supabase } from '@/lib/supabase';
import type { DBNotification } from '@/lib/types';

export const NotificationService = {
  async getNotifications(userId: string, limit = 40): Promise<{ data: DBNotification[]; error: string | null }> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data: (data as DBNotification[]) ?? [], error: error?.message ?? null };
  },

  async getUnreadCount(userId: string): Promise<number> {
    const { count } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);
    return count ?? 0;
  },

  async markRead(notifId: string): Promise<void> {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notifId);
  },

  async markAllRead(userId: string): Promise<void> {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
  },

  async create(notif: Omit<DBNotification, 'id' | 'created_at'>): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('notifications')
      .insert(notif);
    return { error: error?.message ?? null };
  },

  subscribeToNotifications(userId: string, callback: (notif: DBNotification) => void) {
    return supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => callback(payload.new as DBNotification)
      )
      .subscribe();
  },
};

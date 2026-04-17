import { supabase } from '@/lib/supabase';
import type { DBConversation, DBMessage } from '@/lib/types';

export const ChatService = {
  async getConversations(userId: string): Promise<{ data: DBConversation[]; error: string | null }> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order('last_message_at', { ascending: false });
    return { data: (data as DBConversation[]) ?? [], error: error?.message ?? null };
  },

  async getOrCreateConversation(userId: string, otherUserId: string): Promise<{ data: DBConversation | null; error: string | null }> {
    // Check existing
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .or(
        `and(participant_1.eq.${userId},participant_2.eq.${otherUserId}),` +
        `and(participant_1.eq.${otherUserId},participant_2.eq.${userId})`
      )
      .maybeSingle();

    if (existing) return { data: existing as DBConversation, error: null };

    const { data, error } = await supabase
      .from('conversations')
      .insert({ participant_1: userId, participant_2: otherUserId })
      .select('*')
      .single();

    return { data: data as DBConversation | null, error: error?.message ?? null };
  },

  async getMessages(conversationId: string, limit = 50): Promise<{ data: DBMessage[]; error: string | null }> {
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:sender_id(username, avatar_url)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);
    return { data: (data as DBMessage[]) ?? [], error: error?.message ?? null };
  },

  async sendMessage(conversationId: string, senderId: string, text: string): Promise<{ data: DBMessage | null; error: string | null }> {
    const { data, error } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: senderId, text })
      .select('*, sender:sender_id(username, avatar_url)')
      .single();

    if (!error) {
      await supabase
        .from('conversations')
        .update({ last_message: text, last_message_at: new Date().toISOString() })
        .eq('id', conversationId);
    }

    return { data: data as DBMessage | null, error: error?.message ?? null };
  },

  subscribeToMessages(conversationId: string, callback: (msg: DBMessage) => void) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => callback(payload.new as DBMessage)
      )
      .subscribe();
  },

  async markRead(conversationId: string, userId: string): Promise<void> {
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('read', false);
  },
};

import { supabase } from '@/lib/supabase';
import { DbConversation, DbMessage } from '@/lib/types';

export const ChatService = {
  // Get or create conversation between two users
  async getOrCreateConversation(userId1: string, userId2: string): Promise<DbConversation | null> {
    // Try to find existing
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .or(
        `and(participant_1.eq.${userId1},participant_2.eq.${userId2}),and(participant_1.eq.${userId2},participant_2.eq.${userId1})`
      )
      .single();

    if (existing) return existing as DbConversation;

    // Create new
    const { data, error } = await supabase
      .from('conversations')
      .insert({ participant_1: userId1, participant_2: userId2 })
      .select()
      .single();
    if (error) { console.error('ChatService.getOrCreate:', error.message); return null; }
    return data as DbConversation;
  },

  // Get all conversations for a user
  async getConversations(userId: string): Promise<DbConversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        profile1:participant_1(id,username,avatar_url,verified),
        profile2:participant_2(id,username,avatar_url,verified)
      `)
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order('last_message_at', { ascending: false });
    if (error) return [];

    // Attach other_user
    return ((data || []) as any[]).map(c => ({
      ...c,
      other_user: c.participant_1 === userId ? c.profile2 : c.profile1,
    }));
  },

  // Get messages in conversation
  async getMessages(conversationId: string): Promise<DbMessage[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:sender_id(id,username,avatar_url)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(100);
    if (error) return [];
    return (data || []) as DbMessage[];
  },

  // Send message
  async sendMessage(conversationId: string, senderId: string, text: string): Promise<DbMessage | null> {
    const { data, error } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: senderId, text })
      .select('*, sender:sender_id(id,username,avatar_url)')
      .single();
    if (error) { console.error('ChatService.sendMessage:', error.message); return null; }

    // Update conversation last_message
    await supabase.from('conversations').update({
      last_message: text,
      last_message_at: new Date().toISOString(),
    }).eq('id', conversationId);

    return data as DbMessage;
  },

  // Mark messages as read
  async markRead(conversationId: string, userId: string): Promise<void> {
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId);
  },

  // Subscribe to new messages (polling fallback)
  subscribeToConversation(
    conversationId: string,
    callback: (msg: DbMessage) => void
  ) {
    const channel = supabase
      .channel(`conv:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        callback(payload.new as DbMessage);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  },
};

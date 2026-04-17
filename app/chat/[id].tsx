import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, FlatList, TextInput,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Gradients, Radius, Typography } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { ChatService } from '@/services/chatService';
import type { DBMessage } from '@/lib/types';

const MOCK_MSGS: DBMessage[] = [
  { id: 'm1', conversation_id: 'demo', sender_id: 'other', text: 'Hey! Is this still available?', read: true, created_at: new Date(Date.now() - 120000).toISOString() },
  { id: 'm2', conversation_id: 'demo', sender_id: 'me', text: 'Yes! Still in stock 🔥', read: true, created_at: new Date(Date.now() - 60000).toISOString() },
  { id: 'm3', conversation_id: 'demo', sender_id: 'other', text: 'Can I pay on delivery?', read: false, created_at: new Date(Date.now() - 30000).toISOString() },
];

export default function ConversationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id, otherUser } = useLocalSearchParams<{ id: string; otherUser?: string }>();
  const { authUser } = useApp();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const flatRef = useRef<FlatList>(null);
  const channelRef = useRef<any>(null);

  const conversationId = id;
  const isDemoConvo = !id || id.startsWith('c');

  useEffect(() => {
    loadMessages();
    return () => {
      channelRef.current?.unsubscribe();
    };
  }, [conversationId]);

  const loadMessages = async () => {
    setLoading(true);
    if (!isDemoConvo && authUser) {
      const { data, error } = await ChatService.getMessages(conversationId);
      if (!error && data.length > 0) {
        setMessages(data);
        await ChatService.markRead(conversationId, authUser.id);
      } else {
        setMessages(MOCK_MSGS);
      }

      // Subscribe to real-time messages
      channelRef.current = ChatService.subscribeToMessages(conversationId, (msg) => {
        setMessages(prev => [...prev, msg]);
        setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
      });
    } else {
      setMessages(MOCK_MSGS);
    }
    setLoading(false);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: false }), 200);
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setText('');

    if (!isDemoConvo && authUser) {
      setSending(true);
      const optimistic: any = {
        id: `opt_${Date.now()}`,
        conversation_id: conversationId,
        sender_id: authUser.id,
        text: trimmed,
        read: false,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, optimistic]);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);

      const { data, error } = await ChatService.sendMessage(conversationId, authUser.id, trimmed);
      if (data) {
        setMessages(prev => prev.map(m => m.id === optimistic.id ? data : m));
      }
      setSending(false);
    } else {
      // Demo mode
      const newMsg: any = {
        id: `m${Date.now()}`,
        conversation_id: 'demo',
        sender_id: authUser?.id ?? 'me',
        text: trimmed,
        read: false,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, newMsg]);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const isMe = (senderId: string) =>
    authUser ? senderId === authUser.id : senderId === 'me';

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>@{otherUser || 'User'}</Text>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        </View>
        <Pressable hitSlop={8}>
          <Ionicons name="ellipsis-horizontal" size={22} color={Colors.textSecondary} />
        </Pressable>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={Colors.pink} />
        </View>
      ) : (
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: 4 }}
          renderItem={({ item }) => {
            const mine = isMe(item.sender_id);
            return (
              <View style={[styles.msgRow, mine ? styles.msgRowMe : styles.msgRowOther]}>
                {!mine && (
                  <LinearGradient colors={Gradients.primary} style={styles.msgAvatar}>
                    <Text style={styles.msgAvatarText}>{(otherUser || 'U').charAt(0).toUpperCase()}</Text>
                  </LinearGradient>
                )}
                <View style={[styles.bubble, mine ? styles.bubbleMe : styles.bubbleOther]}>
                  <Text style={[styles.bubbleText, mine ? styles.bubbleTextMe : styles.bubbleTextOther]}>
                    {item.text}
                  </Text>
                  <Text style={[styles.bubbleTime, mine ? { color: 'rgba(255,255,255,0.6)' } : { color: Colors.textMuted }]}>
                    {formatTime(item.created_at)}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}

      <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <Pressable style={styles.attachBtn} hitSlop={8}>
          <Ionicons name="image-outline" size={22} color={Colors.textSecondary} />
        </Pressable>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={Colors.textMuted}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
        />
        <Pressable onPress={handleSend} disabled={!text.trim() || sending} style={styles.sendBtn}>
          <LinearGradient
            colors={text.trim() ? Gradients.primary : ['#333', '#444']}
            start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
            style={styles.sendBtnGrad}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </LinearGradient>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerInfo: { flex: 1 },
  headerName: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.success },
  onlineText: { color: Colors.success, fontSize: Typography.xs },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowMe: { justifyContent: 'flex-end' },
  msgRowOther: { justifyContent: 'flex-start' },
  msgAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  msgAvatarText: { color: '#fff', fontSize: 12, fontWeight: Typography.bold },
  bubble: { maxWidth: '72%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, gap: 4 },
  bubbleMe: { backgroundColor: Colors.pink, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: Colors.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: Colors.border },
  bubbleText: { fontSize: Typography.base, lineHeight: 20 },
  bubbleTextMe: { color: '#fff' },
  bubbleTextOther: { color: '#fff' },
  bubbleTime: { fontSize: 10, alignSelf: 'flex-end' },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: 12, paddingTop: 10,
    backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  attachBtn: { padding: 6, marginBottom: 6 },
  input: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border,
    color: '#fff', fontSize: Typography.base,
    paddingHorizontal: 14, paddingVertical: 10, maxHeight: 100,
  },
  sendBtn: { marginBottom: 2 },
  sendBtnGrad: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});

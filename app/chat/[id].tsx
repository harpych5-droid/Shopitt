import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, FlatList, TextInput,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Gradients, Radius, Typography } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { ChatService } from '@/services/chatService';
import { DbMessage } from '@/lib/types';

export default function ConversationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id, otherUser } = useLocalSearchParams<{ id: string; otherUser?: string }>();
  const { authUser, profile } = useApp();

  const [messages, setMessages] = useState<DbMessage[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const flatRef = useRef<FlatList>(null);

  // Mock messages as fallback
  const MOCK_MSGS: DbMessage[] = [
    { id: 'm1', conversation_id: id, sender_id: 'other', text: 'Hey! Is this still available?', read: true, created_at: new Date(Date.now() - 120000).toISOString() },
    { id: 'm2', conversation_id: id, sender_id: authUser?.id || 'me', text: 'Yes! Still in stock 🔥', read: true, created_at: new Date(Date.now() - 60000).toISOString() },
    { id: 'm3', conversation_id: id, sender_id: 'other', text: 'Can I pay on delivery?', read: true, created_at: new Date(Date.now() - 30000).toISOString() },
  ];

  useEffect(() => {
    loadMessages();
    if (authUser) {
      const unsub = ChatService.subscribeToConversation(id, (msg) => {
        setMessages(prev => [...prev, msg]);
        scrollToBottom();
      });
      return unsub;
    }
  }, [id, authUser]);

  const loadMessages = async () => {
    setLoading(true);
    if (authUser && id && !id.startsWith('c')) {
      const data = await ChatService.getMessages(id);
      setMessages(data.length > 0 ? data : MOCK_MSGS);
      await ChatService.markRead(id, authUser.id);
    } else {
      setMessages(MOCK_MSGS);
    }
    setLoading(false);
    setTimeout(() => scrollToBottom(), 200);
  };

  const scrollToBottom = () => {
    flatRef.current?.scrollToEnd({ animated: true });
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText('');
    setSending(true);

    if (authUser && id && !id.startsWith('c')) {
      const msg = await ChatService.sendMessage(id, authUser.id, trimmed);
      if (msg) {
        setMessages(prev => [...prev, msg]);
        scrollToBottom();
      }
    } else {
      // Local mock
      const mockMsg: DbMessage = {
        id: `m${Date.now()}`,
        conversation_id: id,
        sender_id: authUser?.id || 'me',
        text: trimmed,
        read: false,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, mockMsg]);
      scrollToBottom();
    }
    setSending(false);
  };

  const isMe = (senderId: string) => senderId === authUser?.id;

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
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
        <View style={styles.loading}>
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
            const me = isMe(item.sender_id);
            return (
              <View style={[styles.msgRow, me ? styles.msgRowMe : styles.msgRowOther]}>
                {!me && (
                  <LinearGradient colors={Gradients.primary} style={styles.msgAvatar}>
                    <Text style={styles.msgAvatarText}>{(otherUser || 'U').charAt(0).toUpperCase()}</Text>
                  </LinearGradient>
                )}
                <View style={[styles.bubble, me ? styles.bubbleMe : styles.bubbleOther]}>
                  <Text style={[styles.bubbleText, me ? styles.bubbleTextMe : styles.bubbleTextOther]}>
                    {item.text}
                  </Text>
                  <Text style={[styles.bubbleTime, me ? { color: 'rgba(255,255,255,0.6)' } : { color: Colors.textMuted }]}>
                    {formatTime(item.created_at)}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Input */}
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
          onSubmitEditing={handleSend}
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
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable, FlatList, TextInput,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Gradients, Radius, Typography } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { ChatService } from '@/services/chatService';
import { ProfileService } from '@/services/profileService';
import { CHAT_LIST } from '@/constants/data';

function formatTime(ts: string | undefined): string {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 2) return 'Just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return d.toLocaleDateString();
}

export default function ChatListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { authUser } = useApp();
  const [search, setSearch] = useState('');
  const [convos, setConvos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, [authUser]);

  const loadConversations = async () => {
    setLoading(true);
    if (authUser) {
      const { data, error } = await ChatService.getConversations(authUser.id);
      if (!error && data.length > 0) {
        // Enrich with other user profiles
        const enriched = await Promise.all(
          data.map(async (c: any) => {
            const otherUserId = c.participant_1 === authUser.id ? c.participant_2 : c.participant_1;
            const { data: profile } = await ProfileService.getProfile(otherUserId);
            const unread = c.participant_1 === authUser.id ? c.unread_1 : c.unread_2;
            return {
              id: c.id,
              username: profile?.username ?? 'User',
              avatar: profile?.avatar_url ?? null,
              lastMessage: c.last_message ?? '',
              time: formatTime(c.last_message_at),
              unread: unread ?? 0,
              online: false,
              otherUserId,
            };
          })
        );
        setConvos(enriched);
      } else {
        setConvos(CHAT_LIST);
      }
    } else {
      setConvos(CHAT_LIST);
    }
    setLoading(false);
  };

  const filtered = search.trim()
    ? convos.filter(c => (c.username || '').toLowerCase().includes(search.toLowerCase()))
    : convos;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Messages</Text>
        <Pressable hitSlop={8}>
          <Ionicons name="create-outline" size={24} color={Colors.pink} />
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        renderItem={({ item }) => {
          const username = item.username || 'User';
          const avatar = item.avatar;
          const lastMsg = item.lastMessage || '';
          const time = item.time || '';
          const unread = item.unread || 0;
          const online = item.online || false;
          return (
            <Pressable
              onPress={() => router.push(`/chat/${item.id}?otherUser=${username}`)}
              style={styles.convoItem}
            >
              <View style={styles.avatarWrap}>
                {avatar ? (
                  <Image source={{ uri: avatar }} style={styles.avatar} contentFit="cover" />
                ) : (
                  <LinearGradient colors={Gradients.primary} style={styles.avatarFallback}>
                    <Text style={styles.avatarFallbackText}>{username.charAt(0).toUpperCase()}</Text>
                  </LinearGradient>
                )}
                {online && <View style={styles.onlineDot} />}
              </View>
              <View style={styles.convoInfo}>
                <View style={styles.convoTop}>
                  <Text style={styles.convoName}>@{username}</Text>
                  <Text style={styles.convoTime}>{time}</Text>
                </View>
                <View style={styles.convoBottom}>
                  <Text style={[styles.convoMsg, unread > 0 && styles.convoMsgUnread]} numberOfLines={1}>
                    {lastMsg}
                  </Text>
                  {unread > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{unread}</Text>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No conversations yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { color: '#fff', fontSize: Typography.xl, fontWeight: Typography.black },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surface, borderRadius: Radius.pill,
    marginHorizontal: 16, marginVertical: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  searchInput: { flex: 1, color: '#fff', fontSize: Typography.base },
  convoItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  avatarWrap: { position: 'relative' },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  avatarFallback: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  avatarFallbackText: { color: '#fff', fontSize: Typography.lg, fontWeight: Typography.bold },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: Colors.success, borderWidth: 2, borderColor: Colors.background,
  },
  convoInfo: { flex: 1 },
  convoTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  convoName: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold },
  convoTime: { color: Colors.textMuted, fontSize: Typography.xs },
  convoBottom: { flexDirection: 'row', alignItems: 'center' },
  convoMsg: { color: Colors.textSecondary, fontSize: Typography.sm, flex: 1 },
  convoMsgUnread: { color: '#fff', fontWeight: Typography.semibold },
  unreadBadge: {
    backgroundColor: Colors.pink, borderRadius: 10,
    minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: Typography.bold },
  empty: { alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 60 },
  emptyText: { color: Colors.textMuted, fontSize: Typography.base },
});

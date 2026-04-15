import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Gradients, Radius, Typography } from '@/constants/theme';
import { CHAT_LIST } from '@/constants/data';

export default function ChatListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');

  const totalUnread = CHAT_LIST.reduce((s, c) => s + c.unread, 0);

  const filtered = activeFilter === 'unread'
    ? CHAT_LIST.filter(c => c.unread > 0)
    : CHAT_LIST;

  const renderChat = ({ item }: any) => (
    <Pressable
      style={styles.chatItem}
      onPress={() => router.push({ pathname: '/chat/[id]', params: { id: item.id } })}
    >
      <View style={styles.avatarWrap}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} contentFit="cover" />
        {item.online && <View style={styles.onlineDot} />}
      </View>

      <View style={styles.chatInfo}>
        <View style={styles.chatTop}>
          <View style={styles.chatNameRow}>
            <Text style={styles.chatName}>{item.username}</Text>
            {item.verified && (
              <MaterialIcons name="verified" size={13} color={Colors.verified} style={{ marginLeft: 3 }} />
            )}
          </View>
          <Text style={[styles.chatTime, item.unread > 0 && { color: Colors.pink }]}>{item.time}</Text>
        </View>
        <Text style={[styles.chatMsg, item.unread > 0 && { color: Colors.textPrimary }]}
          numberOfLines={1}>{item.lastMessage}</Text>
      </View>

      {item.unread > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unread}</Text>
        </View>
      )}
    </Pressable>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Messages</Text>
          {totalUnread > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{totalUnread}</Text>
            </View>
          )}
        </View>
        <Pressable hitSlop={8}>
          <Ionicons name="create-outline" size={24} color="#fff" />
        </Pressable>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filters}>
        <Pressable onPress={() => setActiveFilter('all')}>
          {activeFilter === 'all' ? (
            <LinearGradient colors={Gradients.primary} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
              style={styles.filterPill}>
              <Text style={[styles.filterText, { color: '#fff' }]}>All Messages</Text>
            </LinearGradient>
          ) : (
            <View style={styles.filterPillInactive}>
              <Text style={styles.filterText}>All Messages</Text>
            </View>
          )}
        </Pressable>
        <Pressable onPress={() => setActiveFilter('unread')}>
          {activeFilter === 'unread' ? (
            <LinearGradient colors={Gradients.primary} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
              style={styles.filterPill}>
              <Text style={[styles.filterText, { color: '#fff' }]}>Unread ({totalUnread})</Text>
            </LinearGradient>
          ) : (
            <View style={styles.filterPillInactive}>
              <Text style={styles.filterText}>Unread ({totalUnread})</Text>
            </View>
          )}
        </Pressable>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderChat}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  headerTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { color: '#fff', fontSize: Typography.xl, fontWeight: Typography.black },
  headerBadge: {
    backgroundColor: Colors.pink, borderRadius: Radius.pill,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  headerBadgeText: { color: '#fff', fontSize: Typography.xs, fontWeight: Typography.bold },
  filters: {
    flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  filterPill: { borderRadius: Radius.pill, paddingHorizontal: 18, paddingVertical: 9 },
  filterPillInactive: {
    borderRadius: Radius.pill, paddingHorizontal: 18, paddingVertical: 9,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  filterText: { color: Colors.textSecondary, fontSize: Typography.sm, fontWeight: Typography.semibold },
  chatItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  avatarWrap: { position: 'relative' },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: Colors.success, borderWidth: 2, borderColor: Colors.background,
  },
  chatInfo: { flex: 1, gap: 4 },
  chatTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatNameRow: { flexDirection: 'row', alignItems: 'center' },
  chatName: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold },
  chatTime: { color: Colors.textMuted, fontSize: Typography.xs },
  chatMsg: { color: Colors.textSecondary, fontSize: Typography.sm },
  unreadBadge: {
    backgroundColor: Colors.pink, borderRadius: Radius.circle,
    width: 22, height: 22, alignItems: 'center', justifyContent: 'center',
  },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: Typography.bold },
  separator: { height: 1, backgroundColor: Colors.divider, marginLeft: 80 },
});

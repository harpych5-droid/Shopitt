import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, FlatList, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Gradients, Radius, Typography, Shadow } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { NotificationService } from '@/services/notificationService';
import { DbNotification } from '@/lib/types';
import { NOTIFICATIONS_DATA } from '@/constants/data';
import { BottomTabBar } from '@/components/layout/BottomTabBar';

const TYPE_ICON: Record<string, { name: string; color: string }> = {
  order: { name: 'bag-handle-outline', color: Colors.pink },
  like: { name: 'heart-outline', color: Colors.pink },
  comment: { name: 'chatbubble-outline', color: Colors.purple },
  message: { name: 'mail-outline', color: Colors.verified },
  follow: { name: 'person-add-outline', color: Colors.success },
};

function NotifItem({ item, onPress }: { item: any; onPress: () => void }) {
  const iconInfo = TYPE_ICON[item.type] || TYPE_ICON.order;
  return (
    <Pressable onPress={onPress} style={[styles.item, !item.read && styles.itemUnread]}>
      <View style={styles.iconWrap}>
        {item.avatar_url || item.avatar ? (
          <Image
            source={{ uri: item.avatar_url || item.avatar }}
            style={styles.avatar}
            contentFit="cover"
          />
        ) : (
          <LinearGradient colors={Gradients.primary} style={styles.iconGrad}>
            <Ionicons name={iconInfo.name as any} size={18} color="#fff" />
          </LinearGradient>
        )}
        <View style={[styles.typeDot, { backgroundColor: iconInfo.color }]}>
          <Ionicons name={iconInfo.name as any} size={9} color="#fff" />
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
        <Text style={styles.time}>{item.time || formatTime(item.created_at)}</Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </Pressable>
  );
}

function formatTime(ts: string | undefined): string {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { authUser, notifCount, refreshNotifCount } = useApp();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    if (authUser) {
      const data = await NotificationService.getForUser(authUser.id);
      setNotifs(data.length > 0 ? data : NOTIFICATIONS_DATA);
    } else {
      setNotifs(NOTIFICATIONS_DATA);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [authUser]);

  const markAllRead = async () => {
    if (authUser) {
      await NotificationService.markAllRead(authUser.id);
      await refreshNotifCount();
    }
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotifPress = async (notif: any) => {
    if (authUser && !notif.read) {
      await NotificationService.markRead(notif.id);
      await refreshNotifCount();
      setNotifs(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    }
    // Navigate based on type
    if (notif.type === 'order') router.push('/order-tracking');
    else if (notif.type === 'message') router.push('/chat');
    else if (notif.related_type === 'post' && notif.related_id) router.push(`/post/${notif.related_id}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifCount > 0 && (
          <Pressable onPress={markAllRead} style={styles.markAllBtn} hitSlop={8}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </Pressable>
        )}
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={Colors.pink} size="large" />
        </View>
      ) : (
        <FlatList
          data={notifs}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}
          renderItem={({ item }) => (
            <NotifItem item={item} onPress={() => handleNotifPress(item)} />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <LinearGradient colors={Gradients.primary} style={styles.emptyIcon}>
                <Ionicons name="notifications-outline" size={32} color="#fff" />
              </LinearGradient>
              <Text style={styles.emptyTitle}>All caught up!</Text>
              <Text style={styles.emptySubtitle}>No new notifications</Text>
            </View>
          }
        />
      )}
      <BottomTabBar />
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
  markAllBtn: { paddingVertical: 6, paddingHorizontal: 10 },
  markAllText: { color: Colors.pink, fontSize: Typography.sm, fontWeight: Typography.semibold },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  item: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  itemUnread: { backgroundColor: 'rgba(255,77,166,0.04)' },
  iconWrap: { position: 'relative' },
  avatar: { width: 46, height: 46, borderRadius: 23 },
  iconGrad: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  typeDot: {
    position: 'absolute', bottom: -2, right: -2,
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.background,
  },
  content: { flex: 1, gap: 3 },
  title: { color: '#fff', fontSize: Typography.sm, fontWeight: Typography.bold },
  body: { color: Colors.textSecondary, fontSize: Typography.sm, lineHeight: 18 },
  time: { color: Colors.textMuted, fontSize: Typography.xs, marginTop: 2 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.pink, marginTop: 6 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingTop: 80 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: '#fff', fontSize: Typography.xl, fontWeight: Typography.bold },
  emptySubtitle: { color: Colors.textSecondary, fontSize: Typography.base },
});

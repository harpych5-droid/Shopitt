import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Gradients, Radius, Typography } from '@/constants/theme';
import { NOTIFICATIONS_DATA } from '@/constants/data';
import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { useApp } from '@/contexts/AppContext';

const TYPE_ICONS: Record<string, { icon: string; color: string }> = {
  order: { icon: 'bag-handle-outline', color: Colors.purple },
  like: { icon: 'heart', color: Colors.pink },
  comment: { icon: 'chatbubble', color: Colors.gold },
  message: { icon: 'chatbubbles', color: Colors.verified },
};

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { clearNotifs } = useApp();

  useEffect(() => {
    clearNotifs();
  }, []);

  const handleTap = (type: string) => {
    if (type === 'order') router.push('/seller-dashboard');
    else if (type === 'message') router.push('/chat');
    else if (type === 'like' || type === 'comment') router.push('/(tabs)/profile');
  };

  const renderNotif = ({ item }: any) => {
    const ico = TYPE_ICONS[item.type];
    return (
      <Pressable onPress={() => handleTap(item.type)}
        style={[styles.notifCard, !item.read && styles.notifUnread]}>
        {/* Avatar or icon */}
        <View style={styles.avatarWrap}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} contentFit="cover" />
          ) : (
            <LinearGradient colors={Gradients.primary} style={styles.iconWrap}>
              <Ionicons name={ico.icon as any} size={20} color="#fff" />
            </LinearGradient>
          )}
          <View style={[styles.typeIcon, { backgroundColor: ico.color }]}>
            <Ionicons name={ico.icon as any} size={10} color="#fff" />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>

        {!item.read && <View style={styles.unreadDot} />}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <Pressable onPress={() => {}}>
          <Text style={styles.markRead}>Mark all read</Text>
        </Pressable>
      </View>

      <FlatList
        data={NOTIFICATIONS_DATA}
        keyExtractor={item => item.id}
        renderItem={renderNotif}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionText}>TODAY</Text>
          </View>
        }
      />

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
  markRead: { color: Colors.pink, fontSize: Typography.sm },
  sectionHeader: { paddingHorizontal: 16, paddingVertical: 8 },
  sectionText: { color: Colors.textMuted, fontSize: Typography.xs, fontWeight: Typography.bold, letterSpacing: 1.2 },
  list: { paddingBottom: 20 },
  notifCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  notifUnread: { backgroundColor: 'rgba(255,77,166,0.05)' },
  avatarWrap: { position: 'relative' },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  iconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  typeIcon: {
    position: 'absolute', bottom: -2, right: -2,
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.background,
  },
  content: { flex: 1, gap: 3 },
  title: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.semibold },
  body: { color: Colors.textSecondary, fontSize: Typography.sm, lineHeight: 18 },
  time: { color: Colors.textMuted, fontSize: Typography.xs },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.pink, marginTop: 6,
  },
});

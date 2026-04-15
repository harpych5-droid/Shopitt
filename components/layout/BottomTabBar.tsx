import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Gradients, Typography } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { GlobalFloatingBag } from '@/components/ui/FloatingBag';

const tabs = [
  { name: 'Home', route: '/(tabs)', icon: 'home-outline', activeIcon: 'home' },
  { name: 'Shorts', route: '/(tabs)/shorts', icon: 'play-circle-outline', activeIcon: 'play-circle' },
  { name: 'Create', route: '/(tabs)/create', icon: 'add-circle', activeIcon: 'add-circle', special: true },
  { name: 'Alerts', route: '/(tabs)/alerts', icon: 'notifications-outline', activeIcon: 'notifications' },
  { name: 'Profile', route: '/(tabs)/profile', icon: 'person-outline', activeIcon: 'person' },
];

export function BottomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { notifCount } = useApp();

  const isActive = (route: string) => {
    if (route === '/(tabs)') return pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/index';
    return pathname.includes(route.replace('/(tabs)', ''));
  };

  // Hide floating bag on shorts — it's shown in the right action stack there
  const isShorts = pathname.includes('/shorts');

  const tabBarHeight = 60 + insets.bottom;

  return (
    <View style={[styles.outerContainer, { height: tabBarHeight }]}>
      {/* Global Floating Bag — anchored left, floats above tab bar, hidden on shorts */}
      {!isShorts && (
        <View style={[styles.floatingBagAnchor, { bottom: tabBarHeight + 12 }]}>
          <GlobalFloatingBag />
        </View>
      )}

      {/* Tab bar */}
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        {tabs.map((tab) => {
          const active = isActive(tab.route);
          return (
            <Pressable
              key={tab.name}
              style={styles.tab}
              onPress={() => router.push(tab.route as any)}
              hitSlop={4}
            >
              {tab.special ? (
                <LinearGradient colors={Gradients.primary} style={styles.createBtn}>
                  <Ionicons name="add" size={28} color="#fff" />
                </LinearGradient>
              ) : (
                <View style={styles.tabInner}>
                  <View style={styles.iconWrap}>
                    <Ionicons
                      name={(active ? tab.activeIcon : tab.icon) as any}
                      size={24}
                      color={active ? Colors.pink : Colors.textMuted}
                    />
                    {tab.name === 'Alerts' && notifCount > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{notifCount}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.label, { color: active ? Colors.pink : Colors.textMuted }]}>
                    {tab.name}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'relative',
    width: '100%',
  },
  floatingBagAnchor: {
    position: 'absolute',
    left: 16,
    zIndex: 999,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    paddingHorizontal: 8,
    alignItems: 'flex-start',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  tabInner: {
    alignItems: 'center',
    gap: 3,
  },
  iconWrap: {
    position: 'relative',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
  createBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -8,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: Colors.notificationBadge,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
});

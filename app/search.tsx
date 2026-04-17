import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, ScrollView,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Gradients, Radius, Typography } from '@/constants/theme';
import { TRENDING_TAGS, SEARCH_CATEGORIES, FEATURED_SELLERS, FEED_POSTS } from '@/constants/data';
import { useApp } from '@/contexts/AppContext';

const { width } = Dimensions.get('window');
const RESULT_IMG = (width - 48) / 2;

const ICON_MAP: Record<string, string> = {
  'shirt-outline': 'shirt-outline',
  'footsteps-outline': 'walk-outline',
  'diamond-outline': 'diamond-outline',
  'time-outline': 'time-outline',
  'sparkles-outline': 'sparkles-outline',
  'watch-outline': 'watch-outline',
  'cut-outline': 'cut-outline',
  'pricetag-outline': 'pricetag-outline',
};

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currency } = useApp();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(() => {
      const q = query.toLowerCase();
      const filtered = (FEED_POSTS as any[]).filter((p: any) =>
        (p.seller || '').toLowerCase().includes(q) ||
        (p.caption || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.hashtags || []).some((h: string) => h.toLowerCase().includes(q))
      );
      setResults(filtered);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const sym = currency.symbol;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.searchRow}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <View style={[styles.searchBar, focused && styles.searchBarFocused]}>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search fashion, sellers, styles..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {query.length === 0 ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔥 Trending Searches</Text>
              <View style={styles.tagCloud}>
                {TRENDING_TAGS.map(tag => (
                  <Pressable key={tag} onPress={() => setQuery(tag.replace('#', ''))} style={styles.trendTag}>
                    <Text style={styles.trendTagText}>{tag}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Browse Categories</Text>
              <View style={styles.catGrid}>
                {SEARCH_CATEGORIES.map(cat => (
                  <Pressable key={cat.id} style={styles.catCard} onPress={() => setQuery(cat.label)}>
                    <LinearGradient colors={Gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.catIcon}>
                      <Ionicons name={(ICON_MAP[cat.icon] || 'grid-outline') as any} size={24} color="#fff" />
                    </LinearGradient>
                    <Text style={styles.catLabel}>{cat.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Featured Sellers</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {FEATURED_SELLERS.map(s => (
                  <Pressable key={s.id} style={styles.sellerChip} onPress={() => router.push('/(tabs)/profile')}>
                    <View style={styles.sellerAvatarWrap}>
                      <Image source={{ uri: s.avatar }} style={styles.sellerAvatar} contentFit="cover" />
                      {s.verified && <MaterialIcons name="verified" size={14} color={Colors.verified} style={styles.verifiedIcon} />}
                    </View>
                    <Text style={styles.sellerChipName} numberOfLines={1}>@{s.username}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </>
        ) : (
          <View style={styles.results}>
            <Text style={styles.resultsCount}>
              {results.length} {results.length === 1 ? 'result' : 'results'} for "{query}"
            </Text>

            {results.length === 0 ? (
              <View style={styles.noResults}>
                <Text style={styles.noResultsEmoji}>🔍</Text>
                <Text style={styles.noResultsText}>No results found</Text>
                <Text style={styles.noResultsSub}>Try different keywords or browse categories</Text>
              </View>
            ) : (
              <View style={styles.resultsGrid}>
                {results.map((item: any) => (
                  <Pressable key={item.id} style={styles.resultCard}
                    onPress={() => router.push({ pathname: '/post/[id]', params: { id: item.id } })}>
                    <Image source={{ uri: item.image || item.media_urls?.[0] }} style={styles.resultImg} contentFit="cover" />
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.resultGrad}>
                      <Text style={styles.resultPrice}>{item.price || `${sym}${item.price_num || ''}`}</Text>
                      <Text style={styles.resultSeller} numberOfLines={1}>@{item.seller}</Text>
                    </LinearGradient>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surface, borderRadius: Radius.pill,
    paddingHorizontal: 16, paddingVertical: 11, borderWidth: 1, borderColor: Colors.border,
  },
  searchBarFocused: { borderColor: Colors.pink },
  searchInput: { flex: 1, color: '#fff', fontSize: Typography.base },
  section: { paddingHorizontal: 16, paddingTop: 20, gap: 12 },
  sectionTitle: { color: '#fff', fontSize: Typography.lg, fontWeight: Typography.bold },
  tagCloud: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  trendTag: { borderRadius: Radius.pill, borderWidth: 1.5, borderColor: Colors.pink, paddingHorizontal: 14, paddingVertical: 8 },
  trendTagText: { color: Colors.pink, fontSize: Typography.sm, fontWeight: Typography.medium },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catCard: {
    width: (width - 52) / 4, backgroundColor: Colors.surface, borderRadius: Radius.lg,
    alignItems: 'center', paddingVertical: 14, gap: 8, borderWidth: 1, borderColor: Colors.border,
  },
  catIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  catLabel: { color: Colors.textSecondary, fontSize: 11, fontWeight: Typography.medium, textAlign: 'center' },
  sellerChip: { alignItems: 'center', gap: 6, width: 80 },
  sellerAvatarWrap: { position: 'relative' },
  sellerAvatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: Colors.pink },
  verifiedIcon: { position: 'absolute', bottom: 0, right: 0 },
  sellerChipName: { color: Colors.textSecondary, fontSize: Typography.xs, textAlign: 'center' },
  results: { padding: 16, gap: 12 },
  resultsCount: { color: Colors.textSecondary, fontSize: Typography.sm },
  resultsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  resultCard: { width: RESULT_IMG, height: RESULT_IMG * 1.3, borderRadius: Radius.lg, overflow: 'hidden', position: 'relative' },
  resultImg: { width: '100%', height: '100%' },
  resultGrad: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, gap: 2 },
  resultPrice: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.black },
  resultSeller: { color: Colors.textSecondary, fontSize: Typography.xs },
  noResults: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  noResultsEmoji: { fontSize: 40 },
  noResultsText: { color: '#fff', fontSize: Typography.lg, fontWeight: Typography.bold },
  noResultsSub: { color: Colors.textSecondary, fontSize: Typography.sm, textAlign: 'center' },
});

import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Dimensions,
  Animated, TextInput, KeyboardAvoidingView, Platform, FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Gradients, Radius, Typography, Shadow, Spacing } from '@/constants/theme';
import { FEED_POSTS } from '@/constants/data';
import { BuyNowButton } from '@/components/ui/GradientButton';
import { useApp } from '@/contexts/AppContext';

const { width, height } = Dimensions.get('window');

// ─── Mock Comments Data ──────────────────────────────────────
const EMOJI_REACTIONS = ['🔥', '❤️', '😍', '💯', '👏', '🙌'];

const MOCK_COMMENTS = [
  {
    id: 'cm1',
    username: 'zm_jordanlungu',
    avatar: 'https://images.unsplash.com/photo-1587015990127-424b954571b4?w=80&h=80&fit=crop&crop=face',
    text: 'Still available? Sending money now 🔥🔥',
    time: '2m',
    likes: 47,
    liked: false,
    verified: false,
    isPinned: false,
    reactions: { '🔥': 12, '❤️': 8 },
    replies: [
      {
        id: 'r1',
        username: 'shop_sharonthreads_plug',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
        text: 'Yes still available! DM me to confirm 🙌',
        time: '1m',
        likes: 23,
        liked: false,
        verified: true,
        isSeller: true,
      },
    ],
  },
  {
    id: 'cm2',
    username: 'shop_sharonthreads_plug',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    text: 'Thank you all for the love! 📦 Orders shipping within 24h. Fast delivery guaranteed 🚀',
    time: '5m',
    likes: 128,
    liked: false,
    verified: true,
    isPinned: true,
    isSeller: true,
    reactions: { '🔥': 34, '❤️': 28, '👏': 15 },
    replies: [],
  },
  {
    id: 'cm3',
    username: 'the_sharonkunda',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=face',
    text: 'Ordered last week, quality is 10/10 no cap 💯',
    time: '18m',
    likes: 89,
    liked: false,
    verified: true,
    isPinned: false,
    reactions: { '💯': 19, '🙌': 11 },
    replies: [
      {
        id: 'r2',
        username: 'zm_stellalungu_store',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
        text: 'Facts! I copped one last month, legit fire 🔥',
        time: '14m',
        likes: 31,
        liked: false,
        verified: false,
        isSeller: false,
      },
      {
        id: 'r3',
        username: 'official_samuelnyirenda_5',
        avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=80&h=80&fit=crop&crop=face',
        text: 'Same experience here, fast delivery 👌',
        time: '10m',
        likes: 14,
        liked: false,
        verified: false,
        isSeller: false,
      },
    ],
  },
  {
    id: 'cm4',
    username: 'zm_sharonmwape_plug',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face',
    text: 'Is delivery available to Ndola?',
    time: '34m',
    likes: 12,
    liked: false,
    verified: false,
    isPinned: false,
    reactions: {},
    replies: [],
  },
  {
    id: 'cm5',
    username: 'zm_stylesbychanda',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=face',
    text: 'This colourway is insane 😍😍 copped 2',
    time: '1h',
    likes: 203,
    liked: false,
    verified: false,
    isPinned: false,
    reactions: { '😍': 67, '🔥': 44 },
    replies: [],
  },
];

// ─── Animated count helper ───────────────────────────────────
function useCountAnim(target: number) {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    Animated.timing(anim, { toValue: target, duration: 800, useNativeDriver: false }).start();
    const sub = anim.addListener(({ value: v }) => setDisplay(Math.round(v)));
    return () => anim.removeListener(sub);
  }, [target]);
  return display;
}

// ─── Reply Component ─────────────────────────────────────────
function ReplyItem({ reply }: { reply: any }) {
  const [liked, setLiked] = useState(reply.liked);
  const [likes, setLikes] = useState(reply.likes);
  const scale = useRef(new Animated.Value(1)).current;

  const handleLike = () => {
    setLiked((v: boolean) => !v);
    setLikes((v: number) => liked ? v - 1 : v + 1);
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.4, useNativeDriver: true, speed: 80 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40 }),
    ]).start();
  };

  return (
    <View style={styles.replyItem}>
      <View style={styles.replyLine} />
      <Image source={{ uri: reply.avatar }} style={styles.replyAvatar} contentFit="cover" />
      <View style={styles.replyContent}>
        <View style={styles.replyHeader}>
          <Text style={styles.replyUsername}>{reply.username}</Text>
          {reply.verified && <MaterialIcons name="verified" size={11} color={Colors.verified} style={{ marginLeft: 3 }} />}
          {reply.isSeller && (
            <View style={styles.sellerTag}>
              <Text style={styles.sellerTagText}>Seller</Text>
            </View>
          )}
          <Text style={styles.commentTime}>{reply.time}</Text>
        </View>
        <Text style={styles.commentText}>{reply.text}</Text>
        <View style={styles.commentActions}>
          <Animated.View style={{ transform: [{ scale }] }}>
            <Pressable onPress={handleLike} style={styles.likeBtn} hitSlop={8}>
              <Ionicons name={liked ? 'heart' : 'heart-outline'} size={13} color={liked ? Colors.pink : Colors.textMuted} />
              <Text style={[styles.likeBtnText, liked && { color: Colors.pink }]}>{likes}</Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

// ─── Comment Component ───────────────────────────────────────
function CommentItem({ comment, onReply }: { comment: any; onReply: (username: string) => void }) {
  const [liked, setLiked] = useState(comment.liked);
  const [likes, setLikes] = useState(comment.likes);
  const [showReplies, setShowReplies] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [localReactions, setLocalReactions] = useState<Record<string, number>>(comment.reactions || {});
  const scale = useRef(new Animated.Value(1)).current;
  const displayLikes = useCountAnim(likes);

  const handleLike = () => {
    setLiked((v: boolean) => !v);
    setLikes((v: number) => liked ? v - 1 : v + 1);
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.45, useNativeDriver: true, speed: 80 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40 }),
    ]).start();
  };

  const addReaction = (emoji: string) => {
    setLocalReactions(prev => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));
    setShowEmojiPicker(false);
  };

  return (
    <View style={[styles.commentItem, comment.isPinned && styles.pinnedComment]}>
      {comment.isPinned && (
        <View style={styles.pinnedBadge}>
          <Ionicons name="pin" size={11} color={Colors.pink} />
          <Text style={styles.pinnedText}>Pinned by seller</Text>
        </View>
      )}
      <View style={styles.commentRow}>
        <Image source={{ uri: comment.avatar }} style={styles.commentAvatar} contentFit="cover" />
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentUsername}>{comment.username}</Text>
            {comment.verified && <MaterialIcons name="verified" size={12} color={Colors.verified} style={{ marginLeft: 3 }} />}
            {comment.isSeller && (
              <View style={styles.sellerTag}>
                <Text style={styles.sellerTagText}>Seller</Text>
              </View>
            )}
            <Text style={styles.commentTime}>{comment.time}</Text>
          </View>
          <Text style={styles.commentText}>{comment.text}</Text>

          {/* Reactions bar */}
          {Object.keys(localReactions).length > 0 && (
            <View style={styles.reactionsBar}>
              {Object.entries(localReactions).map(([emoji, count]) => (
                <Pressable key={emoji} onPress={() => addReaction(emoji)} style={styles.reactionPill}>
                  <Text style={styles.reactionEmoji}>{emoji}</Text>
                  <Text style={styles.reactionCount}>{count as number}</Text>
                </Pressable>
              ))}
              <Pressable onPress={() => setShowEmojiPicker(v => !v)} style={styles.addReactionBtn}>
                <Ionicons name="add-circle-outline" size={15} color={Colors.textMuted} />
              </Pressable>
            </View>
          )}

          {/* Emoji picker */}
          {showEmojiPicker && (
            <View style={styles.emojiPicker}>
              {EMOJI_REACTIONS.map(e => (
                <Pressable key={e} onPress={() => addReaction(e)} style={styles.emojiBtn}>
                  <Text style={styles.emojiText}>{e}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Actions */}
          <View style={styles.commentActions}>
            <Animated.View style={{ transform: [{ scale }] }}>
              <Pressable onPress={handleLike} style={styles.likeBtn} hitSlop={8}>
                <Ionicons name={liked ? 'heart' : 'heart-outline'} size={14} color={liked ? Colors.pink : Colors.textMuted} />
                <Text style={[styles.likeBtnText, liked && { color: Colors.pink }]}>{displayLikes}</Text>
              </Pressable>
            </Animated.View>
            <Pressable onPress={() => onReply(comment.username)} style={styles.replyBtn} hitSlop={8}>
              <Text style={styles.replyBtnText}>Reply</Text>
            </Pressable>
            {Object.keys(localReactions).length === 0 && (
              <Pressable onPress={() => setShowEmojiPicker(v => !v)} style={styles.replyBtn} hitSlop={8}>
                <Text style={styles.replyBtnText}>React</Text>
              </Pressable>
            )}
          </View>

          {/* Replies toggle */}
          {comment.replies?.length > 0 && (
            <Pressable onPress={() => setShowReplies(v => !v)} style={styles.viewRepliesBtn}>
              <View style={styles.viewRepliesLine} />
              <Text style={styles.viewRepliesText}>
                {showReplies ? 'Hide' : `View ${comment.replies.length}`} {comment.replies.length === 1 ? 'reply' : 'replies'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Nested Replies */}
      {showReplies && comment.replies?.map((r: any) => (
        <ReplyItem key={r.id} reply={r} />
      ))}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────
export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addToBag } = useApp();

  const post = FEED_POSTS.find(p => p.id === id) || FEED_POSTS[0];

  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(post.comments);
  const inputRef = useRef<TextInput>(null);
  const countDisplay = useCountAnim(totalCount);

  // Slight zoom on media image
  const imageScale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(imageScale, { toValue: 1.03, duration: 8000, useNativeDriver: true }),
        Animated.timing(imageScale, { toValue: 1, duration: 8000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleBuy = () => {
    addToBag({
      id: post.id,
      postId: post.id,
      seller: post.seller,
      image: post.image,
      price: post.price,
      priceNum: parseInt(post.price.replace(/[^0-9]/g, '')) || 200,
      product: post.caption.split(' ').slice(0, 4).join(' '),
    });
    router.push('/bag');
  };

  const handleReply = (username: string) => {
    setReplyingTo(username);
    setCommentText(`@${username} `);
    inputRef.current?.focus();
  };

  const handleSendComment = () => {
    const text = commentText.trim();
    if (!text) return;
    const newComment = {
      id: `cm${Date.now()}`,
      username: 'the_joystreet_shop',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
      text,
      time: 'Just now',
      likes: 0,
      liked: false,
      verified: true,
      isPinned: false,
      isSeller: true,
      reactions: {},
      replies: [],
    };
    setComments(prev => [newComment, ...prev]);
    setTotalCount(v => v + 1);
    setCommentText('');
    setReplyingTo(null);
  };

  // Sort: pinned first
  const sortedComments = [...comments].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Fullscreen Media */}
      <View style={styles.mediaWrap}>
        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ scale: imageScale }] }]}>
          <Image source={{ uri: post.image }} style={StyleSheet.absoluteFill} contentFit="cover" />
        </Animated.View>
        <LinearGradient colors={['rgba(0,0,0,0.55)', 'transparent']} style={styles.topGrad} />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.97)']} style={styles.bottomGrad} />

        {/* Close */}
        <Pressable onPress={() => router.back()} style={[styles.closeBtn, { top: insets.top + 12 }]}>
          <Ionicons name="close" size={22} color="#fff" />
        </Pressable>
      </View>

      {/* Scrollable bottom sheet */}
      <ScrollView
        style={styles.sheet}
        contentContainerStyle={{ paddingBottom: 90 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Trust row */}
        <View style={styles.trustRow}>
          <View style={styles.trustBadge}>
            <MaterialIcons name="verified" size={13} color={Colors.verified} />
            <Text style={styles.trustText}>Verified Seller</Text>
          </View>
          <View style={styles.trustBadge}>
            <Ionicons name="flash" size={13} color={Colors.gold} />
            <Text style={styles.trustText}>Ships in 24h</Text>
          </View>
          <View style={styles.trustBadge}>
            <Ionicons name="shield-checkmark" size={13} color={Colors.success} />
            <Text style={styles.trustText}>Buyer Protection</Text>
          </View>
        </View>

        {/* Social proof */}
        <View style={styles.socialProof}>
          <View style={styles.proofItem}>
            <Text style={styles.proofEmoji}>🔥</Text>
            <Text style={styles.proofText}>{post.sold} bought today</Text>
          </View>
          <View style={styles.proofItem}>
            <Text style={styles.proofEmoji}>👀</Text>
            <Text style={styles.proofText}>87 viewing now</Text>
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.pricingRow}>
          <View>
            <Text style={styles.oldPrice}>{post.oldPrice}</Text>
            <Text style={styles.newPrice}>{post.price}</Text>
          </View>
          {post.freeDelivery && (
            <View style={styles.freeDelivery}>
              <Ionicons name="car-outline" size={13} color={Colors.success} />
              <Text style={styles.freeDeliveryText}>Free Delivery</Text>
            </View>
          )}
        </View>

        {/* Seller */}
        <Pressable style={styles.sellerRow} onPress={() => router.push('/(tabs)/profile')}>
          <Image source={{ uri: post.sellerAvatar }} style={styles.sellerAvatar} contentFit="cover" />
          <View style={{ flex: 1 }}>
            <View style={styles.sellerNameRow}>
              <Text style={styles.sellerName}>{post.seller}</Text>
              {post.verified && <MaterialIcons name="verified" size={13} color={Colors.verified} style={{ marginLeft: 4 }} />}
            </View>
            <Text style={styles.sellerLocation}>📍 {post.location}</Text>
          </View>
          <Pressable style={styles.msgBtn} onPress={() => router.push('/chat')}>
            <Ionicons name="chatbubble-outline" size={16} color={Colors.pink} />
            <Text style={styles.msgText}>Message</Text>
          </Pressable>
        </Pressable>

        {/* Description */}
        <Text style={styles.caption}>{post.caption}</Text>

        {/* Stock warning */}
        {post.stockLeft > 0 && post.stockLeft <= 8 && (
          <View style={styles.stockWarn}>
            <Ionicons name="warning-outline" size={15} color={Colors.orange} />
            <Text style={styles.stockWarnText}>Only {post.stockLeft} left — order soon!</Text>
          </View>
        )}

        {/* Hashtags */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {post.hashtags.map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Delivery stats */}
        <View style={styles.statsRow}>
          {[
            { icon: 'time-outline', label: 'Dispatch', value: '24 hours' },
            { icon: 'location-outline', label: 'Delivery', value: '2–4 days' },
            { icon: 'return-up-back-outline', label: 'Returns', value: '7 days' },
          ].map(s => (
            <View key={s.label} style={styles.stat}>
              <Ionicons name={s.icon as any} size={19} color={Colors.pink} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── COMMENTS SECTION ── */}
        <View style={styles.commentsSection}>
          <View style={styles.commentsTitleRow}>
            <Text style={styles.commentsTitle}>Comments</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{countDisplay.toLocaleString()}</Text>
            </View>
          </View>

          {/* Pinned + regular */}
          {sortedComments.map(comment => (
            <CommentItem key={comment.id} comment={comment} onReply={handleReply} />
          ))}

          {/* Load more placeholder */}
          <Pressable style={styles.loadMoreBtn}>
            <Text style={styles.loadMoreText}>Load more comments</Text>
            <Ionicons name="chevron-down" size={16} color={Colors.textMuted} />
          </Pressable>
        </View>
      </ScrollView>

      {/* CTA Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 8 }]}>
        <Pressable style={styles.bagBtn} onPress={() => addToBag({
          id: post.id, postId: post.id, seller: post.seller,
          image: post.image, price: post.price,
          priceNum: parseInt(post.price.replace(/[^0-9]/g, '')) || 200,
          product: post.caption.split(' ').slice(0, 4).join(' '),
        })}>
          <Ionicons name="bag-add-outline" size={20} color="#fff" />
          <Text style={styles.bagBtnText}>Add to Bag</Text>
        </Pressable>
        <BuyNowButton
          label={post.type === 'service' ? 'Book Now' : 'Buy Now'}
          onPress={handleBuy}
        />
      </View>

      {/* ── STICKY COMMENT INPUT ── */}
      <View style={[styles.commentInputBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        {replyingTo && (
          <View style={styles.replyingToBar}>
            <Text style={styles.replyingToText}>Replying to <Text style={{ color: Colors.pink }}>@{replyingTo}</Text></Text>
            <Pressable onPress={() => { setReplyingTo(null); setCommentText(''); }} hitSlop={8}>
              <Ionicons name="close" size={16} color={Colors.textMuted} />
            </Pressable>
          </View>
        )}
        <View style={styles.commentInputRow}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face' }}
            style={styles.inputAvatar}
            contentFit="cover"
          />
          <TextInput
            ref={inputRef}
            style={styles.commentInput}
            placeholder={replyingTo ? `Reply to @${replyingTo}...` : 'Add a comment...'}
            placeholderTextColor={Colors.textMuted}
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={300}
            returnKeyType="send"
            onSubmitEditing={handleSendComment}
          />
          {/* Emoji quick-add */}
          <Pressable
            onPress={handleSendComment}
            style={[styles.sendBtn, commentText.trim() ? styles.sendBtnActive : null]}
            disabled={!commentText.trim()}
          >
            <LinearGradient
              colors={commentText.trim() ? Gradients.primary : ['#333', '#444']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.sendBtnGrad}
            >
              <Ionicons name="send" size={16} color="#fff" />
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Media
  mediaWrap: {
    height: height * 0.34,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  topGrad: { position: 'absolute', top: 0, left: 0, right: 0, height: 100, zIndex: 2 },
  bottomGrad: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, zIndex: 2 },
  closeBtn: {
    position: 'absolute', left: 16, zIndex: 20,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Sheet
  sheet: { flex: 1, backgroundColor: Colors.background },

  // Trust
  trustRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 16, flexWrap: 'wrap' },
  trustBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surface, borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: Colors.border,
  },
  trustText: { color: Colors.textSecondary, fontSize: Typography.xs, fontWeight: Typography.medium },
  socialProof: { flexDirection: 'row', gap: 16, paddingHorizontal: 16, marginTop: 12 },
  proofItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  proofEmoji: { fontSize: 15 },
  proofText: { color: '#fff', fontSize: Typography.sm, fontWeight: Typography.semibold },
  pricingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, marginTop: 12,
  },
  oldPrice: { color: Colors.textMuted, fontSize: Typography.base, textDecorationLine: 'line-through' },
  newPrice: { color: '#fff', fontSize: 34, fontWeight: Typography.black, letterSpacing: -1 },
  freeDelivery: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,200,81,0.1)', borderRadius: Radius.pill,
    paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: Colors.success,
  },
  freeDeliveryText: { color: Colors.success, fontSize: Typography.xs, fontWeight: Typography.semibold },

  // Seller
  sellerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: 12, marginHorizontal: 16, marginTop: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  sellerAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: Colors.pink },
  sellerNameRow: { flexDirection: 'row', alignItems: 'center' },
  sellerName: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold },
  sellerLocation: { color: Colors.textMuted, fontSize: Typography.xs, marginTop: 2 },
  msgBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: Colors.pink, borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  msgText: { color: Colors.pink, fontSize: Typography.xs, fontWeight: Typography.semibold },
  caption: { color: Colors.textSecondary, fontSize: Typography.base, lineHeight: 22, paddingHorizontal: 16, marginTop: 12 },
  stockWarn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,140,0,0.1)', borderRadius: Radius.md,
    padding: 10, marginHorizontal: 16, marginTop: 8,
    borderWidth: 1, borderColor: Colors.orange,
  },
  stockWarnText: { color: Colors.orange, fontSize: Typography.sm },
  tags: { paddingHorizontal: 16, marginTop: 8 },
  tag: {
    backgroundColor: 'rgba(255,77,166,0.1)', borderRadius: Radius.pill,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(255,77,166,0.2)',
  },
  tagText: { color: Colors.pink, fontSize: Typography.xs },
  statsRow: {
    flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: 14, marginHorizontal: 16, marginTop: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { color: '#fff', fontSize: Typography.sm, fontWeight: Typography.bold },
  statLabel: { color: Colors.textMuted, fontSize: Typography.xs },

  // Comments section
  commentsSection: { marginTop: 20, paddingHorizontal: 16 },
  commentsTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  commentsTitle: { color: '#fff', fontSize: Typography.lg, fontWeight: Typography.black },
  countBadge: {
    backgroundColor: 'rgba(255,77,166,0.15)', borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 3,
    borderWidth: 1, borderColor: 'rgba(255,77,166,0.3)',
  },
  countBadgeText: { color: Colors.pink, fontSize: Typography.xs, fontWeight: Typography.bold },

  // Comment item
  commentItem: { marginBottom: 18 },
  pinnedComment: {
    backgroundColor: 'rgba(255,77,166,0.05)', borderRadius: Radius.lg,
    padding: 12, borderWidth: 1, borderColor: 'rgba(255,77,166,0.15)',
  },
  pinnedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginBottom: 8,
  },
  pinnedText: { color: Colors.pink, fontSize: Typography.xs, fontWeight: Typography.semibold },
  commentRow: { flexDirection: 'row', gap: 10 },
  commentAvatar: { width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: Colors.border },
  commentContent: { flex: 1, gap: 5 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  commentUsername: { color: '#fff', fontSize: Typography.sm, fontWeight: Typography.bold },
  commentTime: { color: Colors.textMuted, fontSize: Typography.xs, marginLeft: 'auto' },
  commentText: { color: Colors.textSecondary, fontSize: Typography.sm, lineHeight: 19 },
  sellerTag: {
    backgroundColor: 'rgba(255,77,166,0.15)', borderRadius: Radius.pill,
    paddingHorizontal: 7, paddingVertical: 2,
    borderWidth: 1, borderColor: 'rgba(255,77,166,0.3)',
  },
  sellerTagText: { color: Colors.pink, fontSize: 9, fontWeight: Typography.bold },

  // Reactions
  reactionsBar: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  reactionPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.surface, borderRadius: Radius.pill,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: Colors.border,
  },
  reactionEmoji: { fontSize: 13 },
  reactionCount: { color: Colors.textSecondary, fontSize: Typography.xs, fontWeight: Typography.semibold },
  addReactionBtn: { padding: 3 },
  emojiPicker: {
    flexDirection: 'row', gap: 6, backgroundColor: Colors.surface,
    borderRadius: Radius.lg, padding: 8, borderWidth: 1, borderColor: Colors.border,
    flexWrap: 'wrap',
  },
  emojiBtn: { padding: 4 },
  emojiText: { fontSize: 20 },

  // Comment actions
  commentActions: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 2 },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  likeBtnText: { color: Colors.textMuted, fontSize: Typography.xs, fontWeight: Typography.semibold },
  replyBtn: { paddingVertical: 2 },
  replyBtnText: { color: Colors.textMuted, fontSize: Typography.xs, fontWeight: Typography.semibold },

  // View replies
  viewRepliesBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  viewRepliesLine: { width: 20, height: 1, backgroundColor: Colors.border },
  viewRepliesText: { color: Colors.pink, fontSize: Typography.xs, fontWeight: Typography.semibold },

  // Nested reply
  replyItem: { flexDirection: 'row', marginLeft: 44, marginTop: 10, gap: 8 },
  replyLine: {
    position: 'absolute', left: -28, top: -8, bottom: 0,
    width: 1.5, backgroundColor: Colors.border,
  },
  replyAvatar: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: Colors.border },
  replyContent: { flex: 1, gap: 4 },
  replyHeader: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  replyUsername: { color: '#fff', fontSize: Typography.xs, fontWeight: Typography.bold },

  // Load more
  loadMoreBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 14, borderTopWidth: 1, borderTopColor: Colors.divider, marginTop: 8,
  },
  loadMoreText: { color: Colors.textMuted, fontSize: Typography.sm },

  // Footer CTA
  footer: {
    flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 10,
    backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  bagBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.surface, borderRadius: Radius.pill,
    borderWidth: 1.5, borderColor: Colors.border, paddingVertical: 13,
  },
  bagBtnText: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.semibold },

  // Comment input bar
  commentInputBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    paddingHorizontal: 12,
  },
  replyingToBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 5, paddingHorizontal: 4, marginBottom: 6,
  },
  replyingToText: { color: Colors.textMuted, fontSize: Typography.xs },
  commentInputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  inputAvatar: { width: 32, height: 32, borderRadius: 16, marginBottom: 4 },
  commentInput: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 9,
    color: '#fff',
    fontSize: Typography.sm,
    maxHeight: 100,
    lineHeight: 18,
  },
  sendBtn: { marginBottom: 2 },
  sendBtnActive: {},
  sendBtnGrad: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
});

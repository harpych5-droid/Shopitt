import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput, FlatList,
  KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Gradients, Radius, Typography } from '@/constants/theme';
import { CHAT_LIST } from '@/constants/data';

interface Message {
  id: string;
  text: string;
  sent: boolean;
  time: string;
}

const INITIAL_MSGS: Message[] = [
  { id: 'm1', text: 'Hey! Is delivery available to Ndola?', sent: false, time: 'Just now' },
  { id: 'm2', text: 'Yes, we deliver to Ndola! Usually 2-3 days.', sent: true, time: 'Just now' },
  { id: 'm3', text: 'How much is the delivery fee?', sent: false, time: '1m ago' },
  { id: 'm4', text: 'Free delivery for orders above K500! 🔥', sent: true, time: '1m ago' },
  { id: 'm5', text: 'Amazing! Can I pay on delivery?', sent: false, time: '2m ago' },
];

const AUTO_REPLIES = [
  'Yes, absolutely! 😊',
  'Let me check that for you...',
  'That item is still available! 🔥',
  'We can do cash on delivery 👍',
  'Great choice! You won\'t regret it ✨',
  'Feel free to ask anything else!',
];

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MSGS);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingDot = useRef(new Animated.Value(0)).current;
  const flatRef = useRef<FlatList>(null);

  const chat = CHAT_LIST.find(c => c.id === id) || CHAT_LIST[0];

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(typingDot, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(typingDot, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    );
    if (isTyping) anim.start();
    else anim.stop();
    return () => anim.stop();
  }, [isTyping]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: `m${Date.now()}`,
      text: input.trim(),
      sent: true,
      time: 'Just now',
    };
    setMessages(prev => [...prev, newMsg]);
    setInput('');

    // Simulate reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const reply: Message = {
        id: `m${Date.now() + 1}`,
        text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)],
        sent: false,
        time: 'Just now',
      };
      setMessages(prev => [...prev, reply]);
    }, 1500 + Math.random() * 1000);
  };

  const renderMsg = ({ item }: { item: Message }) => (
    <View style={[styles.msgWrap, item.sent ? styles.msgWrapSent : styles.msgWrapReceived]}>
      {!item.sent && (
        <Image source={{ uri: chat.avatar }} style={styles.msgAvatar} contentFit="cover" />
      )}
      {item.sent ? (
        <LinearGradient colors={Gradients.primary} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
          style={[styles.bubble, styles.bubbleSent]}>
          <Text style={[styles.bubbleText, { color: '#fff' }]}>{item.text}</Text>
          <Text style={[styles.bubbleTime, { color: 'rgba(255,255,255,0.6)' }]}>{item.time}</Text>
        </LinearGradient>
      ) : (
        <View style={[styles.bubble, styles.bubbleReceived]}>
          <Text style={styles.bubbleText}>{item.text}</Text>
          <Text style={styles.bubbleTime}>{item.time}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <View style={styles.headerUser}>
          <View style={styles.headerAvatarWrap}>
            <Image source={{ uri: chat.avatar }} style={styles.headerAvatar} contentFit="cover" />
            {chat.online && <View style={styles.onlineDot} />}
          </View>
          <View>
            <Text style={styles.headerName}>{chat.username}</Text>
            <Text style={styles.headerStatus}>{chat.online ? '● Online' : '● Offline'}</Text>
          </View>
        </View>
        <Pressable hitSlop={8}>
          <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMsg}
          contentContainerStyle={styles.msgList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={isTyping ? (
            <View style={styles.typingWrap}>
              <Image source={{ uri: chat.avatar }} style={styles.msgAvatar} contentFit="cover" />
              <View style={styles.typingBubble}>
                {[0, 1, 2].map(i => (
                  <Animated.View key={i} style={[styles.typingDot, {
                    opacity: typingDot,
                    transform: [{ translateY: typingDot.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
                  }]} />
                ))}
              </View>
            </View>
          ) : null}
        />

        {/* Input */}
        <View style={[styles.inputRow, { paddingBottom: insets.bottom + 8 }]}>
          <Pressable style={styles.attachBtn} hitSlop={8}>
            <Ionicons name="image-outline" size={22} color={Colors.textMuted} />
          </Pressable>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor={Colors.textMuted}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
            />
          </View>
          <Pressable onPress={sendMessage}
            style={[styles.sendBtn, input.trim().length > 0 && styles.sendBtnActive]}>
            {input.trim().length > 0 ? (
              <LinearGradient colors={Gradients.primary} style={styles.sendBtnGrad}>
                <Ionicons name="send" size={18} color="#fff" />
              </LinearGradient>
            ) : (
              <View style={[styles.sendBtnGrad, { backgroundColor: Colors.surface }]}>
                <Ionicons name="send" size={18} color={Colors.textMuted} />
              </View>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerUser: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, paddingHorizontal: 16 },
  headerAvatarWrap: { position: 'relative' },
  headerAvatar: { width: 40, height: 40, borderRadius: 20 },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.success, borderWidth: 1.5, borderColor: Colors.background,
  },
  headerName: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold },
  headerStatus: { color: Colors.success, fontSize: Typography.xs },
  msgList: { padding: 16, gap: 12 },
  msgWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgWrapSent: { justifyContent: 'flex-end' },
  msgWrapReceived: { justifyContent: 'flex-start' },
  msgAvatar: { width: 28, height: 28, borderRadius: 14 },
  bubble: { maxWidth: '75%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, gap: 4 },
  bubbleSent: { borderBottomRightRadius: 4 },
  bubbleReceived: { backgroundColor: Colors.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: Colors.border },
  bubbleText: { color: Colors.textPrimary, fontSize: Typography.base, lineHeight: 20 },
  bubbleTime: { color: Colors.textMuted, fontSize: 10, alignSelf: 'flex-end' },
  typingWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginTop: 4 },
  typingBubble: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  typingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.textMuted },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: 12, paddingTop: 8,
    borderTopWidth: 1, borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  attachBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  inputWrap: {
    flex: 1, backgroundColor: Colors.surface,
    borderRadius: 20, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 8, maxHeight: 100,
  },
  textInput: { color: '#fff', fontSize: Typography.base, includeFontPadding: false },
  sendBtn: { width: 40, height: 40 },
  sendBtnActive: {},
  sendBtnGrad: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});

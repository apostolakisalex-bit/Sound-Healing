// AI Wellness Assistant — Aeon Oracle (Claude Sonnet 4.5)
import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Heading, Body, Overline, BreathingGlow } from '@/src/components/UI';
import { api } from '@/src/api/client';
import { colors, spacing, radii, fonts } from '@/src/theme';

type Msg = { role: 'user' | 'assistant'; content: string };

const SUGGESTIONS = [
  'I feel overwhelmed today. What sound practice helps?',
  'Suggest a 5-minute meditation before sleep.',
  'Which realm should I explore next?',
  'How do I deepen my listening practice?',
];

export default function AIChat() {
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scroll = useRef<ScrollView>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/ai/history');
        if (data.length === 0) {
          setMessages([{ role: 'assistant', content: 'Welcome, traveler. I am Aeon — your guide through the sonic temple. What brings you here today?' }]);
        } else {
          setMessages(data.map((m: any) => ({ role: m.role, content: m.content })));
        }
      } catch {
        setMessages([{ role: 'assistant', content: 'The temple breathes. How may I guide you?' }]);
      }
    })();
  }, []);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || busy) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setBusy(true);
    try {
      const { data } = await api.post('/ai/chat', { message: msg });
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'The oracle is silent for a moment. Try again shortly.' }]);
    } finally {
      setBusy(false);
      setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0F0A1D', '#05050A']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }} keyboardVerticalOffset={20}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} testID="close-btn"><Ionicons name="close" size={26} color={colors.text.primary} /></Pressable>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <BreathingGlow>
                <View style={styles.orb}><Ionicons name="sparkles" size={18} color={colors.accent.gold} /></View>
              </BreathingGlow>
              <Heading size="h4" style={{ marginTop: 4 }}>Aeon</Heading>
              <Overline color={colors.text.muted}>Wellness Oracle</Overline>
            </View>
            <View style={{ width: 26 }} />
          </View>

          <ScrollView
            ref={scroll}
            contentContainerStyle={styles.messages}
            onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: false })}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((m, i) => (
              <Animated.View
                key={i}
                entering={FadeIn.duration(400)}
                style={[styles.bubble, m.role === 'user' ? styles.userBubble : styles.aiBubble]}
              >
                {m.role === 'assistant' && <Overline color={colors.accent.gold} style={{ marginBottom: 4 }}>Aeon</Overline>}
                <Body color={m.role === 'user' ? colors.bg.primary : colors.text.primary} style={{ lineHeight: 22 }}>{m.content}</Body>
              </Animated.View>
            ))}
            {busy && (
              <View style={[styles.bubble, styles.aiBubble]}>
                <ActivityIndicator color={colors.accent.gold} />
              </View>
            )}
            {messages.length === 1 && (
              <View style={{ gap: spacing.xs, marginTop: spacing.md }}>
                {SUGGESTIONS.map(s => (
                  <Pressable key={s} onPress={() => send(s)} style={styles.suggestion} testID={`suggest-${s.substring(0, 10)}`}>
                    <Body size="small" color={colors.accent.cyan}>{s}</Body>
                  </Pressable>
                ))}
              </View>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>

          <View style={styles.inputRow}>
            <TextInput
              testID="ai-input"
              style={styles.input}
              placeholder="Speak to the oracle…"
              placeholderTextColor={colors.text.muted}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
            />
            <Pressable
              onPress={() => send()}
              testID="ai-send"
              disabled={busy || !input.trim()}
              style={({ pressed }) => [styles.sendBtn, { opacity: !input.trim() || busy ? 0.4 : pressed ? 0.7 : 1 }]}
            >
              <Ionicons name="arrow-up" size={22} color={colors.bg.primary} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, paddingBottom: spacing.lg },
  orb: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(204,163,82,0.15)', borderWidth: 1, borderColor: colors.accent.gold },
  messages: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  bubble: { maxWidth: '85%', padding: spacing.md, borderRadius: radii.lg, marginBottom: spacing.sm },
  userBubble: { alignSelf: 'flex-end', backgroundColor: colors.accent.gold, borderBottomRightRadius: 4 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: colors.bg.secondary, borderWidth: 1, borderColor: colors.border.default, borderBottomLeftRadius: 4 },
  suggestion: {
    padding: spacing.sm, borderRadius: radii.full, borderWidth: 1, borderColor: colors.accent.cyan,
    backgroundColor: 'rgba(77,208,225,0.06)', alignSelf: 'flex-start',
  },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: spacing.md, gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border.subtle },
  input: {
    flex: 1, maxHeight: 100, backgroundColor: colors.bg.secondary, borderRadius: radii.lg,
    borderWidth: 1, borderColor: colors.border.default, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    color: colors.text.primary, fontFamily: fonts.body, fontSize: 15,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent.gold, alignItems: 'center', justifyContent: 'center' },
});

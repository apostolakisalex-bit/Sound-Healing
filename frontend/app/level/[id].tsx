// Level detail: lessons
import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Heading, Body, Overline, GlowCard } from '@/src/components/UI';
import { ResourcesSection } from '@/src/components/ResourcesSection';
import { useAuth } from '@/src/auth/AuthContext';
import { api } from '@/src/api/client';
import { colors, spacing, radii } from '@/src/theme';

const TYPE_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  video: 'play-circle-outline',
  audio: 'headset-outline',
  ritual: 'flame-outline',
};

export default function LevelDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { refresh } = useAuth();
  const [level, setLevel] = useState<any>(null);
  const [completing, setCompleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    try { const { data } = await api.get(`/academy/${id}`); setLevel(data); } catch {}
  }, [id]);
  useEffect(() => { load(); }, [load]);

  const completeLesson = async (lessonId: string) => {
    setCompleting(lessonId);
    try {
      const { data } = await api.post(`/academy/${id}/lesson/${lessonId}/complete`);
      await refresh();
      if (data.leveled_up) {
        Alert.alert('Ascension', `You have entered ${data.new_level}. The temple expands.`);
      } else if (data.already_completed) {
        Alert.alert('Already integrated', 'This lesson has been completed before.');
      } else {
        Alert.alert('+50 XP', 'Lesson integrated. Resonance honored.');
      }
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.detail || 'Could not complete');
    } finally { setCompleting(null); }
  };

  if (!level) return <View style={{ flex: 1, backgroundColor: colors.bg.primary }} />;

  return (
    <View style={styles.root}>
      <LinearGradient colors={[colors.bg.primary, colors.bg.tertiary]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} testID="back-btn">
          <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
          <Body color={colors.text.primary}>Academy</Body>
        </Pressable>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(500)}>
            <Overline color={colors.accent.cyan}>{level.level} · {level.xp_required}+ XP</Overline>
            <Heading size="h1" style={{ marginTop: spacing.sm }}>{level.name}</Heading>
            <Body size="bodyLg" style={{ marginTop: spacing.xs, fontStyle: 'italic' }} color={colors.accent.gold}>"{level.theme}"</Body>
            <Body style={{ marginTop: spacing.md, lineHeight: 24 }}>{level.description}</Body>
          </Animated.View>

          {/* LEVEL-WIDE resources */}
          <ResourcesSection
            parentType="academy_level"
            parentId={level.id}
            title="Level Documents"
          />

          <Heading size="h4" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>Lessons</Heading>
          {level.lessons.map((lesson: any, i: number) => (
            <Animated.View key={lesson.id} entering={FadeInDown.delay(i * 80).duration(400)}>
              <GlowCard style={{ marginBottom: spacing.sm }} testID={`lesson-${lesson.id}`}>
                <View style={styles.lessonHead}>
                  <View style={styles.iconCircle}>
                    <Ionicons name={TYPE_ICON[lesson.type] || 'document-outline'} size={22} color={colors.accent.gold} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Overline color={colors.text.muted}>{lesson.type.toUpperCase()} · {lesson.duration_min} MIN</Overline>
                    <Heading size="h4" style={{ marginTop: 2 }}>{lesson.title}</Heading>
                    <Body size="small" style={{ marginTop: spacing.xs }}>{lesson.summary}</Body>
                  </View>
                </View>
                {level.is_unlocked && (
                  <Pressable
                    onPress={() => completeLesson(lesson.id)}
                    testID={`complete-${lesson.id}`}
                    disabled={completing === lesson.id}
                    style={({ pressed }) => [styles.completeBtn, { opacity: pressed ? 0.7 : 1 }]}
                  >
                    <Ionicons name="checkmark-circle-outline" size={16} color={colors.accent.cyan} />
                    <Body size="small" weight="semi" color={colors.accent.cyan}>
                      {completing === lesson.id ? 'Integrating…' : 'Mark Complete · +50 XP'}
                    </Body>
                  </Pressable>
                )}
                {/* LESSON-SPECIFIC resources */}
                <ResourcesSection
                  parentType="academy_lesson"
                  parentId={lesson.id}
                  levelId={level.id}
                  title="Lesson Documents"
                />
              </GlowCard>
            </Animated.View>
          ))}

          {!level.is_unlocked && (
            <GlowCard style={{ marginTop: spacing.lg }} testID="level-locked">
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="lock-closed" size={32} color={colors.accent.gold} />
                <Heading size="h4" style={{ marginTop: spacing.sm, textAlign: 'center' }}>Level sealed</Heading>
                <Body size="small" style={{ marginTop: spacing.xs, textAlign: 'center' }}>
                  Reach {level.xp_required} XP to begin this initiation.
                </Body>
              </View>
            </GlowCard>
          )}
          <View style={{ height: 60 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg.primary },
  backBtn: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  content: { padding: spacing.lg, paddingTop: 0 },
  lessonHead: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  iconCircle: {
    width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(204,163,82,0.1)', borderWidth: 1, borderColor: colors.accent.gold,
  },
  completeBtn: {
    marginTop: spacing.md, flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radii.full,
    backgroundColor: 'rgba(77,208,225,0.08)', borderWidth: 1, borderColor: colors.accent.cyan,
    alignSelf: 'flex-start',
  },
});

// Landing / Splash — cinematic temple entrance
import React, { useEffect } from 'react';
import { View, StyleSheet, ImageBackground, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing, FadeInDown } from 'react-native-reanimated';
import { Heading, Body, Overline, PrimaryButton, AuraButton } from '@/src/components/UI';
import { colors, spacing } from '@/src/theme';

const HERO = 'https://static.prod-images.emergentagent.com/jobs/c2cb8af1-2a04-4bb0-b7b5-e596a8e90f2a/images/b31a2bf6323cdce4d56dd4599de8502bc6d78800b468caf8a35827946c27e6d2.png';

export default function Landing() {
  const router = useRouter();
  const glow = useSharedValue(0.4);

  useEffect(() => {
    glow.value = withRepeat(withSequence(
      withTiming(0.9, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
      withTiming(0.4, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
    ), -1, false);
  }, [glow]);

  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  return (
    <View style={styles.root}>
      <ImageBackground source={{ uri: HERO }} style={StyleSheet.absoluteFill} resizeMode="cover">
        <LinearGradient
          colors={['rgba(5,5,10,0.6)', 'rgba(5,5,10,0.85)', 'rgba(5,5,10,1)']}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

      <Animated.View style={[styles.aura, glowStyle]} pointerEvents="none">
        <LinearGradient
          colors={['rgba(204,163,82,0.18)', 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Animated.View entering={FadeInDown.duration(800)}>
            <Overline testID="brand-overline">Sound Healing Greece</Overline>
            <Heading size="h1" style={styles.title} testID="landing-title">
              Enter the{'\n'}sacred{'\n'}temple of{'\n'}resonance.
            </Heading>
            <Body size="bodyLg" color={colors.text.secondary} style={styles.subtitle}>
              An immersive academy and progression journey for sound healers.{'\n'}Begin where listening becomes prayer.
            </Body>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(800)} style={styles.actions}>
            <PrimaryButton
              testID="cta-begin-journey"
              label="Begin Your Journey"
              onPress={() => router.push('/register')}
            />
            <View style={{ height: 12 }} />
            <AuraButton
              testID="cta-login"
              label="I have an account"
              onPress={() => router.push('/login')}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600).duration(800)} style={styles.foot}>
            <Overline color={colors.text.muted}>Foundations · Bodywork · Sound Baths · Mastery</Overline>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg.primary },
  aura: { position: 'absolute', top: '20%', left: '-20%', width: '140%', height: '60%' },
  container: { flexGrow: 1, padding: spacing.xl, justifyContent: 'space-between', paddingTop: spacing.xxxl },
  title: { marginTop: spacing.lg, lineHeight: 50 },
  subtitle: { marginTop: spacing.lg, lineHeight: 24 },
  actions: { marginVertical: spacing.xxl },
  foot: { alignItems: 'center', paddingBottom: spacing.md },
});

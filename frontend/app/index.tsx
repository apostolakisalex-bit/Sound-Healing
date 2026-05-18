// SOUND HEALING GREECE — Public Discovery Experience
// A cinematic, scrollable, conversion-focused public-facing landing.
// Sections: Hero · What is Sound Healing · Philosophy & Founder · Academy · Benefits
// · Instruments · Workshops · Community · Testimonials · FAQ · Final CTA · Footer.

import React, { useEffect, useRef, useState } from 'react';
import {
  View, StyleSheet, ScrollView, ImageBackground, Image, Pressable,
  Linking, useWindowDimensions, Platform,
} from 'react-native';import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence,
  Easing, FadeInDown, FadeIn,
} from 'react-native-reanimated';

import { Heading, Body, Overline, PrimaryButton, AuraButton, GlowCard, BreathingGlow } from '@/src/components/UI';
import { colors, spacing, radii, fonts } from '@/src/theme';
import { useAuth } from '@/src/auth/AuthContext';
import {
  FOUNDER, PHILOSOPHY_PILLARS, WHAT_IS_SOUND_HEALING, BENEFITS, INSTRUMENTS,
  ACADEMY_PREVIEW, OFFERINGS, TESTIMONIALS, FAQS, SOCIAL_LINKS, HERO_IMAGES,
} from '@/src/content/public';

// ╔══════════════════════════════════════════════════════════════════════╗
// ║                              LANDING                                 ║
// ╚══════════════════════════════════════════════════════════════════════╝
export default function PublicLanding() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width > 720;

  return (
    <View style={styles.root}>
      <LinearGradient colors={[colors.bg.primary, colors.bg.tertiary, colors.bg.primary]} style={StyleSheet.absoluteFill} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xxxl }}
        stickyHeaderIndices={[0]}
      >
        <TopBar router={router} />
        <Hero router={router} />
        <WhatIsSection />
        <PhilosophySection isWide={isWide} />
        <AcademySection router={router} isWide={isWide} />
        <BenefitsSection isWide={isWide} />
        <InstrumentsSection />
        <OfferingsSection isWide={isWide} />
        <CommunitySection router={router} />
        <TestimonialsSection />
        <FAQSection />
        <FinalCTASection router={router} />
        <Footer />
      </ScrollView>
    </View>
  );
}

// ╔══════════════════════════════════════════════════════════════════════╗
// ║                              TOP BAR                                 ║
// ╚══════════════════════════════════════════════════════════════════════╝
function TopBar({ router }: { router: ReturnType<typeof useRouter> }) {
  const { user } = useAuth();
  return (
    <View style={styles.topBar}>
      <LinearGradient
        colors={['rgba(252,251,249,0.98)', 'rgba(252,251,249,0.92)']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView edges={['top']}>
        <View style={styles.topBarRow}>
          <View>
            <Overline color={colors.accent.gold}>Sound Healing Greece</Overline>
            <Body size="caption" color={colors.text.muted} style={{ marginTop: 2 }}>
              Chania · Athens · Online
            </Body>
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
            {user ? (
              <Pressable
                onPress={() => router.replace('/(tabs)/sanctuary')}
                testID="nav-back-dashboard"
                style={styles.topBarCta}
              >
                <Body size="small" weight="semi" color="#FFFFFF">← Dashboard</Body>
              </Pressable>
            ) : (
              <>
                <Pressable onPress={() => router.push('/login')} testID="nav-login">
                  <Body size="small" color={colors.text.primary} weight="semi">Sign In</Body>
                </Pressable>
                <Pressable
                  onPress={() => router.push('/register')}
                  testID="nav-register"
                  style={styles.topBarCta}
                >
                  <Body size="small" weight="semi" color="#FFFFFF">Join</Body>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

// ╔══════════════════════════════════════════════════════════════════════╗
// ║                                HERO                                  ║
// ╚══════════════════════════════════════════════════════════════════════╝
function Hero({ router }: { router: ReturnType<typeof useRouter> }) {
  const glow = useSharedValue(0.4);
  useEffect(() => {
    glow.value = withRepeat(withSequence(
      withTiming(0.95, { duration: 2800, easing: Easing.inOut(Easing.quad) }),
      withTiming(0.4, { duration: 2800, easing: Easing.inOut(Easing.quad) }),
    ), -1, false);
  }, [glow]);
  const auraStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  return (
    <View style={styles.hero}>
      <ImageBackground source={{ uri: HERO_IMAGES.main }} style={StyleSheet.absoluteFill} resizeMode="cover">
        <LinearGradient
          colors={['rgba(20,22,24,0.45)', 'rgba(20,22,24,0.75)', 'rgba(20,22,24,0.95)']}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

      <Animated.View style={[styles.heroAura, auraStyle, { pointerEvents: 'none' }]}>
        <LinearGradient
          colors={['rgba(204,163,82,0.25)', 'transparent']}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
        <View style={styles.heroContent}>
          <Animated.View entering={FadeInDown.duration(1000)}>
            <Overline testID="hero-overline">Sound Healing · Sound Therapy · Greece</Overline>
            <Heading size="h1" style={[styles.heroTitle, { color: colors.text.inverse }]} testID="hero-title">
              Enter the{'\n'}world of{'\n'}sound healing.
            </Heading>
            <Body size="bodyLg" color={colors.text.inverseSecondary} style={styles.heroSubtitle}>
              An immersive academy, ritual progression, and global healing community —
              rooted in nervous system regulation and the timeless practice of deep listening.
            </Body>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(1000)} style={styles.heroActions}>
            <PrimaryButton
              testID="hero-cta-begin"
              label="Begin Your Journey"
              onPress={() => router.push('/register')}
            />
            <View style={{ height: spacing.sm }} />
            <AuraButton
              testID="hero-cta-explore"
              label="Explore the Academy"
              onPress={() => router.push('/login')}
              icon={<Ionicons name="arrow-down" size={14} color={colors.accent.gold} />}
            />
          </Animated.View>

          <Animated.View entering={FadeIn.delay(900).duration(1200)} style={styles.heroFooter}>
            <Overline color="rgba(252,251,249,0.6)">ISTA · IPHM Certified · 4 Progressive Levels</Overline>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

// ╔══════════════════════════════════════════════════════════════════════╗
// ║                          WHAT IS SOUND HEALING                       ║
// ╚══════════════════════════════════════════════════════════════════════╝
function WhatIsSection() {
  return (
    <SectionWrap testID="section-what">
      <SectionTitle eyebrow="The Practice" title={`What is\nsound healing?`} />
      <Body size="bodyLg" style={{ marginTop: spacing.md, marginBottom: spacing.xl, lineHeight: 26 }}>
        Vibration, intentionally held. A meeting of ancient tradition and modern nervous system science.
        You arrive carrying your week. You leave carrying yourself.
      </Body>

      {WHAT_IS_SOUND_HEALING.map((item, i) => (
        <Animated.View key={item.title} entering={FadeInDown.delay(i * 120).duration(600)}>
          <GlowCard style={{ marginBottom: spacing.md }}>
            <Overline color={colors.accent.cyan}>{`0${i + 1}`}</Overline>
            <Heading size="h4" style={{ marginTop: spacing.xs }}>{item.title}</Heading>
            <Body size="small" style={{ marginTop: spacing.sm, lineHeight: 22 }}>{item.body}</Body>
          </GlowCard>
        </Animated.View>
      ))}
    </SectionWrap>
  );
}

// ╔══════════════════════════════════════════════════════════════════════╗
// ║                            PHILOSOPHY                                ║
// ╚══════════════════════════════════════════════════════════════════════╝
function PhilosophySection({ isWide }: { isWide: boolean }) {
  return (
    <SectionWrap testID="section-philosophy" dark>
      <SectionTitle eyebrow="The Philosophy" title={`Grounded.\nRefined.\nReverent.`} />

      <Body size="bodyLg" style={{ marginTop: spacing.md, marginBottom: spacing.xl, lineHeight: 26 }}>
        We do not chase mystical theatre. We honour what the body already knows.
        Our approach combines structured methodology with refined intuition — a clear framework that
        supports relaxation, awareness, and the body's natural capacity for regulation.
      </Body>

      <View style={[styles.benefitsGrid, isWide && { gap: spacing.lg }]}>
        {PHILOSOPHY_PILLARS.map((p, i) => (
          <Animated.View key={p.title} entering={FadeInDown.delay(i * 100).duration(500)}
            style={[styles.benefitCard, isWide && { width: '31%' }]}
          >
            <View style={styles.benefitIcon}>
              <Ionicons name={`${p.icon}-outline` as keyof typeof Ionicons.glyphMap} size={22} color={colors.accent.gold} />
            </View>
            <Heading size="h4" style={{ marginTop: spacing.sm, fontSize: 18 }}>{p.title}</Heading>
            <Body size="small" style={{ marginTop: spacing.xs, lineHeight: 20 }}>{p.body}</Body>
          </Animated.View>
        ))}
      </View>

      {/* Founder */}
      <Animated.View entering={FadeInDown.delay(200).duration(800)}>
        <GlowCard style={{ marginTop: spacing.xl }} testID="founder-card">
          <View style={styles.founderHead}>
            <Image source={{ uri: FOUNDER.photo }} style={styles.founderPhoto} testID="founder-photo" />
            <View style={{ flex: 1 }}>
              <Overline color={colors.accent.gold}>Founder & Guide</Overline>
              <Heading size="h3" style={{ marginTop: spacing.xs }}>{FOUNDER.name}</Heading>
              <Body size="caption" color={colors.accent.gold} style={{ marginTop: 4, letterSpacing: 2, textTransform: 'uppercase' }}>
                {FOUNDER.title}
              </Body>
            </View>
          </View>
          <Body size="small" style={{ marginTop: spacing.lg, lineHeight: 22 }}>
            {FOUNDER.bio}
          </Body>
          <View style={{ marginTop: spacing.md }}>
            {FOUNDER.credentials.map((c) => (
              <View key={c} style={styles.credRow}>
                <Ionicons name="checkmark-circle-outline" size={14} color={colors.accent.gold} />
                <Body size="caption" color={colors.text.secondary} style={{ flex: 1 }}>{c}</Body>
              </View>
            ))}
          </View>
          <View style={{ marginTop: spacing.md, flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' }}>
            {FOUNDER.bases.map((b) => (
              <View key={b} style={styles.locPill}>
                <Ionicons name="location-outline" size={11} color={colors.accent.gold} />
                <Body size="caption" weight="semi" color={colors.text.secondary}>{b}</Body>
              </View>
            ))}
          </View>
        </GlowCard>
      </Animated.View>
    </SectionWrap>
  );
}

// ╔══════════════════════════════════════════════════════════════════════╗
// ║                              ACADEMY                                 ║
// ╚══════════════════════════════════════════════════════════════════════╝
function AcademySection({ router, isWide }: { router: ReturnType<typeof useRouter>; isWide: boolean }) {
  return (
    <SectionWrap testID="section-academy">
      <SectionTitle eyebrow="The Academy" title={`Five thresholds\nof initiation.`} />
      <Body size="bodyLg" style={{ marginTop: spacing.md, marginBottom: spacing.xl, lineHeight: 26 }}>
        From the first conscious listening to fully certified practitioner — a progressive path through
        sonic mastery, ethical facilitation, and professional development.
      </Body>

      {ACADEMY_PREVIEW.map((lvl, i) => (
        <Animated.View key={lvl.code} entering={FadeInDown.delay(i * 100).duration(600)}>
          <GlowCard style={{ marginBottom: spacing.md }} testID={`academy-preview-${lvl.code}`}>
            <View style={styles.levelHead}>
              <View style={styles.levelCodeBox}>
                <Heading size="h4" style={{ letterSpacing: 2 }}>{lvl.code}</Heading>
              </View>
              <View style={{ flex: 1 }}>
                <Heading size="h3">{lvl.name}</Heading>
                <Body size="caption" color={colors.accent.gold} style={{ marginTop: 2, fontStyle: 'italic' }}>
                  "{lvl.theme}"
                </Body>
              </View>
            </View>
            <Body size="small" style={{ marginTop: spacing.md, lineHeight: 22 }}>{lvl.description}</Body>
          </GlowCard>
        </Animated.View>
      ))}

      <Animated.View entering={FadeInDown.delay(400).duration(600)}>
        <GlowCard style={styles.xpExplainer} testID="xp-explainer">
          <Overline color={colors.accent.cyan}>Sound XP Progression</Overline>
          <Heading size="h4" style={{ marginTop: spacing.xs }}>Earn. Unlock. Ascend.</Heading>
          <Body size="small" style={{ marginTop: spacing.sm, lineHeight: 22 }}>
            Lessons. Verified sessions. Receiver feedback. Each meaningful action contributes to your
            Sound XP. As you cross thresholds, new realms open, ceremonial stamps unlock, and your
            practitioner identity evolves.
          </Body>
          <View style={{ marginTop: spacing.md }}>
            <PrimaryButton
              testID="academy-cta"
              label="Begin at Level 1"
              onPress={() => router.push('/register')}
            />
          </View>
        </GlowCard>
      </Animated.View>
    </SectionWrap>
  );
}

// ╔══════════════════════════════════════════════════════════════════════╗
// ║                              BENEFITS                                ║
// ╚══════════════════════════════════════════════════════════════════════╝
function BenefitsSection({ isWide }: { isWide: boolean }) {
  return (
    <SectionWrap testID="section-benefits" dark>
      <SectionTitle eyebrow="What May Arise" title={`The body remembers\nhow to rest.`} />
      <Body size="bodyLg" style={{ marginTop: spacing.md, marginBottom: spacing.xl, lineHeight: 26 }}>
        Sound healing supports — it does not promise. Each body responds in its own way.
        These are some of the experiences receivers commonly report.
      </Body>

      <View style={[styles.benefitsGrid, isWide && { gap: spacing.lg }]}>
        {BENEFITS.map((b, i) => (
          <Animated.View key={b.title} entering={FadeInDown.delay(i * 70).duration(500)}
            style={[styles.benefitCard, isWide && { width: '31%' }]}
          >
            <View style={styles.benefitIcon}>
              <Ionicons name={b.icon as keyof typeof Ionicons.glyphMap} size={22} color={colors.accent.gold} />
            </View>
            <Heading size="h4" style={{ marginTop: spacing.sm, fontSize: 18 }}>{b.title}</Heading>
            <Body size="small" style={{ marginTop: spacing.xs, lineHeight: 20 }}>{b.body}</Body>
          </Animated.View>
        ))}
      </View>
    </SectionWrap>
  );
}

// ╔══════════════════════════════════════════════════════════════════════╗
// ║                            INSTRUMENTS                               ║
// ╚══════════════════════════════════════════════════════════════════════╝
function InstrumentsSection() {
  return (
    <SectionWrap testID="section-instruments">
      <SectionTitle eyebrow="The Sonic Palette" title={`Instruments\nof transformation.`} />
      <Body size="bodyLg" style={{ marginTop: spacing.md, marginBottom: spacing.xl, lineHeight: 26 }}>
        Eight families of resonance. Each carries its own emotional gravity, its own way of moving
        through the body. The practitioner learns when to summon which voice.
      </Body>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={280}
        decelerationRate="fast"
        contentContainerStyle={{ gap: spacing.md, paddingRight: spacing.lg }}
      >
        {INSTRUMENTS.map((inst, i) => (
          <Animated.View key={inst.name} entering={FadeIn.delay(i * 80).duration(500)}>
            <View style={styles.instrumentCard} testID={`instrument-${inst.name}`}>
              <ImageBackground source={{ uri: inst.image }} style={styles.instrumentImg} imageStyle={{ borderRadius: radii.md }}>
                <LinearGradient
                  colors={['rgba(5,5,10,0.1)', 'rgba(5,5,10,0.95)']}
                  locations={[0, 0.85]}
                  style={[StyleSheet.absoluteFill, { borderRadius: radii.md }]}
                />
              </ImageBackground>
              <View style={styles.instrumentBody}>
                <Overline color={colors.accent.cyan}>{inst.quality}</Overline>
                <Heading size="h4" style={{ marginTop: spacing.xs }}>{inst.name}</Heading>
                <Body size="caption" style={{ marginTop: spacing.xs, lineHeight: 18 }} numberOfLines={4}>{inst.description}</Body>
              </View>
            </View>
          </Animated.View>
        ))}
      </ScrollView>
    </SectionWrap>
  );
}

// ╔══════════════════════════════════════════════════════════════════════╗
// ║                       OFFERINGS / WORKSHOPS                          ║
// ╚══════════════════════════════════════════════════════════════════════╝
function OfferingsSection({ isWide }: { isWide: boolean }) {
  return (
    <SectionWrap testID="section-offerings" dark>
      <SectionTitle eyebrow="Workshops & Retreats" title={`Held space.\nGlobally offered.`} />
      <Body size="bodyLg" style={{ marginTop: spacing.md, marginBottom: spacing.xl, lineHeight: 26 }}>
        Private sessions in Chania and Athens. Group sound baths in studios, villas, and hotels.
        Multi-day training intensives. Aerial sound baths under the full moon.
      </Body>

      {OFFERINGS.map((o, i) => (
        <Animated.View key={o.name} entering={FadeInDown.delay(i * 100).duration(600)}>
          <View style={styles.offeringCard} testID={`offering-${o.name}`}>
            <ImageBackground source={{ uri: o.image }} style={styles.offeringImg} imageStyle={{ borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg }}>
              <LinearGradient
                colors={['rgba(5,5,10,0.1)', 'rgba(5,5,10,0.9)']}
                locations={[0, 0.95]}
                style={[StyleSheet.absoluteFill, { borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg }]}
              />
              <View style={styles.offeringDuration}>
                <Ionicons name="time-outline" size={11} color={colors.accent.gold} />
                <Body size="caption" weight="semi" color={colors.accent.gold}>{o.duration}</Body>
              </View>
            </ImageBackground>
            <View style={styles.offeringBody}>
              <Overline color={colors.accent.cyan}>{o.intention}</Overline>
              <Heading size="h3" style={{ marginTop: spacing.xs }}>{o.name}</Heading>
              <Body size="small" style={{ marginTop: spacing.sm, lineHeight: 22 }}>{o.description}</Body>
            </View>
          </View>
        </Animated.View>
      ))}
    </SectionWrap>
  );
}

// ╔══════════════════════════════════════════════════════════════════════╗
// ║                             COMMUNITY                                ║
// ╚══════════════════════════════════════════════════════════════════════╝
function CommunitySection({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <SectionWrap testID="section-community">
      <View style={styles.communityHero}>
        <ImageBackground source={{ uri: HERO_IMAGES.community }} style={StyleSheet.absoluteFill} resizeMode="cover">
          <LinearGradient
            colors={['rgba(20,22,24,0.35)', 'rgba(20,22,24,0.9)']}
            style={StyleSheet.absoluteFill}
          />
        </ImageBackground>
        <View style={styles.communityContent}>
          <Overline color={colors.accent.gold}>The Resonance Collective</Overline>
          <Heading size="h2" style={{ marginTop: spacing.sm, color: colors.text.inverse }}>
            A worldwide{'\n'}sangha of{'\n'}sound.
          </Heading>
          <Body size="bodyLg" color={colors.text.inverseSecondary} style={{ marginTop: spacing.md, lineHeight: 26 }}>
            Practitioners from Crete to Athens, from Bali to Berlin. We gather digitally and physically
            — in healing circles, full-moon ceremonies, supervision groups, and quiet conversations
            between two people who have both held the bowl.
          </Body>
        </View>
      </View>

      <View style={styles.communityStats}>
        <CommunityStat number="500+" label="Sessions Logged" />
        <CommunityStat number="4" label="Progressive Levels" />
        <CommunityStat number="∞" label="Resonance" />
      </View>

      <Animated.View entering={FadeInDown.duration(600)}>
        <GlowCard style={{ marginTop: spacing.lg }}>
          <Heading size="h4">Healing Journeys Begin Together</Heading>
          <Body size="small" style={{ marginTop: spacing.sm, lineHeight: 22 }}>
            Inside the app, you join level-based community spaces, participate in collective challenges,
            and receive feedback from a global network of receivers and fellow practitioners.
          </Body>
          <View style={{ marginTop: spacing.md }}>
            <AuraButton testID="community-cta" label="Enter the Community" onPress={() => router.push('/register')} />
          </View>
        </GlowCard>
      </Animated.View>
    </SectionWrap>
  );
}

function CommunityStat({ number, label }: { number: string; label: string }) {
  return (
    <View style={styles.communityStatBox}>
      <Heading size="h2" style={{ color: colors.accent.gold }}>{number}</Heading>
      <Body size="caption" color={colors.text.muted} style={{ letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>{label}</Body>
    </View>
  );
}

// ╔══════════════════════════════════════════════════════════════════════╗
// ║                           TESTIMONIALS                               ║
// ╚══════════════════════════════════════════════════════════════════════╝
function TestimonialsSection() {
  return (
    <SectionWrap testID="section-testimonials" dark>
      <SectionTitle eyebrow="Words From the Field" title={`Stories of\ntransformation.`} />

      <View style={{ marginTop: spacing.lg }}>
        {TESTIMONIALS.map((t, i) => (
          <Animated.View key={i} entering={FadeInDown.delay(i * 120).duration(600)}>
            <GlowCard style={{ marginBottom: spacing.md }} testID={`testimonial-${i}`}>
              <Body size="bodyLg" style={{ lineHeight: 26, fontStyle: 'italic' }}>
                "{t.quote}"
              </Body>
              <View style={{ marginTop: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <View style={styles.testimonialDot} />
                <View>
                  <Body weight="semi" color={colors.text.primary}>{t.author}</Body>
                  <Overline color={colors.accent.gold}>{t.role}</Overline>
                </View>
              </View>
            </GlowCard>
          </Animated.View>
        ))}
      </View>
    </SectionWrap>
  );
}

// ╔══════════════════════════════════════════════════════════════════════╗
// ║                                 FAQ                                  ║
// ╚══════════════════════════════════════════════════════════════════════╝
function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <SectionWrap testID="section-faq">
      <SectionTitle eyebrow="Questions Welcomed" title={`Frequently\nasked.`} />
      <Body size="bodyLg" style={{ marginTop: spacing.md, marginBottom: spacing.xl, lineHeight: 26 }}>
        Curiosity is the first sign of readiness. Here are the questions most often arriving at our door.
      </Body>

      {FAQS.map((f, i) => (
        <Pressable
          key={i}
          onPress={() => setOpen(open === i ? null : i)}
          testID={`faq-${i}`}
          style={({ pressed }) => [styles.faqItem, { opacity: pressed ? 0.8 : 1 }]}
        >
          <View style={styles.faqHead}>
            <Heading size="h4" style={{ flex: 1, fontSize: 18 }}>{f.q}</Heading>
            <Ionicons name={open === i ? 'remove' : 'add'} size={22} color={colors.accent.gold} />
          </View>
          {open === i ? (
            <Animated.View entering={FadeIn.duration(300)}>
              <Body size="small" style={{ marginTop: spacing.sm, lineHeight: 22 }}>{f.a}</Body>
            </Animated.View>
          ) : null}
        </Pressable>
      ))}
    </SectionWrap>
  );
}

// ╔══════════════════════════════════════════════════════════════════════╗
// ║                            FINAL CTA                                 ║
// ╚══════════════════════════════════════════════════════════════════════╝
function FinalCTASection({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <View style={styles.finalCta} testID="section-final-cta">
      <ImageBackground source={{ uri: HERO_IMAGES.cta }} style={StyleSheet.absoluteFill} resizeMode="cover">
        <LinearGradient
          colors={['rgba(5,5,10,0.3)', 'rgba(5,5,10,0.9)', 'rgba(5,5,10,1)']}
          locations={[0, 0.6, 1]}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

      <View style={styles.finalCtaContent}>
        <Animated.View entering={FadeInDown.duration(800)}>
          <Overline color={colors.accent.gold}>The Threshold Awaits</Overline>
          <Heading size="h1" style={{ marginTop: spacing.md, color: colors.text.inverse }}>
            Become part of{'\n'}the resonance.
          </Heading>
          <Body size="bodyLg" color={colors.text.inverseSecondary} style={{ marginTop: spacing.md, lineHeight: 26 }}>
            Join a global academy of sound. Begin your practitioner journey at Level 1.
            Every threshold opens a new chamber. Every chamber, a new way of listening.
          </Body>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(800)} style={{ marginTop: spacing.xl }}>
          <BreathingGlow>
            <PrimaryButton
              testID="final-cta-register"
              label="Begin Your Journey"
              onPress={() => router.push('/register')}
            />
          </BreathingGlow>
          <View style={{ height: spacing.sm }} />
          <AuraButton
            testID="final-cta-login"
            label="Already initiated? Sign In"
            onPress={() => router.push('/login')}
          />
        </Animated.View>

        <Animated.View entering={FadeIn.delay(700).duration(800)} style={{ marginTop: spacing.lg }}>
          <Overline color={colors.text.muted}>Free to begin · No card required · 4 progressive levels</Overline>
        </Animated.View>
      </View>
    </View>
  );
}

// ╔══════════════════════════════════════════════════════════════════════╗
// ║                              FOOTER                                  ║
// ╚══════════════════════════════════════════════════════════════════════╝
function Footer() {
  const openLink = (url: string) => Linking.openURL(url).catch(() => {});
  return (
    <View style={styles.footer} testID="section-footer">
      <View style={{ alignItems: 'center' }}>
        <Overline color={colors.accent.gold} style={{ marginBottom: spacing.sm }}>Stay Connected</Overline>
        <Heading size="h3" style={{ textAlign: 'center' }}>The temple{'\n'}is always open.</Heading>
      </View>

      <View style={styles.socialRow}>
        {SOCIAL_LINKS.map((s) => (
          <Pressable
            key={s.label}
            onPress={() => openLink(s.url)}
            testID={`social-${s.label}`}
            style={({ pressed }) => [styles.socialBtn, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Ionicons name={s.icon as keyof typeof Ionicons.glyphMap} size={20} color={colors.accent.gold} />
            <Body size="small" weight="semi" color={colors.text.secondary}>{s.label}</Body>
          </Pressable>
        ))}
      </View>

      <View style={styles.footerMeta}>
        <Body size="caption" color={colors.text.muted} style={{ textAlign: 'center', letterSpacing: 1.5 }}>
          SOUND HEALING GREECE
        </Body>
        <Body size="caption" color={colors.text.muted} style={{ textAlign: 'center', marginTop: 4 }}>
          Chania · Athens · Online · International
        </Body>
        <Body size="caption" color={colors.text.muted} style={{ textAlign: 'center', marginTop: spacing.md, fontStyle: 'italic' }}>
          "Every session is sacred. Every moment is ceremony."
        </Body>
      </View>
    </View>
  );
}

// ╔══════════════════════════════════════════════════════════════════════╗
// ║                            HELPERS                                   ║
// ╚══════════════════════════════════════════════════════════════════════╝
function SectionWrap({ children, dark, testID }: { children: React.ReactNode; dark?: boolean; testID?: string }) {
  return (
    <View testID={testID} style={[styles.section, dark && styles.sectionDark]}>
      {children}
    </View>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <View>
      <Overline color={colors.accent.gold}>{eyebrow}</Overline>
      <Heading size="h1" style={{ marginTop: spacing.sm, lineHeight: 50 }}>{title}</Heading>
    </View>
  );
}

// ╔══════════════════════════════════════════════════════════════════════╗
// ║                              STYLES                                  ║
// ╚══════════════════════════════════════════════════════════════════════╝
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg.primary },

  // Top bar
  topBar: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
    zIndex: 10,
  },  topBarRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  topBarCta: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: colors.accent.gold,
  },

  // Hero
  hero: { height: 720, overflow: 'hidden' },
  heroAura: { position: 'absolute', top: 80, left: -100, width: '140%', height: '60%' },
  heroContent: { flex: 1, justifyContent: 'space-between', padding: spacing.xl, paddingTop: 100 },
  heroTitle: { marginTop: spacing.lg, lineHeight: 56, fontSize: 50 },
  heroSubtitle: { marginTop: spacing.lg, lineHeight: 26, maxWidth: 480 },
  heroActions: { marginTop: spacing.xxl },
  heroFooter: { alignItems: 'center', marginTop: spacing.md },

  // Section
  section: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xxxl },
  sectionDark: { backgroundColor: colors.bg.tertiary, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border.subtle },

  // Philosophy / Founder
  founderHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  founderPhoto: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 2, borderColor: colors.accent.gold,
    backgroundColor: colors.bg.tertiary,
  },

  // Academy
  levelHead: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  levelCodeBox: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radii.sm, backgroundColor: 'rgba(77,208,225,0.1)', borderWidth: 1, borderColor: colors.accent.cyan, minWidth: 70, alignItems: 'center' },
  xpExplainer: { marginTop: spacing.lg, padding: spacing.lg, borderColor: colors.accent.gold },

  // Benefits
  benefitsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  benefitCard: { width: '48%', padding: spacing.md, borderRadius: radii.md, backgroundColor: colors.bg.secondary, borderWidth: 1, borderColor: colors.border.subtle },
  benefitIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(204,163,82,0.1)', borderWidth: 1, borderColor: colors.accent.gold },

  // Instruments
  instrumentCard: { width: 260, borderRadius: radii.md, backgroundColor: colors.bg.secondary, borderWidth: 1, borderColor: colors.border.subtle, overflow: 'hidden' },
  instrumentImg: { height: 180, justifyContent: 'flex-end' },
  instrumentBody: { padding: spacing.md },

  // Offerings
  offeringCard: { marginBottom: spacing.lg, borderRadius: radii.lg, backgroundColor: colors.bg.secondary, borderWidth: 1, borderColor: colors.border.default, overflow: 'hidden' },
  offeringImg: { height: 200 },
  offeringDuration: { position: 'absolute', top: spacing.md, right: spacing.md, flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: spacing.sm, borderRadius: radii.full, backgroundColor: 'rgba(5,5,10,0.7)', borderWidth: 1, borderColor: colors.accent.gold },
  offeringBody: { padding: spacing.lg },

  // Community
  communityHero: { height: 380, marginHorizontal: -spacing.lg, marginBottom: spacing.lg, overflow: 'hidden' },
  communityContent: { flex: 1, justifyContent: 'flex-end', padding: spacing.lg },
  communityStats: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between' },
  communityStatBox: { flex: 1, padding: spacing.md, borderRadius: radii.md, backgroundColor: colors.bg.secondary, borderWidth: 1, borderColor: colors.accent.bronze, alignItems: 'center' },

  // Testimonials
  testimonialDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent.gold },

  // FAQ
  faqItem: { paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderRadius: radii.md, backgroundColor: colors.bg.secondary, borderWidth: 1, borderColor: colors.border.subtle, marginBottom: spacing.sm },
  faqHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },

  // Final CTA
  finalCta: { height: 700, justifyContent: 'flex-end' },
  finalCtaContent: { padding: spacing.xl, paddingBottom: spacing.xxxl },

  // Footer
  footer: { padding: spacing.xl, paddingVertical: spacing.xxxl, alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border.subtle },
  socialRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.xl },
  socialBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radii.full, backgroundColor: 'rgba(204,163,82,0.06)', borderWidth: 1, borderColor: colors.border.default },
  footerMeta: { marginTop: spacing.xxl, alignItems: 'center' },
});
;

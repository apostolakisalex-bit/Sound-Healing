// Tab navigation: Sanctuary / Journey / Academy / Practice / Profile
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { colors, fonts } from '@/src/theme';

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  sanctuary: 'sparkles-outline',
  journey: 'planet-outline',
  academy: 'book-outline',
  practice: 'pulse-outline',
  profile: 'person-circle-outline',
};

const TAB_ICONS_ACTIVE: Record<string, keyof typeof Ionicons.glyphMap> = {
  sanctuary: 'sparkles',
  journey: 'planet',
  academy: 'book',
  practice: 'pulse',
  profile: 'person-circle',
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent.gold,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'rgba(5,5,10,0.85)',
          borderTopWidth: 1,
          borderTopColor: colors.border.subtle,
          height: Platform.OS === 'ios' ? 88 : 72,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
        },
        tabBarBackground: () => (
          Platform.OS === 'ios'
            ? <BlurView tint="dark" intensity={60} style={StyleSheet.absoluteFill} />
            : <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg.primary }]} />
        ),
        tabBarLabelStyle: { fontFamily: fonts.bodySemi, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase' },
        tabBarIcon: ({ focused, color, size }) => {
          const name = focused ? TAB_ICONS_ACTIVE[route.name] : TAB_ICONS[route.name];
          return <Ionicons name={name || 'ellipse-outline'} size={size - 2} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="sanctuary" options={{ title: 'Sanctuary' }} />
      <Tabs.Screen name="journey" options={{ title: 'Journey' }} />
      <Tabs.Screen name="academy" options={{ title: 'Academy' }} />
      <Tabs.Screen name="practice" options={{ title: 'Practice' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

// Tab navigation — the visible bar is now rendered at the TOP via `TabsTopBar` component.
// We keep `Tabs` here only as the routing primitive (hidden default bar).
import { useAuth } from '@/src/auth/AuthContext';
import { Tabs, Redirect } from 'expo-router';
import { useLanguage } from '@/src/components/AppNavigation';
import React from 'react';

export default function TabsLayout() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  if (loading) return null;
  if (user && ["admin", "instructor"].includes(user.role)) return <Redirect href="/admin" />;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="sanctuary" options={{ title: t('Αρχική', 'Home') }} />
      <Tabs.Screen name="journey" options={{ title: t('Ταξίδι', 'Journey') }} />
      <Tabs.Screen name="academy" options={{ title: t('Σχολή', 'School') }} />
      <Tabs.Screen name="practice" options={{ title: t('Πρακτική', 'Practice') }} />
      <Tabs.Screen name="profile" options={{ title: t('Προφίλ', 'Profile') }} />
    </Tabs>
  );
}


// Tab navigation — the visible bar is now rendered at the TOP via `TabsTopBar` component.
// We keep `Tabs` here only as the routing primitive (hidden default bar).
import { useAuth } from '@/src/auth/AuthContext';
import { Tabs, Redirect } from 'expo-router';
import React from 'react';

export default function TabsLayout() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user && ["admin", "instructor"].includes(user.role)) return <Redirect href="/admin" />;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="sanctuary" options={{ title: 'Sanctuary' }} />
      <Tabs.Screen name="journey" options={{ title: 'Journey' }} />
      <Tabs.Screen name="academy" options={{ title: 'Academy' }} />
      <Tabs.Screen name="practice" options={{ title: 'Practice' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}


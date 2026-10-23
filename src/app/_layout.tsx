import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/context/AuthContext';
import { SettingsProvider } from '@/context/SettingsContext';

export default function RootLayout() {
  useEffect(() => {
    // Hide splash immediately so no lingering blue/splash screen occurs
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <SettingsProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="crowd-monitor" />
          <Stack.Screen name="emergency" />
          <Stack.Screen name="safe-route" />
          <Stack.Screen name="medical-help" />
          <Stack.Screen name="police-help" />
          <Stack.Screen name="family" />
        </Stack>
      </AuthProvider>
    </SettingsProvider>
  );
}

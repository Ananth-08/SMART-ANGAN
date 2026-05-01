import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as NavigationBar from 'expo-navigation-bar';
import * as SystemUI from 'expo-system-ui';
import { Platform } from 'react-native';
import 'react-native-reanimated';
import '../i18n'; // Initialize i18n
import { loadSavedLanguage } from '../i18n';
import { useTranslation } from 'react-i18next';
import Splash from '../screens/Splash';
import { colors } from '../theme/colors';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from '../context/AuthContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { i18n } = useTranslation();
  const [appIsReady, setAppIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {
        // Set system UI colors
        if (Platform.OS === 'android') {
          await NavigationBar.setBackgroundColorAsync(colors.white);
          await NavigationBar.setButtonStyleAsync('dark');
        }
        await SystemUI.setBackgroundColorAsync(colors.white);

        // Load saved language
        await loadSavedLanguage();
        // Pre-load fonts, make any API calls you need to do here
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!appIsReady || showSplash) {
    return <Splash onFinish={() => setShowSplash(false)} />;
  }

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/signup" />
      </Stack>
      <StatusBar style="dark" />
    </AuthProvider>
  );
}

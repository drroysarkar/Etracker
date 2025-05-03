import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { initDatabase } from '../services/database';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
  });
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (fontsLoaded) {
      initDatabase();
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor: '#fff',
            paddingTop: insets.top * 0.5,
            paddingBottom: insets.bottom * 0.6,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="add-transaction" options={{ title: 'Add Transaction' }} />
        <Stack.Screen name="split-bill" options={{ title: 'Split Your Bill' }} />
        <Stack.Screen name="track-loans" options={{ title: 'Track Loans' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
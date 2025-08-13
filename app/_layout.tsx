import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { tasksContext } from './(tabs)/tasksContext';
import { AnalyticsProvider } from './(tabs)/analyticsContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Provide tasks context at the root
  const [tasks, setTasks] = React.useState([]);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <AnalyticsProvider>
      <tasksContext.Provider value={{ tasks, setTasks }}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </tasksContext.Provider>
    </AnalyticsProvider>
  );
}

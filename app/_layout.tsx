import { AlertProvider } from '@/components/ui/AlertProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '@/contexts/AppContext';

export default function RootLayout() {
  return (
    <AlertProvider>
      <AppProvider>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0E0E0E' } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="post/[id]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="bag" options={{ headerShown: false }} />
            <Stack.Screen name="search" options={{ headerShown: false }} />
            <Stack.Screen name="chat/index" options={{ headerShown: false }} />
            <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="seller-dashboard" options={{ headerShown: false }} />
            <Stack.Screen name="menu" options={{ headerShown: false }} />
            <Stack.Screen name="help" options={{ headerShown: false }} />
            <Stack.Screen name="contact" options={{ headerShown: false }} />
            <Stack.Screen name="safety" options={{ headerShown: false }} />
            <Stack.Screen name="terms" options={{ headerShown: false }} />
            <Stack.Screen name="privacy" options={{ headerShown: false }} />
            <Stack.Screen name="about" options={{ headerShown: false }} />
            <Stack.Screen name="cookies" options={{ headerShown: false }} />
            <Stack.Screen name="wallet" options={{ headerShown: false }} />
            <Stack.Screen name="order-tracking" options={{ headerShown: false }} />
          </Stack>
        </SafeAreaProvider>
      </AppProvider>
    </AlertProvider>
  );
}

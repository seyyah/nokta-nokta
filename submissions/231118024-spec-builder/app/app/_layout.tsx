import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

// Nokta Audit Dependencies
import { AuditWidget } from '@xtatistix/mobile-audit';
import { auditStorage } from '@/utils/auditStorage';
import * as FileSystem from 'expo-file-system/src/legacy';
import * as Sharing from 'expo-sharing';
import { captureScreen, captureRef } from 'react-native-view-shot';
import { usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen 
          name="chat" 
          options={{ 
            title: 'Fikri Geliştir', 
            headerTintColor: Colors.light.primary, 
            headerStyle: { backgroundColor: '#ffffff' },
            headerTitleStyle: { fontWeight: '800', color: '#0f172a' },
            headerShadowVisible: false,
            headerBackTitle: 'Geri',
          }} 
        />
        <Stack.Screen 
          name="spec" 
          options={{ 
            title: 'Spesifikasyon Kartı', 
            headerTintColor: Colors.light.primary, 
            headerStyle: { backgroundColor: '#ffffff' },
            headerTitleStyle: { fontWeight: '800', color: '#0f172a' },
            headerShadowVisible: false,
            headerLeft: () => null, // Remove back button to ensure flow completion
            gestureEnabled: false, // Prevent swiping back
          }} 
        />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>

      <AuditWidget
        appName="SpecBuilder"
        deps={{
          captureScreen,
          captureRef,
          currentScreen: pathname,
          storage: auditStorage,
          reporterId: 'müşteri-qa',
          BugIcon: <Ionicons name="bug" size={24} color="#fff" />,
          writeFile: async (filename, content) => {
            try {
              const fullPath = (FileSystem.documentDirectory || '') + filename;
              console.log('[Audit] Writing file (legacy) to:', fullPath);
              await FileSystem.writeAsStringAsync(fullPath, content);
              return fullPath;
            } catch (err) {
              console.error('[Audit] writeFile failed:', err);
              throw err;
            }
          },
          writeFileBinary: async (filename, base64) => {
            try {
              const fullPath = (FileSystem.documentDirectory || '') + filename;
              console.log('[Audit] Writing binary (legacy) to:', fullPath);
              await FileSystem.writeAsStringAsync(fullPath, base64, {
                encoding: FileSystem.EncodingType.Base64,
              });
              return fullPath;
            } catch (err) {
              console.error('[Audit] writeFileBinary failed:', err);
              throw err;
            }
          },
          shareFile: async (path) => {
            try {
              console.log('[Audit] Sharing file at:', path);
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(path);
              } else {
                console.warn('[Audit] Sharing is not available on this platform');
              }
            } catch (err) {
              console.error('[Audit] Sharing failed:', err);
            }
          },
        }}
      />
    </ThemeProvider>
  );
}

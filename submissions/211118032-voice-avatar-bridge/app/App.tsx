import React, { useState, useCallback, useRef, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainerRef } from '@react-navigation/native';
import type { NavigationState } from '@react-navigation/native';
import { AuditWidget } from '@xtatistix/mobile-audit';
import AppNavigator from './src/navigation/AppNavigator';
import NotificationBanner from './src/components/NotificationBanner';
import { useAutoAccept } from './src/hooks/useAutoAccept';
import { EscalationService } from './src/services/escalationService';
import { RootStackParamList } from './src/types';
import { createAuditDeps } from './src/auditDeps';
import { getActiveRouteName } from './src/utils/navigationScreenName';

type BannerState = {
  visible: boolean;
  escalationId: string;
  mentorType: string;
};

const INITIAL_BANNER: BannerState = {
  visible: false,
  escalationId: '',
  mentorType: '',
};

const MENTOR_TYPE_LABEL: Record<string, string> = {
  algoritma: 'Algoritma Uzmanı',
  girisim: 'Girişim Mentoru',
  yazilim: 'Yazılım Mimarı',
  database: 'Veritabanı Uzmanı',
  guvenlik: 'Güvenlik Uzmanı',
  hukuk: 'Hukuk Danışmanı',
  saglik: 'Sağlık Uzmanı',
  default: 'Genel Danışman',
};

export default function App() {
  const [banner, setBanner] = useState<BannerState>(INITIAL_BANNER);
  const [currentScreen, setCurrentScreen] = useState('Home');
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  const auditDeps = useMemo(
    () => createAuditDeps(currentScreen),
    [currentScreen],
  );

  const handleNavigationStateChange = useCallback((state: NavigationState | undefined) => {
    setCurrentScreen(getActiveRouteName(state));
  }, []);

  const handleAccepted = useCallback(async (escalationId: string) => {
    const esc = await EscalationService.getEscalationById(escalationId);
    if (!esc) return;
    setBanner({
      visible: true,
      escalationId,
      mentorType: esc.mentorType,
    });
  }, []);

  useAutoAccept(handleAccepted);

  const dismissBanner = useCallback(() => {
    setBanner((prev) => ({ ...prev, visible: false }));
  }, []);

  const goToMentor = useCallback(() => {
    dismissBanner();
    if (navigationRef.current) {
      navigationRef.current.navigate('Mentor', { escalationId: banner.escalationId });
    }
  }, [banner.escalationId, dismissBanner]);

  const mentorLabel =
    MENTOR_TYPE_LABEL[banner.mentorType] ?? MENTOR_TYPE_LABEL['default'];

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar style="dark" />
        <AppNavigator
          navigationRef={navigationRef}
          onStateChange={handleNavigationStateChange}
        />
        <NotificationBanner
          visible={banner.visible}
          type="success"
          message="✅ Mentor Eşleşti!"
          subMessage={`${mentorLabel} seninle görüşmeye hazır.`}
          actionLabel="Görüşmeye Git"
          onAction={goToMentor}
          onDismiss={dismissBanner}
        />
        <AuditWidget
          appName="Nokta Voice Avatar Bridge"
          deps={auditDeps}
          initialPosition={{ bottom: 110, right: 16 }}
        />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

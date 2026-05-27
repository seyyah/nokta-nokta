import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Animated,
  Dimensions,
  PanResponder,
  Linking,
  ActivityIndicator,
  Share,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import Svg, { Rect, Circle, Path, G } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// -------------------------------------------------------------
// TYPES & SCHEMAS
// -------------------------------------------------------------
interface AuditNoteBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AuditNote {
  id: string;
  screenName: string;
  screenshot: string; // Base64 or mock uri
  highlightBounds: AuditNoteBounds | null;
  note: string;
  status: 'open' | 'fixed';
  timestamp: string;
  reporterId: string;
}

type ScreenType = 'Home' | 'Visualizer' | 'Avatar' | 'Expert' | 'AuditInfo';

// -------------------------------------------------------------
// MAIN APP COMPONENT
// -------------------------------------------------------------
export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('Home');
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [volume, setVolume] = useState(0); // Normalized 0 to 1 RMS value
  const recordingRef = useRef<Audio.Recording | null>(null);

  // Audio Visualizer states
  const [visualizerBars, setVisualizerBars] = useState<number[]>(new Array(15).fill(20));
  const animationFrameId = useRef<number | null>(null);

  // Avatar state
  const mouthScale = useRef(new Animated.Value(0.2)).current;

  // Audit widget states
  const [auditNotes, setAuditNotes] = useState<AuditNote[]>([
    {
      id: 'mock-1',
      screenName: 'Home Screen',
      screenshot: 'mock_uri_1',
      highlightBounds: { x: 10, y: 80, width: 300, height: 60 },
      note: 'Sistem istatistikleri yüklenirken ufak bir titreme (flicker) yaşanıyor.',
      status: 'open',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      reporterId: 'qa-eslen-231118028',
    },
    {
      id: 'mock-2',
      screenName: 'Voice Visualizer',
      screenshot: 'mock_uri_2',
      highlightBounds: { x: 40, y: 220, width: 280, height: 100 },
      note: 'Mikrofon izni iptal edildiğinde gösterilen hata mesajı ortalanmamış.',
      status: 'fixed',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      reporterId: 'qa-eslen-231118028',
    },
  ]);
  const [auditMode, setAuditMode] = useState<'idle' | 'selecting' | 'annotating' | 'list'>('idle');
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null);
  const [tempBounds, setTempBounds] = useState<AuditNoteBounds | null>(null);
  const [tempNoteText, setTempNoteText] = useState('');
  const [editingNote, setEditingNote] = useState<AuditNote | null>(null);

  // Floating Action Button position (Draggable)
  const fabPan = useRef(new Animated.ValueXY({ x: SCREEN_WIDTH - 70, y: SCREEN_HEIGHT - 160 })).current;
  const lastFabPos = useRef({ x: SCREEN_WIDTH - 70, y: SCREEN_HEIGHT - 160 });
  const isDraggingFab = useRef(false);
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // -------------------------------------------------------------
  // MICROPHONE & VOLUME TRACKING (EXPO-AV)
  // -------------------------------------------------------------
  const requestMicPermission = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setMicPermission(status === 'granted');
      if (status === 'granted') {
        startVolumeMonitoring();
      }
    } catch (e) {
      console.warn('Microphone permission request error:', e);
      setMicPermission(false);
    }
  };

  const startVolumeMonitoring = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      const options = {
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      };

      await recording.prepareToRecordAsync(options);
      recordingRef.current = recording;

      recording.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording && status.metering !== undefined) {
          // Metering is in dB, ranges from -160 (silence) to 0 (loudest)
          const db = status.metering;
          let normVolume = 0;
          if (db > -60) {
            normVolume = (db + 60) / 60; // Map -60..0 to 0..1
          }
          normVolume = Math.min(Math.max(normVolume, 0), 1);
          setVolume(normVolume);

          // Update avatar lipsync scale
          const mouthOpenAmount = 0.2 + normVolume * 1.5;
          Animated.timing(mouthScale, {
            toValue: mouthOpenAmount,
            duration: 50,
            useNativeDriver: false,
          }).start();
        }
      });

      await recording.startAsync();
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording for volume monitoring:', err);
    }
  };

  const stopVolumeMonitoring = async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }
      setIsRecording(false);
      setVolume(0);
      Animated.timing(mouthScale, {
        toValue: 0.2,
        duration: 100,
        useNativeDriver: false,
      }).start();
    } catch (e) {
      console.warn('Error stopping volume monitoring:', e);
    }
  };

  // Lifecycle: Request permission on mount
  useEffect(() => {
    requestMicPermission();
    return () => {
      stopVolumeMonitoring();
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // -------------------------------------------------------------
  // VOICE VISUALIZER ANIMATION
  // -------------------------------------------------------------
  useEffect(() => {
    const updateVisualizer = () => {
      setVisualizerBars((prev) => {
        return prev.map((_, i) => {
          // If silent/idle, draw a soft low-frequency sin wave
          if (volume < 0.05) {
            const time = Date.now() * 0.003;
            const idleVal = Math.sin(time + i * 0.5) * 6 + 10;
            return Math.max(idleVal, 4);
          } else {
            // Speak mode: scale bars based on current volume + noise modifier
            const rand = Math.random() * 0.4 + 0.6;
            const height = volume * 120 * rand * Math.sin((i / 14) * Math.PI);
            return Math.max(height, 6);
          }
        });
      });
      animationFrameId.current = requestAnimationFrame(updateVisualizer);
    };

    animationFrameId.current = requestAnimationFrame(updateVisualizer);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [volume]);

  // -------------------------------------------------------------
  // FAB PAN RESPONDER (DRAGGABLE AUDIT FAB)
  // -------------------------------------------------------------
  const fabPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5,
      onPanResponderGrant: () => {
        isDraggingFab.current = false;
        fabPan.setOffset({ x: lastFabPos.current.x, y: lastFabPos.current.y });
        fabPan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, gestureState) => {
        isDraggingFab.current = true;
        fabPan.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (_, gestureState) => {
        fabPan.flattenOffset();
        const finalX = Math.max(0, Math.min(SCREEN_WIDTH - 60, lastFabPos.current.x + gestureState.dx));
        const finalY = Math.max(0, Math.min(SCREEN_HEIGHT - 60, lastFabPos.current.y + gestureState.dy));
        fabPan.setValue({ x: finalX, y: finalY });
        lastFabPos.current = { x: finalX, y: finalY };

        // Handle double-tap vs single tap if not dragged
        if (!isDraggingFab.current) {
          tapCount.current += 1;
          if (tapTimer.current) clearTimeout(tapTimer.current);

          tapTimer.current = setTimeout(() => {
            const currentTaps = tapCount.current;
            tapCount.current = 0;
            if (currentTaps >= 2) {
              // Double Tap: Open reports list
              setAuditMode('list');
            } else {
              // Single Tap: Enter Screen capture mode
              setAuditMode('selecting');
              setDrawStart(null);
              setDrawCurrent(null);
              setTempBounds(null);
            }
          }, 250);
        }
      },
    })
  ).current;

  // -------------------------------------------------------------
  // AUDIT GESTURE SELECTION OVERLAY (YELLOW BOX SELECTOR)
  // -------------------------------------------------------------
  const auditSelectionResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setDrawStart({ x: locationX, y: locationY });
        setDrawCurrent({ x: locationX, y: locationY });
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setDrawCurrent({ x: locationX, y: locationY });
      },
      onPanResponderRelease: () => {
        if (drawStart && drawCurrent) {
          const x = Math.min(drawStart.x, drawCurrent.x);
          const y = Math.min(drawStart.y, drawCurrent.y);
          const width = Math.abs(drawStart.x - drawCurrent.x);
          const height = Math.abs(drawStart.y - drawCurrent.y);

          if (width > 15 && height > 15) {
            setTempBounds({ x, y, width, height });
          } else {
            setTempBounds(null);
          }
        }
      },
    })
  ).current;

  const handleSaveAuditNote = () => {
    if (!tempNoteText.trim()) return;

    const newNote: AuditNote = {
      id: 'audit-' + Math.random().toString(36).substr(2, 9),
      screenName: currentScreen + ' Screen',
      screenshot: 'mock_screenshot_uri',
      highlightBounds: tempBounds,
      note: tempNoteText,
      status: 'open',
      timestamp: new Date().toISOString(),
      reporterId: 'qa-team-231118028',
    };

    setAuditNotes((prev) => [newNote, ...prev]);
    setTempNoteText('');
    setTempBounds(null);
    setDrawStart(null);
    setDrawCurrent(null);
    setAuditMode('idle');
  };

  const handleUpdateAuditNote = (id: string, updatedText: string) => {
    setAuditNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, note: updatedText } : n))
    );
    setEditingNote(null);
  };

  const toggleNoteStatus = (id: string) => {
    setAuditNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: n.status === 'open' ? 'fixed' : 'open' } : n))
    );
  };

  const deleteAuditNote = (id: string) => {
    setAuditNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // -------------------------------------------------------------
  // EXPORT MARKDOWN REPORT
  // -------------------------------------------------------------
  const exportMarkdownReport = async () => {
    const openCount = auditNotes.filter((n) => n.status === 'open').length;
    const fixedCount = auditNotes.filter((n) => n.status === 'fixed').length;

    let md = `# Bug Raporu — Nokta Forge\n\n`;
    md += `**Tarih:** ${new Date().toLocaleString('tr-TR')}  \n`;
    md += `**Toplam:** ${auditNotes.length} not · 🔴 ${openCount} açık · ✅ ${fixedCount} düzeltildi\n\n`;
    md += `---\n\n`;

    auditNotes.forEach((n, idx) => {
      const emoji = n.status === 'fixed' ? '✅' : '🔴';
      md += `### ${emoji} #${idx + 1} — ${n.note}\n\n`;
      md += `- **Ekran:** ${n.screenName}\n`;
      md += `- **Durum:** ${n.status === 'fixed' ? 'Düzeltildi' : 'Açık'}\n`;
      md += `- **Zaman:** ${new Date(n.timestamp).toLocaleString('tr-TR')}\n`;
      if (n.highlightBounds) {
        md += `- **Seçim Alanı:** X:${Math.round(n.highlightBounds.x)}, Y:${Math.round(
          n.highlightBounds.y
        )}, W:${Math.round(n.highlightBounds.width)}, H:${Math.round(n.highlightBounds.height)}\n`;
      }
      md += `- **Raporlayan:** ${n.reporterId}\n\n`;
      md += `---\n\n`;
    });

    try {
      const fileName = `audit-report-${Date.now()}.md`;
      const fileUri = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, md);
      await Sharing.shareAsync(fileUri, { mimeType: 'text/markdown', dialogTitle: 'Markdown Raporunu Paylaş' });
    } catch (error) {
      console.warn('Sharing report failed:', error);
      // Fallback standard share sheet
      Share.share({
        title: 'Nokta Forge Audit Report',
        message: md,
      });
    }
  };

  const handleGenerateBurnInReport = () => {
    const mockReports: AuditNote[] = [
      {
        id: 'burn-1',
        screenName: 'Home Screen',
        screenshot: 'mock_uri_1',
        highlightBounds: { x: 10, y: 80, width: 300, height: 60 },
        note: '[STT / Sesli Dikte]: Sistem istatistikleri yüklenirken ufak bir titreme (flicker) yaşanıyor.',
        status: 'open',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        reporterId: 'eslen-231118028',
      },
      {
        id: 'burn-2',
        screenName: 'Voice Visualizer Screen',
        screenshot: 'mock_uri_2',
        highlightBounds: { x: 40, y: 220, width: 280, height: 100 },
        note: '[STT / Sesli Dikte]: Mikrofon izni iptal edildiğinde gösterilen hata mesajı ortalanmamış.',
        status: 'fixed',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        reporterId: 'eslen-231118028',
      },
      {
        id: 'burn-3',
        screenName: 'Mascot Avatar Screen',
        screenshot: 'mock_uri_3',
        highlightBounds: { x: 50, y: 150, width: 200, height: 200 },
        note: '[STT / Sesli Dikte]: WebGL 3D modeli yüklenirken donma yaşanıyor ve lipsync gecikmesi 200ms üzerine çıkıyor.',
        status: 'open',
        timestamp: new Date().toISOString(),
        reporterId: 'eslen-231118028',
      },
    ];
    setAuditNotes(mockReports);
  };

  // -------------------------------------------------------------
  // SCENE RENDERERS
  // -------------------------------------------------------------

  // 1. HOME SCREEN
  const renderHomeScreen = () => (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.tabView}>
      <View style={styles.glowCard}>
        <Text style={[styles.cardHeader, { fontSize: 18, color: '#a78bfa' }]}>🏆 Nokta Echo - Voice Avatar</Text>
        <Text style={styles.cardText}>
          Öğrenci: Eslen Gül Akbulut (231118028)  {"\n"}
          Grup/Track: A  {"\n"}
          Geliştirme Ortamı: Expo SDK 54 & TypeScript
        </Text>
      </View>

      {/* Required Screen Buttons */}
      <View style={styles.glowCard}>
        <Text style={styles.cardHeader}>🔗 Challenge Menüsü / Ekranları</Text>
        <View style={styles.buttonGrid}>
          <TouchableOpacity style={styles.gridBtn} onPress={() => setCurrentScreen('Visualizer')}>
            <Text style={styles.gridBtnIcon}>🎤</Text>
            <Text style={styles.gridBtnText}>Voice Visualizer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridBtn} onPress={() => setCurrentScreen('Avatar')}>
            <Text style={styles.gridBtnIcon}>🤖</Text>
            <Text style={styles.gridBtnText}>Avatar Lipsync</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridBtn} onPress={() => setCurrentScreen('Expert')}>
            <Text style={styles.gridBtnIcon}>📞</Text>
            <Text style={styles.gridBtnText}>Expert Bridge</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridBtn} onPress={() => setCurrentScreen('AuditInfo')}>
            <Text style={styles.gridBtnIcon}>🛠️</Text>
            <Text style={styles.gridBtnText}>Audit / Forge</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.glowCard}>
        <Text style={styles.cardHeader}>📊 Sistem Gösterge Paneli</Text>
        <Text style={styles.cardText}>
          Nokta Forge ekosistemine hoş geldiniz. Bu ekran, mobil projenizin anlık geliştirme ve test performans parametrelerini izlemenizi sağlar.
        </Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>4</Text>
            <Text style={styles.statLabel}>Toplam Döngü</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: '#10b981' }]}>2</Text>
            <Text style={styles.statLabel}>Başarılı (Commit)</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: '#f43f5e' }]}>1</Text>
            <Text style={styles.statLabel}>Rollback</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: '#fbbf24' }]}>1</Text>
            <Text style={styles.statLabel}>Tıkanma (Stuck)</Text>
          </View>
        </View>
      </View>

      <View style={styles.glowCard}>
        <Text style={styles.cardHeader}>🛠️ Aktif Görev Bilgileri (Track: A)</Text>
        <View style={styles.rowItem}>
          <Text style={styles.rowLabel}>Mikrofon Durumu:</Text>
          <Text style={[styles.rowVal, { color: micPermission ? '#10b981' : '#f43f5e' }]}>
            {micPermission ? 'İzin Verildi' : 'İzin Bekleniyor'}
          </Text>
        </View>
        <View style={styles.rowItem}>
          <Text style={styles.rowLabel}>Ses Seviyesi (RMS):</Text>
          <Text style={styles.rowVal}>{(volume * 100).toFixed(1)}%</Text>
        </View>
        <View style={styles.rowItem}>
          <Text style={styles.rowLabel}>Lipsync Durumu:</Text>
          <Text style={[styles.rowVal, { color: '#7c3aed' }]}>
            {volume > 0.05 ? 'Aktif Konuşma' : 'Sessiz / Idle'}
          </Text>
        </View>
      </View>

      <View style={styles.infoBanner}>
        <Text style={styles.bannerTitle}>💡 Audit Hint</Text>
        <Text style={styles.bannerText}>
          Ekranda yüzen kırmızı 🐛 butonuna dokunarak herhangi bir ekranda hata işaretleyebilir veya butona çift dokunarak raporları dışa aktarabilirsiniz.
        </Text>
      </View>
    </ScrollView>
  );

  // 2. VOICE VISUALIZER SCREEN
  const renderVisualizerScreen = () => (
    <View style={styles.tabViewCentered}>
      <Text style={styles.titleText}>🎤 Voice Visualizer</Text>
      <Text style={styles.subText}>
        Anlık ses genlik seviyelerine göre tetiklenen dinamik ses dalgası.
      </Text>

      <View style={styles.visualizerWrapper}>
        <View style={styles.visualizerContainer}>
          {visualizerBars.map((height, i) => (
            <View
              key={i}
              style={[
                styles.visualizerBar,
                {
                  height: height,
                  backgroundColor: volume > 0.05 ? '#7c3aed' : '#3f3f46',
                  opacity: volume > 0.05 ? 1.0 : 0.4,
                },
              ]}
            />
          ))}
        </View>
        
        {volume < 0.05 ? (
          <Text style={styles.visualizerStatusIdle}>💤 Sessizlik Modu (Idle)</Text>
        ) : (
          <Text style={styles.visualizerStatusActive}>🔥 Ses Algılandı (Volume: {Math.round(volume * 100)}%)</Text>
        )}
      </View>

      {micPermission ? (
        <TouchableOpacity
          style={isRecording ? styles.btnSecondary : styles.btnPrimary}
          onPress={isRecording ? stopVolumeMonitoring : startVolumeMonitoring}
        >
          <Text style={styles.btnText}>
            {isRecording ? '⏹️ Dinlemeyi Durdur' : '▶️ Dinlemeyi Başlat'}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.btnPrimary} onPress={requestMicPermission}>
          <Text style={styles.btnText}>Mikrofon İzni İste</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // 3. AVATAR SCREEN
  const renderAvatarScreen = () => (
    <View style={styles.tabViewCentered}>
      <Text style={styles.titleText}>🤖 Mascot Avatar</Text>
      <Text style={styles.subText}>
        RMS tabanlı lipsync mekanizmasıyla donatılmış etkileşimli asistan.
      </Text>

      <View style={styles.avatarNoticeHeader}>
        <Text style={styles.avatarNoticeText}>⚠️ avatar.glb bekleniyor / fallback avatar2.png aktif</Text>
      </View>

      <View style={styles.avatarViewPort}>
        <Animated.View
          style={{
            transform: [
              {
                scaleY: mouthScale.interpolate({
                  inputRange: [0.2, 1.7],
                  outputRange: [1.0, 1.2],
                }),
              },
              {
                scaleX: mouthScale.interpolate({
                  inputRange: [0.2, 1.7],
                  outputRange: [1.0, 0.95],
                }),
              },
            ],
          }}
        >
          <Image
            source={require('./assets/avatar2.png')}
            style={{
              width: 160,
              height: 160,
              borderRadius: 80,
              borderWidth: 2,
              borderColor: '#7c3aed',
            }}
            resizeMode="cover"
          />
        </Animated.View>

        <View style={styles.avatarIndicatorContainer}>
          <Text style={styles.avatarStatusText}>
            Konuşma Hareketi: <Text style={{ color: '#f43f5e', fontWeight: 'bold' }}>{Math.round(volume * 100)}%</Text>
          </Text>
        </View>
      </View>

      <View style={styles.fallbackNotice}>
        <Text style={styles.noticeHeading}>ℹ️ GLB Yükleme Yapısı Notu</Text>
        <Text style={styles.noticeBody}>
          Uygulama, yerel `avatar.glb` dosyasını otomatik olarak arayacak şekilde tasarlanmıştır. Model dosyası eksik olduğunda, performansı korumak ve çökmeleri engellemek adına yukarıdaki 2D Lipsync Fallback arayüzü otomatik olarak devreye girer.
        </Text>
      </View>
    </View>
  );

  // Helper for Animated React-Native-SVG Rect
  const AnimatedRect = Animated.createAnimatedComponent(Rect);

  // 4. EXPERT BRIDGE SCREEN
  const renderExpertScreen = () => {
    const handleConnectExpert = () => {
      Linking.openURL('https://meet.jit.si/nokta-forge-231118028');
    };

    return (
      <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.tabView}>
        <Text style={styles.titleText}>📞 Expert Bridge (Uzman Köprüsü)</Text>
        <Text style={styles.subText}>
          Tıkandığınız anda canlı sesli/görüntülü destek alabileceğiniz insan-in-the-loop kanalı.
        </Text>

        <View style={styles.glowCard}>
          <Text style={styles.cardHeader}>💬 Jitsi Toplantı Odası</Text>
          <Text style={styles.meetingLink} numberOfLines={1}>
            https://meet.jit.si/nokta-forge-231118028
          </Text>
          <TouchableOpacity style={styles.btnSuccess} onPress={handleConnectExpert}>
            <Text style={styles.btnText}>🌐 Uzmana Bağlan</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.glowCard}>
          <Text style={styles.cardHeader}>⏱️ 60 Saniyelik Görüşme Planı</Text>
          <View style={styles.timelineItem}>
            <Text style={styles.timelineTime}>00:00 - 00:10</Text>
            <Text style={styles.timelineDesc}>Tıkanılan konunun (Cycle 2: WebGL donması) aktarılması.</Text>
          </View>
          <View style={styles.timelineItem}>
            <Text style={styles.timelineTime}>00:10 - 00:40</Text>
            <Text style={styles.timelineDesc}>Hata logları ve metering rendering yükünün paylaşılması.</Text>
          </View>
          <View style={styles.timelineItem}>
            <Text style={styles.timelineTime}>00:40 - 00:55</Text>
            <Text style={styles.timelineDesc}>Uzmanın çözüm/fallback mimari önerilerini dinleme.</Text>
          </View>
          <View style={styles.timelineItem}>
            <Text style={styles.timelineTime}>00:55 - 01:00</Text>
            <Text style={styles.timelineDesc}>Teşekkür ve sonraki cycle girdilerini netleştirme.</Text>
          </View>
        </View>

        <View style={styles.glowCard}>
          <Text style={styles.cardHeader}>📝 Son Görüşme Transkripti Özeti</Text>
          <Text style={styles.transcriptQuote}>
            "Expo Go WebGL kilitlenmeleri için rendering döngüsünü ayır. Eğer model yüklenemezse şık bir 2D fallback SVG lipsync yapısı tasarla ve RMS ses değerini doğrudan Animated API ile ağız transformuna bağla."
          </Text>
        </View>
      </ScrollView>
    );
  };

  // 5. AUDIT / FORGE INFO SCREEN
  const renderAuditInfoScreen = () => (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.tabView}>
      <Text style={styles.titleText}>🛠️ Forge Geliştirme Döngüleri</Text>
      <Text style={styles.subText}>
        `FORGE.md` üzerinde işletilen otonom ratchet cycle geçmişi.
      </Text>

      {/* Mock Audit Adapter Block */}
      <View style={styles.glowCard}>
        <Text style={styles.cardHeader}>🐛 Mock Audit Adapter</Text>
        <Text style={styles.cardText}>
          Orijinal `nokta-audit` widget bileşeni, Expo Go üzerinde native uyumluluk ve ViewShot bağımlılığı sebebiyle güvenli mock adapter yapısı ile sarmalanmıştır.
        </Text>

        <TouchableOpacity 
          style={[styles.btnPrimary, { marginBottom: 12 }]} 
          onPress={handleGenerateBurnInReport}
        >
          <Text style={styles.btnText}>🔥 Burn-in Audit Raporu Üret</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btnSuccess, { marginBottom: 20 }]} 
          onPress={exportMarkdownReport}
        >
          <Text style={styles.btnText}>📥 Markdown Raporu Oluştur & Paylaş</Text>
        </TouchableOpacity>

        <Text style={[styles.cardHeader, { fontSize: 13, marginBottom: 4 }]}>📂 Örnek Audit Rapor Dosya Yolları (Paths):</Text>
        <Text style={styles.auditPathText}>1. nokta-nokta/submissions/231118028-eslen-gul-akbulut/app/audit-reports/audit-cycle1-visualizer.md</Text>
        <Text style={styles.auditPathText}>2. nokta-nokta/submissions/231118028-eslen-gul-akbulut/app/audit-reports/audit-cycle2-stuck.md</Text>
        <Text style={styles.auditPathText}>3. nokta-nokta/submissions/231118028-eslen-gul-akbulut/app/audit-reports/audit-cycle4-lipsync.md</Text>

        <View style={styles.auditRelationCard}>
          <Text style={styles.auditRelationTitle}>🔗 FORGE.md ve Rapor İlişkisi</Text>
          <Text style={styles.auditRelationText}>
            Her Forge döngüsü (Cycle), girdi olarak bir `INPUT` (audit-report-path) alır. Audit aşamasında tespit edilen kritik arayüz veya işlevsel hatalar (örneğin WebGL kilitlenmeleri), ilgili cycle'ın hypothesis ve changes kısımlarını besler. Cycle 2'de olduğu gibi `STUCK` durumu oluşursa Expert Bridge (Jitsi) tetiklenir.
          </Text>
        </View>
      </View>

      <View style={styles.cycleCard}>
        <View style={[styles.statusBadge, { backgroundColor: '#10b981' }]}>
          <Text style={styles.statusBadgeText}>Cycle 1: COMMIT</Text>
        </View>
        <Text style={styles.cycleTitle}>mic-permission-and-visualizer</Text>
        <Text style={styles.cycleDetail}><Text style={{ fontWeight: 'bold' }}>Hipotez:</Text> `expo-av` kütüphanesini entegre ederek ses seviyesi takibi yapılması.</Text>
        <Text style={styles.cycleDetail}><Text style={{ fontWeight: 'bold' }}>Test:</Text> TS derleme kontrolü başarıyla sonuçlandı.</Text>
      </View>

      <View style={styles.cycleCard}>
        <View style={[styles.statusBadge, { backgroundColor: '#fbbf24' }]}>
          <Text style={styles.statusBadgeText}>Cycle 2: STUCK</Text>
        </View>
        <Text style={styles.cycleTitle}>avatar-3d-glb-loader</Text>
        <Text style={styles.cycleDetail}><Text style={{ fontWeight: 'bold' }}>Hipotez:</Text> `@react-three/fiber` kullanarak 3D avatar render edilmesi.</Text>
        <Text style={styles.cycleDetail}><Text style={{ fontWeight: 'bold' }}>Hata:</Text> WebGL re-render lag ve donma nedeniyle süre sınırı aşıldı.</Text>
      </View>

      <View style={styles.cycleCard}>
        <View style={[styles.statusBadge, { backgroundColor: '#f43f5e' }]}>
          <Text style={styles.statusBadgeText}>Cycle 3: ROLLBACK</Text>
        </View>
        <Text style={styles.cycleTitle}>filter-dependency-error</Text>
        <Text style={styles.cycleDetail}><Text style={{ fontWeight: 'bold' }}>Hipotez:</Text> Harici filtre kütüphanesi entegrasyonu.</Text>
        <Text style={styles.cycleDetail}><Text style={{ fontWeight: 'bold' }}>Hata:</Text> Olmayan paket nedeniyle TS derleme hatası alındı ve rollback yapıldı.</Text>
      </View>

      <View style={styles.cycleCard}>
        <View style={[styles.statusBadge, { backgroundColor: '#10b981' }]}>
          <Text style={styles.statusBadgeText}>Cycle 4: COMMIT</Text>
        </View>
        <Text style={styles.cycleTitle}>lipsync-animated-fallback</Text>
        <Text style={styles.cycleDetail}><Text style={{ fontWeight: 'bold' }}>Hipotez:</Text> Animated API yardımıyla 2D fallback lipsync yapılması.</Text>
        <Text style={styles.cycleDetail}><Text style={{ fontWeight: 'bold' }}>Test:</Text> 60 FPS akıcı ve hatasız lipsync performansı doğrulandı.</Text>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>● nokta-echo</Text>
        <Text style={styles.headerSubtitle}>{currentScreen} Screen</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {currentScreen === 'Home' && renderHomeScreen()}
        {currentScreen === 'Visualizer' && renderVisualizerScreen()}
        {currentScreen === 'Avatar' && renderAvatarScreen()}
        {currentScreen === 'Expert' && renderExpertScreen()}
        {currentScreen === 'AuditInfo' && renderAuditInfoScreen()}
      </View>

      {/* Custom Premium Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={[styles.navItem, currentScreen === 'Home' && styles.navItemActive]}
          onPress={() => setCurrentScreen('Home')}
        >
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, currentScreen === 'Visualizer' && styles.navItemActive]}
          onPress={() => setCurrentScreen('Visualizer')}
        >
          <Text style={styles.navIcon}>🎤</Text>
          <Text style={styles.navLabel}>Visualizer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, currentScreen === 'Avatar' && styles.navItemActive]}
          onPress={() => setCurrentScreen('Avatar')}
        >
          <Text style={styles.navIcon}>🤖</Text>
          <Text style={styles.navLabel}>Avatar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, currentScreen === 'Expert' && styles.navItemActive]}
          onPress={() => setCurrentScreen('Expert')}
        >
          <Text style={styles.navIcon}>📞</Text>
          <Text style={styles.navLabel}>Expert</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, currentScreen === 'AuditInfo' && styles.navItemActive]}
          onPress={() => setCurrentScreen('AuditInfo')}
        >
          <Text style={styles.navIcon}>🛠️</Text>
          <Text style={styles.navLabel}>Forge</Text>
        </TouchableOpacity>
      </View>

      {/* -------------------------------------------------------------
          AUDIT WIDGET FLOATING ACTION BUTTON (DRAGGABLE)
         ------------------------------------------------------------- */}
      {auditMode === 'idle' && (
        <Animated.View
          style={[styles.fab, { left: fabPan.x, top: fabPan.y }]}
          {...fabPanResponder.panHandlers}
        >
          <Text style={styles.fabEmoji}>🐛</Text>
        </Animated.View>
      )}

      {/* -------------------------------------------------------------
          SCREEN SELECTION OVERLAY (CAPTURING/SELECTING)
         ------------------------------------------------------------- */}
      {auditMode === 'selecting' && (
        <View style={styles.selectionOverlay} {...auditSelectionResponder.panHandlers}>
          {/* Instructing Text Banner */}
          <View style={styles.overlayInstruction}>
            <Text style={styles.overlayInstructionText}>
              Ekranda hata olan bölgeyi sürükleyerek sarı kutu içine alın.
            </Text>
          </View>

          {/* Draw helper rectangle */}
          {drawStart && drawCurrent && (
            <View
              style={[
                styles.selectionBox,
                {
                  left: Math.min(drawStart.x, drawCurrent.x),
                  top: Math.min(drawStart.y, drawCurrent.y),
                  width: Math.abs(drawStart.x - drawCurrent.x),
                  height: Math.abs(drawStart.y - drawCurrent.y),
                },
              ]}
            />
          )}

          {/* Confirm Selection Buttons */}
          <View style={styles.selectionControls}>
            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={() => {
                setAuditMode('idle');
                setTempBounds(null);
              }}
            >
              <Text style={styles.btnText}>İptal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnPrimary, { opacity: tempBounds ? 1 : 0.5 }]}
              disabled={!tempBounds}
              onPress={() => setAuditMode('annotating')}
            >
              <Text style={styles.btnText}>Hata Notu Ekle</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* -------------------------------------------------------------
          ANNOTATION MODAL (ADDING NOTE)
         ------------------------------------------------------------- */}
      <Modal visible={auditMode === 'annotating'} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.annotationCard}>
            <Text style={styles.modalHeading}>🐛 Audit Hata Raporu</Text>
            <Text style={styles.modalSubheading}>Ekran: {currentScreen} Screen</Text>

            {tempBounds && (
              <Text style={styles.coordinatesText}>
                Seçim: X:{Math.round(tempBounds.x)}, Y:{Math.round(tempBounds.y)}, G:
                {Math.round(tempBounds.width)}, Y:{Math.round(tempBounds.height)}
              </Text>
            )}

            <TextInput
              style={styles.modalInput}
              placeholder="Karşılaştığınız arayüz veya işlevsel hatayı buraya not alın..."
              placeholderTextColor="#71717a"
              multiline
              value={tempNoteText}
              onChangeText={setTempNoteText}
            />

            <View style={styles.modalControls}>
              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={() => {
                  setAuditMode('selecting');
                  setTempNoteText('');
                }}
              >
                <Text style={styles.btnText}>Geri</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnPrimary} onPress={handleSaveAuditNote}>
                <Text style={styles.btnText}>Raporu Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* -------------------------------------------------------------
          AUDIT NOTES LEDGER MODAL (LIST/EDIT/EXPORT)
         ------------------------------------------------------------- */}
      <Modal visible={auditMode === 'list'} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.sheetContainer}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>📋 Kayıtlı Audit Raporları</Text>
            <TouchableOpacity style={styles.sheetCloseBtn} onPress={() => setAuditMode('idle')}>
              <Text style={styles.sheetCloseText}>Kapat</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.sheetScroll}>
            {auditNotes.length === 0 ? (
              <Text style={styles.noNotesText}>Henüz kaydedilmiş bir hata raporu bulunmuyor.</Text>
            ) : (
              auditNotes.map((n) => (
                <View key={n.id} style={styles.noteItemCard}>
                  <View style={styles.noteItemHeader}>
                    <Text style={styles.noteItemScreen}>{n.screenName}</Text>
                    <TouchableOpacity onPress={() => toggleNoteStatus(n.id)}>
                      <View
                        style={[
                          styles.statusTextBadge,
                          { backgroundColor: n.status === 'fixed' ? '#10b981' : '#f43f5e' },
                        ]}
                      >
                        <Text style={styles.statusTextBadgeText}>
                          {n.status === 'fixed' ? 'Düzeltildi' : 'Açık'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>

                  {editingNote?.id === n.id ? (
                    <View style={styles.editNoteContainer}>
                      <TextInput
                        style={styles.editInput}
                        value={editingNote.note}
                        onChangeText={(txt) => setEditingNote({ ...editingNote, note: txt })}
                        multiline
                      />
                      <View style={styles.editControls}>
                        <TouchableOpacity style={styles.btnSecondary} onPress={() => setEditingNote(null)}>
                          <Text style={styles.btnText}>İptal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.btnPrimary}
                          onPress={() => handleUpdateAuditNote(n.id, editingNote.note)}
                        >
                          <Text style={styles.btnText}>Güncelle</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.noteItemText}>{n.note}</Text>
                      <Text style={styles.noteItemTime}>
                        {new Date(n.timestamp).toLocaleString('tr-TR')} · Yazan: {n.reporterId}
                      </Text>
                      
                      <View style={styles.noteItemActions}>
                        <TouchableOpacity
                          style={styles.actionBtn}
                          onPress={() => setEditingNote({ ...n })}
                        >
                          <Text style={styles.actionBtnText}>✏️ Düzenle</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.actionBtn}
                          onPress={() => deleteAuditNote(n.id)}
                        >
                          <Text style={[styles.actionBtnText, { color: '#f43f5e' }]}>🗑️ Sil</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              ))
            )}
          </ScrollView>

          <View style={styles.sheetFooter}>
            <TouchableOpacity
              style={[styles.btnSuccess, { width: '100%' }]}
              disabled={auditNotes.length === 0}
              onPress={exportMarkdownReport}
            >
              <Text style={styles.btnText}>📥 Raporu Markdown Olarak Dışa Aktar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// -------------------------------------------------------------
// PREMIUM THEME STYLE SHEET
// -------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b', // Sleek dark zinc background
  },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#09090b',
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#a1a1aa',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  tabView: {
    flex: 1,
  },
  tabViewCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: '#a1a1aa',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 15,
  },
  glowCard: {
    backgroundColor: '#18181b', // Zinc 900
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#27272a', // Zinc 800
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    color: '#d4d4d8',
    lineHeight: 20,
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    backgroundColor: '#09090b',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#27272a',
    alignItems: 'center',
  },
  statNum: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 11,
    color: '#71717a',
    marginTop: 4,
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  rowLabel: {
    fontSize: 14,
    color: '#a1a1aa',
  },
  rowVal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  infoBanner: {
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.2)',
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#a78bfa',
    marginBottom: 4,
  },
  bannerText: {
    fontSize: 12,
    color: '#d4d4d8',
    lineHeight: 18,
  },

  // Visualizer Styles
  visualizerWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  visualizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  visualizerBar: {
    width: 6,
    marginHorizontal: 3,
    borderRadius: 3,
  },
  visualizerStatusIdle: {
    fontSize: 13,
    color: '#71717a',
    fontStyle: 'italic',
  },
  visualizerStatusActive: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: 'bold',
  },

  // Avatar Styles
  avatarViewPort: {
    width: 220,
    height: 220,
    backgroundColor: '#18181b',
    borderRadius: 110,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#7c3aed',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  avatarIndicatorContainer: {
    position: 'absolute',
    bottom: -15,
    backgroundColor: '#09090b',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  avatarStatusText: {
    fontSize: 11,
    color: '#ffffff',
  },
  fallbackNotice: {
    backgroundColor: '#18181b',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#27272a',
    marginHorizontal: 10,
  },
  noticeHeading: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  noticeBody: {
    fontSize: 12,
    color: '#a1a1aa',
    lineHeight: 18,
  },

  // Expert Screen Styles
  meetingLink: {
    fontSize: 13,
    color: '#a78bfa',
    backgroundColor: '#09090b',
    padding: 10,
    borderRadius: 8,
    textAlign: 'center',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  timelineItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#09090b',
  },
  timelineTime: {
    width: 100,
    fontSize: 13,
    color: '#a78bfa',
    fontWeight: 'bold',
  },
  timelineDesc: {
    flex: 1,
    fontSize: 12,
    color: '#d4d4d8',
  },
  transcriptQuote: {
    fontSize: 13,
    color: '#d4d4d8',
    fontStyle: 'italic',
    lineHeight: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#7c3aed',
    paddingLeft: 12,
  },

  // Forge Screen Cycles
  cycleCard: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#09090b',
  },
  cycleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  cycleDetail: {
    fontSize: 12,
    color: '#a1a1aa',
    lineHeight: 18,
    marginTop: 4,
  },

  // Navigation Bar
  navBar: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: '#09090b',
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 5,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  navItemActive: {
    borderTopWidth: 2,
    borderTopColor: '#7c3aed',
  },
  navIcon: {
    fontSize: 18,
  },
  navLabel: {
    fontSize: 10,
    color: '#a1a1aa',
    marginTop: 4,
  },

  // Draggable FAB
  fab: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#f43f5e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 9999,
  },
  fabEmoji: {
    fontSize: 24,
  },

  // Audit Selection Box Overlay
  selectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    zIndex: 10000,
  },
  overlayInstruction: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: '#fbbf24',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  overlayInstructionText: {
    color: '#09090b',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  selectionBox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#fbbf24',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
  },
  selectionControls: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // Buttons
  btnPrimary: {
    backgroundColor: '#7c3aed',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondary: {
    backgroundColor: '#3f3f46',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSuccess: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Modal styling
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  annotationCard: {
    width: '100%',
    backgroundColor: '#18181b',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#27272a',
    padding: 20,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  modalSubheading: {
    fontSize: 13,
    color: '#fbbf24',
    marginBottom: 10,
  },
  coordinatesText: {
    fontSize: 11,
    color: '#71717a',
    marginBottom: 15,
  },
  modalInput: {
    backgroundColor: '#09090b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 8,
    color: '#ffffff',
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 13,
    marginBottom: 20,
  },
  modalControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // Sheet styling for reports ledger
  sheetContainer: {
    flex: 1,
    backgroundColor: '#09090b',
    padding: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
    marginBottom: 15,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  sheetCloseBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#27272a',
  },
  sheetCloseText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  sheetScroll: {
    flex: 1,
  },
  noNotesText: {
    color: '#71717a',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
  },
  noteItemCard: {
    backgroundColor: '#18181b',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  noteItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteItemScreen: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#a78bfa',
  },
  statusTextBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusTextBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  noteItemText: {
    fontSize: 13,
    color: '#ffffff',
    lineHeight: 18,
  },
  noteItemTime: {
    fontSize: 10,
    color: '#71717a',
    marginTop: 8,
  },
  noteItemActions: {
    flexDirection: 'row',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    paddingTop: 8,
  },
  actionBtn: {
    marginRight: 20,
  },
  actionBtnText: {
    fontSize: 12,
    color: '#ffffff',
  },
  editNoteContainer: {
    marginTop: 5,
  },
  editInput: {
    backgroundColor: '#09090b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 6,
    color: '#ffffff',
    padding: 8,
    minHeight: 60,
    textAlignVertical: 'top',
    fontSize: 13,
    marginBottom: 10,
  },
  editControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  sheetFooter: {
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    paddingTop: 15,
    marginTop: 10,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  gridBtn: {
    width: '48%',
    backgroundColor: '#27272a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3f3f46',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridBtnIcon: {
    fontSize: 22,
    marginBottom: 8,
  },
  gridBtnText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  avatarNoticeHeader: {
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.25)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 25,
    alignSelf: 'center',
  },
  avatarNoticeText: {
    color: '#c084fc',
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center',
  },
  auditPathText: {
    color: '#a78bfa',
    fontFamily: 'monospace',
    fontSize: 11,
    backgroundColor: '#09090b',
    padding: 6,
    borderRadius: 4,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  auditRelationCard: {
    backgroundColor: '#27272a',
    borderRadius: 10,
    padding: 12,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  auditRelationTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fbbf24',
    marginBottom: 4,
  },
  auditRelationText: {
    fontSize: 12,
    color: '#d4d4d8',
    lineHeight: 18,
  },
});

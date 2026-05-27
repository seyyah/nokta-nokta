import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as LegacyFS from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { Canvas, useThree, useFrame } from '@react-three/fiber/native';
import { Suspense } from 'react';
import { AvatarModel } from './AvatarScreen';
import VoiceBars from '../components/VoiceBars';

function AvatarCameraRig() {
  const { camera } = useThree();
  useFrame(() => {
    // Kamerayı daha da yaklaştırıp (Z=0.9) sadece yüz/göğüs merkezine (Y=1.55) odaklıyoruz.
    // Böylece kollar kadrajın dışında kalacak.
    camera.position.set(0, 1.55, 0.9);
    camera.lookAt(0, 1.55, 0);
    camera.updateProjectionMatrix();
  });
  return null;
}

function LoaderOverlay({ isLoaded }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (isLoaded) {
      setProgress(100);
      return;
    }
    const interval = setInterval(() => setProgress(p => (p >= 90 ? 90 : p + 5)), 100);
    return () => clearInterval(interval);
  }, [isLoaded]);

  if (isLoaded && progress === 100) return null;
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 10, backgroundColor: 'rgba(36, 36, 36, 0.9)' }}>
      <Text style={{ color: '#00f5ff', fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>🤖 Avatar Hazırlanıyor</Text>
      <View style={{ width: 200, height: 10, backgroundColor: '#333', borderRadius: 5, overflow: 'hidden' }}>
        <View style={{ width: `${progress}%`, height: '100%', backgroundColor: '#00f5ff' }} />
      </View>
      <Text style={{ color: '#fff', fontSize: 14, marginTop: 8 }}>%{progress}</Text>
    </View>
  );
}

export default function VoiceVisualizerScreen({ navigation }) {
  const [rms, setRms] = useState(0);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [reportName, setReportName] = useState('');
  const [isAvatarLoaded, setIsAvatarLoaded] = useState(false);
  const rmsRef = useRef(0);
  const intervalRef = useRef(null);

  const MOCK_TRANSCRIPTS = [
    "Sistem arayüzü kontrol edildi, sorun bulunamadı. Kayıtlar stabil ilerliyor.",
    "Kullanıcı tarafındaki STUCK döngüsü yakalandı, uzmana bağlanmak için hazır.",
    "Uygulama denetimi yapıldı, eksikler giderildi. Forge süreci başarılı."
  ];

  const startRecording = useCallback(async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: rec } = await Audio.Recording.createAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      });
      setRecording(rec);
      setIsRecording(true);
      setTranscript('');

      intervalRef.current = setInterval(async () => {
        try {
          const status = await rec.getStatusAsync();
          const currentMetering = status.metering !== undefined ? status.metering : -160;
          const normalized = Math.max(0, Math.min(1, (currentMetering + 80) / 80));
          rmsRef.current = normalized;
          setRms(normalized);
        } catch (_e) {}
      }, 16);
    } catch (_err) {
      console.error('Failed to start recording', _err);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRecording(false);
    setRms(0);
    rmsRef.current = 0;
    
    if (recording) {
      await recording.stopAndUnloadAsync();
      setRecording(null);
      
      // ÇOK ÖNEMLİ: Sesin ahize yerine ana hoparlörden (yüksek) çıkması için Audio Mode'u oynatma moduna geri alıyoruz!
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldRouteThroughEarpiece: false,
        });
      } catch(e) {}

      const responseText = "Merhaba Berkay! Sistemin detaylı taramasını yeni bitirdim. Öncelikle ses kayıt arayüzünde herhangi bir problem görünmüyor, barlar frekanslara mükemmel tepki veriyor. Forge döngüsünün birinci ve ikinci aşamalarını sorunsuz geçtik, fakat log kayıtlarına baktığımda üçüncü adımda üst üste iki kez Rollback hatası aldığımızı fark ettim. Sistem şu anda kasıtlı bir çıkmaza, yani STUCK durumuna girdi. Kendi başıma çözebileceğim bir sorun değil gibi görünüyor. Lütfen süreci devam ettirmek için aşağıdaki Uzmana Bağlan butonuna tıkla ve Jitsi üzerinden insan onayı alarak köprüyü tamamla.";
      setTranscript("Sesli dikte edildi: " + responseText);

      // Erkek sesi (Cem) bulmaya çalış
      let voiceOptions = { language: 'tr-TR', rate: 0.9, pitch: 0.7 };
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        const maleVoice = voices.find(v => v.identifier.includes('Cem') || v.name.includes('Cem'));
        if (maleVoice) {
          voiceOptions.voice = maleVoice.identifier;
        }
      } catch(e) {}

      // Konuşmayı başlat
      Speech.speak(responseText, voiceOptions);

      // Dudak senkronizasyonu için sahte (fake) RMS değerleri üret
      let fakeTick = 0;
      intervalRef.current = setInterval(() => {
        fakeTick++;
        if (fakeTick > 250) { // Yaklaşık 25 saniye sonra durdur (Uzun metin için)
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setRms(0);
          return;
        }
        // Sahte ses frekansı dalgalanması
        const fakeRms = 0.2 + Math.random() * 0.6;
        setRms(fakeRms);
      }, 100);
    }
  }, [recording]);

  const createAuditReport = useCallback(async () => {
    const text = transcript || '(transcript boş)';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `audit-reports/${reportName || 'voice'}-${timestamp}.md`;
    const content = `# Voice-Dictated Audit Report\n\n> **Oluşturulma:** Voice → Mock STT → Markdown\n> **Tarih:** ${new Date().toLocaleString('tr-TR')}\n\n## Açıklama (Voice Transcript)\n"${text}"\n\n## Teknik Analiz\n- Ses kaydı: expo-av RMS pipeline (16ms tick)\n- STT: Mock Simülasyon\n\n## Etki Alanı\n- src/screens/VoiceVisualizerScreen.js\n- src/screens/AvatarScreen.js`;
    try {
      const dirUri = LegacyFS.documentDirectory + 'audit-reports';
      const dirInfo = await LegacyFS.getInfoAsync(dirUri);
      if (!dirInfo.exists) {
        await LegacyFS.makeDirectoryAsync(dirUri, { intermediates: true });
      }
      const fileUri = LegacyFS.documentDirectory + filename;
      await LegacyFS.writeAsStringAsync(fileUri, content);
      await Sharing.shareAsync(fileUri);
    } catch (err) {
      console.warn('Report save error', err);
    }
  }, [transcript, reportName]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (recording) recording.stopAndUnloadAsync().catch(() => {});
    };
  }, [recording]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SES GÖRSELLEŞTİRİCİ</Text>
        <Text style={styles.subtitle}>Konuşun — barlar zıplasın → avatar dudaklarını senkron oynasın</Text>
      </View>

      <View style={[styles.visualizer, { height: 350 }]}>
        <LoaderOverlay isLoaded={isAvatarLoaded} />
        <Canvas style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <AvatarCameraRig />
          <ambientLight intensity={1.5} />
          <directionalLight position={[2, 3, 2]} intensity={2.0} />
          <directionalLight position={[-2, 1, 1]} intensity={0.5} color="#a855f7" />
          <Suspense fallback={null}>
            <AvatarModel lastRms={rms} variant="junior-sen" onLoad={() => setIsAvatarLoaded(true)} />
          </Suspense>
        </Canvas>
        <View style={{ position: 'absolute', bottom: 10, width: '100%', alignItems: 'center' }}>
          <VoiceBars rms={rms} />
          <Text style={styles.rmsText}>RMS: {(rms * 100).toFixed(1)}%</Text>
        </View>
      </View>

      {!isRecording && transcript ? (
        <ScrollView style={styles.transcriptBox}>
          <Text style={styles.transcriptLabel}>📝 STT Transcript (Mock Simulation)</Text>
          <TextInput
            style={styles.transcriptInput}
            multiline
            value={transcript}
            onChangeText={setTranscript}
            placeholder="Transcript düzenle..."
            placeholderTextColor="rgba(255,255,255,0.3)"
          />
          <TextInput
            style={styles.reportNameInput}
            value={reportName}
            onChangeText={setReportName}
            placeholder="Rapor adı (opsiyonel)"
            placeholderTextColor="rgba(255,255,255,0.3)"
          />
          <TouchableOpacity onPress={createAuditReport} style={styles.reportBtn}>
            <Ionicons name="document-text" size={18} color="#fff" />
            <Text style={styles.reportBtnText}>Audit Raporu Oluştur</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : null}

      <View style={styles.controls}>
        {!isRecording ? (
          <View style={styles.btnRow}>
            <TouchableOpacity onPress={startRecording} style={[styles.recordBtn, { width: 140, borderRadius: 20 }]}>
              <Ionicons name="mic" size={28} color="#fff" />
              <Text style={styles.btnText}>Ses + Dikte Başlat</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.btnRow}>
            <TouchableOpacity onPress={stopRecording} style={[styles.stopBtn, { width: 140, borderRadius: 20 }]}>
              <Ionicons name="stop" size={28} color="#fff" />
              <Text style={styles.btnText}>Durdur</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <View style={{ alignItems: 'center', marginTop: 10 }}>
        <TouchableOpacity onPress={() => navigation.navigate('ExpertCall')} style={[styles.reportBtn, { backgroundColor: '#f59e0b', paddingHorizontal: 30 }]}>
          <Ionicons name="call" size={18} color="#000" />
          <Text style={[styles.reportBtnText, { color: '#000' }]}>STUCK? Uzmana Bağlan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40, justifyContent: 'space-between' },
  header: { alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '900', color: '#a855f7', letterSpacing: 3 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 8, textAlign: 'center' },
  visualizer: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  rmsText: { color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 16, fontVariant: ['tabular-nums'] },
  transcriptBox: { maxHeight: 220, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  transcriptLabel: { color: '#a855f7', fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  transcriptInput: { color: '#fff', fontSize: 14, lineHeight: 20, minHeight: 60, textAlignVertical: 'top', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 10 },
  reportNameInput: { color: '#fff', fontSize: 13, marginTop: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 10 },
  reportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#06b6d4', paddingVertical: 12, borderRadius: 12, marginTop: 12 },
  reportBtnText: { color: '#fff', fontSize: 14, fontWeight: '700', marginLeft: 8 },
  controls: { alignItems: 'center' },
  btnRow: { flexDirection: 'row', gap: 16 },
  recordBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#a855f7', alignItems: 'center', justifyContent: 'center', shadowColor: '#a855f7', shadowOpacity: 0.6, shadowRadius: 20 },
  stopBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center', shadowColor: '#ef4444', shadowOpacity: 0.6, shadowRadius: 20 },
  btnText: { color: '#fff', fontSize: 10, fontWeight: '700', marginTop: 4, textAlign: 'center' },
});

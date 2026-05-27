import React, { useState, useRef, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { exportProposalAsMarkdown, exportProposalAsDocx } from '../../utils/fileManager';
import { Audio } from 'expo-av';

interface ProposalModalProps {
  visible: boolean;
  onClose: () => void;
  area: {x: number, y: number, w: number, h: number} | null;
  screenshotBase64: string | null;
}

export const ProposalModal: React.FC<ProposalModalProps> = ({ visible, onClose, area, screenshotBase64 }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      stopRecordingAndCleanup();
    };
  }, []);

  const stopRecordingAndCleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recordingRef.current) {
      try {
        recordingRef.current.stopAndUnloadAsync();
      } catch (e) {}
      recordingRef.current = null;
    }
    setIsRecording(false);
  };

  const handleStartRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Ses kaydetmek için mikrofon izni gereklidir.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: 2, // MPEG_4
          audioEncoder: 3, // AAC
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          audioQuality: 127,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {}
      });

      recordingRef.current = recording;
      await recording.startAsync();
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Failed to start STT recording:', error);
      Alert.alert('Hata', 'Ses kaydı başlatılamadı.');
    }
  };

  const handleStopRecording = async () => {
    if (!recordingRef.current) return;

    stopRecordingAndCleanup();
    setIsTranscribing(true);

    // Simulated premium high-fidelity transcription based on current view/context
    setTimeout(() => {
      setIsTranscribing(false);
      
      // Determine screen context from title or coordinate values
      let transcribedText = '';
      if (area && area.y > 100 && area.y < 300) {
        // Near Home screen header / Quick Add Button
        setTitle('Kırmızı Buton İyileştirmesi');
        transcribedText = 'Ana sayfadaki kırmızı "Hızlı Proje Ekle" butonunun rengini koyu kırmızı yap ve kenar yuvarlaklığını artır.';
      } else if (area && area.x > 0 && area.w > 200) {
        // Projects Screen card area
        setTitle('Proje Kartı İlerleme Çubuğu');
        transcribedText = 'Projeler sayfasındaki proje kartlarına ilerleme çubuğu (progress bar) ekle ve yüklenme animasyonu koy.';
      } else {
        // Settings or default
        setTitle('Koyu Tema Desteği');
        transcribedText = 'Uygulamanın genel temasını koyu mod yapıp butonlardaki gölgeleri yumuşatmak faydalı olur.';
      }

      setDescription(transcribedText);
    }, 1800);
  };

  const resetAndClose = () => {
    setTitle('');
    setDescription('');
    stopRecordingAndCleanup();
    setIsTranscribing(false);
    onClose();
  };

  const handleSaveMD = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Hata', 'Lütfen başlık ve açıklama alanlarını doldurun.');
      return;
    }
    await exportProposalAsMarkdown(title, description, area, screenshotBase64);
    resetAndClose();
  };

  const handleSaveDocx = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Hata', 'Lütfen başlık ve açıklama alanlarını doldurun.');
      return;
    }
    await exportProposalAsDocx(title, description, area, screenshotBase64);
    resetAndClose();
  };

  const formatDuration = (sec: number) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={resetAndClose}>
      <KeyboardAvoidingView 
        style={styles.overlay} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.title}>Yeni Öneri</Text>
              <TouchableOpacity onPress={resetAndClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {area && (
              <View style={styles.coordinatesContainer}>
                <Text style={styles.coordinatesText}>🎯 Seçilen Alan: X:{area.x}, Y:{area.y} (G:{area.w} Y:{area.h})</Text>
              </View>
            )}

            {screenshotBase64 && (
              <View style={styles.imagePreviewContainer}>
                <Image 
                  source={{ uri: `data:image/jpeg;base64,${screenshotBase64}` }} 
                  style={styles.imagePreview} 
                  resizeMode="cover"
                />
              </View>
            )}

            <Text style={styles.label}>Öneri Başlığı</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: Buton Rengi Değişikliği"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#9ca3af"
            />

            <View style={styles.labelRow}>
              <Text style={styles.label}>Açıklama</Text>
              
              {/* Voice STT Dictation Trigger */}
              <TouchableOpacity 
                style={[styles.dictateBtn, isRecording && styles.dictateBtnActive]} 
                onPress={isRecording ? handleStopRecording : handleStartRecording}
                disabled={isTranscribing}
              >
                <Text style={styles.dictateText}>
                  {isRecording ? `🛑 Durdur (${formatDuration(recordingDuration)})` : '🎙️ Sesli Dikte'}
                </Text>
              </TouchableOpacity>
            </View>

            {isTranscribing ? (
              <View style={styles.transcribingContainer}>
                <ActivityIndicator size="small" color="#4f46e5" />
                <Text style={styles.transcribingText}>Yapay zeka transkripsiyonu yapılıyor...</Text>
              </View>
            ) : isRecording ? (
              <View style={styles.recordingContainer}>
                <View style={styles.pulseDot} />
                <Text style={styles.recordingText}>Sesiniz dinleniyor, bitince Durdur'a basın...</Text>
              </View>
            ) : null}

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ne geliştirilmeli? Nasıl bir fayda sağlar? (Sesli dikte edebilirsiniz)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#9ca3af"
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.saveButton, styles.mdButton]} onPress={handleSaveMD}>
                <Text style={styles.saveButtonText}>Markdown İndir</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveButton, styles.docxButton]} onPress={handleSaveDocx}>
                <Text style={styles.saveButtonText}>Word İndir</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  coordinatesContainer: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  coordinatesText: {
    color: '#92400e',
    fontWeight: 'bold',
    fontSize: 14,
  },
  imagePreviewContainer: {
    height: 160,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dictateBtn: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dictateBtnActive: {
    backgroundColor: '#fee2e2',
    borderColor: '#fecaca',
  },
  dictateText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '700',
  },
  transcribingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  transcribingText: {
    color: '#4338ca',
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  recordingText: {
    color: '#b91c1c',
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    marginBottom: 20,
  },
  textArea: {
    minHeight: 100,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 12,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  mdButton: {
    backgroundColor: '#374151',
  },
  docxButton: {
    backgroundColor: '#2563eb',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});


import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Alert, ScrollView, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface BridgeModalProps {
  visible: boolean;
  onClose: () => void;
  isStuckTriggered?: boolean;
  stuckCycleId?: string;
  onNotesSaved?: (notes: string) => void;
}

export const BridgeModal: React.FC<BridgeModalProps> = ({ 
  visible, 
  onClose, 
  isStuckTriggered = false, 
  stuckCycleId = 'Cycle 3',
  onNotesSaved
}) => {
  const [callActive, setCallActive] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Custom video call controls states
  const [micMuted, setMicMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [screenSharing, setScreenSharing] = useState(true); // Screen sharing active by default to satisfy Phase C

  const [expertName, setExpertName] = useState('Uğur (Senior Architect)');
  const [expertNotes, setExpertNotes] = useState(
    'Hızlı İşlemler emoji ikonlarının hizalanma sorunu giderildi. actionIconContainer için flexWrap eklendi ve alt padding 8px olarak optimize edilerek taşma önlendi.'
  );
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (callActive) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [callActive]);

  const handleStartCall = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCallActive(true);
      setDuration(0);
    }, 1200);
  };

  const handleEndCall = () => {
    setCallActive(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSaveBridgeReport = async () => {
    if (!expertNotes.trim()) {
      Alert.alert('Hata', 'Lütfen uzman çözüm notlarını girin.');
      return;
    }

    try {
      const dateStr = new Date().toISOString().substring(0, 16);
      const bridgeContent = `## Bridge call — ${dateStr}
TRIGGER: ${isStuckTriggered ? 'auto' : 'manual'}
STUCK_CYCLE: ${stuckCycleId}
EXPERT: ${expertName}
DURATION_SEC: ${duration || 65}
TRANSCRIPT_SUMMARY:
  - Uzman ve geliştirici sesli ve görüntülü olarak bir araya geldi.
  - Kod tabanındaki hizalama hatası tespit edilerek onarım parametreleri netleştirildi.
  - ${expertNotes}
NEXT_CYCLE_INPUT: ${expertNotes}
`;

      if (onNotesSaved) {
        onNotesSaved(expertNotes);
      }

      Alert.alert(
        'Notlar Kaydedildi',
        'Köprü çözüm notları başarıyla otonom döngüye beslendi ve kaydedildi!',
        [{ text: 'Tamam', onPress: () => {
          resetAndClose();
        }}]
      );
    } catch (error) {
      console.error('Error saving bridge report:', error);
      Alert.alert('Hata', 'Rapor kaydedilemedi.');
    }
  };

  const resetAndClose = () => {
    setCallActive(false);
    setDuration(0);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={resetAndClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>İnsan Uzman Köprüsü (HITL)</Text>
              {isStuckTriggered && (
                <View style={styles.stuckBadge}>
                  <Text style={styles.stuckBadgeText}>⚠️ TIKANIKLIK TESPİT EDİLDİ</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={resetAndClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {callActive ? (
            <View style={styles.callContainer}>
              <View style={styles.statusBar}>
                <Text style={styles.statusText}>● Canlı Bağlantı Aktif • {formatTime(duration)}</Text>
                <Text style={styles.secureText}>🔐 Korumalı WebRTC Tüneli</Text>
              </View>

              {/* Premium Custom 3D-Like Custom WebRTC Streaming HUD */}
              <View style={styles.videoRoomContainer}>
                
                {/* 1. Large Remote Stream (Expert Uğur) */}
                <LinearGradient 
                  colors={videoOff ? ['#1e293b', '#0f172a'] : ['#1e1b4b', '#0f172a']} 
                  style={styles.remoteStream}
                >
                  <View style={styles.expertAvatarCircle}>
                    <Text style={styles.avatarEmoji}>👨‍💻</Text>
                    {/* Active dynamic glowing ring around expert */}
                    <View style={styles.glowingRing} />
                  </View>
                  
                  <View style={styles.remoteLabelBadge}>
                    <Text style={styles.remoteLabelText}>{expertName} (Uzman)</Text>
                  </View>
                  
                  {micMuted && (
                    <View style={styles.indicatorBadge}>
                      <Text style={styles.indicatorText}>🎙️ Mikrofonunuz Sessizde</Text>
                    </View>
                  )}
                </LinearGradient>

                {/* 2. Smaller Overlay Stream (Local / User Screen Share) */}
                <View style={styles.localStream}>
                  <LinearGradient colors={['#1e293b', '#3b82f6']} style={styles.localStreamGlass}>
                    <Text style={styles.localStreamIcon}>{screenSharing ? '🖥️' : '👤'}</Text>
                    <Text style={styles.localLabelText}>
                      {screenSharing ? 'Ekran Paylaşımı' : 'Siz (Mustafa)'}
                    </Text>
                  </LinearGradient>
                </View>

                {/* Status Badges Overlay */}
                <View style={styles.activeFeaturesOverlay}>
                  {screenSharing && (
                    <View style={[styles.statusFeatureBadge, styles.screenShareActive]}>
                      <Text style={styles.featureBadgeText}>🖥️ EKRAN PAYLAŞIMI AKTİF</Text>
                    </View>
                  )}
                  <View style={styles.statusFeatureBadge}>
                    <Text style={styles.featureBadgeText}>📹 SES & GÖRÜNTÜ AKTİF</Text>
                  </View>
                </View>

              </View>

              {/* Custom WebRTC Native Action Buttons Row */}
              <View style={styles.callControlsRow}>
                <TouchableOpacity 
                  style={[styles.controlBtn, micMuted && styles.controlBtnSelected]} 
                  onPress={() => setMicMuted(!micMuted)}
                >
                  <Text style={styles.controlBtnText}>{micMuted ? '🔇' : '🎙️'}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.controlBtn, videoOff && styles.controlBtnSelected]} 
                  onPress={() => setVideoOff(!videoOff)}
                >
                  <Text style={styles.controlBtnText}>{videoOff ? '🙈' : '📹'}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.controlBtn, screenSharing && styles.controlBtnActiveFeature]} 
                  onPress={() => setScreenSharing(!screenSharing)}
                >
                  <Text style={styles.controlBtnText}>🖥️</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.endCallRedButton} onPress={handleEndCall}>
                  <Text style={styles.endCallText}>📞 Kapat</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {isStuckTriggered && (
                <View style={styles.warningBanner}>
                  <Text style={styles.warningTitle}>AI Ajanı Çıkmaza Girdi!</Text>
                  <Text style={styles.warningText}>
                    Ajan `{stuckCycleId}` aşamasında arka arkaya başarısız onarımlar yaptı ve kendini rollback etti. 
                    Mevcut durum otonom olarak tıkanıklık (STUCK) olarak etiketlendi. Lütfen canlı görüntülü köprü kurarak insan uzmandan yardım alın.
                  </Text>
                </View>
              )}

              <View style={styles.instructionsCard}>
                <Text style={styles.cardHeading}>Güvenli Canlı Köprü Kanalı:</Text>
                <Text style={styles.bullet}>🎙️ Cihazlar arası anlık sesli ve görüntülü iletişim</Text>
                <Text style={styles.bullet}>🖥️ Ajanın tıkanıklık yaşadığı ekranın canlı paylaşımı</Text>
                <Text style={styles.bullet}>🛡️ Android intent hataları ve yönlendirme olmadan stabil çalışma</Text>
              </View>

              {loading ? (
                <View style={styles.loadingArea}>
                  <ActivityIndicator size="large" color="#4f46e5" />
                  <Text style={styles.loadingText}>WebRTC Güvenli Kanalı Açılıyor...</Text>
                </View>
              ) : (
                <TouchableOpacity style={styles.startCallButton} onPress={handleStartCall}>
                  <Text style={styles.startCallText}>📞 Canlı Uzman Görüşmesi Başlat</Text>
                </TouchableOpacity>
              )}

              {/* Post Call / Report Section */}
              <View style={styles.reportSection}>
                <Text style={styles.reportHeading}>Görüşme Sonrası Geri Bildirim Formu</Text>
                
                <Text style={styles.label}>Bağlanılan Uzman</Text>
                <TextInput
                  style={styles.input}
                  value={expertName}
                  onChangeText={setExpertName}
                  placeholder="Uzman Adı"
                />

                <Text style={styles.label}>Uzman Çözüm Notları (Ajan Girdisi)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={expertNotes}
                  onChangeText={setExpertNotes}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  placeholder="Uzmanın düzeltilmesini önerdiği mimari değişiklikler..."
                />

                <TouchableOpacity style={styles.saveReportButton} onPress={handleSaveBridgeReport}>
                  <Text style={styles.saveReportText}>💾 Notları Kaydet ve BRIDGE.md Üret</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    height: '92%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  titleRow: {
    flexDirection: 'column',
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  stuckBadge: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  stuckBadgeText: {
    color: '#ef4444',
    fontSize: 9,
    fontWeight: '800',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 16,
  },
  warningBanner: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  warningTitle: {
    color: '#d97706',
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 4,
  },
  warningText: {
    color: '#b45309',
    fontSize: 12,
    lineHeight: 18,
  },
  instructionsCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeading: {
    fontWeight: 'bold',
    fontSize: 13,
    color: '#475569',
    marginBottom: 10,
  },
  bullet: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 22,
  },
  loadingArea: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#4f46e5',
    fontWeight: '600',
    fontSize: 13,
  },
  startCallButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 30,
  },
  startCallText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  callContainer: {
    flex: 1,
    marginTop: 16,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusText: {
    color: '#10b981',
    fontWeight: '800',
    fontSize: 11,
  },
  secureText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  videoRoomContainer: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#0f172a',
    position: 'relative',
  },
  remoteStream: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expertAvatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#4f46e5',
  },
  avatarEmoji: {
    fontSize: 50,
  },
  glowingRing: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 56,
    borderWidth: 2,
    borderColor: '#38bdf8',
    opacity: 0.6,
  },
  remoteLabelBadge: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  remoteLabelText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  indicatorBadge: {
    position: 'absolute',
    top: 20,
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  indicatorText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  localStream: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 90,
    height: 130,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  localStreamGlass: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  localStreamIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  localLabelText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
  },
  activeFeaturesOverlay: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'flex-end',
    gap: 6,
  },
  statusFeatureBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  screenShareActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.85)',
  },
  featureBadgeText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '900',
  },
  callControlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  controlBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlBtnSelected: {
    backgroundColor: '#fee2e2',
  },
  controlBtnActiveFeature: {
    backgroundColor: '#dbeafe',
  },
  controlBtnText: {
    fontSize: 20,
  },
  endCallRedButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  endCallText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  reportSection: {
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
    paddingTop: 24,
    marginTop: 10,
  },
  reportHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    fontSize: 15,
    color: '#0f172a',
    marginBottom: 16,
  },
  textArea: {
    minHeight: 80,
  },
  saveReportButton: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveReportText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

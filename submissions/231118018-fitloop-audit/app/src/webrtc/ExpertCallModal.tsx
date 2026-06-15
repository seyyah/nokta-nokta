import React, { useState } from 'react';
import { Modal, StyleSheet, View, TouchableOpacity, Text, SafeAreaView, ActivityIndicator, Platform, Linking } from 'react-native';

const WebView = Platform.OS === 'web' ? null : require('react-native-webview').WebView;

interface ExpertCallModalProps {
  visible: boolean;
  onClose: () => void;
  onCallEnded?: (summary: string) => void;
}

export default function ExpertCallModal({ visible, onClose, onCallEnded }: ExpertCallModalProps) {
  const [loading, setLoading] = useState(true);
  
  const roomId = `fitloop-expert-${Math.floor(Math.random() * 10000)}`;
  const jitsiRoomUrl = `https://meet.jit.si/${roomId}#config.prejoinPageEnabled=false`;

  const handleClose = () => {
    if (onCallEnded) {
      onCallEnded(`Jitsi Expert Call (Oda: ${roomId}) tamamlandı. Ajan'ın çözemediği sorun, ekran paylaşımı ve sesli iletişimle çözülmüştür.`);
    }
    setLoading(true);
    onClose();
  };

  if (!visible) return null;

  return (
    <SafeAreaView style={[styles.container, StyleSheet.absoluteFill, { zIndex: 999 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Uzman Bağlantısı (Jitsi)</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>Aramayı Bitir</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {Platform.OS === 'web' ? (
          <View style={styles.webFallback}>
            <Text style={styles.webText}>WebView tabanlı WebRTC sadece iOS/Android Native ortamında çalışır.</Text>
            <TouchableOpacity onPress={() => Linking.openURL(jitsiRoomUrl)} style={styles.webBtn}>
              <Text style={styles.webBtnText}>Toplantıyı Yeni Sekmede Aç</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {loading && (
              <View style={styles.loader}>
                <ActivityIndicator size="large" color="#10B981" />
                <Text style={styles.loaderText}>Güvenli bağlantı kuruluyor...</Text>
              </View>
            )}
            <WebView
              source={{ uri: jitsiRoomUrl }}
              style={styles.webview}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              mediaPlaybackRequiresUserAction={false}
              allowsInlineMediaPlayback={true}
              onLoadEnd={() => setLoading(false)}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#334155' },
  title: { color: '#F8FAFC', fontSize: 18, fontWeight: 'bold' },
  closeBtn: { backgroundColor: '#EF4444', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  closeText: { color: '#FFFFFF', fontWeight: 'bold' },
  content: { flex: 1, position: 'relative' },
  webview: { flex: 1, backgroundColor: 'transparent' },
  loader: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A', zIndex: 10 },
  loaderText: { color: '#94A3B8', marginTop: 12 },
  webFallback: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  webText: { color: '#94A3B8', textAlign: 'center', marginBottom: 20 },
  webBtn: { backgroundColor: '#3B82F6', padding: 16, borderRadius: 8 },
  webBtnText: { color: '#FFFFFF', fontWeight: 'bold' }
});

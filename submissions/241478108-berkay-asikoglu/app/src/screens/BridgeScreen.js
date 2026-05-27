import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

const JITSI_ROOM = `nokta-bridge-${Date.now()}`;
const JITSI_URL = `https://meet.jit.si/${JITSI_ROOM}#config.startWithAudioMuted=false&config.startWithVideoMuted=false&config.prejoinPageEnabled=false&interfaceConfig.SHOW_JITSI_WATERMARK=false`;

export default function BridgeScreen({ navigation }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.titleBox}>
          <Text style={styles.title}>UZMAN BAĞLANTISI</Text>
          <Text style={styles.room}>Oda: {JITSI_ROOM}</Text>
        </View>
      </View>

      {!loaded && (
        <View style={styles.loader}>
          <ActivityIndicator color="#a855f7" size="large" />
          <Text style={styles.loaderText}>Jitsi Meet açılıyor...</Text>
        </View>
      )}

      <WebView
        source={{ uri: JITSI_URL }}
        style={styles.webview}
        onLoadEnd={() => setLoaded(true)}
        javaScriptEnabled
        domStorageEnabled
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        startInLoadingState
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#0a0a0c',
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  backBtn: {
    padding: 8,
  },
  titleBox: {
    marginLeft: 12,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  room: {
    color: '#a855f7',
    fontSize: 12,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  webview: {
    flex: 1,
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  loaderText: {
    color: 'rgba(255,255,255,0.5)',
    marginTop: 12,
    fontSize: 14,
  },
});

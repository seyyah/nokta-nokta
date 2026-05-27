import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function ExpertCallScreen() {
  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: 'https://meet.jit.si/NoktaExpertCall' }}
        style={styles.webview}
        javaScriptEnabled
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  webview: {
    flex: 1,
  },
});

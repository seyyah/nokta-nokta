import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Share,
} from 'react-native';
import { StackNavigationProp as NativeStackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { generateSpec } from '../services/gemini';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Spec'>;
  route: RouteProp<RootStackParamList, 'Spec'>;
};

export default function SpecOutputScreen({ navigation, route }: Props) {
  const { idea, qas } = route.params;
  const [spec, setSpec] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    loadSpec();
  }, []);

  async function loadSpec() {
    setLoading(true);
    setError('');
    setStatusMsg('');
    try {
      const result = await generateSpec(idea, qas, setStatusMsg);
      setSpec(result.trim());
    } catch (e: any) {
      setError(e.message ?? "Spec oluşturulamadı. API key'ini kontrol et.");
    } finally {
      setLoading(false);
      setStatusMsg('');
    }
  }

  async function handleShare() {
    try {
      await Share.share({ message: `NOKTA Spec\n\nFikir: ${idea}\n\n${spec}` });
    } catch (_) {}
  }

  function renderSpec(text: string) {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) {
        return (
          <Text key={i} style={styles.sectionHeader}>
            {line.replace('## ', '')}
          </Text>
        );
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <Text key={i} style={styles.bold}>
            {line.replace(/\*\*/g, '')}
          </Text>
        );
      }
      if (line.trim() === '') return <View key={i} style={{ height: 10 }} />;
      return (
        <Text key={i} style={styles.bodyText}>
          {line}
        </Text>
      );
    });
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Tek Sayfa Spec</Text>
            <Text style={styles.ideaLabel} numberOfLines={1}>{idea}</Text>
          </View>
          {!loading && !error && (
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Text style={styles.shareBtnText}>Paylaş</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#6c47ff" size="large" />
            <Text style={[styles.loadingText, statusMsg ? styles.loadingTextRetry : null]}>
              {statusMsg || 'Spec oluşturuluyor…'}
            </Text>
          </View>
        )}

        {error && (
          <View>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={loadSpec}>
              <Text style={styles.retryText}>Tekrar Dene</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.humanBtn}
              onPress={() => navigation.navigate('Experts', { spec: '' })}
            >
              <Text style={styles.humanBtnText}>👤 Uzman Desteği Al</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && spec && (
          <View style={styles.specBox}>{renderSpec(spec)}</View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {!loading && !error && spec && (
          <TouchableOpacity
            style={styles.expertBtn}
            onPress={() => navigation.navigate('Experts', { spec })}
          >
            <Text style={styles.expertBtnText}>👨‍💼 Uzman Desteği Al</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.startOverBtn}
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.startOverText}>· Yeni Fikir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  inner: { padding: 24, paddingBottom: 120 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: { color: '#fff', fontSize: 22, fontWeight: '800' },
  ideaLabel: { color: '#555', fontSize: 13, marginTop: 4, maxWidth: 220 },
  shareBtn: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  shareBtnText: { color: '#aaa', fontSize: 13 },
  loadingBox: { alignItems: 'center', paddingTop: 60, gap: 16 },
  loadingText: { color: '#555', fontSize: 14, textAlign: 'center', paddingHorizontal: 16 },
  loadingTextRetry: { color: '#f59e0b' },
  specBox: { backgroundColor: '#111', borderRadius: 12, padding: 18, borderWidth: 1, borderColor: '#1e1e1e' },
  sectionHeader: {
    color: '#6c47ff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 18,
    marginBottom: 6,
  },
  bold: { color: '#fff', fontWeight: '700', fontSize: 15 },
  bodyText: { color: '#ccc', fontSize: 15, lineHeight: 24 },
  errorText: { color: '#ff4444', fontSize: 14 },
  retryBtn: { marginTop: 12, padding: 10 },
  retryText: { color: '#6c47ff', fontSize: 14 },
  humanBtn: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  humanBtnText: { color: '#aaa', fontSize: 14 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    gap: 10,
    backgroundColor: '#0a0a0a',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  expertBtn: {
    backgroundColor: '#6c47ff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  expertBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  startOverBtn: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  startOverText: { color: '#6c47ff', fontSize: 16, fontWeight: '600' },
});

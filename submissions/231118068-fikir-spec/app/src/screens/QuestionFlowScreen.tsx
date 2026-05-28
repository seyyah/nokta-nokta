import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { StackNavigationProp as NativeStackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { askNextQuestion, QA } from '../services/gemini';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Questions'>;
  route: RouteProp<RootStackParamList, 'Questions'>;
};

const TOTAL_QUESTIONS = 5;

export default function QuestionFlowScreen({ navigation, route }: Props) {
  const { idea } = route.params;
  const [qas, setQas] = useState<QA[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const questionIndex = qas.length;

  useEffect(() => {
    loadQuestion();
  }, [qas.length]);

  async function loadQuestion() {
    setLoading(true);
    setError('');
    setStatusMsg('');
    try {
      const q = await askNextQuestion(idea, qas, questionIndex, setStatusMsg);
      setCurrentQuestion(q.trim());
    } catch (e: any) {
      setError(e.message ?? "Soru yüklenemedi. API key'ini kontrol et.");
    } finally {
      setLoading(false);
      setStatusMsg('');
    }
  }

  function handleNext() {
    if (!currentAnswer.trim()) return;
    const newQAs: QA[] = [...qas, { question: currentQuestion, answer: currentAnswer.trim() }];
    setQas(newQAs);
    setCurrentAnswer('');

    if (newQAs.length >= TOTAL_QUESTIONS) {
      navigation.navigate('Spec', { idea, qas: newQAs });
    }
  }

  const progress = questionIndex / TOTAL_QUESTIONS;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressLabel}>
          Soru {questionIndex + 1} / {TOTAL_QUESTIONS}
        </Text>

        <View style={styles.ideaPill}>
          <Text style={styles.ideaText} numberOfLines={2}>{idea}</Text>
        </View>

        <View style={styles.questionBox}>
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color="#6c47ff" size="large" />
              {statusMsg ? <Text style={styles.statusText}>{statusMsg}</Text> : null}
            </View>
          ) : error ? (
            <View>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={loadQuestion}>
                <Text style={styles.retryText}>Tekrar Dene</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.humanBtn}
                onPress={() => navigation.navigate('Experts', {})}
              >
                <Text style={styles.humanBtnText}>👤 Uzman Desteği Al</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.questionText}>{currentQuestion}</Text>
          )}
        </View>

        {!loading && !error && (
          <>
            <TextInput
              style={styles.answerInput}
              multiline
              numberOfLines={4}
              placeholder="Cevabın…"
              placeholderTextColor="#555"
              value={currentAnswer}
              onChangeText={setCurrentAnswer}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.nextBtn, !currentAnswer.trim() && styles.nextBtnDisabled]}
              onPress={handleNext}
              disabled={!currentAnswer.trim()}
            >
              <Text style={styles.nextBtnText}>
                {questionIndex + 1 < TOTAL_QUESTIONS ? 'Devam →' : 'Spec Oluştur ✦'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  inner: { flexGrow: 1, padding: 24 },
  progressTrack: { height: 3, backgroundColor: '#1e1e1e', borderRadius: 2, marginBottom: 8 },
  progressFill: { height: 3, backgroundColor: '#6c47ff', borderRadius: 2 },
  progressLabel: { color: '#555', fontSize: 12, marginBottom: 20, letterSpacing: 1 },
  ideaPill: {
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 12,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#222',
  },
  ideaText: { color: '#888', fontSize: 14, lineHeight: 20 },
  questionBox: { minHeight: 80, justifyContent: 'center', marginBottom: 24 },
  loadingBox: { alignItems: 'center', gap: 12 },
  statusText: { color: '#f59e0b', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  questionText: { color: '#fff', fontSize: 20, fontWeight: '600', lineHeight: 30 },
  answerInput: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 110,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginBottom: 20,
  },
  nextBtn: {
    backgroundColor: '#6c47ff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextBtnDisabled: { opacity: 0.35 },
  nextBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  errorText: { color: '#ff4444', fontSize: 14, lineHeight: 22 },
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
});

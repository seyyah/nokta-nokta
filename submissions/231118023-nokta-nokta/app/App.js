import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { Canvas, useThree } from '@react-three/fiber/native';

function CameraController({ mode }) {
  const { camera } = useThree();
  useEffect(() => {
    if (mode === 'face') {
      // Zoom close-up directly on the face
      camera.position.set(0, 0.35, 1.4);
      camera.lookAt(0, 0.35, 0);
    } else {
      // Full upper body view
      camera.position.set(0, -0.3, 3.8);
      camera.lookAt(0, -0.5, 0);
    }
    camera.updateProjectionMatrix();
  }, [mode, camera]);
  return null;
}

let ExpoSpeechRecognitionModule = null;
try {
  ExpoSpeechRecognitionModule = require('expo-speech-recognition').ExpoSpeechRecognitionModule;
} catch (e) {
  console.warn('expo-speech-recognition is not natively available in this environment:', e);
}
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { captureScreen, captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';

// Local Imports
import { Avatar3D } from './src/components/Avatar3D';
import { AuditWidget } from './src/nokta-audit';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [stories, setStories] = useState([]);
  const [currentStoryId, setCurrentStoryId] = useState(null);

  // Rename Story States
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [storyToRename, setStoryToRename] = useState(null);
  const [renameInput, setRenameInput] = useState('');

  // GLB Asset Loading & Camera States
  const [glbAssetUri, setGlbAssetUri] = useState(null);
  const [cameraMode, setCameraMode] = useState('face'); // 'face' | 'body'
  const [modelLoading, setModelLoading] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);

  // Chat & AI States
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Persona State
  const [persona, setPersona] = useState('senior-sen'); // 'junior-sen' | 'senior-sen'
  const [speechFeedback, setSpeechFeedback] = useState('');

  // Audio / Recording States
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [audioLevel, setAudioLevelState] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // WebView Jitsi call state
  const [expertCallActive, setExpertCallActive] = useState(false);
  const [jitsiRoomName, setJitsiRoomName] = useState('');

  // Refs for audio processing
  const recordingRef = useRef(null);
  const audioLevelRef = useRef(0);
  const meteringIntervalRef = useRef(null);
  const speechIntervalRef = useRef(null);

  const currentStory = stories.find(s => s.id === currentStoryId);

  const transcribeAudioFile = async (fileUri) => {
    if (!fileUri) return { success: false, error: 'Dosya yolu bulunamadı.' };
    if (!GROQ_API_KEY || !GROQ_API_KEY.startsWith('gsk_')) {
      return { 
        success: false, 
        error: 'Groq API anahtarı (EXPO_PUBLIC_GROQ_API_KEY) .env dosyasında bulunamadı veya geçersiz. Lütfen app/.env dosyanızı kontrol edip Metro\'yu "npx expo start -c" ile yeniden başlatın.' 
      };
    }

    try {
      const response = await FileSystem.uploadAsync(
        'https://api.groq.com/openai/v1/audio/transcriptions',
        fileUri,
        {
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: 'file',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
          },
          parameters: {
            model: 'whisper-large-v3',
            language: 'tr',
          },
        }
      );

      let data = {};
      try {
        data = JSON.parse(response.body);
      } catch (pe) {
        return { success: false, error: `Sunucu geçersiz yanıt verdi (HTTP ${response.status}): ${response.body}` };
      }

      if (response.status < 200 || response.status >= 300) {
        console.warn('Transcription API error:', data);
        const errMsg = data.error?.message || 'Bilinmeyen hata';
        if (data.error && (data.error.code === 'invalid_api_key' || errMsg.includes('API key'))) {
          return { success: false, error: 'Groq API anahtarınız geçersiz veya süresi dolmuş.', code: 'invalid_api_key' };
        }
        return { success: false, error: `API Hatası (HTTP ${response.status}): ${errMsg}` };
      }

      return { success: true, text: data.text || '' };
    } catch (error) {
      console.warn('Transcription request failed:', error);
      return { success: false, error: `Bağlantı Hatası: ${error.message}` };
    }
  };

  const resetToDefaultAvatar = async () => {
    setModelLoading(true);
    try {
      const asset = require('./assets/avatar.glb');
      const resolved = Asset.fromModule(asset);
      await resolved.downloadAsync();
      setGlbAssetUri(resolved.localUri);
    } catch (e) {
      console.warn('Custom avatar.glb load error, trying fallback:', e);
      try {
        const fallback = require('./assets/avatar_fallback.glb');
        const resolvedFallback = Asset.fromModule(fallback);
        await resolvedFallback.downloadAsync();
        setGlbAssetUri(resolvedFallback.localUri);
      } catch (err) {
        console.warn('Fallback GLB asset load error:', err);
      }
    } finally {
      setModelLoading(false);
    }
  };

  // Preload local GLB asset
  useEffect(() => {
    resetToDefaultAvatar();
  }, []);

  // Load / Save Stories
  useEffect(() => {
    const loadStories = async () => {
      try {
        const stored = await AsyncStorage.getItem('storyforge_stories');
        if (stored) {
          const parsed = JSON.parse(stored);
          setStories(parsed);
          if (parsed.length > 0) {
            setCurrentStoryId(parsed[0].id);
          }
        }
      } catch (e) {
        console.warn('Failed to load stories:', e);
      }
    };
    loadStories();
  }, []);

  const saveStoriesToStorage = async (newStories) => {
    try {
      await AsyncStorage.setItem('storyforge_stories', JSON.stringify(newStories));
    } catch (e) {
      console.warn('Failed to save stories:', e);
    }
  };

  const updateCurrentStory = (updater) => {
    setStories(prev => {
      const next = prev.map(s => s.id === currentStoryId ? { ...s, ...updater(s) } : s);
      saveStoriesToStorage(next);
      return next;
    });
  };

  // Create New Story
  const createNewStory = () => {
    const newId = Date.now();
    const newStory = {
      id: newId,
      title: 'İsimsiz Hikaye',
      currentStep: 0,
      spec: { idea: '', protagonist: '', antagonist: '', setting: '', twist: '', hoopAdvice: '', fullSpec: '' },
      messages: [{ role: 'ai', text: "Merhaba Yazar! Ben Nokta AI. Aklındaki ham hikaye veya senaryo fikrini kısaca benimle paylaşır mısın? Sana doğru soruları sorarak profesyonel bir Senaryo İskeleti çıkaracağım." }]
    };
    const next = [newStory, ...stories];
    setStories(next);
    setCurrentStoryId(newId);
    saveStoriesToStorage(next);
    setActiveTab('chat');
  };

  const selectStory = (id) => {
    setCurrentStoryId(id);
    setActiveTab('chat');
  };

  const deleteStory = (id) => {
    Alert.alert(
      'Hikayeyi Sil',
      'Bu hikayeyi silmek istediğinizden emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            const next = stories.filter(s => s.id !== id);
            setStories(next);
            saveStoriesToStorage(next);
            if (currentStoryId === id) {
              setCurrentStoryId(null);
              setActiveTab('home');
            }
          }
        }
      ]
    );
  };

  const startRenameStory = (story) => {
    setStoryToRename(story);
    setRenameInput(story.title);
    setShowRenameModal(true);
  };

  // Helper to check if native speech recognition is available (EAS build vs Expo Go)
  const isSpeechRecognitionAvailable = () => {
    try {
      return ExpoSpeechRecognitionModule && typeof ExpoSpeechRecognitionModule.start === 'function';
    } catch (e) {
      return false;
    }
  };

  // Safe Speech Recognition Listeners
  useEffect(() => {
    if (!isSpeechRecognitionAvailable()) return;

    const startSub = ExpoSpeechRecognitionModule.addListener('start', () => setIsListening(true));
    const endSub = ExpoSpeechRecognitionModule.addListener('end', () => setIsListening(false));
    const resultSub = ExpoSpeechRecognitionModule.addListener('result', (event) => {
      const transcript = event.results[0]?.transcript || '';
      setVoiceTranscript(transcript);
      setInputText(transcript);
    });
    const errorSub = ExpoSpeechRecognitionModule.addListener('error', (event) => {
      console.warn('STT Error in App:', event.message);
      setIsListening(false);
      stopVoiceCapture();
    });

    return () => {
      startSub.remove();
      endSub.remove();
      resultSub.remove();
      errorSub.remove();
    };
  }, []);

  // Start Mic & STT
  const startVoiceCapture = async () => {
    try {
      // Speech feedback stop
      Speech.stop();
      setIsSpeaking(false);
      if (speechIntervalRef.current) clearInterval(speechIntervalRef.current);

      const avPerm = await Audio.requestPermissionsAsync();
      if (!avPerm.granted) {
        Alert.alert('İzin Gerekli', 'Mikrofon iznini vermelisiniz.');
        return;
      }

      setIsListening(true);
      setVoiceTranscript('');

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync({
        isMeteringEnabled: true,
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          meteringEnabled: true,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.MEDIUM,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
          meteringEnabled: true,
        },
      });

      recordingRef.current = newRecording;
      await newRecording.startAsync();

      // Poll audio metering every 50ms for visualizer and lipsync
      meteringIntervalRef.current = setInterval(async () => {
        if (newRecording) {
          const status = await newRecording.getStatusAsync();
          if (status.canRecord && status.isRecording) {
            const db = status.metering ?? -160;
            // Map -60dB -> 0dB range to 0 -> 1 amplitude
            const normalized = Math.max(0, Math.min(1, (db + 60) / 60));
            audioLevelRef.current = normalized;
            setAudioLevelState(normalized);
          }
        }
      }, 50);

      // Start Expo Speech Recognition in parallel if available
      if (isSpeechRecognitionAvailable()) {
        const sttPerm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (sttPerm.granted) {
          ExpoSpeechRecognitionModule.start({
            lang: 'tr-TR',
            interimResults: true,
            continuous: true,
          });
        }
      } else {
        console.log("Expo Go fallback: Using real audio recording and Whisper API upon stopping");
      }

    } catch (error) {
      console.warn('Ses yakalama başlatılamadı:', error);
      stopVoiceCapture();
    }
  };

  const stopVoiceCapture = async (finalTranscript) => {
    const actualTranscript = typeof finalTranscript === 'string' ? finalTranscript : null;
    setIsListening(false);
    audioLevelRef.current = 0;
    setAudioLevelState(0);

    if (meteringIntervalRef.current) {
      clearInterval(meteringIntervalRef.current);
      meteringIntervalRef.current = null;
    }

    let fileUri = null;
    try {
      if (recordingRef.current) {
        fileUri = recordingRef.current.getURI();
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }
    } catch (e) {
      console.warn('Failed to stop recording:', e);
    }

    try {
      if (isSpeechRecognitionAvailable()) {
        ExpoSpeechRecognitionModule.stop();
      }
    } catch (e) {}

    let textToSend = actualTranscript || (typeof voiceTranscript === 'string' ? voiceTranscript : '');

    // Transcribe with Whisper if native Speech Recognition is not available
    if (!isSpeechRecognitionAvailable() && !actualTranscript && fileUri) {
      setIsTranscribing(true);
      const result = await transcribeAudioFile(fileUri);
      setIsTranscribing(false);

      if (!result.success) {
        Alert.alert(
          'Bağlantı/API Hatası',
          result.error
        );
        return;
      }

      if (result.text && result.text.trim()) {
        textToSend = result.text.trim();
        setVoiceTranscript(textToSend);
        setInputText(textToSend);
      } else {
        Alert.alert('Sessiz Kayıt', 'Mikrofondan konuşma sesi algılanamadı.');
        return;
      }
    }

    if (textToSend && textToSend.trim()) {
      handleSendVoice(textToSend.trim());
    }
  };

  const handleSendVoice = async (text) => {
    if (!text.trim() || !currentStory) return;
    if (!GROQ_API_KEY || !GROQ_API_KEY.startsWith('gsk_')) {
      Alert.alert('Eksik veya Geçersiz API Key', 'Lütfen app/.env dosyasına geçerli bir EXPO_PUBLIC_GROQ_API_KEY (gsk_ ile başlayan) ekleyin ve Metro\'yu yeniden başlatın.');
      return;
    }

    const userMessage = { role: 'user', text };
    updateCurrentStory(s => ({
      messages: [...s.messages, userMessage]
    }));

    setIsTyping(true);
    await processAiResponse(text, currentStory, true);
    setIsTyping(false);
  };

  // TTS Speech Synthesis with Lip Sync Simulation
  const speakPersonaFeedback = (text) => {
    Speech.stop();
    if (speechIntervalRef.current) clearInterval(speechIntervalRef.current);

    setIsSpeaking(true);
    setSpeechFeedback(text);

    const pitch = persona === 'junior-sen' ? 1.18 : 0.95;
    const rate = persona === 'junior-sen' ? 1.25 : 0.95;

    Speech.speak(text, {
      language: 'tr-TR',
      pitch,
      rate,
      onStart: () => {
        // Simulate lip sync mouth movement during TTS playback
        speechIntervalRef.current = setInterval(() => {
          const simulatedVol = 0.15 + Math.random() * 0.65;
          audioLevelRef.current = simulatedVol;
          setAudioLevelState(simulatedVol);
        }, 60);
      },
      onDone: () => {
        setIsSpeaking(false);
        audioLevelRef.current = 0;
        setAudioLevelState(0);
        if (speechIntervalRef.current) {
          clearInterval(speechIntervalRef.current);
          speechIntervalRef.current = null;
        }
      },
      onStopped: () => {
        setIsSpeaking(false);
        audioLevelRef.current = 0;
        setAudioLevelState(0);
        if (speechIntervalRef.current) {
          clearInterval(speechIntervalRef.current);
          speechIntervalRef.current = null;
        }
      },
      onError: (err) => {
        console.warn('TTS Error:', err);
        setIsSpeaking(false);
        audioLevelRef.current = 0;
        setAudioLevelState(0);
        if (speechIntervalRef.current) {
          clearInterval(speechIntervalRef.current);
          speechIntervalRef.current = null;
        }
      }
    });
  };

  // Get dynamic feedback from Persona
  const triggerPersonaFeedbackChange = (selectedPersona = persona) => {
    if (!currentStory) return;
    const specText = currentStory.spec.fullSpec || currentStory.spec.idea || 'boş';
    
    let feedback = '';
    if (selectedPersona === 'junior-sen') {
      feedback = "Eyvah! Bu senaryonun gidişatı beni cidden çok heyecanlandırıyor ama bir o kadar da panik yapıyorum! Bence kurgusal boşluklar kalmış olabilir, hemen kontrol etmeliyiz! Özellikle karakterlerin motivasyonları ve hikayenin geçtiği evren hakkında daha fazla detay verirsen, belki de bu boşlukları doldurabiliriz! Hadi birlikte çalışalım, ne dersin?";
    } else {
      feedback = "Hikaye dokümanını yapısal ve mimari açıdan inceledim. Karakter motivasyonları genel olarak tutarlı olmakla birlikte, dramatik dönüm noktası (twist) kısmı daha analitik bir derinlikle işlenmelidir.";
    }
    
    speakPersonaFeedback(feedback);
  };

  // Jitsi WebRTC room setup
  const startExpertCall = () => {
    const room = `nokta-expert-call-231118023-${Date.now().toString().slice(-4)}`;
    setJitsiRoomName(room);
    setExpertCallActive(true);
  };

  // Groq API calls
  const askGroq = async (prompt) => {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'Sen yaratıcı bir senaryo danışmanısın. Cevapların kısa, hedefe yönelik ve Türkçe olmalı. Sadece sorulan soruyu cevapla, ekstra giriş veya sonuç cümleleri kurma.'
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
        })
      });
      const data = await response.json();
      if (!response.ok) {
        console.error('API Error Response:', data);
        return `API Hatası: ${data.error?.message || 'Bilinmeyen hata'}`;
      }
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Network or Parse Error:', error);
      return `Bağlantı Hatası: ${error.message}`;
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !currentStory) return;
    if (!GROQ_API_KEY || !GROQ_API_KEY.startsWith('gsk_')) {
      Alert.alert('Eksik veya Geçersiz API Key', 'Lütfen app/.env dosyasına geçerli bir EXPO_PUBLIC_GROQ_API_KEY (gsk_ ile başlayan) ekleyin ve Metro\'yu yeniden başlatın.');
      return;
    }

    const userMessage = { role: 'user', text: inputText };
    const currentInput = inputText;

    updateCurrentStory(s => ({
      messages: [...s.messages, userMessage]
    }));

    setInputText('');
    setIsTyping(true);

    await processAiResponse(currentInput, currentStory);
    setIsTyping(false);
  };

  const processAiResponse = async (text, storyBeforeUpdate, isVoice = false) => {
    let nextSpec = { ...storyBeforeUpdate.spec };
    let aiResponse = "";
    let nextStep = storyBeforeUpdate.currentStep;
    let nextTitle = storyBeforeUpdate.title;

    // Speak AI feedback automatically if in voice mode or assistant tab
    const shouldSpeak = isVoice || activeTab === 'avatar';

    if (nextStep === 0) {
      nextSpec.idea = text;
      nextTitle = text.split(' ').slice(0, 3).join(' ') + '...';
      const prompt = `Kullanıcının hikaye fikri: "${text}". Bu fikre dayanarak, ana karakterin (Protagonist) bu olaydaki içsel motivasyonunu sorgulayan yaratıcı, tek cümlelik bir soru sor.`;
      aiResponse = await askGroq(prompt);
      nextStep = 1;
    } else if (nextStep === 1) {
      nextSpec.protagonist = text;
      const prompt = `Fikir: "${nextSpec.idea}". Ana karakter motivasyonu: "${text}". Şimdi bu hikayedeki kötü adamı (Antagonist) veya ana karakterin karşısındaki en büyük engeli sorgulayan tek cümlelik yaratıcı bir soru sor.`;
      aiResponse = await askGroq(prompt);
      nextStep = 2;
    } else if (nextStep === 2) {
      nextSpec.antagonist = text;
      const prompt = `Fikir: "${nextSpec.idea}". Kötü Adam/Engel: "${text}". Şimdi hikayenin geçtiği evreni, mekanı veya atmosferi (Setting) sorgulayan tek cümlelik yaratıcı bir soru sor.`;
      aiResponse = await askGroq(prompt);
      nextStep = 3;
    } else if (nextStep === 3) {
      nextSpec.setting = text;
      const prompt = `Fikir: "${nextSpec.idea}". Atmosfer: "${text}". Son olarak, hikayenin sonunda okuyucuyu/izleyiciyi şaşırtacak bir ters köşe (Twist) veya dramatik bir dönüş için tek cümlelik bir soru sor.`;
      aiResponse = await askGroq(prompt);
      nextStep = 4;
    } else if (nextStep === 4) {
      nextSpec.twist = text;
      aiResponse = "Harika! Verdiğin tüm detayları harmanlıyorum ve Senaryo İskeleti (Story Spec) dokümanını oluşturuyorum. Lütfen biraz bekle...";

      updateCurrentStory(s => ({
        spec: nextSpec,
        currentStep: 5,
        messages: [...s.messages, { role: 'ai', text: aiResponse }]
      }));
      if (shouldSpeak) speakPersonaFeedback(aiResponse);

      const specPrompt = `Sen profesyonel bir senaryo yazarısın. Aşağıdaki dağınık notları alıp profesyonel bir "Story Spec" (Hikaye Dokümanı) oluştur.
      Notlar:
      - Ana Fikir: ${nextSpec.idea}
      - Ana Karakter: ${nextSpec.protagonist}
      - Çatışma/Engel: ${nextSpec.antagonist}
      - Evren/Mekan: ${nextSpec.setting}
      - Ters Köşe: ${nextSpec.twist}
      Lütfen bu bilgileri akıcı, heyecan verici bir dille, alt başlıklar kullanarak özetle.`;

      const generatedSpec = await askGroq(specPrompt);
      nextSpec.fullSpec = generatedSpec;

      const finalMsg = "Mükemmel! Senin için profesyonel bir Senaryo İskeleti oluşturdum. Doküman (Spec) sekmesine geçerek okuyabilirsin.\n\nEğer asistanından canlı sesli yorum duymak istersen, yukarıdaki 'Asistan' sekmesine geçip istediğin Persona ile konuşabilirsin!";

      updateCurrentStory(s => ({
        spec: nextSpec,
        messages: [...s.messages, { role: 'ai', text: finalMsg }]
      }));
      if (shouldSpeak) speakPersonaFeedback(finalMsg);
      return;
    } else if (nextStep >= 5) {
      aiResponse = "Harika fikir! İsteğin doğrultusunda senaryo kurgusunu güncelliyorum...";

      updateCurrentStory(s => ({
        messages: [...s.messages, { role: 'ai', text: aiResponse }]
      }));
      if (shouldSpeak) speakPersonaFeedback(aiResponse);

      const updatePrompt = `Aşağıda daha önce oluşturulan senaryo dokümanı bulunuyor:
      "${nextSpec.fullSpec}"
      
      Yazar (kullanıcı) senden şu değişikliği yapmanı istiyor: "${text}"
      
      Lütfen yazarın isteğini dikkate alarak dokümanın GÜNCELLENMİŞ halini yaz. Başka hiçbir şey söyleme, sadece güncel doküman metnini ver.`;

      const updatedSpecText = await askGroq(updatePrompt);
      nextSpec.fullSpec = updatedSpecText;

      const finalMsg = "Kurguyu başarıyla güncelledim! 'Doküman' sekmesinden yeni haline göz atabilirsin.";
      updateCurrentStory(s => ({
        spec: nextSpec,
        messages: [...s.messages, { role: 'ai', text: finalMsg }]
      }));
      if (shouldSpeak) speakPersonaFeedback(finalMsg);
      return;
    }

    updateCurrentStory(s => ({
      title: nextTitle,
      spec: nextSpec,
      currentStep: nextStep,
      messages: [...s.messages, { role: 'ai', text: aiResponse }]
    }));
    if (shouldSpeak) speakPersonaFeedback(aiResponse);
  };

  // Audit Widget setup deps
  const auditStorage = {
    loadNotes: async () => {
      const data = await AsyncStorage.getItem('audit_logs');
      return data ? JSON.parse(data) : [];
    },
    saveNotes: async (notes) => {
      await AsyncStorage.setItem('audit_logs', JSON.stringify(notes));
    }
  };

  const auditDeps = {
    captureScreen: async () => {
      const uri = await captureScreen({ format: 'png', quality: 0.8 });
      return uri;
    },
    captureRef: async (ref) => {
      const uri = await captureRef(ref, { format: 'png', quality: 0.8 });
      return uri;
    },
    writeFile: async (filename, content) => {
      const uri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(uri, content, { encoding: FileSystem.EncodingType.UTF8 });
      return uri;
    },
    writeFileBinary: async (filename, base64) => {
      const uri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
      return uri;
    },
    shareFile: async (uri) => {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
    },
    storage: auditStorage,
    currentScreen: activeTab,
    reporterId: '231118023-Buse',
    BugIcon: <Text style={{ fontSize: 24 }}>🪲</Text>,
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'home' && styles.activeTab]} onPress={() => setActiveTab('home')}>
          <Text style={[styles.tabText, activeTab === 'home' && styles.activeTabText]}>Hikayelerim</Text>
        </TouchableOpacity>
        {currentStory && (
          <>
            <TouchableOpacity style={[styles.tab, activeTab === 'chat' && styles.activeTab]} onPress={() => setActiveTab('chat')}>
              <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>Sohbet</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, activeTab === 'spec' && styles.activeTab]} onPress={() => setActiveTab('spec')}>
              <Text style={[styles.tabText, activeTab === 'spec' && styles.activeTabText]}>Doküman</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, activeTab === 'avatar' && styles.activeTab]} onPress={() => setActiveTab('avatar')}>
              <Text style={[styles.tabText, activeTab === 'avatar' && styles.activeTabText]}>Asistan (3D)</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* HOME TAB */}
      {activeTab === 'home' && (
        <ScrollView style={styles.content} contentContainerStyle={{ padding: 20 }}>
          <TouchableOpacity style={styles.newStoryButton} onPress={createNewStory}>
            <Text style={styles.newStoryButtonText}>+ Yeni Hikaye Fikri Oluştur</Text>
          </TouchableOpacity>

          <Text style={styles.listTitle}>Mevcut Hikayeleriniz</Text>
          {stories.length === 0 ? (
            <Text style={styles.emptyText}>Henüz bir hikaye oluşturmadınız.</Text>
          ) : (
            stories.map(s => (
              <View key={s.id} style={styles.storyCardContainer}>
                <TouchableOpacity style={styles.storyCard} onPress={() => selectStory(s.id)}>
                  <Text style={styles.storyCardTitle}>{s.title}</Text>
                  <Text style={styles.storyCardSub}>İlerleme Durumu: %{Math.min(100, s.currentStep * 20)}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.editTitleButton} onPress={() => startRenameStory(s)}>
                  <Text style={styles.editTitleButtonText}>Düzenle</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => deleteStory(s.id)}>
                  <Text style={styles.deleteButtonText}>Sil</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* CHAT TAB */}
      {activeTab === 'chat' && currentStory && (
        <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatHeaderTitle}>{currentStory.title}</Text>
            <TouchableOpacity style={{ padding: 8 }} onPress={() => startRenameStory(currentStory)}>
              <Text style={{ fontSize: 16 }}>✏️</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.chatArea} contentContainerStyle={{ padding: 15 }}>
            {currentStory.messages.map((msg, index) => (
              <View key={index} style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                <Text style={[styles.messageText, msg.role === 'user' ? styles.userText : styles.aiText]}>{msg.text}</Text>
              </View>
            ))}
            {isTyping && (
              <View style={[styles.messageBubble, styles.aiBubble]}>
                <ActivityIndicator size="small" color="#3b82f6" />
              </View>
            )}
          </ScrollView>

          <View style={styles.inputArea}>
            <TextInput
              style={styles.input}
              placeholder="Mesajınızı yazın..."
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            {isTranscribing ? (
              <View style={[styles.composerMicButton, { backgroundColor: '#475569' }]}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            ) : inputText.length === 0 ? (
              <TouchableOpacity
                style={[styles.composerMicButton, isListening && styles.composerMicButtonActive]}
                onPress={isListening ? stopVoiceCapture : startVoiceCapture}
              >
                <Text style={styles.sendButtonText}>{isListening ? '🛑' : '🎙️'}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={isTyping}>
                <Text style={styles.sendButtonText}>Gönder</Text>
              </TouchableOpacity>
            )}
          </View>
          {isListening && (
            <View style={styles.listeningOverlay}>
              <Text style={styles.listeningText}>Dinleniyor...</Text>
              <Text style={styles.listeningSubtext}>{voiceTranscript}</Text>
            </View>
          )}
        </KeyboardAvoidingView>
      )}

      {/* SPEC TAB */}
      {activeTab === 'spec' && currentStory && (
        <ScrollView style={styles.content} contentContainerStyle={{ padding: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={[styles.specTitle, { marginBottom: 0, flex: 1 }]}>{currentStory.title}</Text>
            <TouchableOpacity style={{ padding: 8 }} onPress={() => startRenameStory(currentStory)}>
              <Text style={{ fontSize: 18 }}>✏️</Text>
            </TouchableOpacity>
          </View>

          {currentStory.spec.fullSpec ? (
            <View style={styles.specSection}>
              <Text style={styles.sectionContent}>{currentStory.spec.fullSpec}</Text>
            </View>
          ) : (
            <View style={styles.specSection}>
              <Text style={styles.sectionContent}>Sohbetteki 4 soruyu cevapladığınızda, profesyonel dokümanınız yapay zeka tarafından bu alanda oluşturulacaktır...</Text>
            </View>
          )}

          <TouchableOpacity style={styles.expertBtn} onPress={startExpertCall}>
            <Text style={styles.expertBtnText}>Uzmana Bağlan</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* AVATAR / ASISTAN TAB */}
      {activeTab === 'avatar' && currentStory && (
        <View style={styles.content}>
          {/* Story Selector at Top */}
          <View style={styles.storySelectorContainer}>
            <Text style={styles.storySelectorLabel}>Aktif Hikaye:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storyChipsScroll}>
              {stories.map(s => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.storyChip, s.id === currentStoryId && styles.storyChipActive]}
                  onPress={() => {
                    setCurrentStoryId(s.id);
                    Speech.stop();
                    setIsSpeaking(false);
                    setSpeechFeedback('');
                  }}
                >
                  <Text style={[styles.storyChipText, s.id === currentStoryId && styles.storyChipTextActive]}>
                    {s.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Persona Switcher at Top */}
          <View style={styles.personaContainer}>
            <TouchableOpacity
              style={[styles.personaBtn, persona === 'junior-sen' && styles.personaBtnActiveJunior]}
              onPress={() => {
                setPersona('junior-sen');
                triggerPersonaFeedbackChange('junior-sen');
              }}
            >
              <Text style={[styles.personaBtnText, persona === 'junior-sen' && styles.personaBtnTextActive]}>
                Junior Buse
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.personaBtn, persona === 'senior-sen' && styles.personaBtnActiveSenior]}
              onPress={() => {
                setPersona('senior-sen');
                triggerPersonaFeedbackChange('senior-sen');
              }}
            >
              <Text style={[styles.personaBtnText, persona === 'senior-sen' && styles.personaBtnTextActive]}>
                Senior Buse
              </Text>
            </TouchableOpacity>
          </View>

          {/* 3D Canvas */}
          <View style={styles.avatarCanvasContainer}>
            {glbAssetUri && !modelLoading ? (
              <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={1.5} />
                <directionalLight position={[5, 5, 5]} intensity={1.5} />
                <CameraController mode={cameraMode} />
                <Avatar3D
                  modelUri={glbAssetUri}
                  audioLevelRef={audioLevelRef}
                  persona={persona}
                  isListening={isListening || isSpeaking}
                />
              </Canvas>
            ) : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={{ color: '#cbd5e1', marginTop: 10 }}>
                  {modelLoading ? 'Yeni Model Yükleniyor...' : '3D Model Hazırlanıyor...'}
                </Text>
              </View>
            )}

            {/* Floating Camera Mode Toggle (Yüz / Boydan) */}
            <TouchableOpacity
              style={styles.floatingCameraBtn}
              onPress={() => setCameraMode(prev => prev === 'face' ? 'body' : 'face')}
            >
              <Text style={{ fontSize: 18 }}>{cameraMode === 'face' ? '👤' : '🔍'}</Text>
              <Text style={styles.floatingBtnLabel}>{cameraMode === 'face' ? 'Tam' : 'Yüz'}</Text>
            </TouchableOpacity>

            {/* Floating Avatar Changer Menu Toggle */}
            <TouchableOpacity
              style={styles.floatingModelBtn}
              onPress={() => setShowModelMenu(prev => !prev)}
            >
              <Text style={{ fontSize: 18 }}>🔄</Text>
              <Text style={styles.floatingBtnLabel}>Model</Text>
            </TouchableOpacity>

            {/* Model Selection Dropdown Menu */}
            {showModelMenu && (
              <View style={styles.modelDropdown}>
                <Text style={styles.dropdownTitle}>Avatar Seçimi</Text>
                
                <TouchableOpacity 
                  style={styles.dropdownItem} 
                  onPress={async () => {
                    setShowModelMenu(false);
                    await resetToDefaultAvatar();
                  }}
                >
                  <Text style={styles.dropdownItemText}> Avatar 1 </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.dropdownItem, { borderBottomWidth: 0 }]} 
                  onPress={async () => {
                    setShowModelMenu(false);
                    setModelLoading(true);
                    try {
                      const fallback = require('./assets/avatar_fallback.glb');
                      const resolvedFallback = Asset.fromModule(fallback);
                      await resolvedFallback.downloadAsync();
                      setGlbAssetUri(resolvedFallback.localUri);
                    } catch (err) {
                      console.warn('Yedek model yukleme hatasi:', err);
                    } finally {
                      setModelLoading(false);
                    }
                  }}
                >
                  <Text style={styles.dropdownItemText}> Avatar 2</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* OpenAI style glowing Voice Visualizer */}
          <View style={styles.visualizerContainer}>
            <View style={styles.visualizerWaveRow}>
              {[0, 1, 2, 3, 4].map((idx) => {
                // Height based on audioLevel + index offset
                const amplitude = audioLevel;
                const waveHeight = 6 + amplitude * (idx === 2 ? 80 : idx === 1 || idx === 3 ? 55 : 35);
                const barColor = persona === 'junior-sen' ? '#f97316' : '#a855f7';
                return (
                  <View
                    key={idx}
                    style={[
                      styles.visualizerBar,
                      {
                        height: waveHeight,
                        backgroundColor: barColor,
                        shadowColor: barColor,
                        shadowOpacity: amplitude > 0.1 ? 0.6 : 0,
                      }
                    ]}
                  />
                );
              })}
            </View>
            <Text style={styles.visualizerStatusText}>
              {isListening ? 'Sizi Dinliyorum...' : isTranscribing ? 'Sesiniz Çözümleniyor...' : isSpeaking ? `${persona === 'junior-sen' ? 'Junior' : 'Senior'} Buse Konuşuyor...` : 'Konuşmak İçin Dokunun'}
            </Text>

            {/* Mic Toggle Button */}
            <TouchableOpacity
              style={[
                styles.voiceMicBtn,
                isListening ? styles.voiceMicBtnActive : isTranscribing ? { backgroundColor: '#475569' } : (persona === 'junior-sen' ? styles.voiceMicBtnJunior : styles.voiceMicBtnSenior)
              ]}
              onPress={isListening ? stopVoiceCapture : startVoiceCapture}
              disabled={isTranscribing}
            >
              {isTranscribing ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                <Text style={styles.voiceMicBtnText}>{isListening ? '🛑' : '🎙️'}</Text>
              )}
            </TouchableOpacity>

            {/* Read Feedback Button */}
            {!isListening && (
              <TouchableOpacity
                style={styles.feedbackReadBtn}
                onPress={() => triggerPersonaFeedbackChange()}
              >
                <Text style={styles.feedbackReadBtnText}>Persona Yorumunu Dinle</Text>
              </TouchableOpacity>
            )}

            {/* Dynamic spoken text bubble showing both voice dictation and AI feedback */}
            {(isListening || isTranscribing || voiceTranscript.length > 0 || speechFeedback.length > 0) && (
              <View style={styles.speechBubble}>
                {isListening && (
                  <View>
                    <Text style={[styles.speechBubbleLabel, { color: '#ef4444' }]}>🎙️ Dinleniyor...</Text>
                    <Text style={[styles.speechBubbleText, { fontStyle: 'italic', color: '#94a3b8' }]}>
                      {voiceTranscript || 'Konuşun, sesiniz kaydediliyor...'}
                    </Text>
                  </View>
                )}
                {isTranscribing && (
                  <View>
                    <Text style={[styles.speechBubbleLabel, { color: '#f59e0b' }]}>🎙️ Çözümleniyor...</Text>
                    <Text style={[styles.speechBubbleText, { fontStyle: 'italic', color: '#94a3b8' }]}>
                      Ses kaydı analiz ediliyor...
                    </Text>
                  </View>
                )}
                {!isListening && !isTranscribing && voiceTranscript.length > 0 && (
                  <View style={{ marginBottom: speechFeedback.length > 0 ? 10 : 0 }}>
                    <Text style={[styles.speechBubbleLabel, { color: '#10b981' }]}>🎙️ Mikrofondan Duyulan:</Text>
                    <Text style={styles.speechBubbleText}>{voiceTranscript}</Text>
                  </View>
                )}
                {!isListening && !isTranscribing && speechFeedback.length > 0 && (
                  <View style={{ borderTopWidth: voiceTranscript.length > 0 ? 1 : 0, borderTopColor: '#334155', paddingTop: voiceTranscript.length > 0 ? 10 : 0 }}>
                    <Text style={styles.speechBubbleLabel}>🤖 Asistan Yorumu ({persona === 'junior-sen' ? 'Junior Buse' : 'Senior Buse'}):</Text>
                    <Text style={styles.speechBubbleText}>{speechFeedback}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      )}

      {/* JITSI WEBRTC MODAL */}
      <Modal visible={expertCallActive} animationType="slide" presentationStyle="fullScreen">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#111' }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Uzman Bağlantısı (WebRTC)</Text>
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setExpertCallActive(false)}>
              <Text style={styles.closeModalBtnText}>Kapat</Text>
            </TouchableOpacity>
          </View>
          <WebView
            source={{ uri: `https://meet.jit.si/${jitsiRoomName}#config.deeplinking.disabled=true` }}
            style={{ flex: 1 }}
            originWhitelist={['*']}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true}
            onShouldStartLoadWithRequest={(request) => {
              // Only allow http/https to prevent intent:// or other custom schemes from crashing the webview
              return request.url.startsWith('http://') || request.url.startsWith('https://');
            }}
          />
        </SafeAreaView>
      </Modal>

      {/* Rename Story Modal */}
      <Modal visible={showRenameModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.urlModalContainer}>
            <Text style={styles.urlModalTitle}>Hikayeyi Yeniden Adlandır</Text>
            <Text style={styles.urlModalSub}>Lütfen yeni bir başlık girin:</Text>
            
            <TextInput
              style={styles.urlInput}
              placeholder="Hikaye Başlığı"
              placeholderTextColor="#64748b"
              value={renameInput}
              onChangeText={setRenameInput}
              autoCapitalize="words"
            />

            <View style={styles.urlModalButtons}>
              <TouchableOpacity
                style={[styles.urlModalBtn, styles.urlCancelBtn]}
                onPress={() => {
                  setShowRenameModal(false);
                  setStoryToRename(null);
                  setRenameInput('');
                }}
              >
                <Text style={styles.urlCancelText}>İptal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.urlModalBtn, styles.urlLoadBtn]}
                onPress={() => {
                  if (renameInput.trim() && storyToRename) {
                    const newTitle = renameInput.trim();
                    setStories(prev => {
                      const next = prev.map(s => s.id === storyToRename.id ? { ...s, title: newTitle } : s);
                      saveStoriesToStorage(next);
                      return next;
                    });
                    setShowRenameModal(false);
                    setStoryToRename(null);
                    setRenameInput('');
                  }
                }}
              >
                <Text style={styles.urlLoadText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


      {/* Floating Audit Widget */}
      <AuditWidget deps={auditDeps} appName="StoryForge" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19' },
  tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#1e293b', paddingTop: Platform.OS === 'android' ? 40 : 0 },
  tab: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#6366f1' },
  tabText: { color: '#64748b', fontWeight: 'bold', fontSize: 13 },
  activeTabText: { color: '#6366f1' },
  content: { flex: 1 },
  newStoryButton: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  newStoryButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  listTitle: { color: '#f8fafc', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  emptyText: { color: '#64748b', fontStyle: 'italic', textAlign: 'center', marginTop: 20 },
  storyCardContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  storyCard: { flex: 1, backgroundColor: '#1e293b', padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#6366f1' },
  storyCardTitle: { color: '#f8fafc', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  storyCardSub: { color: '#94a3b8', fontSize: 12 },
  deleteButton: { backgroundColor: '#ef4444', padding: 16, borderRadius: 12, marginLeft: 8, justifyContent: 'center' },
  deleteButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  chatArea: { flex: 1 },
  messageBubble: { maxWidth: '80%', padding: 14, borderRadius: 16, marginBottom: 12 },
  aiBubble: { backgroundColor: '#1e293b', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: '#6366f1', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  messageText: { fontSize: 14, lineHeight: 20 },
  aiText: { color: '#f1f5f9' },
  userText: { color: '#fff' },
  inputArea: { flexDirection: 'row', padding: 12, backgroundColor: '#0f172a', borderTopWidth: 1, borderTopColor: '#1e293b', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#1e293b', color: '#fff', borderRadius: 24, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, minHeight: 40, maxHeight: 100, marginRight: 8, fontSize: 14 },
  sendButton: { backgroundColor: '#6366f1', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, justifyContent: 'center' },
  composerMicButton: { backgroundColor: '#334155', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  composerMicButtonActive: { backgroundColor: '#ef4444' },
  sendButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  listeningOverlay: { position: 'absolute', bottom: 70, left: 16, right: 16, backgroundColor: 'rgba(15, 23, 42, 0.9)', padding: 12, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#ef4444' },
  listeningText: { color: '#ef4444', fontSize: 12, fontWeight: 'bold', marginBottom: 2 },
  listeningSubtext: { color: '#fff', fontSize: 13 },
  specTitle: { color: '#f8fafc', fontSize: 20, fontWeight: 'bold' },
  specSection: { backgroundColor: '#1e293b', padding: 18, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  sectionContent: { color: '#cbd5e1', fontSize: 15, lineHeight: 24 },
  expertBtn: { backgroundColor: '#ef4444', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, shadowColor: '#ef4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  expertBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold', textAlign: 'center' },
  personaContainer: { flexDirection: 'row', padding: 12, justifyContent: 'center', gap: 12 },
  personaBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' },
  personaBtnActiveJunior: { backgroundColor: '#f97316', borderColor: '#f97316' },
  personaBtnActiveSenior: { backgroundColor: '#a855f7', borderColor: '#a855f7' },
  personaBtnText: { color: '#94a3b8', fontSize: 13, fontWeight: 'bold' },
  personaBtnTextActive: { color: '#fff' },
  avatarCanvasContainer: { flex: 1, minHeight: 350, backgroundColor: '#090d16' },
  visualizerContainer: { padding: 16, alignItems: 'center', backgroundColor: '#0f172a', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderTopColor: '#1e293b' },
  visualizerWaveRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 100, marginBottom: 12 },
  visualizerBar: { width: 6, borderRadius: 3, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } },
  visualizerStatusText: { color: '#94a3b8', fontSize: 12, fontWeight: '500', marginBottom: 12 },
  voiceMicBtn: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  voiceMicBtnActive: { backgroundColor: '#ef4444', shadowColor: '#ef4444' },
  voiceMicBtnJunior: { backgroundColor: '#f97316', shadowColor: '#f97316' },
  voiceMicBtnSenior: { backgroundColor: '#a855f7', shadowColor: '#a855f7' },
  voiceMicBtnText: { fontSize: 24 },
  feedbackReadBtn: { marginTop: 12, paddingVertical: 6, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#1e293b' },
  feedbackReadBtnText: { color: '#6366f1', fontSize: 13, fontWeight: 'bold' },
  speechBubble: { marginTop: 16, padding: 12, borderRadius: 12, backgroundColor: '#1e293b', width: '100%', borderWidth: 1, borderColor: '#334155' },
  speechBubbleLabel: { color: '#6366f1', fontSize: 11, fontWeight: 'bold', marginBottom: 4 },
  speechBubbleText: { color: '#cbd5e1', fontSize: 13, lineHeight: 18 },
  modalHeader: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#2d3748', backgroundColor: '#1a202c' },
  modalTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  closeModalBtn: { padding: 8 },
  closeModalBtnText: { color: '#ef4444', fontSize: 14, fontWeight: 'bold' },
  floatingCameraBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    minWidth: 50,
  },
  floatingModelBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    minWidth: 50,
  },
  floatingBtnLabel: {
    color: '#cbd5e1',
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 2,
  },
  modelDropdown: {
    position: 'absolute',
    top: 68,
    left: 16,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    width: 200,
    padding: 8,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  dropdownTitle: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    textTransform: 'uppercase',
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  dropdownItemText: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  urlModalContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  urlModalTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  urlModalSub: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  urlInput: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#f8fafc',
    fontSize: 14,
    marginBottom: 20,
  },
  urlModalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  urlModalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  urlCancelBtn: {
    backgroundColor: '#334155',
  },
  urlCancelText: {
    color: '#cbd5e1',
    fontWeight: '600',
    fontSize: 14,
  },
  urlLoadBtn: {
    backgroundColor: '#6366f1',
  },
  urlLoadText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  storySelectorContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  storySelectorLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  storyChipsScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  storyChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    marginRight: 8,
  },
  storyChipActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  storyChipText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: 'bold',
  },
  storyChipTextActive: {
    color: '#ffffff',
  },
  editTitleButton: {
    backgroundColor: '#334155',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editTitleButtonText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: 'bold',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    backgroundColor: '#0f172a',
  },
  chatHeaderTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

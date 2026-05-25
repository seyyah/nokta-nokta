import { useState, useEffect, useRef } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Text, View } from '@/components/Themed';
import { ChatBubble } from '@/components/ChatBubble';
import Colors from '@/constants/Colors';

type Message = {
  id: string;
  text: string;
  sender: 'ai' | 'user';
};

const API_URL = 'https://honest-squids-relax.loca.lt/api/idea'

export default function ChatScreen() {
  const { initialSpark } = useLocalSearchParams<{ initialSpark: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hitlError, setHitlError] = useState<string | null>(null);

  const [specData, setSpecData] = useState<{ problem: string, targetAudience: string, scope: string } | null>(null);
  const [showConfirmButton, setShowConfirmButton] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (initialSpark && messages.length === 0) {
      const initialMessages: Message[] = [
        { id: '1', text: initialSpark, sender: 'user' },
      ];
      setMessages(initialMessages);
      processIdea(initialSpark);
    }
  }, [initialSpark]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isProcessing, showConfirmButton]);

  const processIdea = async (ideaText: string) => {
    setIsProcessing(true);
    setHitlError(null);
    setShowConfirmButton(false);

    try {
      // API'yi simüle etmek için 1.5 saniye bekletiyoruz
      await new Promise(resolve => setTimeout(resolve, 1500));

      // SAHTE (MOCK) YANIT:
      // Dikkat: Asıl Forge testini yapabilmemiz için "Prob_Error" bug'ını burada bilerek yolluyoruz!
      const data = {
        spec: {
          problem: "Uygulama arayüzü çok karmaşık",
          targetAudience: "Genel Kullanıcılar",
          scope: "MVP"
        }
      };

      setIsProcessing(false);

      const Problem = data.spec.problem || 'Hata: Problem belirlenemedi'; // Fixed field mismatch
      const TargetAudience = data.spec.targetAudience || 'N/A';
      const Scope = data.spec.scope || 'N/A';

      setSpecData({
        problem: Problem,
        targetAudience: TargetAudience,
        scope: Scope
      });

      const aiMessageText = `Fikrini harika buldum, analizimi tamamladım! 🚀\n\n**📌 Temel Problem:** ${Problem}\n**👥 Hedef Kitle:** ${TargetAudience}\n**🎯 MVP Kapsamı:** ${Scope}\n\nBu detayları onaylıyor musun?`;

      const aiMsg: Message = {
        id: Date.now().toString(),
        text: aiMessageText,
        sender: 'ai'
      };

      setMessages(prev => [...prev, aiMsg]);
      setShowConfirmButton(true);

    } catch (error) {
      console.error('API Error:', error);
      setIsProcessing(false);
      setHitlError('Sunucuya bağlanırken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleConfirm = () => {
    if (!specData) return;
    
    router.replace({
      pathname: '/spec',
      params: {
        summary: initialSpark || '',
        problem: specData.problem,
        targetAudience: specData.targetAudience,
        scope: specData.scope
      }
    });
  };

  const handleGoBack = () => {
    router.replace('/');
  };

  return (
    <View style={styles.mainContainer}>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: '#ffffff' }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ChatBubble text={item.text} sender={item.sender} />
          )}
          contentContainerStyle={[
            styles.chatContent,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100, backgroundColor: '#ffffff' }
          ]}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <View style={{ paddingBottom: 40, backgroundColor: 'transparent' }}>
              {isProcessing && (
                <View style={[styles.typingContainer, { backgroundColor: '#f8fafc' }]}>
                  <ActivityIndicator size="small" color={Colors.light.primary} />
                  <Text style={styles.typingText}>Nokta Analiz Ediyor...</Text>
                </View>
              )}

              {hitlError && (
                <View style={styles.errorCard}>
                  <Ionicons name="warning" size={32} color="#ef4444" style={styles.errorIcon} />
                  <Text style={styles.errorText}>{hitlError}</Text>
                  <TouchableOpacity
                    style={styles.errorButton}
                    onPress={handleGoBack}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.errorButtonText}>Geri Dön</Text>
                  </TouchableOpacity>
                </View>
              )}

              {showConfirmButton && (
                <TouchableOpacity
                  style={styles.confirmButtonContainer}
                  onPress={handleConfirm}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[Colors.light.primary, Colors.light.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.confirmButton}
                  >
                    <Text style={styles.confirmButtonText}>✅ Onayla ve Belgeyi Oluştur</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 20,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#f8fafc',
    alignSelf: 'flex-start',
    paddingVertical: 12,
    borderRadius: 20,
    marginLeft: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  typingText: {
    marginLeft: 8,
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  errorCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 24,
    padding: 24,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
    alignItems: 'center',
  },
  errorIcon: {
    marginBottom: 12,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  errorButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  confirmButtonContainer: {
    marginTop: 20,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 6,
    paddingHorizontal: 4,
    backgroundColor: 'transparent',
  },
  confirmButton: {
    flexDirection: 'row',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});

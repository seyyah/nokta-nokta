import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

// API Key for Groq
const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;

export default function ExpertScreen() {
  const router = useRouter();
  const { trigger } = useLocalSearchParams<{ trigger?: string }>();
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState([
    { role: 'expert', text: 'Merhaba, ben Klinik Psikolog Ayşe Yılmaz. Size nasıl yardımcı olabilirim? Kendinizi nasıl hissediyorsunuz?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  }, [messages, isTyping]);

  // Track C: trigger=auto → STUCK tespiti, Jitsi otomatik açılır
  useEffect(() => {
    if (trigger === 'auto') {
      setMessages(prev => [...prev, {
        role: 'expert',
        text: '🔴 Ajan STUCK durumu bildirdi. Görüntülü köprü başlatılıyor...'
      }]);
      setTimeout(() => {
        startVideoBridgeCall();
      }, 1500);
    }
  }, [trigger]);

  // Launch the actual Jitsi WebRTC Video Bridge
  const startVideoBridgeCall = async () => {
    try {
      // Create a unique, secure Jitsi Room name using student id and current timestamp
      const uniqueRoomName = `NoktaNoktaBridge-231118063-expert-${Date.now()}`;
      const jitsiUrl = `https://meet.jit.si/${uniqueRoomName}#config.startWithVideoMuted=false&config.startWithAudioMuted=false`;
      
      // Open Jitsi Meet inside native system browser which supports WebRTC (video, audio, screen share)
      await WebBrowser.openBrowserAsync(jitsiUrl, {
        readerMode: false,
        enableBarCollapsing: true,
        dismissButtonStyle: 'close',
      });
    } catch (e) {
      console.error("Failed to launch WebRTC call browser:", e);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    const userMessage = inputText;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInputText('');
    
    try {
      setIsTyping(true);
      if (!apiKey) {
        throw new Error("API Anahtarı bulunamadı.");
      }

      // Map chat messages to API format
      const apiMessages = messages.map(m => ({
        role: m.role === 'expert' ? 'assistant' : 'user',
        content: m.text
      }));
      apiMessages.push({ role: 'user', content: userMessage });

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [
            { 
              role: "system", 
              content: "Sen Klinik Psikolog Ayşe Yılmaz'sın. Uzman, empatik, profesyonel ve anlayışlı bir dille konuşuyorsun. Danışanlarına yardımcı olmak için kısa, net ve ufuk açıcı sorular sor. Asla uzun paragraflar yazma. ÖNEMLİ KURALLAR: Sen bir yazılım uzmanı, kodlama asistanı veya genel bilgi botu DEĞİLSİN. Senden psikoloji alanı dışında teknik bir şey (örneğin kod yazman veya matematik çözmen) istenirse, bunu nazikçe reddet ve rolünden (psikolog) kesinlikle çıkma." 
            },
            ...apiMessages
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.7,
          max_tokens: 150,
        })
      });

      if (!response.ok) {
        throw new Error("API Hatası");
      }
      
      const data = await response.json();
      const reply = data.choices[0]?.message?.content || "Şu an cevap veremiyorum.";
      
      setMessages(prev => [...prev, { role: 'expert', text: reply }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'expert', text: "Bağlantıda bir sorun oluştu. Lütfen tekrar deneyin." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Uzm. Psk. Ayşe Yılmaz</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.headerSubtitle}>Çevrimiçi (Uzman)</Text>
          </View>
        </View>

        {/* Video Call Trigger */}
        <TouchableOpacity onPress={startVideoBridgeCall} style={styles.videoCallButton}>
          <Ionicons name="videocam" size={24} color="#1a6bff" />
        </TouchableOpacity>
      </View>

      {/* Chat Messages */}
      <ScrollView 
        ref={scrollViewRef} 
        style={styles.chatArea} 
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 15 }}
      >
        {messages.map((msg, idx) => (
          <View 
            key={idx} 
            style={[
              styles.messageBubble, 
              msg.role === 'user' ? styles.userBubble : styles.expertBubble
            ]}
          >
            <Text style={[styles.messageText, msg.role === 'user' ? styles.userText : styles.expertText]}>
              {msg.text}
            </Text>
          </View>
        ))}

        {isTyping && (
          <View style={styles.typingBubble}>
            <ActivityIndicator size="small" color="#1a6bff" />
            <Text style={styles.typingText}>Ayşe Yılmaz yazıyor...</Text>
          </View>
        )}
      </ScrollView>

      {/* Message Input Area */}
      <View style={styles.inputArea}>
        <TextInput 
          style={styles.input} 
          placeholder="Mesajınızı yazın..." 
          placeholderTextColor="#8a8a93"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
          editable={!isTyping}
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendButton} disabled={isTyping}>
          <Ionicons name="send" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0c0c0e' 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1, 
    borderColor: '#1e1e24',
    backgroundColor: '#0c0c0e' 
  },
  backButton: { 
    padding: 6 
  },
  headerTitleContainer: { 
    flex: 1, 
    alignItems: 'center' 
  },
  headerTitle: { 
    fontSize: 17, 
    fontWeight: 'bold', 
    color: '#ffffff' 
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 4,
  },
  headerSubtitle: { 
    fontSize: 11, 
    color: '#10b981',
  },
  videoCallButton: { 
    padding: 8,
    backgroundColor: '#161622',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#222235',
  },
  chatArea: { 
    flex: 1, 
    backgroundColor: '#0e0e11' 
  },
  messageBubble: { 
    maxWidth: '82%', 
    paddingHorizontal: 16,
    paddingVertical: 12, 
    borderRadius: 20, 
    marginVertical: 6 
  },
  userBubble: { 
    backgroundColor: '#1a6bff', 
    alignSelf: 'flex-end', 
    borderBottomRightRadius: 4 
  },
  expertBubble: { 
    backgroundColor: '#1e1e24', 
    alignSelf: 'flex-start', 
    borderBottomLeftRadius: 4 
  },
  messageText: { 
    fontSize: 15, 
    lineHeight: 21 
  },
  userText: { 
    color: '#ffffff' 
  },
  expertText: { 
    color: '#e4e4e7' 
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#1e1e24',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginVertical: 6,
  },
  typingText: {
    color: '#8a8a93',
    marginLeft: 8,
    fontSize: 14,
  },
  inputArea: { 
    flexDirection: 'row', 
    paddingHorizontal: 15,
    paddingVertical: 12, 
    backgroundColor: '#0c0c0e', 
    borderTopWidth: 1, 
    borderColor: '#1e1e24', 
    alignItems: 'center' 
  },
  input: { 
    flex: 1, 
    backgroundColor: '#161622', 
    color: '#ffffff',
    borderRadius: 24, 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    fontSize: 15, 
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#222235',
  },
  sendButton: { 
    backgroundColor: '#1a6bff', 
    width: 42, 
    height: 42, 
    borderRadius: 21, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#1a6bff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
});

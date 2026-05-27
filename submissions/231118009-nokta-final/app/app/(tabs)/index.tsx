import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Linking,
} from "react-native";

const API_KEY = "";

interface Scores {
  Feasibility: number;
  MarketNeed: number;
  Originality: number;
}

// YENI EKLENECEK FONKSIYONLAR:
const cleanJSON = (text: string) => {
  return text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
};

const callGemini = async (promptText: string) => {
  // Liste: En çok çalışandan en az çalışana doğru modeller
  const models = ["gemini-2.5-flash"];
  let lastError = "";

  for (const modelName of models) {
    try {
      // v1 sürümünü kullanarak daha stabil bir yol seçiyoruz
      const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${API_KEY}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
        }),
      });

      const data = await response.json();

      if (response.ok && data.candidates && data.candidates[0]) {
        console.log(`Başarılı! Kullanılan model: ${modelName}`);
        return data.candidates[0].content.parts[0].text;
      } else {
        lastError =
          data.error?.message || "Model bulunamadı veya desteklenmiyor.";
        console.warn(`${modelName} başarısız oldu, bir sonraki deneniyor...`);
      }
    } catch (err: any) {
      lastError = err.message;
    }
  }

  // Eğer hiçbir model çalışmazsa buraya düşer
  throw new Error(
    `Tüm modeller denendi ama sonuç alınamadı. Son hata: ${lastError}`,
  );
};

// Özel Animasyonlu Progress Bar Component'i
const ScoreBar = ({ label, score }: { label: string; score: number }) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: score,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [score, animatedWidth]);

  const getColor = (s: number) => {
    if (s < 40) return "#EF5350"; // Kırmızı (Düşük)
    if (s <= 70) return "#FFA726"; // Turuncu (Orta)
    return "#66BB6A"; // Yeşil (Yüksek)
  };

  return (
    <View style={styles.scoreBarContainer}>
      <View style={styles.scoreHeader}>
        <Text style={styles.scoreLabel}>{label}</Text>
        <Text style={styles.scoreValue}>%{score}</Text>
      </View>
      <View style={styles.barBackground}>
        <Animated.View
          style={[
            styles.barFill,
            {
              width: animatedWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
              backgroundColor: getColor(score),
            },
          ]}
        />
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const [step, setStep] = useState<number>(1);
  const [idea, setIdea] = useState<string>("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [spec, setSpec] = useState<string>("");
  const [scores, setScores] = useState<Scores | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const generateQuestions = async () => {
    if (!idea.trim()) return;
    setLoading(true);

    try {
      const prompt = `Fikir: ${idea}. Bu fikri olgunlaştırmak için hedef kitle, temel ihtiyaç ve teknik uygulanabilirlik üzerine 3 kısa ve kritik PM sorusu sor. SADECE JSON formatında bir array dön: ["soru1", "soru2", "soru3"].`;

      const rawText = await callGemini(prompt);
      const parsedQuestions = JSON.parse(cleanJSON(rawText));

      if (Array.isArray(parsedQuestions)) {
        setQuestions(parsedQuestions);
        setAnswers(new Array(parsedQuestions.length).fill(""));
        setStep(2);
      } else {
        throw new Error("API beklenen JSON Array formatında veri dönmedi.");
      }
    } catch (error: any) {
      console.error("Sorular oluşturulurken hata detayı:", error);
      alert("Hata: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateFinalSpec = async () => {
    setLoading(true);

    try {
      const qaPairs = questions
        .map((q, i) => `S: ${q}\nC: ${answers[i] || "Belirtilmedi"}`)
        .join("\n\n");

      const prompt = `Fikir: ${idea}.\n\nCevaplar:\n${qaPairs}\n\nBu verileri analiz et. SADECE şu JSON formatında cevap ver:
{
  "Scores": {
    "Feasibility": 85,
    "MarketNeed": 60,
    "Originality": 90
  },
  "Spec": "## 1. Proje Özeti\\n...\\n## 2. Çözülen Problem\\n...\\n## 3. Hedef Kullanıcılar\\n..."
}`;

      const rawText = await callGemini(prompt);
      const parsedData = JSON.parse(cleanJSON(rawText));

      if (parsedData && parsedData.Spec) {
        setSpec(parsedData.Spec);
        setScores(parsedData.Scores || null);
        setStep(3);
      } else {
        throw new Error("API içinden Spec verisi ayrıştırılamadı.");
      }
    } catch (error: any) {
      console.error("Spec oluşturulurken hata detayı:", error);
      alert("Spec hatası: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (text: string, index: number) => {
    const newAnswers = [...answers];
    newAnswers[index] = text;
    setAnswers(newAnswers);
  };

  const Header = ({ title }: { title: string }) => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>{title}</Text>
      <Text style={styles.poweredByText}>Nokta audit destekli fikir araci</Text>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Header title="Nokta Fikir" />
      <TextInput
        style={styles.mainTextArea}
        placeholder="Uygulama fikrinizi buraya yazın..."
        placeholderTextColor="#636E72"
        value={idea}
        onChangeText={setIdea}
        multiline
      />
      <TouchableOpacity
        style={[
          styles.button,
          (!idea.trim() || loading) && styles.buttonDisabled,
        ]}
        onPress={generateQuestions}
        disabled={!idea.trim() || loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Fikri Analiz Et</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <ScrollView
      style={styles.stepContainer}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Header title="Soruları Cevapla" />

      {questions.map((q, index) => (
        <View key={index} style={styles.questionCard}>
          <View style={styles.questionCardAccent} />
          <View style={styles.questionCardContent}>
            <Text style={styles.questionText}>{q}</Text>
            <TextInput
              style={styles.answerInput}
              placeholder="Cevabınızı buraya yazın..."
              placeholderTextColor="#636E72"
              value={answers[index]}
              onChangeText={(text) => handleAnswerChange(text, index)}
              multiline
            />
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={generateFinalSpec}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Spec Üret</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setStep(1)}
        disabled={loading}
      >
        <Text style={styles.backButtonText}>Fikri Düzenle</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView
      style={styles.stepContainer}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Header title="Nokta Fikir Raporu" />

      {scores && (
        <View style={styles.cardContainer}>
          <Text style={styles.cardTitle}>Fikir Olabilirlik Karnesi</Text>
          <ScoreBar
            label="Teknik Uygulanabilirlik"
            score={scores.Feasibility}
          />
          <ScoreBar label="Pazar İhtiyacı" score={scores.MarketNeed} />
          <ScoreBar label="Özgünlük" score={scores.Originality} />
        </View>
      )}

      <View style={styles.cardContainer}>
        <TextInput
          style={styles.specInput}
          multiline
          value={spec}
          onChangeText={setSpec}
          placeholder="AI çıktısı burada..."
          placeholderTextColor="#636E72"
        />
      </View>

      <TouchableOpacity
        style={styles.approveButton}
        onPress={() =>
          console.log("Metin insan tarafından incelendi ve onaylandı")
        }
      >
        <Text style={styles.buttonText}>İnsan Onayı Ver (Approve)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.emailButton}
        onPress={() =>
          Linking.openURL(`mailto:?body=${encodeURIComponent(spec)}`)
        }
      >
        <Text style={styles.buttonText}>Gerçek Uzmana İlet</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setIdea("");
          setQuestions([]);
          setAnswers([]);
          setSpec("");
          setScores(null);
          setStep(1);
        }}
      >
        <Text style={styles.buttonText}>Yeni Fikir Başlat</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F7F6", // Nötr açık gri
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  stepContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 50,
  },
  headerContainer: {
    marginBottom: 32,
    marginTop: 12,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "700",
    color: "#1A2B4C", // Koyu Kobalt Mavisi (Okunabilirlik için çok karanlık bir mavi seçildi, ikincil vurgu için kullanılabilir)
    marginBottom: 4,
  },
  poweredByText: {
    fontSize: 13,
    fontWeight: "400",
    color: "#636E72",
  },

  // Adım 1
  mainTextArea: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    minHeight: 180,
    textAlignVertical: "top",
    fontSize: 16,
    fontWeight: "400",
    marginBottom: 24,
    color: "#2D3436", // Koyu antrasit
    borderWidth: 1,
    borderColor: "transparent",
    elevation: 4,
    shadowColor: "#1A2B4C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },

  // Butonlar
  button: {
    backgroundColor: "#CA8A04",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    elevation: 3,
    shadowColor: "#CA8A04",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
  },
  buttonDisabled: {
    backgroundColor: "#FDE68A",
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  backButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "transparent",
  },
  backButtonText: {
    color: "#636E72",
    fontSize: 16,
    fontWeight: "700",
  },

  // Adım 2 - Soru Kartları
  questionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#1A2B4C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    flexDirection: "row",
    overflow: "hidden",
  },
  questionCardAccent: {
    width: 6,
    backgroundColor: "#2563EB",
  },
  questionCardContent: {
    flex: 1,
    padding: 20,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2D3436",
    marginBottom: 16,
    lineHeight: 24,
  },
  answerInput: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 10,
    minHeight: 110,
    textAlignVertical: "top",
    fontSize: 15,
    fontWeight: "400",
    color: "#2D3436",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },

  // Adım 3 - Kart Containarları (Aynı mantık: %100 beyaz ve gölgeli)
  cardContainer: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 3,
    shadowColor: "#1A2B4C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A2B4C",
    marginBottom: 20,
  },

  // ScoreBoard Bar Stilleri
  scoreBarContainer: {
    marginBottom: 18,
  },
  scoreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2D3436",
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A2B4C",
  },
  barBackground: {
    height: 8, // Biraz daha zarif ince
    backgroundColor: "#F1F3F5",
    borderRadius: 6,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 6,
  },

  specInput: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 10,
    minHeight: 250,
    textAlignVertical: "top",
    fontSize: 15,
    fontWeight: "400",
    color: "#2D3436",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  approveButton: {
    backgroundColor: "#4CAF50",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    elevation: 3,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  emailButton: {
    backgroundColor: "#03A9F4",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    elevation: 3,
    shadowColor: "#03A9F4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
});

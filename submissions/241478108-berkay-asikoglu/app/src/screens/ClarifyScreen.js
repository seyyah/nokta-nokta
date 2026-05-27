import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const MOCK_QUESTIONS = [
  {
    title: "1/3: Hedef Kitle (Kullanıcı)",
    desc: "Bunu doğrudan son kullanıcıya (B2C) mi açıyorsun, yoksa sadece kurumsal firmalara (B2B) mi pazarlayacaksın?",
    opt1: { label: "Kurumsal (B2B)", emoji: "🏢" },
    opt2: { label: "Bireysel (B2C)", emoji: "🧑‍🤝‍🧑" }
  },
  {
    title: "2/3: Ana Problem",
    desc: "Sektördeki en büyük tıkanıklık bilgi dağınıklığı ve zaman kaybı mı, yoksa güvensizlik mi?",
    opt1: { label: "Zaman/Hız", emoji: "⏱️" },
    opt2: { label: "Güvenlik", emoji: "🤝" }
  },
  {
    title: "3/3: İlk Faz (MVP) Kapsamı",
    desc: "İlk etapta sistemi Mobil Uygulama olarak mı, yoksa Web Panel otomasyonu olarak mı çıkarıyoruz?",
    opt1: { label: "Mobil App", emoji: "📱" },
    opt2: { label: "Web Panel", emoji: "💻" }
  }
];

export default function ClarifyScreen({ route, navigation }) {
  const { ideaDump } = route.params;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);

  const handleSelection = (answer) => {
    const newAnswers = [...answers, answer];
    if (index < MOCK_QUESTIONS.length - 1) {
      setAnswers(newAnswers);
      setIndex(index + 1);
    } else {
      navigation.replace('IdeaResult', { ideaDump, clarifyAnswer: newAnswers.join(' | ') });
    }
  };

  const currentQ = MOCK_QUESTIONS[index];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(15,23,42,0.95)', 'rgba(0,0,0,0.98)']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.content}>
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>AI Soru Soruyor</Text>
        </View>

        <Text style={styles.questionText}>{currentQ.title}</Text>
        <Text style={styles.subQuestionText}>
          {currentQ.desc}
        </Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity onPress={() => handleSelection(currentQ.opt1.label)} activeOpacity={0.8} style={styles.optionWrapper}>
            <BlurView intensity={30} tint="light" style={styles.optionBox}>
              <Text style={styles.optionEmoji}>{currentQ.opt1.emoji}</Text>
              <Text style={styles.optionText}>{currentQ.opt1.label}</Text>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleSelection(currentQ.opt2.label)} activeOpacity={0.8} style={styles.optionWrapper}>
            <BlurView intensity={30} tint="light" style={styles.optionBox}>
              <Text style={styles.optionEmoji}>{currentQ.opt2.emoji}</Text>
              <Text style={styles.optionText}>{currentQ.opt2.label}</Text>
            </BlurView>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 32,
    alignItems: 'center',
  },
  aiBadge: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.4)',
    marginBottom: 40,
  },
  aiBadgeText: {
    color: '#d8b4fe',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  subQuestionText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 60,
  },
  highlight: {
    color: '#06b6d4',
    fontWeight: '600',
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 20,
    width: '100%',
    justifyContent: 'center',
  },
  optionWrapper: {
    flex: 1,
    maxWidth: 160,
    borderRadius: 24,
    overflow: 'hidden',
  },
  optionBox: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  optionEmoji: {
    fontSize: 40,
    marginBottom: 16,
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  }
});

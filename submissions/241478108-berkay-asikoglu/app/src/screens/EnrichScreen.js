import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, ScrollView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

export default function EnrichScreen({ route, navigation }) {
  const { idea } = route.params;
  const [targetUser, setTargetUser] = useState('');
  const [coreProblem, setCoreProblem] = useState('');
  const [refusal, setRefusal] = useState('');

  const handleGenerate = () => {
    navigation.navigate('IdeaResult', { idea, targetUser, coreProblem, refusal });
  };

  const isFormValid = targetUser.trim() && coreProblem.trim() && refusal.trim();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#020617', '#000000']}
        style={StyleSheet.absoluteFillObject}
      />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView 
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
              <Text style={styles.headerIdeaText} numberOfLines={1}>{`"${idea}"`}</Text>
            </View>

            <Text style={styles.title}>Detaylandır.</Text>
            <Text style={styles.subtitle}>Sadece 3 kısa soru.</Text>
            
            <BlurView intensity={20} tint="dark" style={styles.formCard}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Hedef kullanıcı kim?</Text>
                <TextInput
                  style={styles.input}
                  placeholder="örn: solo diş hekimleri"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={targetUser}
                  onChangeText={setTargetUser}
                  selectionColor="#3b82f6"
                  cursorColor="#3b82f6"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Hangi problemi çözüyor?</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="örn: randevu takibinde zaman kaybı"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={coreProblem}
                  onChangeText={setCoreProblem}
                  multiline
                  selectionColor="#3b82f6"
                  cursorColor="#3b82f6"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Bu ürün kesinlikle ne yapmaz?</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="örn: teşhis koymaz"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={refusal}
                  onChangeText={setRefusal}
                  multiline
                  selectionColor="#3b82f6"
                  cursorColor="#3b82f6"
                />
              </View>
            </BlurView>

            <TouchableOpacity 
              style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]} 
              onPress={handleGenerate}
              disabled={!isFormValid}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isFormValid ? ['#3b82f6', '#2563eb'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                style={styles.gradientButton}
              >
                <Text style={[styles.buttonText, !isFormValid && styles.buttonTextDisabled]}>
                  idea.md Üret
                </Text>
                {isFormValid && <Ionicons name="flash-outline" size={20} color="#fff" style={{marginLeft: 8}} />}
              </LinearGradient>
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerIdeaText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    flex: 1,
    fontStyle: 'italic',
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 32,
    marginTop: 8,
  },
  formCard: {
    borderRadius: 20,
    padding: 24,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    color: '#fff',
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 12,
  },
  textArea: {
    minHeight: 40,
  },
  submitButton: {
    marginTop: 40,
    borderRadius: 16,
    shadowColor: '#3b82f6',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  submitButtonDisabled: {
    shadowOpacity: 0,
  },
  gradientButton: {
    padding: 18,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonTextDisabled: {
    color: 'rgba(255,255,255,0.3)',
  }
});

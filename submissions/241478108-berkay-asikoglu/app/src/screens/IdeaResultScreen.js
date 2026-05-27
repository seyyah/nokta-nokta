import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

export default function IdeaResultScreen({ route, navigation }) {
  const { ideaDump, clarifyAnswer } = route.params;
  
  const tags = ideaDump.split(',').map(tag => tag.trim());
  const mainConcept = tags[0]?.toUpperCase() || 'MOCK';
  
  const markdownText = `
# PROJECT: ${mainConcept} SYNAPSE

## 1. THESIS (TEZ)
**Ağ Verisi:** [ ${ideaDump} ]
**Kullanıcı Hedefi:** ${clarifyAnswer || 'Belirtilmedi'}
Oluşturulan bu simantik ağ, geleneksel süreçleri otomatize ederek ve gereksiz aracıları ortadan kaldırarak sektörde ciddi bir zaman tasarrufu sağlamayı hedefliyor.

## 2. PROBLEM
Sektördeki oyuncular, dağınık bilgi ve entegre olmayan araçlar yüzünden günde saatlerini israf ediyor. Şu an kullanılan çözümler hantal, yüksek öğrenme eğrisine sahip ve mobil uyumlu değil.

## 3. HOW IT WORKS (NASIL ÇALIŞIR)
- **Zero-Friction Girdi:** Kullanıcı sadece temel amacı sisteme girer, geri kalan ilişki ağını sistem kendisi çözer (Nodes).
- **Agentic Orkestrasyon:** Ağda beliren düğümler, arka planda API ve mikro servislerle haberleşerek operasyonları otomatik yürütür.
- **Sade Arayüz:** Kullanıcıya hiçbir form doldurtulmaz; her şey etkileşimli bir "canvas" üzerinde gerçekleşir.

## 4. WHAT IT DOES NOT DO (NE YAPMAZ)
- Karmaşık, binlerce ayarın olduğu bir yönetici paneli (Admin Dashboard) sunmaz.
- Sosyal ağ özelliklerine sahip değildir; tamamen sonuca ve performansa odaklanmıştır.
- Her sektöre uymaya çalışmaz; belirli bir nişe dikey entegrasyon sağlar.
`;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#020617', '#0f172a']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>Nihai Döküm (idea.md)</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.markdownCard}>
          <Text style={styles.markdownText}>
             {markdownText.trim()}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.btn}
          activeOpacity={0.8}
          onPress={() => navigation.popToTop()}
        >
          <BlurView intensity={30} tint="light" style={styles.btnBlur}>
            <Ionicons name="sparkles" size={20} color="#06b6d4" style={{marginRight: 8}}/>
            <Text style={styles.btnText}>Yeni Ağ Yarat</Text>
          </BlurView>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '800'
  },
  scroll: {
    padding: 20,
  },
  markdownCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.3)',
    marginBottom: 30,
  },
  markdownText: {
    color: '#cbd5e1',
    lineHeight: 24,
    fontSize: 15,
  },
  btn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  btnBlur: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(6,182,212,0.1)'
  },
  btnText: {
    color: '#06b6d4',
    fontSize: 16,
    fontWeight: '700'
  }
});

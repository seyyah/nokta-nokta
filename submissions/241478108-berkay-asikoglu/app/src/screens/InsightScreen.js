import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

export default function InsightScreen({ route, navigation }) {
  const { ideaDump } = route.params;

  // ideaDump contains comma separated keywords generated in CaptureScreen
  const keywords = ideaDump.split(',').map(k => k.trim());
  const keywordCount = keywords.length;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e1b4b', '#000000']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>AĞ ÇÖZÜMLEMESİ</Text>
        </View>

        <Text style={styles.mainTitle}>Nokta AI bu kelime kümelerinden ne anladı?</Text>

        <View style={styles.insightBox}>
          <Text style={styles.insightLabel}>1. Semantic İlişki (Konseptler)</Text>
          <Text style={styles.insightText}>
            Nokta AI, girdiğin {keywordCount} düğüm (<Text style={styles.highlight}>{ideaDump}</Text>) arasında güçlü bir ürün-pazar ilişkisi sezdi. Bu dağınık fikirlerin hepsi {`"Eski usul işleyişi dijital hıza bağlama"`} vizyonu üzerine birleşiyor.
          </Text>

          <View style={styles.separator} />

          <Text style={styles.insightLabel}>2. Çıkan Ürün Varsayımı</Text>
          <Text style={styles.insightText}>
            Oluşan bu sinapslar, temelde sürtünmesiz bir otomasyon aracı ya da özel niş bir pazaryeri modeli hayal ettiğini gösteriyor. Sistem karmaşık paneller yerine, kullanıcının minimum zaman harcayacağı bir {`"tak-çalıştır"`} platformu iskeleti kurdu.
          </Text>

          <View style={styles.separator} />

          <Text style={styles.insightLabel}>3. Olası Tehlikeler (Riskler)</Text>
          <Text style={styles.insightText}>
            Bu konseptleri birleştirirken {`"kapsam kayması"`} riski algılandı. Yani projenin her şeyi yapmaya çalışıp kimseye yaranamama ihtimali yüksek.
          </Text>
        </View>

        <Text style={styles.footerText}>
          Ağı tam anlamıyla fikre dökmek için AI&apos;a sadece 1 küçük soru için daha izin var.
        </Text>

        <TouchableOpacity 
          style={styles.nextButton}
          activeOpacity={0.8}
          onPress={() => navigation.replace('Clarify', { ideaDump })}
        >
          <BlurView intensity={40} tint="light" style={styles.buttonBlur}>
             <Text style={styles.buttonText}>Devam Et</Text>
             <Ionicons name="arrow-forward" size={20} color="#fff" />
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
  content: {
    padding: 24,
    paddingTop: 80,
    paddingBottom: 60,
  },
  headerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    marginBottom: 24,
  },
  headerBadgeText: {
    color: '#06b6d4',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 40,
    marginBottom: 40,
  },
  insightBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 30,
  },
  insightLabel: {
    fontSize: 14,
    color: '#a855f7',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  insightText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 26,
  },
  highlight: {
    color: '#06b6d4',
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  nextButton: {
    borderRadius: 50,
    overflow: 'hidden',
  },
  buttonBlur: {
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(168,85,247,0.3)',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  }
});

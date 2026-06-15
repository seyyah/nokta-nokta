import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AuditDemoScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Audit Demo</Text>
      <Text style={styles.copy}>
        Bu ekran, nokta-audit akisini farkli bir route uzerinde denemek icin ayrildi.
      </Text>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Ornek kontrol alani</Text>
        <Text style={styles.panelCopy}>
          Sol audit dugmesine bas, bu bolgedeki bir parcayi sec ve notunu yaz.
        </Text>
        <TouchableOpacity style={styles.cta}>
          <Text style={styles.ctaText}>Sevilmeyen Buton</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 72,
    backgroundColor: '#f8fafc',
  },
  title: {
    color: '#0f172a',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 10,
  },
  copy: {
    color: '#475569',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 28,
  },
  panel: {
    padding: 20,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  panelTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
  },
  panelCopy: {
    color: '#64748b',
    marginTop: 8,
    lineHeight: 21,
  },
  cta: {
    alignSelf: 'flex-start',
    minHeight: 40,
    marginTop: 20,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
  },
  ctaText: {
    color: '#ffffff',
    fontWeight: '800',
  },
});

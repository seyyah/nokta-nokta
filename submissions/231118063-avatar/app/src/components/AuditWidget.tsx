import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { documentDirectory, writeAsStringAsync, EncodingType } from 'expo-file-system/legacy';

export function AuditWidget() {
  const [report, setReport] = useState('');

  const saveReport = async () => {
    if (report.trim().length === 0) {
      Alert.alert('Hata', 'Rapor boş olamaz.');
      return;
    }

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `audit-${timestamp}.md`;
      const content = `# Audit Raporu\n\nTarih: ${new Date().toLocaleString()}\n\n## Sorun/Bulgu\n${report}\n`;

      if (Platform.OS === 'web') {
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        Alert.alert('Başarılı', `Rapor indirildi: ${filename}`);
        setReport('');
        console.log(`Audit Raporu İndirildi: ${filename}\nİçerik: ${content}`);
      } else {
        const path = `${documentDirectory || ''}${filename}`;
        await writeAsStringAsync(path, content, { encoding: EncodingType.UTF8 });
        
        Alert.alert('Başarılı', `Rapor kaydedildi: ${filename}\n\nLütfen bunu cihazdan alıp bilgisayarınıza ekleyin veya loglara bakın.`);
        setReport('');
        console.log(`Audit Raporu Kaydedildi: ${path}\nİçerik: ${content}`);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Hata', 'Rapor kaydedilirken bir sorun oluştu.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛠️ Audit Raporu Oluştur (Phase B)</Text>
      <Text style={styles.hint}>
        Sesli dikte kullanmak için klavyenizdeki 🎙️ mikrofon simgesine basın (Sistem STT).
      </Text>
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={4}
        placeholder="Gördüğünüz hatayı veya geliştirme önerisini açıklayın..."
        placeholderTextColor="#888"
        value={report}
        onChangeText={setReport}
      />
      <TouchableOpacity style={styles.button} onPress={saveReport}>
        <Text style={styles.buttonText}>Raporu Kaydet</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e1e1e',
    padding: 15,
    borderRadius: 15,
    margin: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  hint: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    borderRadius: 10,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun } from 'docx';
import * as base64js from 'base64-js';

export const exportProposalAsMarkdown = async (
  title: string, 
  description: string, 
  area: {x: number, y: number, w: number, h: number} | null,
  screenshotBase64: string | null
) => {
  try {
    const timestamp = new Date().toLocaleString('tr-TR');
    const areaText = area ? `\n**Seçilen Alan:** X: ${area.x}, Y: ${area.y} (Genişlik: ${area.w}, Yükseklik: ${area.h})\n` : '';
    
    // Markdown'da resim göstermek için base64 embed edilebilir
    const imageText = screenshotBase64 ? `\n## Ekran Görüntüsü\n![Ekran Görüntüsü](data:image/jpeg;base64,${screenshotBase64})\n` : '';

    const markdownContent = `# Geliştirme Önerisi\n\n**Başlık:** ${title}\n**Tarih:** ${timestamp}${areaText}\n\n## Açıklama\n${description}\n${imageText}`;
    
    // Geçici dizine dosya yolu oluştur
    const fileUri = `${FileSystem.cacheDirectory}oneriler.md`;
    
    await FileSystem.writeAsStringAsync(fileUri, markdownContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    // Dosyayı paylaş
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/markdown',
        dialogTitle: 'Öneriyi Paylaş',
        UTI: 'net.daringfireball.markdown'
      });
    } else {
      Alert.alert('Uyarı', 'Cihazınızda paylaşım özelliği desteklenmiyor.');
    }
  } catch (error) {
    console.error('Export Error:', error);
    Alert.alert('Hata', 'İndirme/Paylaşma işlemi başarısız oldu.');
  }
};

export const exportProposalAsDocx = async (
  title: string, 
  description: string, 
  area: {x: number, y: number, w: number, h: number} | null,
  screenshotBase64: string | null
) => {
  try {
    const timestamp = new Date().toLocaleString('tr-TR');
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "Geliştirme Önerisi",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Başlık: ", bold: true }),
              new TextRun(title),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Tarih: ", bold: true }),
              new TextRun(timestamp),
            ],
          }),
          ...(area ? [
            new Paragraph({
              children: [
                new TextRun({ text: "Seçilen Alan: ", bold: true }),
                new TextRun(`X: ${area.x}, Y: ${area.y} (Genişlik: ${area.w}, Yükseklik: ${area.h})`),
              ],
            })
          ] : []),
          new Paragraph({
            text: "Açıklama",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200 }
          }),
          new Paragraph({
            text: description,
          }),
          ...(screenshotBase64 ? [
            new Paragraph({
              text: "Ekran Görüntüsü",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200 }
            }),
            new Paragraph({
              children: [
                new ImageRun({
                  data: base64js.toByteArray(screenshotBase64.replace(/\s/g, '')),
                  transformation: {
                    width: 300,
                    height: 500,
                  },
                  type: 'jpg',
                }),
              ],
            })
          ] : []),
        ],
      }],
    });

    const base64Data = await Packer.toBase64String(doc);
    const fileUri = `${FileSystem.cacheDirectory}oneriler.docx`;
    
    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
      encoding: 'base64',
    });
    
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        dialogTitle: 'Öneriyi Word Olarak Paylaş',
        UTI: 'org.openxmlformats.wordprocessingml.document'
      });
    } else {
      Alert.alert('Uyarı', 'Cihazınızda paylaşım özelliği desteklenmiyor.');
    }
  } catch (error) {
    console.error('Docx Export Error:', error);
    Alert.alert('Hata', 'Word (Docx) İndirme/Paylaşma işlemi başarısız oldu.');
  }
};

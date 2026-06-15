const express = require('express');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json({ limit: '50mb' }));

// Gemini API Key from .env
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post('/repair', async (req, res) => {
    try {
        const { markdown } = req.body;
        if (!markdown) return res.status(400).json({ error: 'Markdown bulunamadı.' });

        console.log('🤖 Otonom Onarım İsteği Geldi! Raporu okuyorum...');

        const screenMatches = [...markdown.matchAll(/(?:\*\*Ekran:\*\*|## Ekran:)\s*(\w+)/gi)];
        let screenName = null;
        for (const match of screenMatches) {
            if (match[1] !== 'Unknown') {
                screenName = match[1].trim();
                break;
            }
        }

        if (!screenName) {
            console.log('❌ Geçerli bir ekran adı bulunamadı (Tümü Unknown). Lütfen yeni bir hata raporu çekin.');
            return res.status(400).json({ error: 'Geçerli bir ekran adı bulunamadı.' });
        }

        if (!screenName.endsWith('Screen')) screenName += 'Screen';
        
        // YENİ: Ajanın tüm yapıya hakim olması için kritik dosyaları okuyoruz
        const navPath = path.join(__dirname, 'app', 'src', 'navigation', 'index.tsx');
        const screensIndexPath = path.join(__dirname, 'app', 'src', 'screens', 'index.tsx');
        const targetPath = path.join(__dirname, 'app', 'src', 'screens', `${screenName}.tsx`);
        const bridgePath = path.join(__dirname, 'BRIDGE.md');
        
        const navCode = fs.existsSync(navPath) ? fs.readFileSync(navPath, 'utf-8') : '';
        const screensIndexCode = fs.existsSync(screensIndexPath) ? fs.readFileSync(screensIndexPath, 'utf-8') : '';
        const currentCode = fs.existsSync(targetPath) ? fs.readFileSync(targetPath, 'utf-8') : '// DOSYA HENÜZ YOK, YENİ OLUŞTURULABİLİR';
        const bridgeContext = fs.existsSync(bridgePath) ? fs.readFileSync(bridgePath, 'utf-8') : '';

        console.log(`✅ Mimari veriler toplandı. Ajan Gemini'a gönderiliyor...`);

        const prompt = `
Sen çok ileri düzey otonom bir React Native (Expo) uygulama mimarısın.
Kullanıcının sesli komutundan üretilmiş bir hata/istek raporu aşağıda yer alıyor. 
Görevini yerine getirirken UZMANLARIN GEÇMİŞ TAVSİYELERİNE KESİNLİKLE UYMALISIN (Aşağıda "UZMAN GÖRÜŞME KAYITLARI" kısmında yer almaktadır).
Gerekirse YENİ BİR EKRAN DOSYASI (örn. LoginScreen.tsx) oluşturmalı, mevcut ekranı güncellemeli ve yeni oluşturduğun ekranı navigasyon (index.tsx) dosyalarına uygun şekilde eklemelisin.

UZMAN GÖRÜŞME KAYITLARI (BRIDGE.md):
${bridgeContext}

Hata/İstek Raporu:
${markdown}

--- MEVCUT DOSYALAR ---
1) Hedef Ekran (${screenName}.tsx):
\`\`\`tsx
${currentCode}
\`\`\`

2) Navigasyon (app/src/navigation/index.tsx):
\`\`\`tsx
${navCode}
\`\`\`

3) Export Dosyası (app/src/screens/index.tsx):
\`\`\`tsx
${screensIndexCode}
\`\`\`

LÜTFEN SADECE GEÇERLİ BİR JSON YANITI DÖNDÜR. (Açıklama yapma, sadece JSON formatı). JSON şeması şöyle olmalı:
{
  "files": [
    {
      "path": "app/src/screens/OrnekScreen.tsx",
      "content": "tam dosya kodu buraya..."
    }
  ]
}

**KRİTİK GÜVENLİK KURALLARI (UYGULAMANIN ÇÖKMEMESİ İÇİN):**
1. ASLA projede var olup olmadığını bilmediğin yerel görselleri (örn: require('../../assets/images/X.jpg')) KULLANMA! Görsel gerekiyorsa harici URL (https://...) kullan veya sadece arka plan rengi (backgroundColor) ver.
2. ASLA projenin package.json dosyasında olmayan paketleri import etme. Sadece react, react-native, expo, lucide-react-native gibi temel paketleri kullan.
3. Kodları tamamen çalışır, kesintisiz tam dosya içeriği olarak ver. Yalnızca değişiklik yaptığın veya yeni oluşturduğun dosyaları JSON listesine ekle.
`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                systemInstruction: { parts: [{ text: "Sen otonom bir mimarsın. Sadece geçerli, saf JSON yanıtı üretirsin." }]},
                generationConfig: { 
                    temperature: 0.1,
                    responseMimeType: "application/json"
                }
            })
        });

        const data = await response.json();
        
        if (data.error) {
            console.error('Gemini Hatası:', data.error.message);
            return res.status(500).json({ error: 'Yapay zeka servisi hata döndürdü.' });
        }

        const jsonStr = data.candidates[0].content.parts[0].text;
        
        let parsed;
        try {
            parsed = JSON.parse(jsonStr);
        } catch(e) {
            console.error('JSON Parse Hatası:', e);
            return res.status(500).json({ error: 'Ajan düzgün bir JSON üretemedi.' });
        }

        if (parsed.files && Array.isArray(parsed.files)) {
            for (const file of parsed.files) {
                // Güvenlik: Path'i düzelt ve yaz
                const absolutePath = path.join(__dirname, ...file.path.split('/'));
                fs.writeFileSync(absolutePath, file.content, 'utf-8');
                console.log(`🛠️ Ajan dosyayı yazdı: ${file.path}`);
            }
        }

        console.log(`🎉 ONARIM TAMAMLANDI! Fast Refresh tetikleniyor...`);
        res.json({ success: true, message: 'Onarım tamamlandı.' });

    } catch (error) {
        console.error('Sunucu Hatası:', error);
        res.status(500).json({ error: error.message });
    }
});

// NEW ENDPOINT: Save report directly to the host computer's submissions directory!
app.post('/save-report', (req, res) => {
    try {
        const { filename, content } = req.body;
        if (!filename || !content) {
            return res.status(400).json({ error: 'Filename veya content eksik.' });
        }

        // Save report inside the submissions/231118058-nokta-nokta directory
        const filePath = path.join(__dirname, filename);
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`📝 Rapor başarıyla yazıldı: ${filePath}`);
        
        res.json({ success: true, path: filePath });
    } catch (error) {
        console.error('Rapor Yazma Hatası:', error);
        res.status(500).json({ error: error.message });
    }
});

// NEW ENDPOINT: Append report to FORGE.md
app.post('/append-forge', (req, res) => {
    try {
        const { content } = req.body;
        if (!content) return res.status(400).json({ error: 'Content eksik.' });

        const forgePath = path.join(__dirname, 'FORGE.md');
        fs.appendFileSync(forgePath, '\n\n' + content, 'utf-8');
        console.log(`📝 Rapor FORGE.md'ye eklendi.`);
        
        res.json({ success: true });
    } catch (error) {
        console.error('FORGE.md Yazma Hatası:', error);
        res.status(500).json({ error: error.message });
    }
});

// NEW ENDPOINT: Append transcript to BRIDGE.md
app.post('/append-bridge', (req, res) => {
    try {
        const { transcript } = req.body;
        if (!transcript) return res.status(400).json({ error: 'Transcript eksik.' });

        const bridgePath = path.join(__dirname, 'BRIDGE.md');
        const formatted = `\n## Otonom Görüşme Kaydı\n**TARİH:** ${new Date().toISOString()}\n**TRANSKRİPT:**\n${transcript}\n`;
        fs.appendFileSync(bridgePath, formatted, 'utf-8');
        console.log(`📝 Görüşme kaydı BRIDGE.md'ye eklendi.`);
        
        res.json({ success: true });
    } catch (error) {
        console.error('BRIDGE.md Yazma Hatası:', error);
        res.status(500).json({ error: error.message });
    }
});

// NEW ENDPOINT: Transcribe audio using Gemini 1.5 Flash
app.post('/transcribe', async (req, res) => {
    try {
        const { audioBase64, mimeType } = req.body;
        if (!audioBase64) return res.status(400).json({ error: 'Ses verisi bulunamadı.' });

        console.log('🎤 Ses dosyası alındı, çeviri yapılıyor...');

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "Sen bir STT (Speech-to-Text) asistanısın. Sadece duyduğun sesi metne çevir ve doğrudan metni ver. Hiçbir ek açıklama, yorum veya format kullanma." },
                        {
                            inlineData: {
                                mimeType: mimeType || 'audio/m4a',
                                data: audioBase64
                            }
                        }
                    ]
                }],
                generationConfig: { temperature: 0.1 }
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error('Gemini Hatası (STT):', data.error.message);
            return res.status(500).json({ error: data.error.message || 'Çeviri başarısız.' });
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        console.log('✅ Çeviri başarılı:', text);
        res.json({ success: true, text: text || '' });
    } catch (error) {
        console.error('STT Sunucu Hatası:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('🚀 Forge Local Server 3000 portunda çalışıyor...');
    console.log('Uygulama içindeki [🤖 Otonom Düzelt] ve Sesle Rapor özellikleri aktif.');
});

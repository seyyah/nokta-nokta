const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

const RETRY_DELAYS_MS = [2000, 4000, 8000]; // exponential backoff: 2s, 4s, 8s (max 3 retries)

export interface QA {
  question: string;
  answer: string;
}

const QUESTION_CATEGORIES = [
  'Problem (Sorun): Bu fikir hangi spesifik sorunu çözüyor?',
  'User (Kullanıcı): Birincil kullanıcı kim ve bağlamı nedir?',
  'Scope (Kapsam): Bu fikrin minimum geçerli versiyonu nedir?',
  'Constraint (Kısıt): En büyük teknik veya kaynak kısıtları nelerdir?',
  'Success Metric (Başarı Ölçütü): Fikrin başarısını nasıl ölçeceksin?',
];

async function callGemini(
  systemPrompt: string,
  userMessage: string,
  onStatus?: (msg: string) => void
): Promise<string> {
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: { maxOutputTokens: 512, temperature: 0.7 },
      }),
    });

    const shouldRetry =
      (response.status === 429 || response.status === 503) &&
      attempt < RETRY_DELAYS_MS.length;

    if (shouldRetry) {
      const waitMs = RETRY_DELAYS_MS[attempt];
      const label = response.status === 503 ? 'Sunucu yoğun' : 'Ücretsiz kota doldu';
      onStatus?.(`${label}. ${waitMs / 1000} sn sonra tekrar deneniyor… (${attempt + 1}/${RETRY_DELAYS_MS.length})`);
      await new Promise<void>((resolve) => setTimeout(resolve, waitMs));
      onStatus?.('Yeniden deneniyor…');
      continue;
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          'API key eksik veya geçersiz. Lütfen .env dosyasında EXPO_PUBLIC_GEMINI_API_KEY değerini kontrol edin.'
        );
      }
      if (response.status === 429 || response.status === 503) {
        throw new Error(
          'Sunucu yoğun veya ücretsiz kota aşıldı. Biraz sonra tekrar deneyin.'
        );
      }
      const raw = await response.text();
      let message = `Gemini API hatası (${response.status})`;
      try {
        const body = JSON.parse(raw);
        const detail = body?.error?.message;
        if (detail) message = detail;
      } catch {
        message = raw.slice(0, 200) || message;
      }
      throw new Error(message);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text as string;
  }

  throw new Error('Sunucu yoğun veya ücretsiz kota aşıldı. Biraz sonra tekrar deneyin.');
}

export async function askNextQuestion(
  idea: string,
  previousQAs: QA[],
  questionIndex: number,
  onStatus?: (msg: string) => void
): Promise<string> {
  const category = QUESTION_CATEGORIES[questionIndex] ?? QUESTION_CATEGORIES[4];

  const systemPrompt = `Sen ham fikirleri spec'e dönüştüren bir mühendislik danışmanısın. Türkçe yanıt ver.
Bu kategoride TEK bir odaklı soru sor: "${category}".
Soruyu 20 kelimede tut. Açıklama veya giriş yapma — sadece soruyu yaz.`;

  const history = previousQAs
    .map((qa, i) => `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}`)
    .join('\n');

  const userMessage = `Raw idea: "${idea}"${history ? `\n\nPrevious Q&A:\n${history}` : ''}`;

  return callGemini(systemPrompt, userMessage, onStatus);
}

export async function generateSpec(
  idea: string,
  qas: QA[],
  onStatus?: (msg: string) => void
): Promise<string> {
  const systemPrompt = `Sen bir ürün spec yazarısın. Fikir ve soru-cevaplara dayanarak kısa bir tek sayfalık mühendislik spec'i yaz. Türkçe yaz.
Şu bölümleri kullan:
## Sorun
## Hedef Kullanıcılar
## Kapsam (MVP)
## Kısıtlar
## Başarı Ölçütleri
## İlk Yapılacak Özellik

Somut ve direkt ol. Gereksiz söz yok. Toplam uzunluk: ~300 kelime.`;

  const history = qas
    .map((qa, i) => `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}`)
    .join('\n\n');

  const userMessage = `Raw idea: "${idea}"\n\nEngineering Q&A:\n${history}`;

  return callGemini(systemPrompt, userMessage, onStatus);
}

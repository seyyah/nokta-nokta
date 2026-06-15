import { MENTOR_SYSTEM_PROMPTS } from '../constants/mentorPrompts';

const GROK_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROK_MODEL = 'llama-3.3-70b-versatile';

export type GrokMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type ApiMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type GrokApiResponse = {
  choices: Array<{
    message: { content: string };
  }>;
};

// Demo mode responses when no API key is set
const DEMO_RESPONSES: Record<string, string[]> = {
  algoritma: [
    "Bu problemi çözmek için önce zaman karmaşıklığını analiz edelim. Brute-force O(n²) ise, çoğu zaman hash map kullanarak O(n)'e indirebiliriz. Hangi adımda takıldınız?",
    "Graf problemleri için DFS ve BFS seçimi kritik. Kısa yolu bulmak istiyorsanız BFS, tüm yolları keşfetmek için DFS daha uygun. Probleminizin kısıtlamaları neler?",
    "Dinamik programlama için iki şartı kontrol edin: overlapping subproblems ve optimal substructure. Eğer ikisi de varsa DP harika çalışır. Top-down mı bottom-up mı tercih edersiniz?",
    "Bu veri yapısı için array yerine balanced BST veya heap düşünebilirsiniz. Ekleme/silme işlemi mi yoksa arama işlemi mi daha kritik sizin kullanımınızda?",
  ],
  girisim: [
    "İlk adım müşteri doğrulaması. 10 kişiyle derinlemesine görüşmeden MVP yazmayın. Problem gerçek mi, insanlar bunun için para öder mi, önce bunu anlayın.",
    "MVP'niz en basit haliyle core problemi çözmeli. Özellik eklemek yerine tek bir şeyi çok iyi yapın. Retention > Acquisition. Mevcut kullanıcıları tutamazsanız yeni kazanmak anlamsız.",
    "Growth için önce bir kanalı derinlemesine test edin. Çok kanala dağılmak erken aşamada kaynakları boşa harcar. Hangi kanal size en kaliteli kullanıcıyı getirir?",
    "Problem-solution fit için şu soruları sorun: Kullanıcılar ürününüz olmadan nasıl yaşıyor? Şu an ne kullanıyorlar? Neden sizin çözümünüze geçsinler?",
  ],
  yatirim: [
    "Yatırımcılar önce ekibe bakar. Neden siz, neden şimdi, neden bu pazar? Bu üç soruya net cevabınız olmalı. Deck'inizin ilk 3 slaydı bunu anlatmalı.",
    "Pre-seed için SAFE en temiz yapı. Valuation cap ve discount rate pazarlık konusu. Cap'i çok düşük tutmayın, Series A'da sizi sıkar. 2-4M USD arası çoğu erken girişim için makul.",
    "Unit economics'i netleştirin: CAC, LTV, payback period. LTV/CAC > 3 olmalı. Bu rakamlar olmadan deck anlamlı olmaz. Investor pitch'inden önce bu metrikleri çalışın.",
    "Tier 1 VC'ler için referans yoluyla girin. Cold outreach açılma oranı çok düşük. Portföylerindeki şirketlerin kurucularıyla tanışın, onlar introduce etsin.",
  ],
  database: [
    "EXPLAIN ANALYZE ile başlayın. Seq Scan yerine Index Scan görüyorsanız doğru yoldasınız. Composite index mi yoksa partial index mi ihtiyacınız var?",
    "N+1 problemi en yaygın performans sorunudur. ORM kullanıyorsanız eager loading ekleyin. Raw SQL ile JOIN kullanmak genellikle daha öngörülebilir.",
    "Read-heavy workload için: connection pooling (PgBouncer) + read replica + query cache (Redis). Bu üçlü çoğu ölçekleme sorununu çözer.",
    "Büyük tablolar için partitioning düşünün. Range partitioning (tarih bazlı) veya hash partitioning. Hangi boyutu ne kadar büyüyecek?",
  ],
  guvenlik: [
    "JWT için kısa expiry süresi (15 dakika) ve refresh token rotation kullanın. Refresh token'ları HttpOnly cookie'de saklayın, localStorage'da değil.",
    "Input validation her zaman server-side'da yapın. Client-side validation sadece UX içindir güvenlik için değil. Parametrize queries kullanmadan SQL çalıştırmayın.",
    "OWASP Top 10'u checklist olarak kullanın. XSS için Content-Security-Policy header ekleyin, CSRF için SameSite=Strict cookie ve CSRF token kullanın.",
    "Dependencies'ınızı düzenli audit edin. npm audit + Snyk kombinasyonu iyi. CI/CD pipeline'ınıza otomatik dependency check ekleyin.",
  ],
  yazilim: [
    "SOLID'de en önemli S ve D. Single Responsibility ile birimleri küçük tutun, Dependency Inversion ile test edilebilirliği artırın. Interface'lere kod yazın, implementasyonlara değil.",
    "Monolith'ten microservices'e geçiş için Strangler Fig Pattern kullanın. Yavaş yavaş parçaları ayırın. Big bang migration genellikle başarısız olur.",
    "Teknik borç envanteri çıkarın ve kategorilere ayırın: kritik, önemli, nice-to-have. Her sprint'e %20 technical debt oranı ekleyin.",
  ],
  hukuk: [
    "KVKK için veri envanteri zorunlu. Hangi kişisel veri işliyorsunuz, hangi amaçla, ne kadar süre saklıyorsunuz? VERBİS kaydınızı yaptırdınız mı?\n\nNot: Bu genel bilgilendirmedir, resmi hukuki danışmanlık yerine geçmez.",
    "Kullanıcı sözleşmenizde açık rıza metni, veri saklama süreleri ve kullanıcı hakları bölümü olmalı. Gizlilik politikanız KVKK'ya uygun mu?\n\nNot: Bu genel bilgilendirmedir, resmi hukuki danışmanlık yerine geçmez.",
  ],
  saglik: [
    "MDR kapsamına giriyor musunuz? Risk sınıfı Ia, IIa veya IIb? Bu sınıfa göre CE sertifikasyon süreci değişiyor. Önce risk sınıflamasını yapın.",
    "Dijital sağlık uygulaması için klinik validasyon şart. Bir üniversite hastanesiyle pilot çalışma için iletişime geçin. Peer-reviewed yayın güvenilirliği artırır.",
  ],
  default: [
    "Probleminizi daha iyi anlayabilmem için biraz daha detay verir misiniz? Hangi aşamadasınız ve ne tür bir yardıma ihtiyacınız var?",
    "Bu konuyu birlikte adım adım ele alalım. Önce mevcut durumu anlayayım, sonra yol haritası çizelim.",
  ],
};

function getFallbackResponse(mentorType: string): string {
  const responses = DEMO_RESPONSES[mentorType] ?? DEMO_RESPONSES['default'];
  return responses[Math.floor(Math.random() * responses.length)];
}

function isDemoMode(): boolean {
  const key = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  return !key || key === '' || key === 'your_api_key_here';
}

export async function askMentor(
  mentorType: string,
  history: GrokMessage[],
  userMessage: string,
): Promise<string> {
  if (isDemoMode()) {
    // Simulate network delay in demo mode
    await new Promise<void>((r) => setTimeout(r, 800 + Math.random() * 600));
    return getFallbackResponse(mentorType);
  }

  const systemPrompt = MENTOR_SYSTEM_PROMPTS[mentorType] ?? MENTOR_SYSTEM_PROMPTS['default'];

  const messages: ApiMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userMessage },
  ];

  try {
    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 512,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error(`Grok API ${response.status}:`, errText);
      return getFallbackResponse(mentorType);
    }

    const data = (await response.json()) as GrokApiResponse;
    const text = data.choices[0]?.message?.content?.trim();
    return text || getFallbackResponse(mentorType);
  } catch (error) {
    console.error('Grok API error:', error);
    return getFallbackResponse(mentorType);
  }
}

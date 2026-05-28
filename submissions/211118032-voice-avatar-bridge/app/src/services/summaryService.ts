import { SessionSummary } from '../types';
import { StorageHelper } from '../storage/storageHelper';
import { MENTOR_PROFILES } from '../constants/mockData';

function generateId(): string {
  return `sum_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

const RECOMMENDATIONS_MAP: Record<string, string[]> = {
  algoritma: [
    "Big-O analizi yaparak mevcut algoritmanın karmaşıklığını ölçün",
    "Dinamik programlama veya greedy yaklaşımı değerlendirin",
    "LeetCode veya HackerRank üzerinde pratik yapın",
    "CLRS (Introduction to Algorithms) kitabını inceleyin",
  ],
  girisim: [
    "Problem-solution fit doğrulaması için 15 müşteri görüşmesi yapın",
    "MVP'yi en az özellikle piyasaya çıkarın ve geri bildirim toplayın",
    "Rakip analizi ve farklılaşma stratejisi oluşturun",
    "Finansal projeksiyonlarınızı 18 aylık süre için hazırlayın",
  ],
  yatirim: [
    "Yatırım öncesi finansal modelinizi detaylandırın (P&L, cash flow)",
    "Pitch deck'inizi investor feedback alarak rafine edin",
    "Term sheet müzakerelerinde hukuk danışmanı bulundurun",
    "Yatırımcı hedef listesi oluşturun ve warm intro için network kullanın",
  ],
  yazilim: [
    "Domain-Driven Design prensiplerini projeye uygulayın",
    "SOLID prensiplerini kod review'larınızda kontrol listesi olarak kullanın",
    "Teknik borç envanteri çıkarın ve önceliklendirin",
    "CI/CD pipeline kurarak test otomasyonu ekleyin",
  ],
  database: [
    "Yavaş sorguları EXPLAIN ANALYZE ile analiz edin",
    "Indeks stratejisini gözden geçirin ve composite index'leri değerlendirin",
    "Bağlantı havuzu (connection pooling) konfigürasyonunu optimize edin",
    "Yedekleme ve disaster recovery planı oluşturun",
  ],
  guvenlik: [
    "OWASP Top 10 checklist üzerinden uygulamanızı denetleyin",
    "Dependency audit'i CI pipeline'ına ekleyin",
    "Penetrasyon testi için bir güvenlik firmasıyla iletişime geçin",
    "Güvenlik olayı müdahale planı (incident response) hazırlayın",
  ],
  hukuk: [
    "KVKK uyumluluğu için bir hukuk danışmanıyla çalışın",
    "Kullanıcı sözleşmesi ve gizlilik politikanızı güncelleyin",
    "Ticari marka tescili başvurusu yapın",
    "Veri işleme faaliyetleri kaydını (VERBIS) oluşturun",
  ],
  saglik: [
    "Tıbbi cihaz yönetmeliği kapsamınızı belirleyin",
    "Pilot klinik çalışma için bir üniversite hastanesiyle görüşün",
    "HIPAA veya GDPR uyumluluk değerlendirmesi yapın",
    "Hasta güvenliği protokollerinizi belgeleyin",
  ],
  default: [
    "Belirlenen öncelikleri bir action plan haline getirin",
    "Kısa vadeli (1 ay) ve orta vadeli (3 ay) hedefler belirleyin",
    "Ilerlemeyi takip etmek için haftalık review takvimi oluşturun",
    "Gerekirse ek uzman desteği almayı değerlendirin",
  ],
};

const NEXT_STEPS_MAP: Record<string, string[]> = {
  algoritma: [
    "1 hafta içinde algoritmanızı refactor edin",
    "Unit test coverage'ını artırın",
    "Performance benchmark'ları çalıştırın",
  ],
  girisim: [
    "Bu hafta 3 potansiyel müşteri görüşmesi planlayın",
    "Pitch deck'inizi hazırlayın veya güncelleyin",
    "Hızlandırıcı programlarını araştırın",
  ],
  yatirim: [
    "Bu ay içinde 5 hedef yatırımcıya ulaşın",
    "Due diligence hazırlığı için finansal belgelerinizi derleyin",
    "Yatırım sürecini takip etmek için bir CRM aracı kullanın",
  ],
  yazilim: [
    "Teknik borçları sprint backlog'a ekleyin",
    "Kod review süreci için guidelines oluşturun",
    "Monitoring ve alerting altyapısı kurun",
  ],
  database: [
    "Yavaş sorgu raporunu oluşturun ve önceliklendirin",
    "Staging ortamında load test çalıştırın",
    "Veritabanı dokümantasyonunu güncelleyin",
  ],
  guvenlik: [
    "Acil güvenlik yamalarını bu hafta uygulayın",
    "Güvenlik awareness eğitimi planlayın",
    "Bug bounty programı değerlendirin",
  ],
  hukuk: [
    "Hukuk danışmanıyla ilk toplantıyı bu ay içinde gerçekleştirin",
    "Mevcut sözleşmeleri gözden geçirin",
    "Uyum takvimi oluşturun",
  ],
  saglik: [
    "Regülatör kurumla ön görüşme talep edin",
    "Klinik danışman kurulu oluşturun",
    "CE veya FDA başvuru sürecini araştırın",
  ],
  default: [
    "Belirlenen aksiyonları takvimlendirin",
    "Haftalık ilerleme revizyonu planlayın",
    "Gerekirse ek danışmanlık alın",
  ],
};

async function getAllSummaries(): Promise<SessionSummary[]> {
  const data = await StorageHelper.getItem<SessionSummary[]>(StorageHelper.KEYS.SUMMARIES);
  return data ?? [];
}

async function getSummaryById(id: string): Promise<SessionSummary | null> {
  const all = await getAllSummaries();
  return all.find((s) => s.id === id) ?? null;
}

async function createSummary(
  escalationId: string,
  topic: string,
  mentorType: string,
): Promise<SessionSummary> {
  const all = await getAllSummaries();
  const mentor = MENTOR_PROFILES[mentorType] ?? MENTOR_PROFILES['default'];

  const recommendations =
    RECOMMENDATIONS_MAP[mentorType] ?? RECOMMENDATIONS_MAP['default'];
  const nextSteps = NEXT_STEPS_MAP[mentorType] ?? NEXT_STEPS_MAP['default'];

  const summary: SessionSummary = {
    id: generateId(),
    escalationId,
    topic,
    mentorName: mentor.name,
    mentorRecommendations: recommendations.slice(0, 3),
    nextSteps: nextSteps.slice(0, 3),
    createdAt: new Date().toISOString(),
  };

  await StorageHelper.setItem(StorageHelper.KEYS.SUMMARIES, [...all, summary]);
  return summary;
}

export const SummaryService = {
  getAllSummaries,
  getSummaryById,
  createSummary,
};

import { MentorProfile } from '../types';

// ─── Expert keyword list (used for ChatScreen mascot suggestion) ──────────────
export const EXPERT_KEYWORDS: string[] = [
  'algoritma', 'algorithm', 'graph', 'dfs', 'bfs', 'veri yapısı',
  'startup', 'girişim', 'ürün', 'fikir', 'mvp',
  'yatırım', 'finans', 'gelir modeli', 'funding',
  'database', 'sql', 'nosql', 'backend', 'veritabanı',
  'güvenlik', 'auth', 'jwt', 'oauth', 'security',
  'mimari', 'architecture', 'microservice',
  'hukuk', 'kvkk', 'gdpr',
  'sağlık', 'health', 'mdr',
];

// ─── Mentor Profiles ──────────────────────────────────────────────────────────
export const MENTOR_PROFILES: Record<string, MentorProfile> = {
  algoritma: {
    id: 'm1',
    name: 'Burak Şahin',
    expertise: 'Algoritma & Veri Yapıları',
    avatarInitials: 'BS',
    isOnline: true,
  },
  girisim: {
    id: 'm2',
    name: 'Elif Demir',
    expertise: 'Startup & Ürün Stratejisi',
    avatarInitials: 'ED',
    isOnline: true,
  },
  yatirim: {
    id: 'm3',
    name: 'Mert Kaya',
    expertise: 'Yatırım & Finansman',
    avatarInitials: 'MK',
    isOnline: true,
  },
  database: {
    id: 'm4',
    name: 'Ayşe Yıldız',
    expertise: 'Veritabanı & Backend',
    avatarInitials: 'AY',
    isOnline: true,
  },
  guvenlik: {
    id: 'm5',
    name: 'Can Arslan',
    expertise: 'Siber Güvenlik',
    avatarInitials: 'CA',
    isOnline: true,
  },
  yazilim: {
    id: 'm6',
    name: 'Deniz Öztürk',
    expertise: 'Yazılım Mimarisi',
    avatarInitials: 'DO',
    isOnline: true,
  },
  hukuk: {
    id: 'm7',
    name: 'Selin Çelik',
    expertise: 'Teknoloji Hukuku',
    avatarInitials: 'SC',
    isOnline: true,
  },
  saglik: {
    id: 'm8',
    name: 'Dr. Yusuf Akar',
    expertise: 'Dijital Sağlık',
    avatarInitials: 'YA',
    isOnline: true,
  },
  default: {
    id: 'm0',
    name: 'Zeynep Turan',
    expertise: 'Genel Danışmanlık',
    avatarInitials: 'ZT',
    isOnline: true,
  },
};

// ─── Mascot responses for ChatScreen (static, Nokta mascot) ──────────────────
export const MASCOT_RESPONSES: Record<string, string[]> = {
  algoritma: [
    "Algoritma konusunda sana yardımcı olmaya çalışabilirim! Ama bu konu çok derin teknik bilgi gerektiriyor olabilir. Uzman desteği çok daha verimli olur.",
    "Veri yapıları ve algoritmalar konusunda konuşuyoruz. Bir uzman mentor bu konuda sana çok daha iyi rehberlik edebilir.",
  ],
  girisim: [
    "Startup yolculuğu heyecan verici! Hangi aşamadasın? Bir girişim mentoru seninle derinlemesine konuşabilir.",
    "Ürün ve girişim kararları kritik. Deneyimli bir mentor desteği bu süreçte çok değerli olabilir.",
  ],
  yatirim: [
    "Yatırım süreci karmaşık bir alan. Bir yatırım danışmanıyla konuşman çok daha faydalı olur.",
    "Finansman ve gelir modeli konularında uzman görüşü almanı öneririm.",
  ],
  database: [
    "Veritabanı tasarımı ve sorgular teknik detay gerektiriyor. Bir uzmanla konuşmak daha verimli olur.",
    "SQL ve backend konularında deneyimli bir mühendis sana çok daha net rehberlik edebilir.",
  ],
  guvenlik: [
    "Güvenlik konuları asla hafife alınmamalı. Bir siber güvenlik uzmanıyla konuşmanı öneririm.",
    "Authentication ve güvenlik mimarisi konusunda uzman desteği kritik önem taşıyor.",
  ],
  mimari: [
    "Yazılım mimarisi uzun vadeli kararlar içeriyor. Deneyimli bir mimarla oturup tartışmak çok daha verimli.",
    "Mikroservisler ve clean architecture konularında uzman rehberliği işe yarar.",
  ],
  hukuk: [
    "Hukuki konular mutlaka uzmanla görüşülmeli. Teknoloji hukuku danışmanı sana yol gösterebilir.",
    "KVKK ve GDPR uyumluluğu için profesyonel destek almanı öneririm.",
  ],
  saglik: [
    "Dijital sağlık alanı hem heyecan verici hem de regülatif açıdan karmaşık. Uzman desteği şart.",
    "Sağlık uygulamaları özel mevzuata tabi. Bir uzmanla görüşmeni öneririm.",
  ],
  default: [
    "Anlıyorum! Bu konuda sana yardımcı olmaya çalışabilirim.",
    "İlginç bir konu! Daha fazla detay verebilir misin?",
    "Bunu birlikte düşünelim. Ne tür bir sonuç arıyorsun?",
    "Güzel bir soru! Farklı açılardan bakabiliriz.",
    "Anladım. Bu konuda birkaç farklı yaklaşım var, birlikte değerlendirebiliriz.",
  ],
};

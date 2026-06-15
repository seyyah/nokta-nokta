export type ExpertRoute = {
  mentorType: string;
  matchedKeyword: string;
};

type RoutingRule = {
  keywords: string[];
  mentorType: string;
};

const ROUTING_RULES: RoutingRule[] = [
  {
    keywords: [
      'algoritma', 'algorithm', 'graph', 'dfs', 'bfs', 'veri yapısı',
      'veri yapisi', 'sorting', 'sort', 'tree', 'linked list', 'stack',
      'queue', 'heap', 'hash', 'dynamic programming', 'recursion', 'kompleksite',
    ],
    mentorType: 'algoritma',
  },
  {
    keywords: [
      'startup', 'girişim', 'girisim', 'ürün', 'urun', 'fikir',
      'mvp', 'pivot', 'product', 'pazar', 'müşteri', 'musteri',
      'büyüme', 'buyume', 'growth',
    ],
    mentorType: 'girisim',
  },
  {
    keywords: [
      'yatırım', 'yatirim', 'finans', 'gelir modeli', 'funding',
      'investor', 'yatırımcı', 'yatirimci', 'seed', 'series',
      'valuation', 'term sheet', 'safe', 'convertible', 'sermaye',
    ],
    mentorType: 'yatirim',
  },
  {
    keywords: [
      'database', 'sql', 'nosql', 'backend', 'veritabanı', 'veritabani',
      'query', 'postgres', 'postgresql', 'mysql', 'mongodb', 'redis',
      'indeks', 'index', 'join', 'migration', 'orm',
    ],
    mentorType: 'database',
  },
  {
    keywords: [
      'güvenlik', 'guvenlik', 'auth', 'jwt', 'oauth', 'security',
      'xss', 'csrf', 'owasp', 'encryption', 'şifreleme', 'sifreleme',
      'firewall', 'penetrasyon', 'vulnerability', 'token',
    ],
    mentorType: 'guvenlik',
  },
  {
    keywords: [
      'mimari', 'architecture', 'microservice', 'monolith',
      'solid', 'design pattern', 'clean code', 'refactor',
    ],
    mentorType: 'yazilim',
  },
  {
    keywords: [
      'hukuk', 'kvkk', 'gdpr', 'hukuki', 'sözleşme', 'sozlesme',
      'lisans', 'telif', 'fikri mülkiyet',
    ],
    mentorType: 'hukuk',
  },
  {
    keywords: [
      'sağlık', 'saglik', 'health', 'mdr', 'fda', 'klinik',
      'tıbbi', 'tibbi', 'hasta', 'medikal',
    ],
    mentorType: 'saglik',
  },
];

export function routeToExpert(text: string): ExpertRoute | null {
  const lower = text.toLowerCase();
  for (const rule of ROUTING_RULES) {
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) {
        return { mentorType: rule.mentorType, matchedKeyword: kw };
      }
    }
  }
  return null;
}

export function shouldSuggestExpert(text: string): boolean {
  return routeToExpert(text) !== null;
}

export function getMentorTypeForText(text: string): string {
  return routeToExpert(text)?.mentorType ?? 'default';
}

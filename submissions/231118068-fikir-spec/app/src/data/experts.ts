export interface Expert {
  id: string;
  name: string;
  title: string;
  company: string;
  expertise: string[];
  bio: string;
  avatar: string;
  rating: number;
  sessions: number;
}

export const EXPERTS: Expert[] = [
  {
    id: '1',
    name: 'Ahmet Yılmaz',
    title: 'Ürün Yöneticisi',
    company: 'Trendyol',
    expertise: ['Mobil Ürün', 'E-ticaret', 'MVP'],
    bio: '8 yıllık ürün yönetimi deneyimi. 50+ özellik lansmanı.',
    avatar: '👨‍💼',
    rating: 4.9,
    sessions: 124,
  },
  {
    id: '2',
    name: 'Zeynep Kaya',
    title: 'Girişim Danışmanı',
    company: 'Y Combinator Alumni',
    expertise: ['Startup', 'Yatırım', 'Go-to-Market'],
    bio: '3 şirket kurdu, ikisini başarıyla exit etti.',
    avatar: '👩‍💻',
    rating: 4.8,
    sessions: 89,
  },
  {
    id: '3',
    name: 'Can Demir',
    title: 'UX Araştırmacısı',
    company: 'Getir',
    expertise: ['Kullanıcı Araştırması', 'Tasarım', 'Prototip'],
    bio: 'Kullanıcı odaklı tasarım ve araştırma uzmanı.',
    avatar: '🎨',
    rating: 4.7,
    sessions: 67,
  },
  {
    id: '4',
    name: 'Elif Şahin',
    title: 'Yazılım Mimarı',
    company: 'Peak Games',
    expertise: ['Teknik Mimari', 'Ölçeklenebilirlik', 'Backend'],
    bio: 'Milyonlarca kullanıcıya sahip sistemler tasarladı.',
    avatar: '⚙️',
    rating: 4.9,
    sessions: 156,
  },
];

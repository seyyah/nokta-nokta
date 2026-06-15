import ExpertBridge from './ExpertBridge';
import AvatarWebView from './AvatarWebView';
import VoiceVisualizer from './VoiceVisualizer';
import { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, SafeAreaView, StatusBar
} from 'react-native';
import { captureScreen, captureRef } from 'react-native-view-shot';
import { writeAsStringAsync, documentDirectory, EncodingType } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuditWidget } from '@xtatistix/mobile-audit';
import { useRef } from 'react';
const auditStorage = {
  async loadNotes() {
    const raw = await AsyncStorage.getItem('audit_notes');
    return raw ? JSON.parse(raw) : [];
  },
  async saveNotes(notes) {
    await AsyncStorage.setItem('audit_notes', JSON.stringify(notes));
  },
};

const GROQ_API_KEY = 'YOUR_API_KEY_HERE';;

const DEPARTMANLAR = [
  { id: 'pazarlama', label: '📣 Pazarlama', desc: 'Nasıl satarız?' },
  { id: 'teknik', label: '⚙️ Teknik', desc: 'Uygulanabilir mi?' },
  { id: 'finans', label: '💰 Finans', desc: 'Maliyet & getiri?' },
  { id: 'risk', label: '⚠️ Risk', desc: 'Ne ters gidebilir?' },
];

const getDepartmanPrompt = (dept) => {
  const prompts = {
    pazarlama: 'Pazarlama direktörü gözünden bak. Hedef kitle, mesaj, kanal, rekabet avantajı.',
    teknik: 'CTO gözünden bak. Teknik uygulanabilirlik, gerekli altyapı, zorluklar.',
    finans: 'CFO gözünden bak. Başlangıç maliyeti, gelir modeli, geri dönüş süresi.',
    risk: 'Risk yöneticisi gözünden bak. Operasyonel, yasal, pazar riskleri.',
  };
  return prompts[dept];
};

const SENTEZ_PROMPT = `Sen bir üst yönetim danışmanısın.
4 departmanın değerlendirmesini aldın. Kurumsal karar ver.
Yanıt formatı (sadece JSON, başka hiçbir şey yazma):
{
  "baslik": "fikrin güçlü başlığı",
  "kurumselKarar": "Onayla" veya "Şartlı Onayla" veya "Reddet",
  "gerekce": "2-3 cümle gerekçe",
  "oncelikliAdim": "ilk yapılması gereken şey",
  "yatirimSkoru": 0-100 arası sayı
}`;

const MIGRASYON_PROMPT = `Sen bir fikir analistsin.
Kullanıcının yapıştırdığı ham metinden (WhatsApp logu, notlar, bullet listesi) fikirleri ayıkla.
Tekrar edenleri birleştir, anlamsız kısa notları at.
Yanıt formatı (sadece JSON, başka hiçbir şey yazma):
{
  "fikirler": [
    { "id": "1", "baslik": "kısa başlık", "ozet": "1 cümle özet" },
    { "id": "2", "baslik": "kısa başlık", "ozet": "1 cümle özet" }
  ]
}`;

export default function App() {
  const [ana, setAna] = useState('home'); // home, migrate, analyze
  const [insight, setInsight] = useState('');
  const [hamMetin, setHamMetin] = useState('');
  const [ayriklanmis, setAyriklanmis] = useState([]);
  const [migrasyonLoading, setMigrasyonLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [seciliDept, setSeciliDept] = useState(null);
  const [deptSonuclari, setDeptSonuclari] = useState({});
  const [sentez, setSentez] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const rootRef = useRef(null);
  const [rms, setRms] = useState(0);
  const [failCount, setFailCount] = useState(0);

  const groqCall = async (system, user, maxTokens = 800) => {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });
    const data = await response.json();
    const text = data.choices[0].message.content;
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  };

  const handleMigrasyon = async () => {
    if (!hamMetin.trim()) return;
    setMigrasyonLoading(true);
    setError('');
    try {
      const parsed = await groqCall(MIGRASYON_PROMPT, hamMetin, 1000);
      setAyriklanmis(parsed.fikirler);
    } catch (e) {
      setError('Ayıklama hatası, tekrar dene.');
    } finally {
      setMigrasyonLoading(false);
    }
  };

  const selectFikir = (fikir) => {
    setInsight(fikir.ozet);
    setAna('analyze');
    setStep(0);
    setDeptSonuclari({});
    setSentez(null);
  };

  const handleInsightNext = () => {
    if (!insight.trim()) return;
    setStep(1);
  };

  const analyzeDept = async (dept) => {
    setSeciliDept(dept);
    setLoading(true);
    setError('');
    try {
      const systemPrompt = `Sen bir ${dept} uzmanısın. ${getDepartmanPrompt(dept)}
Yanıt formatı (sadece JSON, başka hiçbir şey yazma):
{
  "departman": "${dept}",
  "ozet": "2 cümle temel değerlendirme",
  "guclu": "en güçlü 2 nokta",
  "zayif": "en zayıf 2 nokta",
  "karar": "Destekle" veya "Şartlı Destekle" veya "Reddet",
  "sart": "eğer şartlı ise şart nedir, değilse boş string"
}`;
      const parsed = await groqCall(systemPrompt, insight);
      const yeni = { ...deptSonuclari, [dept]: parsed };
      setDeptSonuclari(yeni);
      if (Object.keys(yeni).length === 4) {
        await makeSentez(yeni);
      }
    } catch (e) {
      setError('Hata oluştu, tekrar dene.');
    } finally {
      setLoading(false);
      setSeciliDept(null);
    }
  };

  const makeSentez = async (sonuclar) => {
    setStep(2);
    setLoading(true);
    try {
      const context = `
Fikir: ${insight}
Pazarlama: ${JSON.stringify(sonuclar.pazarlama)}
Teknik: ${JSON.stringify(sonuclar.teknik)}
Finans: ${JSON.stringify(sonuclar.finans)}
Risk: ${JSON.stringify(sonuclar.risk)}`;
      const parsed = await groqCall(SENTEZ_PROMPT, context);
      setSentez(parsed);
      setStep(3);
    } catch (e) {
      setError('Sentez hatası.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setAna('home');
    setInsight('');
    setHamMetin('');
    setAyriklanmis([]);
    setStep(0);
    setSeciliDept(null);
    setDeptSonuclari({});
    setSentez(null);
    setError('');
  };

  const getKararColor = (karar) => {
    if (karar === 'Destekle' || karar === 'Onayla') return '#22c55e';
    if (karar === 'Şartlı Destekle' || karar === 'Şartlı Onayla') return '#f59e0b';
    return '#ef4444';
  };

  return (
    <SafeAreaView ref={rootRef} style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <Text style={styles.title}>Nokta</Text>
          <Text style={styles.subtitle}>Fikrinden kurumsal karara</Text>
        </View>

        {/* ANA EKRAN */}
        {ana === 'home' && (
          <View>
            <TouchableOpacity style={styles.homeBtn} onPress={() => setAna('analyze')}>
              <Text style={styles.homeBtnEmoji}>💡</Text>
              <View>
                <Text style={styles.homeBtnTitle}>Yeni Fikir Analiz Et</Text>
                <Text style={styles.homeBtnDesc}>Fikrini departmanlara sun, kurumsal karar al</Text>
              </View>
            </TouchableOpacity>
            

            <TouchableOpacity style={styles.homeBtn} onPress={() => setAna('migrate')}>
              <Text style={styles.homeBtnEmoji}>📥</Text>
              <View>
                <Text style={styles.homeBtnTitle}>Notlarımı İçe Aktar</Text>
                <Text style={styles.homeBtnDesc}>WhatsApp, not defteri, e-posta — fikirleri ayıkla</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.homeBtn} onPress={() => setAna('voice')}>
  <Text style={styles.homeBtnEmoji}>🎙️</Text>
  <View>
    <Text style={styles.homeBtnTitle}>Ses & Avatar</Text>
    <Text style={styles.homeBtnDesc}>Konuş, avatarını izle — rapor diktesi</Text>
  </View>
</TouchableOpacity>
          </View>
        )}
 
           {/* SES & AVATAR EKRANI */}
{ana === 'voice' && (
  <View>
    <TouchableOpacity onPress={() => setAna('home')} style={styles.backBtn}>
      <Text style={styles.backText}>← Geri</Text>
    </TouchableOpacity>
     <AvatarWebView
  rms={rms}
  persona="junior"
  style={{ height: 320, marginBottom: 16 }}
/>
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Ses Görselleştirici</Text>
      <Text style={styles.cardDesc}>
        Konuşunca barlar zıplar. Raporu diktele.
      </Text>
      <VoiceVisualizer
        onRmsChange={setRms}
      />
    </View>
    <ExpertBridge
  failCount={failCount}
  reporterId="211118085"
  onBridgeEnd={(summary) => console.log(summary)}
/>

<TouchableOpacity style={styles.failTestBtn} onPress={() => setFailCount(f => f + 1)}>
  <Text style={styles.failTestText}>🔴 FAIL Simüle Et ({failCount}/2)</Text>
</TouchableOpacity>
  </View>
)} 
        {/* MİGRASYON EKRANI */}
        {ana === 'migrate' && (
          <View>
            <TouchableOpacity onPress={() => setAna('home')} style={styles.backBtn}>
              <Text style={styles.backText}>← Geri</Text>
            </TouchableOpacity>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Notlarını Yapıştır</Text>
              <Text style={styles.cardDesc}>
                WhatsApp logu, bullet listesi, e-posta taslağı — ne olursa olsun. AI fikirleri ayıklar.
              </Text>
              <TextInput
                style={[styles.input, { minHeight: 160 }]}
                multiline
                placeholder="Buraya ham metni yapıştır..."
                placeholderTextColor="#444"
                value={hamMetin}
                onChangeText={setHamMetin}
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <TouchableOpacity
                style={[styles.button, styles.migrateButton, migrasyonLoading && styles.buttonDisabled]}
                onPress={handleMigrasyon}
                disabled={migrasyonLoading}
              >
                {migrasyonLoading
                  ? <ActivityIndicator color="#000" />
                  : <Text style={styles.buttonText}>Fikirleri Ayıkla →</Text>
                }
              </TouchableOpacity>
            </View>

            {ayriklanmis.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>
                  {ayriklanmis.length} fikir bulundu — birine tıkla, analiz et
                </Text>
                {ayriklanmis.map((fikir) => (
                  <TouchableOpacity
                    key={fikir.id}
                    style={styles.fikırCard}
                    onPress={() => selectFikir(fikir)}
                  >
                    <Text style={styles.fikırBaslik}>{fikir.baslik}</Text>
                    <Text style={styles.fikırOzet}>{fikir.ozet}</Text>
                    <Text style={styles.fikırAnaliz}>Analiz Et →</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ANALİZ EKRANI */}
        {ana === 'analyze' && (
          <View>
            {step === 0 && (
              <View>
                <TouchableOpacity onPress={() => setAna('home')} style={styles.backBtn}>
                  <Text style={styles.backText}>← Geri</Text>
                </TouchableOpacity>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Fikrini Yaz</Text>
                  <Text style={styles.cardDesc}>
                    Sosyal, teknik ya da psikolojik — ne olursa olsun.
                  </Text>
                  <TextInput
                    style={styles.input}
                    multiline
                    numberOfLines={5}
                    placeholder="Örnek: Şehirde yalnız yaşayan insanlar için sessiz bir terapi modeli..."
                    placeholderTextColor="#444"
                    value={insight}
                    onChangeText={setInsight}
                  />
                  {error ? <Text style={styles.error}>{error}</Text> : null}
                  <TouchableOpacity style={styles.button} onPress={handleInsightNext}>
                    <Text style={styles.buttonText}>Departmanlara Sun →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {step === 1 && (
              <View>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Departman Analizi</Text>
                  <Text style={styles.cardDesc}>
                    Her departmana tıkla. 4'ü tamamlayınca kurumsal karar çıkar.
                  </Text>
                  <Text style={styles.fikirdMsg}>
                    "{insight.slice(0, 80)}{insight.length > 80 ? '...' : ''}"
                  </Text>
                </View>

                {DEPARTMANLAR.map((dept) => {
                  const tamamlandi = !!deptSonuclari[dept.id];
                  const yukleniyor = seciliDept === dept.id && loading;
                  const sonuc = deptSonuclari[dept.id];
                  return (
                    <TouchableOpacity
                      key={dept.id}
                      style={[styles.deptCard, tamamlandi && styles.deptCardDone]}
                      onPress={() => !tamamlandi && !loading && analyzeDept(dept.id)}
                      disabled={tamamlandi || loading}
                    >
                      <View style={styles.deptRow}>
                        <View>
                          <Text style={styles.deptLabel}>{dept.label}</Text>
                          <Text style={styles.deptDesc}>{dept.desc}</Text>
                        </View>
                        {yukleniyor && <ActivityIndicator color="#e8ff00" />}
                        {tamamlandi && !yukleniyor && (
                          <View style={[styles.kararBadge, { backgroundColor: getKararColor(sonuc.karar) }]}>
                            <Text style={styles.kararBadgeText}>{sonuc.karar}</Text>
                          </View>
                        )}
                        {!tamamlandi && !yukleniyor && (
                          <Text style={styles.deptArrow}>→</Text>
                        )}
                      </View>
                      {tamamlandi && sonuc && (
                        <View style={styles.deptDetay}>
                          <Text style={styles.deptDetayOzet}>{sonuc.ozet}</Text>
                          <View style={styles.deptDetayRow}>
                            <View style={styles.deptDetayKutu}>
                              <Text style={styles.deptDetayLabel}>💪 GÜÇLÜ</Text>
                              <Text style={styles.deptDetayText}>{sonuc.guclu}</Text>
                            </View>
                            <View style={styles.deptDetayKutu}>
                              <Text style={styles.deptDetayLabel}>⚠️ ZAYIF</Text>
                              <Text style={styles.deptDetayText}>{sonuc.zayif}</Text>
                            </View>
                          </View>
                          {sonuc.sart ? (
                            <View style={styles.sartRow}>
                              <Text style={styles.sartLabel}>ŞART: </Text>
                              <Text style={styles.sartText}>{sonuc.sart}</Text>
                            </View>
                          ) : null}
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}

                {error ? <Text style={styles.error}>{error}</Text> : null}
                <Text style={styles.progressText}>
                  {Object.keys(deptSonuclari).length} / 4 departman tamamlandı
                </Text>
              </View>
            )}

            {step === 2 && (
              <View style={styles.loadingCard}>
                <ActivityIndicator color="#e8ff00" size="large" />
                <Text style={styles.loadingText}>Kurumsal karar hazırlanıyor...</Text>
              </View>
            )}

            {step === 3 && sentez && (
              <View>
                <View style={styles.sentezHeader}>
                  <Text style={styles.artifactLabel}>KURUMSAL KARAR</Text>
                  <Text style={styles.artifactTitle}>{sentez.baslik}</Text>
                  <View style={[styles.kararBig, { backgroundColor: getKararColor(sentez.kurumselKarar) }]}>
                    <Text style={styles.kararBigText}>{sentez.kurumselKarar}</Text>
                  </View>
                  <View style={styles.skorRow}>
                    <Text style={styles.skorValue}>{sentez.yatirimSkoru}</Text>
                    <Text style={styles.skorMax}>/100</Text>
                  </View>
                  <Text style={styles.skorLabel}>YATIRIM SKORU</Text>
                </View>

                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>GEREKÇE</Text>
                  <Text style={styles.infoText}>{sentez.gerekce}</Text>
                </View>

                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>→ ÖNCELİKLİ ADIM</Text>
                  <Text style={styles.infoText}>{sentez.oncelikliAdim}</Text>
                </View>

                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>DEPARTMAN DEĞERLENDİRMELERİ</Text>
                  {DEPARTMANLAR.map((dept) => {
                    const sonuc = deptSonuclari[dept.id];
                    return (
                      <View key={dept.id} style={styles.deptSonucBlok}>
                        <View style={styles.deptSonucRow}>
                          <Text style={styles.deptSonucIsim}>{dept.label}</Text>
                          <View style={[styles.kararBadge, { backgroundColor: getKararColor(sonuc?.karar) }]}>
                            <Text style={styles.kararBadgeText}>{sonuc?.karar}</Text>
                          </View>
                        </View>
                        <Text style={styles.deptDetayOzet}>{sonuc?.ozet}</Text>
                        <View style={styles.deptDetayRow}>
                          <View style={styles.deptDetayKutu}>
                            <Text style={styles.deptDetayLabel}>💪 GÜÇLÜ</Text>
                            <Text style={styles.deptDetayText}>{sonuc?.guclu}</Text>
                          </View>
                          <View style={styles.deptDetayKutu}>
                            <Text style={styles.deptDetayLabel}>⚠️ ZAYIF</Text>
                            <Text style={styles.deptDetayText}>{sonuc?.zayif}</Text>
                          </View>
                        </View>
                        {sonuc?.sart ? (
                          <View style={styles.sartRow}>
                            <Text style={styles.sartLabel}>ŞART: </Text>
                            <Text style={styles.sartText}>{sonuc.sart}</Text>
                          </View>
                        ) : null}
                        <View style={styles.deptDivider} />
                      </View>
                    );
                  })}
                </View>

                <TouchableOpacity style={styles.resetButton} onPress={reset}>
                  <Text style={styles.resetText}>Ana Menüye Dön</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        <AuditWidget
  appName="Nokta"
  deps={{
    captureScreen: () => captureScreen({ format: 'png', result: 'tmpfile' }),
    captureRef: (ref) => captureRef(ref.current, { format: 'png', result: 'tmpfile' }),
writeFile: async (filename, content) => {
  const uri = documentDirectory + filename;
  await writeAsStringAsync(uri, content, { encoding: EncodingType.UTF8 });
  return uri;
},
writeFileBinary: async (filename, base64) => {
  const uri = documentDirectory + filename;
  await writeAsStringAsync(uri, base64, { encoding: EncodingType.Base64 });
  return uri;
},
    shareFile: (uri) => Sharing.shareAsync(uri),
    storage: auditStorage,
    currentScreen: ana,   // home / migrate / analyze — zaten state'de var!
    reporterId: '211118085',
    BugIcon: <Text style={{ fontSize: 22 }}>🐛</Text>,
  }}
  initialPosition={{ bottom: 110, right: 16 }}
/>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0a0a0a' },
  container: { flex: 1, padding: 16 },
  header: { marginVertical: 24 },
  title: { fontSize: 32, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  homeBtn: {
    backgroundColor: '#111', borderRadius: 16, padding: 20,
    marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 16,
    borderWidth: 1, borderColor: '#1e1e1e',
  },
  homeBtnEmoji: { fontSize: 32 },
  homeBtnTitle: { color: '#e8ff00', fontSize: 17, fontWeight: '700', marginBottom: 4 },
  homeBtnDesc: { color: '#666', fontSize: 13 },
  backBtn: { marginBottom: 16 },
  backText: { color: '#666', fontSize: 14 },
  card: { backgroundColor: '#111', borderRadius: 16, padding: 20, marginBottom: 16 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 8 },
  cardDesc: { fontSize: 14, color: '#666', marginBottom: 16, lineHeight: 20 },
  fikirdMsg: { color: '#888', fontSize: 13, fontStyle: 'italic', lineHeight: 18 },
  input: {
    color: '#fff', fontSize: 15, minHeight: 120,
    textAlignVertical: 'top', marginBottom: 16,
    borderWidth: 1, borderColor: '#1e1e1e', borderRadius: 12, padding: 12,
  },
  button: { backgroundColor: '#e8ff00', borderRadius: 12, padding: 16, alignItems: 'center' },
  migrateButton: { backgroundColor: '#3b82f6' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { fontWeight: '800', fontSize: 16, color: '#000' },
  error: { color: '#ef4444', marginBottom: 12, fontSize: 13, textAlign: 'center' },
  sectionTitle: { color: '#888', fontSize: 13, marginBottom: 12, textAlign: 'center' },
  fikırCard: {
    backgroundColor: '#111', borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#1e1e1e',
  },
  fikırBaslik: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  fikırOzet: { color: '#888', fontSize: 13, lineHeight: 18, marginBottom: 8 },
  fikırAnaliz: { color: '#e8ff00', fontSize: 13, fontWeight: '700' },
  deptCard: {
    backgroundColor: '#111', borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#1e1e1e',
  },
  deptCardDone: { borderColor: '#2a2a2a' },
  deptRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deptLabel: { color: '#fff', fontSize: 16, fontWeight: '700' },
  deptDesc: { color: '#666', fontSize: 13, marginTop: 2 },
  deptArrow: { color: '#444', fontSize: 20 },
  deptDetay: { marginTop: 12 },
  deptDetayOzet: { color: '#888', fontSize: 13, lineHeight: 18, marginBottom: 10 },
  deptDetayRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  deptDetayKutu: { flex: 1, backgroundColor: '#0a0a0a', borderRadius: 10, padding: 10 },
  deptDetayLabel: { color: '#555', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  deptDetayText: { color: '#aaa', fontSize: 12, lineHeight: 16 },
  sartRow: { flexDirection: 'row', gap: 4 },
  sartLabel: { color: '#f59e0b', fontSize: 12, fontWeight: '700' },
  sartText: { color: '#ccc', fontSize: 12, flex: 1 },
  kararBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  kararBadgeText: { fontSize: 12, fontWeight: '700', color: '#000' },
  progressText: { color: '#e8ff00', fontSize: 13, textAlign: 'center', marginTop: 8 },
  loadingCard: { alignItems: 'center', padding: 60, gap: 16 },
  loadingText: { color: '#666', fontSize: 14 },
  sentezHeader: {
    backgroundColor: '#111', borderRadius: 16,
    padding: 20, marginBottom: 12, alignItems: 'center',
  },
  artifactLabel: { color: '#555', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
  artifactTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 16, textAlign: 'center' },
  kararBig: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 24, marginBottom: 16 },
  kararBigText: { fontSize: 18, fontWeight: '800', color: '#000' },
  skorRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  skorValue: { fontSize: 48, fontWeight: '900', color: '#fff', lineHeight: 52 },
  skorMax: { fontSize: 18, color: '#555', marginBottom: 6 },
  skorLabel: { color: '#555', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginTop: 4 },
  infoCard: { backgroundColor: '#111', borderRadius: 16, padding: 16, marginBottom: 12 },
  infoLabel: { color: '#555', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 6 },
  infoText: { color: '#ccc', fontSize: 14, lineHeight: 20 },
  deptSonucBlok: { marginBottom: 8 },
  deptSonucRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 6,
  },
  deptSonucIsim: { color: '#ccc', fontSize: 14 },
  deptDivider: { height: 1, backgroundColor: '#1a1a1a', marginVertical: 12 },
  resetButton: {
    borderWidth: 1, borderColor: '#222', borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 4, marginBottom: 40,
  },
  resetText: { color: '#666', fontWeight: '600' },
  failTestBtn: {
  marginTop: 12, padding: 12, borderRadius: 12,
  borderWidth: 1, borderColor: '#333', alignItems: 'center',
},
failTestText: { color: '#555', fontSize: 13 },
});

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Sparkles, 
  History, 
  PhoneCall, 
  TrendingUp, 
  Trash2, 
  HelpCircle, 
  UserCheck, 
  MessageSquare,
  Volume2
} from 'lucide-react';
import { Avatar2D } from './components/Avatar2D';
import { VoiceVisualizer } from './components/VoiceVisualizer';
import { VideoBridge } from './components/VideoBridge';

interface DietLog {
  id: string;
  text: string;
  timestamp: string;
  isUnhealthy: boolean;
  feedback: string;
}

export default function App() {
  const [persona, setPersona] = useState<'junior' | 'senior'>('junior');
  const [dietText, setDietText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechText, setSpeechText] = useState(
    "Merhaba Ceren! Ben diyetisyenin. Bugün neler yediğini sesli dikte edebilir ya da yazabilirsin."
  );
  
  const [stuckCount, setStuckCount] = useState(0);
  const [logs, setLogs] = useState<DietLog[]>([
    {
      id: '1',
      text: "Öğle yemeğinde ızgara tavuk ve yeşil salata yedim.",
      timestamp: "13:30",
      isUnhealthy: false,
      feedback: "Harika bir tercih Ceren! Lif ve protein dengesi mükemmel."
    }
  ]);
  const [showBridge, setShowBridge] = useState(false);

  // Auto trigger speech on launch
  useEffect(() => {
    // Small delay to allow voices to load
    const timer = setTimeout(() => {
      setIsSpeaking(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handler for microphone STT results
  const handleTranscription = (text: string) => {
    setDietText(text);
    // Auto submit to make the experience smooth and fast!
    submitDiet(text);
  };

  // Analyze keywords in logs
  const analyzeDiet = (text: string): { isUnhealthy: boolean; feedback: string } => {
    const textLower = text.toLowerCase();
    
    // Negative phrases or high-calorie diet breaches
    const unhealthyKeywords = [
      'hamburger', 'çikolata', 'bozacağım', 'mutsuzum', 
      'diyetimi bozmak', 'tatlı', 'kola', 'patates', 'cips', 
      'pizza', 'kriz', 'bıktım', 'yemem lazım', 'makarna'
    ];

    const isUnhealthy = unhealthyKeywords.some(keyword => textLower.includes(keyword));

    let feedback = "";
    if (isUnhealthy) {
      if (persona === 'junior') {
        feedback = "Canın tatlı veya hamburger çekebilir Ceren, bu çok normal. Ancak hedeflerimize sadık kalalım. 1 bardak ılık su içip 5 dakika beklemeye ne dersin?";
      } else {
        feedback = "Ceren, hedeflerimizden sapmaya başlıyorsun! Bu kaçamak seni geriye götürecek. Hemen mutfaktan uzaklaş ve kararlı kal.";
      }
    } else {
      if (persona === 'junior') {
        feedback = "Muhteşem bir seçim Ceren! Diyet planımıza tam uyum gösteriyorsun, tebrikler.";
      } else {
        feedback = "Güzel. Disiplin her şeydir Ceren. Aynen bu şekilde istikrarla devam etmelisin.";
      }
    }

    return { isUnhealthy, feedback };
  };

  const submitDiet = (textToSubmit?: string) => {
    const targetText = textToSubmit || dietText;
    if (!targetText.trim()) return;

    const { isUnhealthy, feedback } = analyzeDiet(targetText);

    // Update consecutive negative counts
    if (isUnhealthy) {
      setStuckCount(prev => {
        const next = prev + 1;
        if (next >= 2) {
          // Trigger Video Bridge autonomously!
          triggerExpertCall(feedback);
        } else {
          setSpeechText(feedback);
          setIsSpeaking(true);
        }
        return next;
      });
    } else {
      setStuckCount(0); // Reset count on healthy input
      setSpeechText(feedback);
      setIsSpeaking(true);
    }

    // Add to logs list
    const newLog: DietLog = {
      id: Date.now().toString(),
      text: targetText,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      isUnhealthy,
      feedback
    };

    setLogs(prev => [newLog, ...prev]);
    if (!textToSubmit) setDietText('');
  };

  // Launch Jitsi Video bridge autonomously or manually
  const triggerExpertCall = (customFeedback?: string) => {
    const expertSpeech = persona === 'junior' 
      ? "Ceren, biraz zorlandığını hissediyorum. Gel bir uzmanımızla görüntülü konuşalım, sana çok iyi gelecektir. Köprüyü kuruyorum."
      : "Ceren, diyet kurallarını ciddi derecede ihlal etme eğilimindesin. Hemen gerçek bir diyetisyene bağlanıyorum, bu kriz durumunu birlikte aşalım.";
    
    setSpeechText(expertSpeech);
    setIsSpeaking(true);

    // Slide down WebRTC call panel after speaking starts
    setTimeout(() => {
      setShowBridge(true);
    }, 1800);
  };

  // Switch dietitian personas
  const togglePersona = () => {
    const nextPersona = persona === 'junior' ? 'senior' : 'junior';
    setPersona(nextPersona);
    setStuckCount(0); // Reset trigger on switch

    const welcomeMsg = nextPersona === 'junior'
      ? "Ben Junior Diyetisyen Ceren! Sevecen, anlayışlı ve enerjik yol arkadaşınım. Hadi bana diyetini anlat."
      : "Ben Kıdemli Diyetisyen Ceren. Disiplin, kurallar ve başarı hedeflerimiz. Diyet durumunu dürüstçe raporla.";
    
    setSpeechText(welcomeMsg);
    setIsSpeaking(true);
  };

  // Clear logs
  const clearLogs = () => {
    setLogs([]);
    setStuckCount(0);
  };

  return (
    <div className="app-container">
      {/* App Header */}
      <header className="app-header">
        <div className="app-title-group">
          <h1 className="app-title">Ceren Diyet AI</h1>
          <span className="app-subtitle">Akıllı Diyet & Sesli Takip</span>
        </div>

        {/* Dynamic Persona Switcher */}
        <div 
          className={`persona-badge ${persona}`}
          onClick={togglePersona}
          title="Diyetisyen Personasını Değiştir"
        >
          <UserCheck size={14} />
          {persona === 'junior' ? 'Junior Ceren' : 'Senior Ceren'}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="app-content">
        {/* SVG Viseme Lipsync Avatar Section */}
        <section className="panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="avatar-speech-balloon">
            {speechText}
          </div>
          
          <Avatar2D 
            textToSpeak={speechText}
            isSpeaking={isSpeaking}
            setIsSpeaking={setIsSpeaking}
            voicePitch={persona === 'junior' ? 1.25 : 0.9}
            voiceRate={persona === 'junior' ? 1.05 : 0.92}
          />
        </section>

        {/* Real-time Web Audio API voice viz and microphone input */}
        <section className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} style={{ color: 'var(--color-green)' }} />
            Sesle Rapor Dikte Et
          </h3>
          
          <VoiceVisualizer 
            isRecording={isRecording}
            setIsRecording={setIsRecording}
            onTranscriptionComplete={handleTranscription}
          />
        </section>

        {/* Diet Logging manual panel & text entry */}
        <section className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MessageSquare size={16} style={{ color: 'var(--color-cyan)' }} />
            Manuel Veri Girişi
          </h3>
          <div className="input-group">
            <textarea
              className="textarea-diet"
              placeholder="Yediğiniz besinleri veya hislerinizi yazın..."
              value={dietText}
              onChange={(e) => setDietText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submitDiet();
                }
              }}
            />
            <button 
              className="btn-icon submit"
              onClick={() => submitDiet()}
              title="Rapor Gönder"
            >
              <Plus size={20} />
            </button>
          </div>
        </section>

        {/* Audit Log representation (AuditWidget simulation) */}
        <section className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <History size={16} style={{ color: 'var(--color-purple)' }} />
              Günlük Diyet Günlüğü
            </h3>
            {logs.length > 0 && (
              <button 
                onClick={clearLogs}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem'
                }}
              >
                <Trash2 size={12} />
                Temizle
              </button>
            )}
          </div>

          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {logs.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '20px 0' }}>
                Henüz log girilmedi. Sesli konuşarak log ekleyin!
              </p>
            ) : (
              logs.map(log => (
                <div key={log.id} className={`log-item ${log.isUnhealthy ? 'unhealthy' : ''}`}>
                  <div className="log-item-header">
                    <span>{log.isUnhealthy ? '⚠️ Kaçamak Algılandı' : '✅ Sağlıklı Öğün'}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <p className="log-item-text">{log.text}</p>
                  <p className="log-item-feedback">{log.feedback}</p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Audit Widget / Forge loop monitor status */}
        <section className="panel" style={{ 
          background: 'rgba(168, 85, 247, 0.05)', 
          borderColor: 'rgba(168, 85, 247, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <h4 style={{ fontSize: '0.8rem', color: 'var(--color-purple)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={14} />
            &lt;AuditWidget /&gt; Entegrasyonu
          </h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Aktif Forge Döngüsü: <strong>3 Cycle</strong> • STUCK tespiti: <strong>Heuristik</strong> (Üst üste 2 olumsuz girdi).
          </p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '0.7rem', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-green)', padding: '2px 6px', borderRadius: '4px' }}>Cycle 1: COMMIT</span>
            <span style={{ fontSize: '0.7rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-red)', padding: '2px 6px', borderRadius: '4px' }}>Cycle 2: ROLLBACK</span>
            <span style={{ fontSize: '0.7rem', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-green)', padding: '2px 6px', borderRadius: '4px' }}>Cycle 3: COMMIT</span>
          </div>
        </section>

        {/* Manual Trigger for Bridge calling Jitsi */}
        <button
          onClick={() => triggerExpertCall()}
          style={{
            background: 'linear-gradient(135deg, var(--color-red) 0%, #dc2626 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '16px',
            padding: '14px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.25)',
            transition: 'transform 0.2s',
            marginTop: '10px',
            marginBottom: '10px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <PhoneCall size={18} />
          Diyetisyene Bağlan (Uzman Köprüsü)
        </button>
      </main>

      {/* Floating WebRTC Video Jitsi Bridge */}
      {showBridge && (
        <VideoBridge 
          onClose={() => {
            setShowBridge(false);
            setStuckCount(0); // Reset count upon closing bridge call
          }}
        />
      )}
    </div>
  );
}

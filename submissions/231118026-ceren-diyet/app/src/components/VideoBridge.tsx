import React, { useEffect, useState } from 'react';
import { PhoneOff, Video, ShieldAlert, MonitorUp } from 'lucide-react';

interface VideoBridgeProps {
  onClose: () => void;
  roomNameSuffix?: string;
}

export const VideoBridge: React.FC<VideoBridgeProps> = ({ onClose, roomNameSuffix = 'CerenDiyetBridge_231118026' }) => {
  const [callDuration, setCallDuration] = useState(0);

  // Call timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Securely build the Jitsi Meet Iframe URL
  // We supply config overrides to focus on UI simplicity and activate audio, video, and screen share instantly!
  const jitsiRoomUrl = `https://meet.jit.si/${roomNameSuffix}#config.startWithAudioMuted=false&config.startWithVideoMuted=false&config.prejoinPageEnabled=false&interfaceConfig.TOOLBAR_BUTTONS=["microphone","camera","desktop","hangup"]`;

  return (
    <div className="bridge-window">
      {/* Header Calling UI */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(239, 68, 68, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-red)',
              animation: 'pulse-red 1.5s infinite',
            }}
          />
          <div>
            <h3
              style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-display)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <ShieldAlert size={16} className="neon-glow" style={{ color: 'var(--color-red)' }} />
              Diyetisyen Köprüsü Aktif
            </h3>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              Uzman Bağlantısı kuruldu • Oda: {roomNameSuffix}
            </p>
          </div>
        </div>

        <div
          style={{
            background: 'rgba(0,0,0,0.4)',
            padding: '6px 12px',
            borderRadius: '10px',
            fontSize: '0.8rem',
            fontFamily: 'monospace',
            color: 'var(--color-red)',
            fontWeight: 'bold',
          }}
        >
          {formatTime(callDuration)}
        </div>
      </div>

      {/* Embedded WebRTC View */}
      <div style={{ flex: 1, position: 'relative', width: '100%' }}>
        <iframe
          src={jitsiRoomUrl}
          allow="camera; microphone; display-capture; autoplay; clipboard-write"
          className="jitsi-frame"
          title="Jitsi Meet Expert Video Call"
        />
      </div>

      {/* Calling Actions Footer */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(7, 10, 16, 0.95)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <MonitorUp size={14} style={{ color: 'var(--color-cyan)' }} />
          Ses + Görüntü + Ekran Paylaşımı Aktif
        </span>

        <button
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--color-red)',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '14px',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#dc2626';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-red)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <PhoneOff size={16} />
          Görüşmeyi Sonlandır
        </button>
      </div>
    </div>
  );
};

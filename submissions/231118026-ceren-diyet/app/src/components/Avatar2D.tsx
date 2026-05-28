import React, { useEffect, useState, useRef } from 'react';

interface Avatar2DProps {
  textToSpeak: string;
  isSpeaking: boolean;
  setIsSpeaking: (speaking: boolean) => void;
  voicePitch: number;
  voiceRate: number;
}

export const Avatar2D: React.FC<Avatar2DProps> = ({
  textToSpeak,
  isSpeaking,
  setIsSpeaking,
  voicePitch,
  voiceRate,
}) => {
  const [mouthShape, setMouthShape] = useState<'smile' | 'wide' | 'round' | 'flat' | 'open'>('smile');
  const [isBlinking, setIsBlinking] = useState(false);
  const [headOffset, setHeadOffset] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Blinking cycle
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 4000);
    return () => clearInterval(blinkInterval);
  }, []);

  // Head idle motion
  useEffect(() => {
    let frame = 0;
    const animateHead = () => {
      frame += 0.05;
      setHeadOffset(Math.sin(frame) * 2);
      requestAnimationFrame(animateHead);
    };
    const animId = requestAnimationFrame(animateHead);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Lipsync Speech Synthesis trigger
  useEffect(() => {
    if (isSpeaking && textToSpeak) {
      // Cancel any ongoing speaking
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utteranceRef.current = utterance;
      utterance.lang = 'tr-TR';
      utterance.pitch = voicePitch;
      utterance.rate = voiceRate;

      // Find a Turkish voice if available
      const voices = window.speechSynthesis.getVoices();
      const trVoice = voices.find(v => v.lang.includes('TR') || v.lang.includes('tr'));
      if (trVoice) {
        utterance.voice = trVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setMouthShape('smile');
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setMouthShape('smile');
      };

      // Boundary event (fired for words/sentences)
      // We will modulate the mouth shape rapidly during speech to simulate actual syllable articulation!
      let mouthToggle = false;
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          // Rapidly toggle between different open/closed shapes based on current word boundary
          const shapes: ('wide' | 'round' | 'flat' | 'open')[] = ['wide', 'round', 'open', 'flat'];
          const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
          setMouthShape(randomShape);
          
          // Fast reset to flat/smile after boundary
          setTimeout(() => {
            if (window.speechSynthesis.speaking) {
              setMouthShape(mouthToggle ? 'flat' : 'open');
              mouthToggle = !mouthToggle;
            }
          }, 80);
        }
      };

      window.speechSynthesis.speak(utterance);
    } else {
      window.speechSynthesis.cancel();
      setMouthShape('smile');
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [isSpeaking, textToSpeak, voicePitch, voiceRate]);

  // SVG paths for different mouth shapes (visemes)
  const getMouthPath = () => {
    switch (mouthShape) {
      case 'smile':
        return 'M 90,145 Q 100,155 110,145'; // Gentle smile arc
      case 'wide':
        return 'M 88,143 Q 100,165 112,143 Q 100,135 88,143'; // Wide open mouth
      case 'round':
        return 'M 93,143 Q 100,153 107,143 Q 100,133 93,143'; // O shape mouth
      case 'flat':
        return 'M 90,145 L 110,145'; // Flat neutral line
      case 'open':
        return 'M 88,141 Q 100,160 112,141 M 88,141 L 112,141'; // Standard open speak
      default:
        return 'M 90,145 Q 100,155 110,145';
    }
  };

  return (
    <div className="avatar-wrapper">
      <svg
        width="200"
        height="220"
        viewBox="0 0 200 200"
        style={{
          transform: `translateY(${headOffset}px) scale(1.15)`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        {/* Soft Shadow */}
        <ellipse cx="100" cy="185" rx="50" ry="10" fill="rgba(0, 0, 0, 0.25)" />

        <g id="avatar-head">
          {/* Hair back */}
          <path
            d="M 50,80 Q 100,20 150,80 Q 160,130 150,170 Q 100,180 50,170 Q 40,130 50,80"
            fill="#2c1a11"
          />

          {/* Neck */}
          <rect x="90" y="140" width="20" height="35" rx="5" fill="#fbcfe8" />
          <path d="M 90,165 Q 100,175 110,165" fill="#db2777" opacity="0.15" />

          {/* Face */}
          <circle cx="100" cy="100" r="55" fill="#fed7aa" />

          {/* Blushing cheeks */}
          <circle cx="65" cy="120" r="10" fill="#f43f5e" opacity="0.25" />
          <circle cx="135" cy="120" r="10" fill="#f43f5e" opacity="0.25" />

          {/* Hair front / Bangs */}
          <path
            d="M 45,75 Q 100,30 155,75 Q 160,50 145,35 Q 100,20 55,35 Q 40,50 45,75 Z"
            fill="#3d2517"
          />
          <path
            d="M 45,75 Q 70,55 90,65 Q 100,55 115,65 Q 130,55 155,75 Q 140,45 100,45 Q 60,45 45,75"
            fill="#1e100a"
          />

          {/* Eyes (Blinking support) */}
          {isBlinking ? (
            <>
              {/* Left closed eye */}
              <path d="M 68,95 Q 75,95 82,95" stroke="#3d2517" strokeWidth="3" strokeLinecap="round" fill="none" />
              {/* Right closed eye */}
              <path d="M 118,95 Q 125,95 132,95" stroke="#3d2517" strokeWidth="3" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              {/* Left eye open */}
              <ellipse cx="75" cy="95" rx="8" ry="10" fill="#fafafa" />
              <circle cx="76" cy="95" r="5" fill="#0284c7" />
              <circle cx="74" cy="92" r="2" fill="#ffffff" /> {/* Eye reflection */}
              
              {/* Right eye open */}
              <ellipse cx="125" cy="95" rx="8" ry="10" fill="#fafafa" />
              <circle cx="124" cy="95" r="5" fill="#0284c7" />
              <circle cx="126" cy="92" r="2" fill="#ffffff" /> {/* Eye reflection */}
            </>
          )}

          {/* Cute Eyebrows */}
          <path
            d="M 65,82 Q 75,77 85,82"
            stroke="#3d2517"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 115,82 Q 125,77 135,82"
            stroke="#3d2517"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Red glasses frame to represent Ceren's style */}
          <circle cx="75" cy="96" r="16" stroke="#ef4444" strokeWidth="3.5" fill="none" />
          <circle cx="125" cy="96" r="16" stroke="#ef4444" strokeWidth="3.5" fill="none" />
          <line x1="91" y1="96" x2="109" y2="96" stroke="#ef4444" strokeWidth="3.5" />

          {/* Cute Nose */}
          <path d="M 98,112 Q 100,118 102,112" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Lipsync Mouth Path */}
          <path
            d={getMouthPath()}
            stroke="#b91c1c"
            strokeWidth="4"
            strokeLinecap="round"
            fill={mouthShape === 'wide' || mouthShape === 'open' || mouthShape === 'round' ? '#b91c1c' : 'none'}
            style={{ transition: 'd 0.06s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </g>

        {/* Fancy Clothes Collar */}
        <path d="M 70,170 L 100,195 L 130,170 Q 150,195 160,200 L 40,200 Q 50,195 70,170" fill="#a855f7" />
        <path d="M 85,170 L 100,190 L 115,170" fill="#fed7aa" />
      </svg>

      {/* Mic status indicator */}
      {isSpeaking && (
        <span
          style={{
            marginTop: '8px',
            fontSize: '0.75rem',
            color: 'var(--color-cyan)',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            animation: 'pulse-cyan 1.5s infinite',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-cyan)',
            }}
          ></span>
          Diyetisyen Konuşuyor
        </span>
      )}
    </div>
  );
};

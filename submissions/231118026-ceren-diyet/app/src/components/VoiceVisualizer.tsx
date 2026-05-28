import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceVisualizerProps {
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  onTranscriptionComplete: (text: string) => void;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  isRecording,
  setIsRecording,
  onTranscriptionComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  // Fallback simulation wave height
  const simVolumeRef = useRef<number>(0);

  // Toggle microphone
  const toggleRecording = async () => {
    if (isRecording) {
      stopMicrophone();
      setIsRecording(false);
      // Simulate STT conversion after recording stops
      triggerMockSTT();
    } else {
      setMicError(null);
      const started = await startMicrophone();
      if (started) {
        setIsRecording(true);
      } else {
        // Fallback simulation recording if mic fails or permission denied
        setIsRecording(true);
        simVolumeRef.current = 0.1;
      }
    }
  };

  // Mock speech to text triggers based on dietitian context
  const triggerMockSTT = () => {
    const mockPhrases = [
      "Bugün canım çok sıkkın, diyetimi bozmak üzereyim.",
      "Hamburger yiyeceğim sanırım, kendimi tutamıyorum.",
      "Harika bir gün geçirdim, sağlıklı beslendim.",
      "Çok mutsuzum, bu diyet programı çok zor.",
      "Akşam yemeğinde haşlanmış sebze ve tavuk yedim.",
      "Çok tatlı krizim var, çikolata yiyeceğim!"
    ];
    const randomPhrase = mockPhrases[Math.floor(Math.random() * mockPhrases.length)];
    onTranscriptionComplete(randomPhrase);
  };

  const startMicrophone = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      return true;
    } catch (err: any) {
      console.warn("Microphone access denied or unavailable. Falling back to voice simulation.", err);
      setMicError("Mikrofon izni verilmedi. Simüle mod aktif.");
      return false;
    }
  };

  const stopMicrophone = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  };

  useEffect(() => {
    return () => {
      stopMicrophone();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // OpenAI Voice-Mode Sinewave loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      let amplitude = 2; // Flat baseline amplitude

      if (isRecording) {
        if (analyserRef.current) {
          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyserRef.current.getByteTimeDomainData(dataArray);

          // Calculate RMS (Root Mean Square) for voice amplitude
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            const v = (dataArray[i] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / bufferLength);

          // Map RMS to visual wave amplitude (with noise floor filter)
          if (rms > 0.01) {
            amplitude = rms * 90;
          } else {
            amplitude = 2; // Silent ambient flutter
          }
        } else {
          // Simulation amplitude (simulates natural breathing and speaking voice)
          simVolumeRef.current += (Math.random() - 0.5) * 0.15;
          simVolumeRef.current = Math.max(0.1, Math.min(0.8, simVolumeRef.current));
          amplitude = 12 + Math.sin(phase * 4) * 8 + simVolumeRef.current * 30;
        }
      }

      phase += 0.07; // Speed of horizontal flow

      // Draw three overlays of beautiful liquid sinewaves (neon styling)
      drawWave(ctx, width, height, phase, amplitude, 'rgba(34, 197, 94, 0.45)', 2);
      drawWave(ctx, width, height, phase + 1.2, amplitude * 0.7, 'rgba(6, 182, 212, 0.45)', 1.5);
      drawWave(ctx, width, height, phase + 2.5, amplitude * 0.5, 'rgba(168, 85, 247, 0.45)', 1.2);

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording]);

  const drawWave = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    phase: number,
    amp: number,
    color: string,
    lineWidth: number
  ) => {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;

    for (let x = 0; x < w; x++) {
      // Gaussian distribution envelope so waves taper down at the edges (OpenAI style)
      const envelope = Math.exp(-Math.pow((x - w / 2) / (w / 3), 2));
      const y = h / 2 + Math.sin(x * 0.025 + phase) * amp * envelope;

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset shadow for efficiency
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        gap: '8px',
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '70px' }}>
        <canvas
          ref={canvasRef}
          width="380"
          height="70"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '12px',
            background: 'rgba(0,0,0,0.15)',
          }}
        />
      </div>

      <button
        className={`btn-icon ${isRecording ? 'active' : ''}`}
        onClick={toggleRecording}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          boxShadow: isRecording ? '0 0 15px var(--color-red)' : 'none',
        }}
        title="Mikrofonu Aç/Kapat"
      >
        {isRecording ? <Mic size={24} /> : <MicOff size={24} />}
      </button>

      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        {isRecording ? "Dinleniyor... Konuşmayı bitirmek için tekrar tıklayın" : "Mikrofonu açıp konuşmayı dikte edin"}
      </span>

      {micError && (
        <span style={{ fontSize: '0.7rem', color: 'var(--color-purple)', fontStyle: 'italic' }}>
          {micError}
        </span>
      )}
    </div>
  );
};

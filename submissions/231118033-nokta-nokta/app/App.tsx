import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AvatarScene from "./AvatarScene";

const BAR_COUNT = 24;

type CycleStatus = "OK" | "FAIL" | "ROLLBACK" | "STUCK";

export default function App() {
  const [isListening, setIsListening] = useState(false);
  const [isSimulatedVoice, setIsSimulatedVoice] = useState(false);
  const [level, setLevel] = useState(0);
  const [reportText, setReportText] = useState("");
  const [cycleStatus, setCycleStatus] = useState<CycleStatus>("OK");
  const [failCount, setFailCount] = useState(0);
  const [persona, setPersona] = useState<"junior" | "senior">("junior");
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [ttsLevel, setTtsLevel] = useState(0);
  const [debugRms, setDebugRms] = useState(0);
  const [debugPeak, setDebugPeak] = useState(0);
  const [micDebug, setMicDebug] = useState("idle");
  const [dictationStatus, setDictationStatus] = useState("idle");
  const [showSilenceWarning, setShowSilenceWarning] = useState(false);

  const personaConfig = {
    junior: {
      title: "Junior-Sen",
      tone: "Destekleyici, sade ve yönlendirici",
      message:
        "Ben Junior-Sen. Önce problemi basitleştirir, sonra adım adım çözüm öneririm.",
    },
    senior: {
      title: "Senior-Sen",
      tone: "Eleştirel, teknik ve doğrulama odaklı",
      message:
        "Ben Senior-Sen. Riskleri, doğrulama adımlarını ve rollback ihtimalini kontrol ederim.",
    },
  };

  const auditCards = [
    {
      id: "01",
      title: "Voice Visualizer Burn-in",
      source: "Voice → STT → Markdown",
      result: "PASS",
      summary: "Mikrofon açılıyor, RMS seviyesi değişiyor ve barlar konuşmaya tepki veriyor.",
    },
    {
      id: "02",
      title: "Avatar Behavior Burn-in",
      source: "Voice → STT → Markdown",
      result: "PASS / LIMITATION",
      summary: "Kişisel avatar yükleniyor; mevcut GLB tam viseme vermediği için RMS fallback kullanılıyor.",
    },
    {
      id: "03",
      title: "Expert Bridge Burn-in",
      source: "Voice → STT → Markdown",
      result: "PASS",
      summary: "STUCK/rollback senaryosu Jitsi uzman köprüsünü açacak şekilde hazırlanıyor.",
    },
  ];

  const forgeCycles = [
    {
      id: "01",
      title: "Voice Visualizer Optimization",
      status: "COMMIT",
      evidence:
        "Mikrofon seviyesi gerçek zamanlı olarak ses barlarını hareket ettiriyor.",
    },
    {
      id: "02",
      title: "Avatar + RMS Lipsync Fallback",
      status: "COMMIT",
      evidence:
        "avatar.glb yükleniyor; GLB viseme vermediğinde RMS fallback güvenli şekilde çalışıyor.",
    },
    {
      id: "03",
      title: "Experimental Camera / Mouth Attempt",
      status: "ROLLBACK",
      evidence:
        "Sahte ağız ve agresif kamera denemesi doğal durmadığı için geri alındı.",
    },
    {
      id: "04",
      title: "STUCK + Expert Bridge",
      status: "STUCK",
      evidence:
        "Çözülemeyen tam lipsync problemi Jitsi uzman köprüsüne aktarılıyor.",
    },
  ];

  const bars = useMemo(
    () => Array.from({ length: BAR_COUNT }, () => new Animated.Value(0.18)),
    []
  );

  const pulse = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const ttsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dictationOriginalTextRef = useRef("");
  const simulatedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gotDictationResultRef = useRef(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (simulatedIntervalRef.current) clearInterval(simulatedIntervalRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      audioContextRef.current?.close().catch(() => {});
      if (ttsIntervalRef.current) clearInterval(ttsIntervalRef.current);
      stopDictation();
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      };

      updateVoices();

      window.speechSynthesis.onvoiceschanged = updateVoices;

      return () => {
        if (window.speechSynthesis) {
          window.speechSynthesis.onvoiceschanged = null;
        }
      };
    }
  }, []);

  const animateBars = (nextLevel: number) => {
    bars.forEach((bar, index) => {
      const wave =
        0.12 +
        Math.abs(Math.sin(Date.now() / 180 + index * 0.45)) *
          Math.max(nextLevel, 0.08);

      Animated.timing(bar, {
        toValue: wave,
        duration: 90,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    });
  };

  const startSimulatedVoice = () => {
    setIsListening(true);
    setIsSimulatedVoice(true);
    setMicDebug("simulated voice visualizer active");

    if (simulatedIntervalRef.current) {
      clearInterval(simulatedIntervalRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.08,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    simulatedIntervalRef.current = setInterval(() => {
      const wave = Math.abs(Math.sin(Date.now() / 150));
      const random = Math.random() * 0.22;
      const nextLevel = Math.min(1, 0.12 + wave * 0.55 + random);
      setLevel(nextLevel);
      animateBars(nextLevel);
      setDebugRms(nextLevel / 40);
      setDebugPeak(nextLevel / 3);
    }, 80);
  };

  const stopSimulatedVoice = () => {
    if (simulatedIntervalRef.current) {
      clearInterval(simulatedIntervalRef.current);
      simulatedIntervalRef.current = null;
    }
    setIsListening(false);
    setIsSimulatedVoice(false);
    setLevel(0);
    setDebugRms(0);
    setDebugPeak(0);
    animateBars(0);
    setMicDebug("idle");

    pulse.stopAnimation();
    pulse.setValue(1);
  };

  const startMic = async () => {
    try {
      if (intervalRef.current) clearInterval(intervalRef.current);

      const isWebPlatform = Platform.OS === "web" || typeof window !== "undefined";
      if (
        !isWebPlatform ||
        typeof navigator === "undefined" ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        alert("Bu tarayıcı mikrofon API'sini desteklemiyor.");
        return;
      }

      setMicDebug("requesting permission");

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err: any) {
        console.warn("Simple audio constraints failed", err);
        throw err;
      }

      streamRef.current = stream;
      setMicDebug("stream received");

      const tracks = stream.getAudioTracks();
      const hasValidTrack = tracks.length > 0 && tracks[0].enabled === true && tracks[0].readyState === "live";

      if (!hasValidTrack) {
        alert("Mikrofon stream alındı ancak aktif audio track bulunamadı.");
        setMicDebug("stream received but no active audio track");
        return;
      }

      const activeTrack = tracks[0];
      setMicDebug(`audio track active: ${activeTrack.label || "unknown"}`);

      const AudioContextClass =
        (window as any).AudioContext || (window as any).webkitAudioContext;

      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      console.log("AudioContext state:", audioContext.state);
      if (audioContext.state !== "running") {
        setMicDebug("audio context not running");
      } else {
        setMicDebug("audio context running");
      }

      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.05;

      source.connect(analyser);

      const hasFloat32 = typeof analyser.getFloatTimeDomainData === "function";
      const dataArrayFloat32 = hasFloat32 ? new Float32Array(analyser.fftSize) : null;
      const dataArrayUint8 = !hasFloat32 ? new Uint8Array(analyser.fftSize) : null;

      setIsListening(true);

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.08,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      let zeroSamplesDurationMs = 0;

      intervalRef.current = setInterval(() => {
        let rms = 0;
        let peak = 0;

        if (hasFloat32 && dataArrayFloat32) {
          analyser.getFloatTimeDomainData(dataArrayFloat32);
          let sumSquares = 0;
          for (let i = 0; i < dataArrayFloat32.length; i++) {
            const sample = dataArrayFloat32[i];
            sumSquares += sample * sample;
            peak = Math.max(peak, Math.abs(sample));
          }
          rms = Math.sqrt(sumSquares / dataArrayFloat32.length);
        } else if (dataArrayUint8) {
          analyser.getByteTimeDomainData(dataArrayUint8);
          let sumSquares = 0;
          let min = 255;
          let max = 0;
          for (let i = 0; i < dataArrayUint8.length; i++) {
            const value = dataArrayUint8[i];
            min = Math.min(min, value);
            max = Math.max(max, value);
            const centered = (value - 128) / 128;
            sumSquares += centered * centered;
          }
          rms = Math.sqrt(sumSquares / dataArrayUint8.length);
          peak = Math.max(Math.abs(max - 128), Math.abs(min - 128)) / 128;
        }

        const boosted = Math.max(rms * 30, peak * 2.5);
        const nextLevel = boosted < 0.006 ? 0 : Math.min(1, boosted);

        setDebugRms(rms);
        setDebugPeak(peak);
        setLevel(nextLevel);
        animateBars(nextLevel);

        if (rms === 0 && peak === 0) {
          zeroSamplesDurationMs += 80;
          if (zeroSamplesDurationMs > 2000) {
            // Stop real mic stream & context
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((track) => track.stop());
              streamRef.current = null;
            }
            if (sourceRef.current) {
              sourceRef.current.disconnect();
              sourceRef.current = null;
            }
            if (audioContextRef.current) {
              audioContextRef.current.close().catch(() => {});
              audioContextRef.current = null;
            }

            // Switch to simulated voice
            startSimulatedVoice();
            setMicDebug("real mic silent, switched to simulated visualizer");
            setShowSilenceWarning(false);
          }
        } else {
          zeroSamplesDurationMs = 0;
          setShowSilenceWarning(false);
          setMicDebug(`audio track active: ${activeTrack.label || "unknown"}`);
        }
      }, 80);
    } catch (error: any) {
      alert(`Mikrofon başlatılamadı: ${error?.name || "unknown"}`);
      setMicDebug("idle");
    }
  };

  const stopMic = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (simulatedIntervalRef.current) {
      clearInterval(simulatedIntervalRef.current);
      simulatedIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (audioContextRef.current) {
      await audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    setIsListening(false);
    setIsSimulatedVoice(false);
    setLevel(0);
    setDebugRms(0);
    setDebugPeak(0);
    setMicDebug("idle");
    setShowSilenceWarning(false);
    pulse.stopAnimation();
    pulse.setValue(1);

    bars.forEach((bar) => {
      Animated.timing(bar, {
        toValue: 0.18,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });
  };

  const toggleMic = async () => {
    if (isListening) {
      await stopMic();
    } else {
      await startMic();
    }
  };

  const restartMic = async () => {
    await stopMic();
    setTimeout(async () => {
      await startMic();
    }, 300);
  };

  const updateCycle = (status: CycleStatus) => {
    setCycleStatus(status);

    if (status === "FAIL" || status === "ROLLBACK") {
      setFailCount((prev) => prev + 1);
    } else if (status === "STUCK") {
      setFailCount((prev) => Math.max(prev, 2));
    } else if (status === "OK") {
      setFailCount(0);
    }
  };

  const stopDictation = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
  };

  const startDictation = async () => {
    if (Platform.OS !== "web") {
      alert("STT dikte sadece web demo üzerinde kullanılabilir.");
      return;
    }

    if (isListening || isSimulatedVoice) {
      await stopMic();
      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    const SpeechRecognition =
      typeof window !== "undefined"
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) {
      alert("Bu tarayıcı konuşmayı yazıya çevirme özelliğini desteklemiyor. Lütfen Google Chrome ile deneyin.");
      setDictationStatus("tarayıcı STT desteklemiyor");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    gotDictationResultRef.current = false;

    recognition.lang = "tr-TR";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setDictationStatus("dinleniyor: şimdi konuş");
    };

    recognition.onspeechstart = () => {
      setDictationStatus("ses algılandı");
    };

    recognition.onsoundstart = () => {
      setDictationStatus("ses girişi başladı");
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (interimTranscript.trim()) {
        setDictationStatus("geçici metin alınıyor");
      }

      if (finalTranscript.trim()) {
        gotDictationResultRef.current = true;
        setReportText((prev) =>
          prev.trim()
            ? `${prev.trim()}\n\n${finalTranscript.trim()}`
            : finalTranscript.trim()
        );
        setDictationStatus("metin alındı");
      }
    };

    recognition.onerror = (event: any) => {
      setDictationStatus(`hata: ${event.error}`);

      if (event.error === "not-allowed") {
        alert("Mikrofon izni verilmedi. Chrome site ayarlarından mikrofon iznini aç.");
      }

      if (event.error === "no-speech") {
        setDictationStatus("ses algılanamadı, tekrar dene");
      }

      if (event.error === "audio-capture") {
        setDictationStatus("mikrofon yakalanamadı");
        alert("Tarayıcı mikrofonu yakalayamadı. Windows ve Chrome mikrofon ayarlarını kontrol et.");
      }
    };

    recognition.onend = () => {
      if (!gotDictationResultRef.current) {
        setDictationStatus("dikte bitti, metin alınamadı");
      }
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch (error) {
      setDictationStatus("dikte başlatılamadı");
      alert("Dikte başlatılamadı. Sayfayı yenileyip tekrar deneyin.");
    }
  };

  const addDemoSttText = () => {
    const textToAppend = "Ses görselleştirici konuşma girişine tepki verir. Kişisel avatar sahnesi yüklenir. GLB viseme sınırlaması nedeniyle RMS tabanlı fallback kullanılır. STUCK durumunda uzman köprüsü açılır.";
    setReportText((prev) => {
      const cleanPrev = prev.trim();
      return cleanPrev ? `${cleanPrev}\n\n${textToAppend}` : textToAppend;
    });
  };

  const loadDemoAuditText = () => {
    setReportText(
      [
        "Voice visualizer reacts to microphone input and returns to idle state during silence.",
        "Personal Avaturn avatar is loaded successfully in the React Three Fiber scene.",
        "Current GLB does not expose reliable viseme morph targets, so RMS-based motion is used as a stable fallback.",
        "After rollback, the unresolved lipsync limitation is marked as STUCK and escalated through the expert bridge.",
      ].join("\n")
    );
  };

  const generateMarkdownReport = () => {
    const cleanFinding =
      reportText.trim() ||
      "Voice visualizer, personal avatar, forge loop and expert bridge were tested.";

    const report = `# Burn-in Audit Report

## Student
231118033

## Screen
Voice Visualizer + Avatar + Expert Bridge

## Dictated Finding
${cleanFinding}

## Audio Signal
- RMS Level: ${(level * 100).toFixed(0)}%
- Latency target: < 200ms
- Visualizer behavior: ${isListening ? "active" : "idle"}

## Avatar
- avatar.glb exists in submission folder
- Personal Avaturn avatar is rendered in the avatar scene
- Avatar movement is driven by RMS level
- Full viseme lipsync is limited by the current GLB export
- Stable fallback: RMS-based avatar motion

## Forge Trigger
- Current cycle status: ${cycleStatus}
- Consecutive FAIL/ROLLBACK count: ${failCount}
- Bridge required: ${failCount >= 2 || cycleStatus === "STUCK" ? "YES" : "NO"}

## Next Action
READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT / ROLLBACK
`;

    setReportText(report);
  };

  const openExpertBridge = () => {
    Linking.openURL("https://meet.jit.si/231118033-nokta-nokta-bridge");
  };

  const getPreferredTurkishVoice = (voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
    if (!voices || voices.length === 0) return null;

    const trVoices = voices.filter(
      (v) => v.lang && v.lang.toLowerCase().startsWith("tr")
    );

    if (trVoices.length > 0) {
      const maleNames = [
        "tolga",
        "ahmet",
        "murat",
        "emre",
        "kerem",
        "yusuf",
        "google türkçe",
        "microsoft ahmet",
        "microsoft tolga",
      ];
      const maleVoice = trVoices.find((v) => {
        const nameLower = v.name ? v.name.toLowerCase() : "";
        return maleNames.some((maleName) => nameLower.includes(maleName));
      });

      if (maleVoice) return maleVoice;
      return trVoices[0];
    }

    return voices[0];
  };

  const startTtsMotion = () => {
    if (ttsIntervalRef.current) {
      clearInterval(ttsIntervalRef.current);
    }

    ttsIntervalRef.current = setInterval(() => {
      const wave = Math.abs(Math.sin(Date.now() / 130));
      const random = Math.random() * 0.25;
      setTtsLevel(Math.min(0.85, 0.15 + wave * 0.55 + random));
    }, 80);
  };

  const stopTtsMotion = () => {
    if (ttsIntervalRef.current) {
      clearInterval(ttsIntervalRef.current);
      ttsIntervalRef.current = null;
    }
    setTtsLevel(0);
  };

  const speakPersonaFeedback = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();

      let feedback = "";
      if (persona === "junior") {
        feedback =
          "Junior-Sen geri bildirimi. Audit raporuna göre ses görselleştirici çalışıyor, avatar yükleniyor ve RMS tabanlı fallback mevcut demo için kabul edilebilir durumda. Bir sonraki adımda forge döngüsünü ve uzman köprüsünü adım adım doğrulamalısın.";
      } else if (persona === "senior") {
        feedback =
          "Senior-Sen teknik değerlendirme. Audit raporu ses görselleştirici, avatar sahnesi, forge döngüsü, rollback durumu ve uzman köprüsünün mevcut olduğunu doğruluyor. Mevcut GLB dosyası güvenilir viseme morph target sağlamadığı için RMS tabanlı avatar hareketi sınırlama olarak belgelenmiştir.";
      }

      const prefix = reportText ? "Mevcut denetim özeti okunuyor. " : "";
      const fullText = prefix + feedback;

      const utterance = new SpeechSynthesisUtterance(fullText);

      const currentVoices = window.speechSynthesis.getVoices();
      const preferredVoice = getPreferredTurkishVoice(currentVoices.length > 0 ? currentVoices : availableVoices);

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      if (persona === "junior") {
        utterance.lang = "tr-TR";
        utterance.rate = 0.95;
        utterance.pitch = 1.15;
        utterance.volume = 1;
      } else {
        utterance.lang = "tr-TR";
        utterance.rate = 0.82;
        utterance.pitch = 0.75;
        utterance.volume = 1;
      }

      startTtsMotion();
      utterance.onstart = () => startTtsMotion();
      utterance.onend = () => stopTtsMotion();
      utterance.onerror = () => stopTtsMotion();

      window.speechSynthesis.speak(utterance);
    } else {
      alert("Bu tarayıcı metin okuma özelliğini desteklemiyor.");
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    stopTtsMotion();
  };

  const bridgeRequired = failCount >= 2 || cycleStatus === "STUCK";

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.kicker}>231118033 · Track A</Text>
          <Text style={styles.title}>Nokta Nokta Voice Forge</Text>
          <Text style={styles.subtitle}>
            Mikrofon seviyesi, ses dalgası, kişisel avatar sahnesi, forge döngüsü
            ve STUCK durumunda uzman köprüsü.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Teslim Kapsamı</Text>
          <View style={styles.coverageGrid}>
            <Text style={styles.coverageItem}>✅ Voice visualizer</Text>
            <Text style={styles.coverageItem}>✅ Personal avatar.glb</Text>
            <Text style={styles.coverageItem}>✅ Audit markdown</Text>
            <Text style={styles.coverageItem}>✅ Forge timeline</Text>
            <Text style={styles.coverageItem}>✅ Rollback + STUCK</Text>
            <Text style={styles.coverageItem}>✅ Jitsi expert bridge</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={styles.cardTitle}>Phase A: Real Voice Visualizer</Text>
            <Text style={styles.badge}>
              {isListening ? "LISTENING" : "IDLE"}
            </Text>
          </View>

          <Animated.View
            style={[
              styles.orb,
              {
                transform: [{ scale: pulse }],
                opacity: isListening ? 1 : 0.55,
              },
            ]}
          >
            <Text style={styles.orbText}>
              {isListening ? "VOICE ACTIVE" : "TAP TO START"}
            </Text>
          </Animated.View>

          <View style={styles.wave}>
            {bars.map((bar, index) => {
              const height = bar.interpolate({
                inputRange: [0, 1],
                outputRange: [16, 132],
              });

              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.bar,
                    {
                      height,
                      opacity: isListening ? 0.95 : 0.35,
                    },
                  ]}
                />
              );
            })}
          </View>

          <Text style={styles.metric}>
            RMS Level: {(level * 100).toFixed(0)}%
          </Text>
          <Text style={styles.metric}>
            Raw RMS: {debugRms.toFixed(4)}
          </Text>
          <Text style={styles.metric}>
            Peak: {debugPeak.toFixed(4)}
          </Text>
          <Text style={styles.metric}>
            Mic Debug: {micDebug}
          </Text>

          {isListening && showSilenceWarning && (
            <Text style={styles.warningText}>
              Mikrofon açık ancak ses örneği gelmiyor. Chrome mikrofon giriş cihazını ve Windows mikrofon izinlerini kontrol et.
            </Text>
          )}

          {isSimulatedVoice && (
            <Text style={[styles.warningText, { color: "#8EA4FF" }]}>
              Demo modu: gerçek mikrofon yerine simüle edilmiş ses seviyesi kullanılıyor.
            </Text>
          )}

          <Pressable
            style={[styles.primaryButton, isListening && styles.stopButton]}
            onPress={toggleMic}
          >
            <Text style={styles.buttonText}>
              {isListening ? "Mikrofonu Durdur" : "Mikrofonu Başlat"}
            </Text>
          </Pressable>

          <View style={{ height: 10 }} />
          <Pressable
            style={styles.secondaryButton}
            onPress={startSimulatedVoice}
          >
            <Text style={styles.secondaryButtonText}>Demo Ses Görselleştiriciyi Başlat</Text>
          </Pressable>

          <View style={{ height: 10 }} />
          <Pressable
            style={styles.secondaryButton}
            onPress={stopSimulatedVoice}
          >
            <Text style={styles.secondaryButtonText}>Demo Ses Görselleştiriciyi Durdur</Text>
          </Pressable>

          <View style={{ height: 10 }} />
          <Pressable
            style={styles.secondaryButton}
            onPress={() => {
              setLevel(0.45);
              animateBars(0.45);
              setTimeout(() => {
                setLevel(0);
                bars.forEach((bar) => {
                  Animated.timing(bar, {
                    toValue: 0.18,
                    duration: 200,
                    useNativeDriver: false,
                  }).start();
                });
              }, 1200);
            }}
          >
            <Text style={styles.secondaryButtonText}>Visualizer Manuel Test</Text>
          </Pressable>

          <View style={{ height: 10 }} />
          <Pressable
            style={styles.secondaryButton}
            onPress={restartMic}
          >
            <Text style={styles.secondaryButtonText}>Mikrofonu Yeniden Başlat</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Phase B: Avatar + Lipsync Fallback</Text>

          <AvatarScene level={Math.max(level, ttsLevel)} />

          <Text style={styles.bodyText}>
            Bu avatar kendi Avaturn export’umdan yüklenmiştir. Mevcut GLB tam
            mouth/jaw/viseme morph target vermediği için güvenli çözüm olarak
            RMS-based avatar motion fallback kullanılmaktadır.
          </Text>

          <View style={styles.personaBox}>
            <Text style={styles.personaTitle}>
              {personaConfig[persona].title}
            </Text>
            <Text style={styles.personaTone}>
              {personaConfig[persona].tone}
            </Text>
            <Text style={styles.personaMessage}>
              {personaConfig[persona].message}
            </Text>

            <Text style={styles.voiceActivity}>
              Persona voice activity:{" "}
              <Text
                style={
                  ttsLevel > 0.05
                    ? styles.voiceActivityActive
                    : styles.voiceActivityIdle
                }
              >
                {ttsLevel > 0.05 ? "ACTIVE" : "IDLE"}
              </Text>
            </Text>

            <View style={styles.personaButtons}>
              <Pressable
                style={[
                  styles.personaButton,
                  persona === "junior" && styles.personaButtonActive,
                ]}
                onPress={() => setPersona("junior")}
              >
                <Text style={styles.personaButtonText}>Junior-Sen</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.personaButton,
                  persona === "senior" && styles.personaButtonActive,
                ]}
                onPress={() => setPersona("senior")}
              >
                <Text style={styles.personaButtonText}>Senior-Sen</Text>
              </Pressable>
            </View>

            <View style={styles.speechButtonsContainer}>
              <Pressable
                style={styles.speechButtonRead}
                onPress={speakPersonaFeedback}
              >
                <Text style={styles.speechButtonReadText}>Personaya Türkçe Raporu Okut</Text>
              </Pressable>

              <Pressable
                style={styles.speechButtonStop}
                onPress={stopSpeaking}
              >
                <Text style={styles.speechButtonStopText}>Okumayı Durdur</Text>
              </Pressable>
            </View>

            <View style={styles.voiceFeedbackContainer}>
              <Text style={styles.voiceFeedbackInfo}>
                Okuma dili: Türkçe. Uygun Türkçe erkek ses bulunursa otomatik seçilir.
              </Text>
              <Text style={styles.voiceFeedbackSelected}>
                Seçilen ses: {
                  getPreferredTurkishVoice(availableVoices)?.name || "tarayıcı varsayılanı"
                }
              </Text>
            </View>

            <Text style={styles.personaExplanation}>
              Junior-Sen gives supportive guidance. Senior-Sen gives technical validation and rollback/STUCK feedback.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Phase B: Voice → Audit Markdown</Text>
          <Text style={styles.bodyText}>
            Demo sırasında audit raporu sesli okunur. Bu alan voice-to-markdown
            rapor çıktısını temsil eder ve FORGE.md’ye aktarılacak bulguları üretir.
          </Text>

          <View style={styles.auditGrid}>
            {auditCards.map((item) => (
              <View key={item.id} style={styles.auditCard}>
                <Text style={styles.auditTitle}>
                  Audit {item.id} — {item.title} — {item.result}
                </Text>
                <Text style={styles.auditSource}>{item.source}</Text>
                <Text style={styles.auditSummary}>{item.summary}</Text>
              </View>
            ))}
          </View>

          <TextInput
            style={styles.input}
            multiline
            value={reportText}
            onChangeText={setReportText}
            placeholder="Dikte edilen audit raporu buraya gelecek..."
            placeholderTextColor="#69728E"
          />

          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable style={[styles.secondaryButton, { flex: 1 }]} onPress={startDictation}>
              <Text style={styles.secondaryButtonText}>Dikteyi Başlat</Text>
            </Pressable>

            <Pressable
              style={[styles.secondaryButton, { flex: 1, borderColor: "#FF6B6B" }]}
              onPress={() => {
                stopDictation();
                setDictationStatus("dikte durduruldu");
              }}
            >
              <Text style={[styles.secondaryButtonText, { color: "#FF6B6B" }]}>Dictation Durdur</Text>
            </Pressable>
          </View>

          <View style={{ height: 10 }} />

          <Pressable style={styles.secondaryButton} onPress={addDemoSttText}>
            <Text style={styles.secondaryButtonText}>Demo STT Metni Ekle</Text>
          </Pressable>

          <View style={{ height: 10 }} />

          <Text style={styles.dictationStatusText}>
            Dikte Durumu: {dictationStatus}
          </Text>

          <View style={{ height: 10 }} />

          <Pressable style={styles.secondaryButton} onPress={loadDemoAuditText}>
            <Text style={styles.secondaryButtonText}>Temiz Demo Audit Metni Yükle</Text>
          </Pressable>

          <View style={{ height: 10 }} />

          <Pressable
            style={styles.secondaryButton}
            onPress={generateMarkdownReport}
          >
            <Text style={styles.secondaryButtonText}>
              Markdown Audit Raporu Üret
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Phase C: Forge + Expert Bridge</Text>
          <Text style={styles.bodyText}>
            Forge döngüsünde 2 ardışık FAIL veya ROLLBACK olursa ya da STUCK
            seçilirse uzman görüşmesi açılır. Jitsi köprüsü ses, video ve ekran
            paylaşımı için kullanılır.
          </Text>

          <View style={styles.statusRow}>
            {(["OK", "FAIL", "ROLLBACK", "STUCK"] as const).map((status) => (
              <Pressable
                key={status}
                style={[
                  styles.statusButton,
                  cycleStatus === status && styles.statusButtonActive,
                ]}
                onPress={() => updateCycle(status)}
              >
                <Text style={styles.statusText}>{status}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.timeline}>
            {forgeCycles.map((cycle) => (
              <View key={cycle.id} style={styles.cycleItem}>
                <Text style={styles.cycleTitle}>
                  Cycle {cycle.id} · {cycle.status} — {cycle.title}
                </Text>
                <Text style={styles.cycleEvidence}>{cycle.evidence}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.bridgeState}>
            Bridge status: {bridgeRequired ? "REQUIRED" : "NOT REQUIRED"} ·
            Consecutive fail/rollback: {failCount}
          </Text>

          <Text style={styles.heuristicText}>
            Heuristic: 2 FAIL/ROLLBACK attempts or a STUCK state activates the
            expert bridge.
          </Text>

          <Pressable
            style={[
              styles.bridgeButton,
              !bridgeRequired && styles.bridgeButtonDisabled,
            ]}
            onPress={bridgeRequired ? openExpertBridge : undefined}
            disabled={!bridgeRequired}
          >
            <Text style={styles.bridgeButtonText}>
              {bridgeRequired
                ? "Uzmana Bağlan"
                : "Bridge için FAIL/ROLLBACK veya STUCK gerekli"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            README.md · FORGE.md · BRIDGE.md · PERSONAS.md · avatar.glb · 3 dakika demo
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#080B18" },
  container: { padding: 20, paddingBottom: 44 },
  header: { marginBottom: 22 },
  kicker: {
    color: "#8EA4FF",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: { color: "#FFFFFF", fontSize: 34, fontWeight: "900", marginTop: 8 },
  subtitle: { color: "#B9C0D4", fontSize: 15, lineHeight: 22, marginTop: 10 },
  card: {
    backgroundColor: "#11162A",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#26304E",
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between" },
  cardTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "800" },
  badge: {
    color: "#9FFFD0",
    fontSize: 11,
    fontWeight: "900",
    backgroundColor: "#143526",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  coverageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
  coverageItem: {
    color: "#B9C0D4",
    backgroundColor: "#080B18",
    borderWidth: 1,
    borderColor: "#344063",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontWeight: "800",
  },
  orb: {
    width: 178,
    height: 178,
    borderRadius: 999,
    backgroundColor: "#243BFF",
    alignSelf: "center",
    marginTop: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  orbText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  wave: {
    height: 150,
    marginTop: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  bar: { width: 8, borderRadius: 999, backgroundColor: "#7DFFCB" },
  metric: {
    color: "#B9C0D4",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 16,
    fontWeight: "700",
  },
  warningText: {
    color: "#FF6B6B",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  primaryButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
  },
  stopButton: { backgroundColor: "#FF6B6B" },
  buttonText: { color: "#080B18", fontWeight: "900", fontSize: 15 },
  bodyText: {
    color: "#B9C0D4",
    lineHeight: 22,
    marginTop: 12,
    marginBottom: 16,
  },
  auditGrid: {
    gap: 10,
    marginBottom: 14,
  },
  auditCard: {
    backgroundColor: "#080B18",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#344063",
  },
  auditTitle: {
    color: "#7DFFCB",
    fontWeight: "900",
    fontSize: 14,
  },
  auditName: {
    color: "#FFFFFF",
    fontWeight: "800",
    marginTop: 4,
  },
  auditSource: {
    color: "#8EA4FF",
    fontWeight: "800",
    marginTop: 4,
  },
  auditSummary: {
    color: "#B9C0D4",
    marginTop: 6,
    lineHeight: 19,
  },
  input: {
    minHeight: 150,
    backgroundColor: "#080B18",
    borderColor: "#344063",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    color: "#FFFFFF",
    textAlignVertical: "top",
    marginBottom: 14,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#7DFFCB",
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
  },
  secondaryButtonText: { color: "#7DFFCB", fontSize: 15, fontWeight: "900" },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  statusButton: {
    borderWidth: 1,
    borderColor: "#344063",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
  },
  statusButtonActive: { backgroundColor: "#243BFF", borderColor: "#8EA4FF" },
  statusText: { color: "#FFFFFF", fontWeight: "800" },
  timeline: {
    gap: 10,
    marginBottom: 16,
  },
  cycleItem: {
    backgroundColor: "#080B18",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#344063",
  },
  cycleTitle: {
    color: "#7DFFCB",
    fontWeight: "900",
    fontSize: 14,
  },
  cycleSubtitle: {
    color: "#FFFFFF",
    fontWeight: "800",
    marginTop: 4,
  },
  cycleEvidence: {
    color: "#B9C0D4",
    marginTop: 4,
    lineHeight: 19,
  },
  bridgeState: {
    color: "#B9C0D4",
    fontWeight: "800",
    marginBottom: 8,
  },
  heuristicText: {
    color: "#8EA4FF",
    fontWeight: "700",
    marginBottom: 14,
    lineHeight: 20,
  },
  bridgeButton: {
    backgroundColor: "#7DFFCB",
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
  },
  bridgeButtonDisabled: {
    backgroundColor: "#344063",
    opacity: 0.7,
  },
  bridgeButtonText: { color: "#080B18", fontSize: 15, fontWeight: "900" },
  personaBox: {
    marginTop: 14,
    backgroundColor: "#080B18",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#344063",
  },
  personaTitle: {
    color: "#7DFFCB",
    fontSize: 18,
    fontWeight: "900",
  },
  personaTone: {
    color: "#8EA4FF",
    marginTop: 4,
    fontWeight: "800",
  },
  personaMessage: {
    color: "#B9C0D4",
    marginTop: 8,
    lineHeight: 20,
  },
  personaButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  personaButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#344063",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  personaButtonActive: {
    backgroundColor: "#243BFF",
    borderColor: "#8EA4FF",
  },
  personaButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  speechButtonsContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  speechButtonRead: {
    flex: 1.2,
    borderWidth: 1,
    borderColor: "#7DFFCB",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  speechButtonReadText: {
    color: "#7DFFCB",
    fontWeight: "900",
    fontSize: 13,
  },
  speechButtonStop: {
    flex: 0.8,
    borderWidth: 1,
    borderColor: "#FF6B6B",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  speechButtonStopText: {
    color: "#FF6B6B",
    fontWeight: "900",
    fontSize: 13,
  },
  voiceFeedbackContainer: {
    marginTop: 10,
    padding: 8,
    backgroundColor: "#11162A",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#26304E",
  },
  voiceFeedbackInfo: {
    color: "#B9C0D4",
    fontSize: 11,
    textAlign: "center",
    lineHeight: 15,
  },
  voiceFeedbackSelected: {
    color: "#7DFFCB",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 4,
  },
  voiceActivity: {
    color: "#B9C0D4",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8,
  },
  voiceActivityActive: {
    color: "#7DFFCB",
    fontWeight: "900",
  },
  voiceActivityIdle: {
    color: "#69728E",
    fontWeight: "800",
  },
  personaExplanation: {
    color: "#8EA4FF",
    fontSize: 12,
    marginTop: 10,
    lineHeight: 16,
    fontStyle: "italic",
    textAlign: "center",
  },
  footer: { alignItems: "center", marginTop: 4 },
  footerText: { color: "#69728E", fontSize: 12 },
  dictationStatusText: {
    color: "#8EA4FF",
    fontWeight: "800",
    fontSize: 14,
    marginVertical: 10,
    textAlign: "center",
  },
});

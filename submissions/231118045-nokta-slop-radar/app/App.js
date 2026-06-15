import React, { useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Speech from 'expo-speech';
import AvatarCanvas from './AvatarCanvas';
import ForgeLoop from './ForgeLoop';
import VoiceVisualizer from './VoiceVisualizer';

const THEME = {
  background: '#07090D',
  backgroundAlt: '#0D1118',
  surface: '#121720',
  surfaceSoft: '#19212C',
  border: '#273243',
  borderStrong: '#37506C',
  primary: '#8BF3FF',
  primaryMuted: '#2A5C66',
  accent: '#C9FF66',
  danger: '#FF5C77',
  warning: '#FFB347',
  success: '#59F2A4',
  textMain: '#F4F7FB',
  textDim: '#91A0B4',
  textSoft: '#6E7C8E',
};

const PERSONAS = {
  JUNIOR: {
    id: 'junior',
    name: 'Junior-sen',
    badge: 'Hype Scan',
    pitch: 1.2,
    rate: 1.2,
    intro: 'Lets use AI and blockchain for everything! Synergy!',
    summary: 'Buzzword-heavy, fast, optimistic feedback.',
  },
  SENIOR: {
    id: 'senior',
    name: 'Senior-sen',
    badge: 'Architecture Review',
    pitch: 0.9,
    rate: 0.85,
    intro: 'Keep it simple. Use Postgres and RLS. Stop the slop.',
    summary: 'Slower, stricter, architecture-first feedback.',
  },
};

const STAGES = [
  {
    id: 'record',
    title: 'Record',
    subtitle: 'Capture the report in a voice-first flow.',
  },
  {
    id: 'audit',
    title: 'Audit',
    subtitle: 'Score the report and surface weak points.',
  },
  {
    id: 'repair',
    title: 'Repair',
    subtitle: 'Run forge cycles and escalate when stuck.',
  },
];

function StageRail({ activeStage }) {
  return (
    <View style={styles.stageRail}>
      {STAGES.map((stage, index) => {
        const isActive = stage.id === activeStage;
        const isComplete = STAGES.findIndex((item) => item.id === activeStage) > index;

        return (
          <View
            key={stage.id}
            style={[
              styles.stageCard,
              isActive && styles.stageCardActive,
              isComplete && styles.stageCardComplete,
            ]}
          >
            <Text style={[styles.stageIndex, (isActive || isComplete) && styles.stageIndexActive]}>
              0{index + 1}
            </Text>
            <Text style={[styles.stageTitle, isActive && styles.stageTitleActive]}>{stage.title}</Text>
            <Text style={styles.stageSubtitle}>{stage.subtitle}</Text>
          </View>
        );
      })}
    </View>
  );
}

function SectionHeader({ eyebrow, title, description }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionEyebrow}>{eyebrow}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionDescription}>{description}</Text>
    </View>
  );
}

function EmptyCard({ title, description }) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
    </View>
  );
}

export default function App() {
  const [pitch, setPitch] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [audioLevel, setAudioLevel] = useState(-160);
  const [activePersona, setActivePersona] = useState(PERSONAS.JUNIOR);
  const [forgeStatus, setForgeStatus] = useState('OK');

  const audioIntensity = useMemo(
    () => Math.max(0, Math.min(1, (audioLevel + 60) / 60)),
    [audioLevel]
  );

  const activeStage = forgeStatus === 'STUCK' ? 'repair' : result ? 'audit' : 'record';
  const liveStatus = audioIntensity > 0.08 ? 'Listening live' : 'Waiting for voice';

  const speak = (text) => {
    Speech.stop();
    Speech.speak(text, {
      pitch: activePersona.pitch,
      rate: activePersona.rate,
      onStart: () => setAudioLevel(-10),
      onDone: () => setAudioLevel(-160),
      onStopped: () => setAudioLevel(-160),
    });
  };

  const togglePersona = () => {
    const nextPersona =
      activePersona.id === PERSONAS.JUNIOR.id ? PERSONAS.SENIOR : PERSONAS.JUNIOR;
    setActivePersona(nextPersona);
    speak(`Switched to ${nextPersona.name} persona. ${nextPersona.intro}`);
  };

  const analyzeSlop = () => {
    if (!pitch.trim()) return;

    setIsAnalyzing(true);
    setResult(null);
    speak('Analyzing the dictated report. Please wait.');

    setTimeout(() => {
      const score = Math.floor(Math.random() * 100);
      const isSlop = score > 60;

      const nextResult = {
        score,
        verdict: isSlop ? 'SLOP DETECTED' : 'SOLID REPORT',
        reasoning: isSlop
          ? 'The report relies on generic AI claims, but skips implementation details, constraints, and ownership.'
          : 'The report names technical constraints, concrete risks, and a believable rollout path.',
        risks: isSlop
          ? [
              'The value proposition sounds broad and untestable.',
              'No clear system architecture or technical owner is identified.',
              'Execution risk is hidden behind trend language.',
            ]
          : [
              'Rollout scope should be narrowed before implementation.',
              'Scalability assumptions still need production evidence.',
              'The repair loop needs clearer success metrics.',
            ],
        roadmap: isSlop
          ? [
              'Rewrite the report around one user workflow and one measurable outcome.',
              'Name the data model, service boundaries, and failure modes.',
              'Convert claims into milestones that a forge loop can validate.',
            ]
          : [
              'Convert the strongest findings into a tracked repair backlog.',
              'Run two forge cycles on the highest-risk assumption.',
              'Document escalation criteria for the expert bridge.',
            ],
      };

      setResult(nextResult);
      setIsAnalyzing(false);
      speak(
        `Audit complete. Score is ${nextResult.score} percent. Verdict: ${nextResult.verdict}. ${nextResult.reasoning}`
      );
    }, 2200);
  };

  const reset = () => {
    setPitch('');
    setResult(null);
    Speech.stop();
    setAudioLevel(-160);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroShell}>
            <View style={styles.heroHeader}>
              <View style={styles.heroCopy}>
                <Text style={styles.kicker}>VOICE-FIRST PRODUCT AUDIT</Text>
                <Text style={styles.heroTitle}>Speak your report. Audit the slop. Repair what breaks.</Text>
                <Text style={styles.heroSubtitle}>
                  Nokta Slop Radar turns dictated product reports into auditable findings, avatar feedback, and forge-ready repair cycles.
                </Text>
              </View>

              <View style={styles.heroBadges}>
                <View style={styles.badge}>
                  <Text style={styles.badgeLabel}>Persona</Text>
                  <Text style={styles.badgeValue}>{activePersona.name}</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeLabel}>Live Status</Text>
                  <Text style={styles.badgeValue}>{liveStatus}</Text>
                </View>
              </View>
            </View>

            <StageRail activeStage={activeStage} />

            <View style={styles.liveDeck}>
              <View style={styles.avatarPanel}>
                <View style={styles.panelHeader}>
                  <View>
                    <Text style={styles.panelEyebrow}>Avatar Guide</Text>
                    <Text style={styles.panelTitle}>{activePersona.badge}</Text>
                  </View>
                  <TouchableOpacity style={styles.personaButton} onPress={togglePersona}>
                    <Text style={styles.personaButtonText}>Switch Persona</Text>
                  </TouchableOpacity>
                </View>

                <AvatarCanvas audioLevel={audioLevel} />

                <View style={styles.personaSummaryRow}>
                  <Text style={styles.personaSummary}>{activePersona.summary}</Text>
                  <View style={styles.liveDotRow}>
                    <View
                      style={[
                        styles.liveDot,
                        { opacity: 0.3 + audioIntensity * 0.7 },
                      ]}
                    />
                    <Text style={styles.liveDotText}>{liveStatus}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.signalPanel}>
                <Text style={styles.panelEyebrow}>Live Signal</Text>
                <Text style={styles.signalTitle}>Mic waveform reacts while you dictate the report.</Text>
                <View style={styles.visualizerWrap}>
                  <VoiceVisualizer onAudioLevel={setAudioLevel} />
                </View>
                <Text style={styles.signalCaption}>
                  Speak naturally, then refine the transcript below before running the audit.
                </Text>
                <View style={styles.signalMetaRow}>
                  <View style={styles.signalMetaCard}>
                    <Text style={styles.signalMetaLabel}>Input Mode</Text>
                    <Text style={styles.signalMetaValue}>Voice + manual edit</Text>
                  </View>
                  <View style={styles.signalMetaCard}>
                    <Text style={styles.signalMetaLabel}>Repair Status</Text>
                    <Text
                      style={[
                        styles.signalMetaValue,
                        forgeStatus === 'STUCK' && styles.signalMetaDanger,
                      ]}
                    >
                      {forgeStatus === 'STUCK' ? 'Expert escalation ready' : 'Forge loop monitoring'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <SectionHeader
              eyebrow="01 · TRANSCRIPT"
              title="Capture the report draft"
              description="This is the working document that the audit reads. Keep it raw, direct, and specific."
            />

            <View style={styles.transcriptCard}>
              <View style={styles.transcriptHeader}>
                <View>
                  <Text style={styles.transcriptTitle}>Dictated report</Text>
                  <Text style={styles.transcriptHint}>
                    Paste it, type it, or speak first and tighten the wording here.
                  </Text>
                </View>
                <View style={styles.wordCountPill}>
                  <Text style={styles.wordCountLabel}>Chars</Text>
                  <Text style={styles.wordCountValue}>{pitch.length}</Text>
                </View>
              </View>

              <TextInput
                style={styles.input}
                multiline
                placeholder="Example: We are building a mobile audit assistant that listens to burn-in reports, scores slop risk, and launches a repair loop when findings repeat."
                placeholderTextColor={THEME.textSoft}
                value={pitch}
                onChangeText={setPitch}
              />

              <View style={styles.transcriptActions}>
                <TouchableOpacity
                  style={[styles.primaryButton, !pitch.trim() && styles.disabledButton]}
                  onPress={analyzeSlop}
                  disabled={isAnalyzing || !pitch.trim()}
                >
                  {isAnalyzing ? (
                    <ActivityIndicator color={THEME.background} />
                  ) : (
                    <Text style={styles.primaryButtonText}>Run Voice Audit</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={reset}>
                  <Text style={styles.secondaryButtonText}>Reset Draft</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <SectionHeader
              eyebrow="02 · AUDIT"
              title="Review the findings"
              description="The audit should explain what sounds vague, what feels credible, and what needs a repair cycle."
            />

            {!result ? (
              <View style={styles.auditGrid}>
                <EmptyCard
                  title="No audit yet"
                  description="Run an audit to generate a score, verbal summary, and repair recommendations."
                />
                <EmptyCard
                  title="What strong reports include"
                  description="Specific users, concrete constraints, named components, measurable outcomes, and visible risks."
                />
              </View>
            ) : (
              <View style={styles.auditStack}>
                <View
                  style={[
                    styles.scoreHero,
                    {
                      borderColor:
                        result.score > 60 ? THEME.danger : THEME.success,
                    },
                  ]}
                >
                  <Text style={styles.scoreEyebrow}>Audit Score</Text>
                  <View style={styles.scoreRow}>
                    <Text
                      style={[
                        styles.scoreValue,
                        { color: result.score > 60 ? THEME.danger : THEME.success },
                      ]}
                    >
                      {result.score}%
                    </Text>
                    <View style={styles.scoreMeta}>
                      <Text
                        style={[
                          styles.verdictText,
                          { color: result.score > 60 ? THEME.danger : THEME.success },
                        ]}
                      >
                        {result.verdict}
                      </Text>
                      <Text style={styles.scoreSummary}>{result.reasoning}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.auditGrid}>
                  <View style={styles.auditCard}>
                    <Text style={styles.auditCardTitle}>Key Risks</Text>
                    {result.risks.map((risk) => (
                      <View key={risk} style={styles.bulletRow}>
                        <View style={[styles.bulletDot, { backgroundColor: THEME.danger }]} />
                        <Text style={styles.bulletText}>{risk}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.auditCard}>
                    <Text style={styles.auditCardTitle}>Repair Actions</Text>
                    {result.roadmap.map((step) => (
                      <View key={step} style={styles.bulletRow}>
                        <View style={[styles.bulletDot, { backgroundColor: THEME.accent }]} />
                        <Text style={styles.bulletText}>{step}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <SectionHeader
              eyebrow="03 · REPAIR"
              title="Run the forge loop"
              description="Use repeat failures to decide when the agent should keep iterating and when it should escalate to a human expert."
            />

            <View style={styles.repairIntro}>
              <View style={styles.repairStatusCard}>
                <Text style={styles.repairStatusLabel}>Current Loop State</Text>
                <Text
                  style={[
                    styles.repairStatusValue,
                    forgeStatus === 'STUCK' ? styles.signalMetaDanger : styles.signalMetaSuccess,
                  ]}
                >
                  {forgeStatus === 'STUCK' ? 'STUCK · expert bridge armed' : 'OK · safe to iterate'}
                </Text>
              </View>
              <Text style={styles.repairStatusNote}>
                Two consecutive FAIL or ROLLBACK events should push the workflow toward a live expert bridge.
              </Text>
            </View>

            <ForgeLoop onStatusChange={setForgeStatus} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 40,
    gap: 24,
  },
  heroShell: {
    backgroundColor: THEME.backgroundAlt,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 20,
    gap: 20,
  },
  heroHeader: {
    gap: 18,
  },
  heroCopy: {
    gap: 10,
  },
  kicker: {
    color: THEME.primary,
    fontSize: 12,
    letterSpacing: 2.5,
    fontWeight: '700',
  },
  heroTitle: {
    color: THEME.textMain,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
  },
  heroSubtitle: {
    color: THEME.textDim,
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 620,
  },
  heroBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badge: {
    minWidth: 150,
    backgroundColor: '#0E141D',
    borderWidth: 1,
    borderColor: THEME.borderStrong,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  badgeLabel: {
    color: THEME.textSoft,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  badgeValue: {
    color: THEME.textMain,
    fontSize: 15,
    fontWeight: '700',
  },
  stageRail: {
    gap: 10,
  },
  stageCard: {
    backgroundColor: THEME.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  stageCardActive: {
    borderColor: THEME.primary,
    backgroundColor: '#11212B',
  },
  stageCardComplete: {
    borderColor: '#31524B',
  },
  stageIndex: {
    color: THEME.textSoft,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  stageIndexActive: {
    color: THEME.primary,
  },
  stageTitle: {
    color: THEME.textMain,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  stageTitleActive: {
    color: THEME.primary,
  },
  stageSubtitle: {
    color: THEME.textDim,
    fontSize: 13,
    lineHeight: 18,
  },
  liveDeck: {
    gap: 16,
  },
  avatarPanel: {
    backgroundColor: THEME.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 16,
    gap: 14,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  panelEyebrow: {
    color: THEME.textSoft,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.3,
    marginBottom: 4,
  },
  panelTitle: {
    color: THEME.textMain,
    fontSize: 20,
    fontWeight: '800',
  },
  personaButton: {
    backgroundColor: '#1D2A38',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: THEME.borderStrong,
  },
  personaButtonText: {
    color: THEME.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  personaSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  personaSummary: {
    color: THEME.textDim,
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
    minWidth: 180,
  },
  liveDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: THEME.primary,
  },
  liveDotText: {
    color: THEME.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  signalPanel: {
    backgroundColor: '#0D141D',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 18,
    gap: 14,
  },
  signalTitle: {
    color: THEME.textMain,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
  },
  visualizerWrap: {
    backgroundColor: '#081018',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: THEME.borderStrong,
    paddingVertical: 12,
  },
  signalCaption: {
    color: THEME.textDim,
    fontSize: 14,
    lineHeight: 21,
  },
  signalMetaRow: {
    gap: 10,
  },
  signalMetaCard: {
    backgroundColor: THEME.surfaceSoft,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  signalMetaLabel: {
    color: THEME.textSoft,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.3,
    marginBottom: 6,
  },
  signalMetaValue: {
    color: THEME.textMain,
    fontSize: 15,
    fontWeight: '700',
  },
  signalMetaSuccess: {
    color: THEME.success,
  },
  signalMetaDanger: {
    color: THEME.danger,
  },
  section: {
    gap: 14,
  },
  sectionHeader: {
    gap: 6,
    paddingHorizontal: 2,
  },
  sectionEyebrow: {
    color: THEME.primary,
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '700',
  },
  sectionTitle: {
    color: THEME.textMain,
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '900',
  },
  sectionDescription: {
    color: THEME.textDim,
    fontSize: 14,
    lineHeight: 22,
  },
  transcriptCard: {
    backgroundColor: THEME.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 18,
    gap: 16,
  },
  transcriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  transcriptTitle: {
    color: THEME.textMain,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  transcriptHint: {
    color: THEME.textDim,
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 420,
  },
  wordCountPill: {
    backgroundColor: '#0B1219',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: THEME.border,
    minWidth: 76,
  },
  wordCountLabel: {
    color: THEME.textSoft,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  wordCountValue: {
    color: THEME.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  input: {
    minHeight: 180,
    backgroundColor: '#091018',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.borderStrong,
    paddingHorizontal: 18,
    paddingVertical: 18,
    color: THEME.textMain,
    fontSize: 15,
    lineHeight: 23,
    textAlignVertical: 'top',
  },
  transcriptActions: {
    gap: 10,
  },
  primaryButton: {
    backgroundColor: THEME.primary,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: THEME.background,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  secondaryButton: {
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.borderStrong,
    backgroundColor: '#111925',
  },
  secondaryButtonText: {
    color: THEME.textDim,
    fontSize: 14,
    fontWeight: '700',
  },
  auditStack: {
    gap: 14,
  },
  scoreHero: {
    backgroundColor: THEME.surface,
    borderRadius: 24,
    borderWidth: 2,
    padding: 18,
    gap: 12,
  },
  scoreEyebrow: {
    color: THEME.textSoft,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  scoreRow: {
    gap: 14,
  },
  scoreValue: {
    fontSize: 64,
    lineHeight: 68,
    fontWeight: '900',
  },
  scoreMeta: {
    gap: 8,
  },
  verdictText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  scoreSummary: {
    color: THEME.textDim,
    fontSize: 14,
    lineHeight: 21,
  },
  auditGrid: {
    gap: 12,
  },
  auditCard: {
    backgroundColor: THEME.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 18,
    gap: 12,
  },
  auditCardTitle: {
    color: THEME.textMain,
    fontSize: 19,
    fontWeight: '800',
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginTop: 7,
  },
  bulletText: {
    color: THEME.textDim,
    fontSize: 14,
    lineHeight: 21,
    flex: 1,
  },
  emptyCard: {
    backgroundColor: '#0C131B',
    borderRadius: 22,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: THEME.borderStrong,
    padding: 18,
    gap: 8,
  },
  emptyTitle: {
    color: THEME.textMain,
    fontSize: 18,
    fontWeight: '800',
  },
  emptyDescription: {
    color: THEME.textDim,
    fontSize: 14,
    lineHeight: 21,
  },
  repairIntro: {
    backgroundColor: THEME.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 18,
    gap: 10,
  },
  repairStatusCard: {
    gap: 6,
  },
  repairStatusLabel: {
    color: THEME.textSoft,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  repairStatusValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  repairStatusNote: {
    color: THEME.textDim,
    fontSize: 14,
    lineHeight: 21,
  },
});

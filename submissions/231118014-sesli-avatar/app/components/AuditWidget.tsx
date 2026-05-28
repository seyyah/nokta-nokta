import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { Loader2, Mic, Pencil, Trash2 } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Colors from "@/constants/colors";
import { type AuditReport, useForge } from "@/providers/ForgeProvider";

type Mode = "idle" | "recording" | "transcribing";

/**
 * Drop-in audit widget. Lets the user dictate a burn-in report (voice -> STT
 * via ElevenLabs Scribe through the Rork proxy) OR type one manually.
 * The transcribed/typed markdown lands in the Forge context so it can be
 * fed into the next forge cycle.
 */
export function AuditWidget() {
  const { addAudit, audits, removeAudit } = useForge();
  const [mode, setMode] = useState<Mode>("idle");
  const [title, setTitle] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recState = useAudioRecorderState(recorder, 250);

  useEffect(() => {
    (async () => {
      try {
        const status = await AudioModule.requestRecordingPermissionsAsync();
        if (!status.granted) return;
        await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      } catch (e) {
        console.log("[AuditWidget] permission error", e);
      }
    })();
  }, []);

  const startDictate = useCallback(async () => {
    try {
      setError(null);
      await recorder.prepareToRecordAsync(RecordingPresets.HIGH_QUALITY);
      recorder.record();
      setMode("recording");
    } catch (e) {
      console.log("[AuditWidget] start error", e);
      setError("Kayıt başlatılamadı.");
    }
  }, [recorder]);

  const stopDictate = useCallback(async () => {
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) {
        setMode("idle");
        return;
      }
      setMode("transcribing");
      await transcribeAndAppend(uri);
    } catch (e) {
      console.log("[AuditWidget] stop error", e);
      setError("Transkripsiyon başarısız.");
      setMode("idle");
    }
  }, [recorder]);

  const transcribeAndAppend = useCallback(async (uri: string) => {
    try {
      const toolkitUrl = process.env.EXPO_PUBLIC_TOOLKIT_URL;
      const secret = process.env.EXPO_PUBLIC_RORK_TOOLKIT_SECRET_KEY;
      if (!toolkitUrl || !secret) {
        throw new Error("Toolkit env eksik");
      }
      const form = new FormData();
      form.append("model_id", "scribe_v2");
      // React Native FormData expects { uri, name, type } shape for file uploads.
      const file = {
        uri,
        name: `audit-${Date.now()}.m4a`,
        type: Platform.OS === "ios" ? "audio/m4a" : "audio/mp4",
      } as unknown as Blob;
      form.append("file", file);

      const res = await fetch(`${toolkitUrl}/v2/elevenlabs/v1/speech-to-text`, {
        method: "POST",
        headers: { Authorization: `Bearer ${secret}` },
        body: form,
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`STT ${res.status}: ${txt.slice(0, 120)}`);
      }
      const json = (await res.json()) as { text?: string };
      const text = (json.text ?? "").trim();
      if (!text) throw new Error("Boş transkript");
      setBody((prev) => (prev ? `${prev}\n\n${text}` : text));
      setMode("idle");
    } catch (e) {
      console.log("[AuditWidget] transcribe error", e);
      setError(e instanceof Error ? e.message : "Transkripsiyon hatası");
      setMode("idle");
    }
  }, []);

  const onSave = useCallback(() => {
    const t = title.trim() || "Burn-in raporu";
    const b = body.trim();
    if (!b) {
      setError("Rapor gövdesi boş olamaz.");
      return;
    }
    addAudit({ title: t, body: b, source: mode === "idle" && body ? "dictate" : "type" });
    setTitle("");
    setBody("");
    setError(null);
  }, [addAudit, title, body, mode]);

  const recording = mode === "recording";
  const transcribing = mode === "transcribing";

  return (
    <View style={styles.wrap} testID="audit-widget">
      <View style={styles.headerRow}>
        <Text style={styles.eyebrow}>AuditWidget · burn-in</Text>
        <Text style={styles.count}>{audits.length} rapor</Text>
      </View>

      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Başlık (ör. voice-lag-001)"
        placeholderTextColor={Colors.textDim}
        style={styles.input}
        editable={!transcribing}
      />
      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder="Raporu dikte et veya yaz... (markdown serbest)"
        placeholderTextColor={Colors.textDim}
        style={[styles.input, styles.bodyInput]}
        multiline
        editable={!transcribing}
      />

      <View style={styles.row}>
        <Pressable
          onPress={recording ? stopDictate : startDictate}
          disabled={transcribing}
          style={({ pressed }) => [
            styles.btn,
            recording && styles.btnDanger,
            pressed && { opacity: 0.85 },
            transcribing && { opacity: 0.5 },
          ]}
          testID="dictate-btn"
        >
          {transcribing ? (
            <ActivityIndicator color={Colors.text} size="small" />
          ) : (
            <Mic color={recording ? Colors.bg : Colors.text} size={16} />
          )}
          <Text style={[styles.btnText, recording && { color: Colors.bg }]}>
            {transcribing
              ? "Transkripsiyon..."
              : recording
                ? `Durdur · ${Math.round(recState.durationMillis / 1000)}s`
                : "Dikte"}
          </Text>
        </Pressable>

        <Pressable
          onPress={onSave}
          disabled={transcribing || !body.trim()}
          style={({ pressed }) => [
            styles.btn,
            styles.btnPrimary,
            (transcribing || !body.trim()) && { opacity: 0.4 },
            pressed && { opacity: 0.85 },
          ]}
          testID="save-btn"
        >
          <Pencil color={Colors.bg} size={16} />
          <Text style={[styles.btnText, { color: Colors.bg }]}>Kaydet</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.errText}>{error}</Text> : null}

      {audits.length > 0 ? (
        <View style={styles.list}>
          {audits.slice(0, 4).map((a) => (
            <AuditRow key={a.id} audit={a} onDelete={() => removeAudit(a.id)} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function AuditRow({ audit, onDelete }: { audit: AuditReport; onDelete: () => void }) {
  return (
    <View style={styles.audit}>
      <View style={{ flex: 1 }}>
        <Text style={styles.auditTitle} numberOfLines={1}>
          {audit.title}
        </Text>
        <Text style={styles.auditBody} numberOfLines={2}>
          {audit.body}
        </Text>
        <Text style={styles.auditMeta}>
          {audit.source === "dictate" ? "🎙️ dikte" : "✍️ yazıldı"} ·{" "}
          {new Date(audit.createdAt).toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
      <Pressable
        onPress={onDelete}
        style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
        hitSlop={12}
      >
        <Trash2 color={Colors.textMuted} size={16} />
      </Pressable>
    </View>
  );
}

// Avoid unused import lint when transcribing branch hides Loader2.
void Loader2;

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.bgElevated,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  eyebrow: {
    color: Colors.accent,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  count: { color: Colors.textMuted, fontSize: 12 },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.text,
    borderWidth: 0.5,
    borderColor: Colors.border,
    marginBottom: 10,
    fontSize: 14,
  },
  bodyInput: { minHeight: 90, textAlignVertical: "top" },
  row: { flexDirection: "row", gap: 10, marginTop: 4 },
  btn: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  btnPrimary: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  btnDanger: { backgroundColor: Colors.danger, borderColor: Colors.danger },
  btnText: { color: Colors.text, fontSize: 14, fontWeight: "600" },
  errText: { color: Colors.warn, marginTop: 10, fontSize: 13 },
  list: { marginTop: 16, gap: 10 },
  audit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  auditTitle: { color: Colors.text, fontSize: 14, fontWeight: "600", marginBottom: 2 },
  auditBody: { color: Colors.textMuted, fontSize: 12, lineHeight: 17 },
  auditMeta: { color: Colors.textDim, fontSize: 10, marginTop: 4, letterSpacing: 0.5 },
  iconBtn: { padding: 8, borderRadius: 10 },
});

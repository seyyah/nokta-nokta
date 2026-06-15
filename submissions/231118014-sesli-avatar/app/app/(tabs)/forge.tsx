import { Check, Plus, RotateCcw, Trash2, X } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { AuditWidget } from "@/components/AuditWidget";
import Colors from "@/constants/colors";
import { type CycleStatus, type ForgeCycle, useForge } from "@/providers/ForgeProvider";

const STATUS_META: Record<CycleStatus, { label: string; color: string; bg: string }> = {
  COMMIT: { label: "COMMIT", color: Colors.accent, bg: "#0F2A20" },
  ROLLBACK: { label: "ROLLBACK", color: Colors.warn, bg: "#2A2014" },
  STUCK: { label: "STUCK", color: Colors.danger, bg: "#2A1414" },
};

export default function ForgeScreen() {
  const { audits, cycles, stats, addCycle, removeCycle } = useForge();
  const [draftOpen, setDraftOpen] = useState<boolean>(false);

  const acceptance = useMemo(() => {
    const commitOk = stats.commit >= 2;
    const rollbackOk = stats.rollback >= 1;
    const cyclesOk = stats.total >= 3;
    return { commitOk, rollbackOk, cyclesOk, allOk: commitOk && rollbackOk && cyclesOk };
  }, [stats]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Phase B — Kendi müşterin</Text>
          <Text style={styles.title}>Forge döngüsü</Text>
        </View>

        <View style={styles.statRow}>
          <Stat label="COMMIT" value={stats.commit} ok={acceptance.commitOk} target="≥2" />
          <Stat label="ROLLBACK" value={stats.rollback} ok={acceptance.rollbackOk} target="≥1" />
          <Stat label="STUCK" value={stats.stuck} ok={true} target="—" />
        </View>

        <AuditWidget />

        <View style={styles.cyclesHeader}>
          <Text style={styles.sectionTitle}>Cycles</Text>
          <Pressable
            onPress={() => setDraftOpen((v) => !v)}
            style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.85 }]}
            testID="toggle-cycle-form"
          >
            {draftOpen ? <X color={Colors.bg} size={14} /> : <Plus color={Colors.bg} size={14} />}
            <Text style={styles.addBtnText}>{draftOpen ? "Kapat" : "Yeni cycle"}</Text>
          </Pressable>
        </View>

        {draftOpen ? (
          <CycleForm
            audits={audits}
            onSubmit={(c) => {
              addCycle(c);
              setDraftOpen(false);
            }}
          />
        ) : null}

        {cycles.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              Henüz cycle yok. Bir audit raporu dikte et, hipotez kur, 20dk kutuda repair → test →
              COMMIT veya ROLLBACK.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {cycles.map((c) => (
              <CycleRow key={c.id} cycle={c} onDelete={() => removeCycle(c.id)} />
            ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Stat({
  label,
  value,
  ok,
  target,
}: {
  label: string;
  value: number;
  ok: boolean;
  target: string;
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, ok && { color: Colors.accent }]}>{value}</Text>
      <Text style={styles.statTarget}>{target}</Text>
    </View>
  );
}

function CycleForm({
  audits,
  onSubmit,
}: {
  audits: { id: string; title: string }[];
  onSubmit: (cycle: Omit<ForgeCycle, "id" | "createdAt">) => void;
}) {
  const [slug, setSlug] = useState<string>("");
  const [status, setStatus] = useState<CycleStatus>("COMMIT");
  const [inputReportId, setInputReportId] = useState<string | null>(audits[0]?.id ?? null);
  const [hypothesis, setHypothesis] = useState<string>("");
  const [changes, setChanges] = useState<string>("");
  const [test, setTest] = useState<string>("");
  const [duration, setDuration] = useState<string>("20");
  const [notes, setNotes] = useState<string>("");

  const submit = () => {
    const s = slug.trim() || "untitled";
    const min = Math.max(1, Math.min(20, parseInt(duration, 10) || 20));
    onSubmit({
      slug: s,
      status,
      inputReportId,
      hypothesis: hypothesis.trim(),
      changes: changes.trim(),
      test: test.trim(),
      durationMin: min,
      notes: notes.trim(),
    });
  };

  return (
    <View style={styles.form}>
      <TextInput
        placeholder="slug (ör. mouth-jitter)"
        placeholderTextColor={Colors.textDim}
        value={slug}
        onChangeText={setSlug}
        style={styles.formInput}
      />
      <View style={styles.statusRow}>
        {(["COMMIT", "ROLLBACK", "STUCK"] as CycleStatus[]).map((s) => (
          <Pressable
            key={s}
            onPress={() => setStatus(s)}
            style={({ pressed }) => [
              styles.statusChip,
              status === s && { backgroundColor: STATUS_META[s].bg, borderColor: STATUS_META[s].color },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text
              style={[
                styles.statusChipText,
                status === s && { color: STATUS_META[s].color },
              ]}
            >
              {s}
            </Text>
          </Pressable>
        ))}
      </View>

      {audits.length > 0 ? (
        <View style={styles.auditPicker}>
          <Text style={styles.subLabel}>INPUT raporu</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
            {audits.map((a) => (
              <Pressable
                key={a.id}
                onPress={() => setInputReportId(a.id)}
                style={({ pressed }) => [
                  styles.auditChip,
                  inputReportId === a.id && {
                    backgroundColor: Colors.surface,
                    borderColor: Colors.accent,
                  },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text
                  style={[
                    styles.auditChipText,
                    inputReportId === a.id && { color: Colors.accent },
                  ]}
                  numberOfLines={1}
                >
                  {a.title}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <TextInput
        placeholder="Hipotez (tek satır)"
        placeholderTextColor={Colors.textDim}
        value={hypothesis}
        onChangeText={setHypothesis}
        style={styles.formInput}
      />
      <TextInput
        placeholder="Değişen dosyalar"
        placeholderTextColor={Colors.textDim}
        value={changes}
        onChangeText={setChanges}
        style={styles.formInput}
      />
      <TextInput
        placeholder="Test / doğrulama"
        placeholderTextColor={Colors.textDim}
        value={test}
        onChangeText={setTest}
        style={styles.formInput}
      />
      <View style={{ flexDirection: "row", gap: 10 }}>
        <TextInput
          placeholder="Süre (dk)"
          placeholderTextColor={Colors.textDim}
          value={duration}
          onChangeText={setDuration}
          keyboardType="number-pad"
          style={[styles.formInput, { flex: 0.4 }]}
        />
        <TextInput
          placeholder="Notlar"
          placeholderTextColor={Colors.textDim}
          value={notes}
          onChangeText={setNotes}
          style={[styles.formInput, { flex: 0.6 }]}
        />
      </View>
      <Pressable
        onPress={submit}
        style={({ pressed }) => [styles.submit, pressed && { opacity: 0.85 }]}
        testID="submit-cycle"
      >
        <Check color={Colors.bg} size={16} />
        <Text style={styles.submitText}>Cycle ekle</Text>
      </Pressable>
    </View>
  );
}

function CycleRow({ cycle, onDelete }: { cycle: ForgeCycle; onDelete: () => void }) {
  const meta = STATUS_META[cycle.status];
  return (
    <View style={styles.cycle}>
      <View style={[styles.statusPill, { backgroundColor: meta.bg, borderColor: meta.color }]}>
        <Text style={[styles.statusPillText, { color: meta.color }]}>{meta.label}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cycleSlug}>{cycle.slug}</Text>
        {cycle.hypothesis ? (
          <Text style={styles.cycleHyp} numberOfLines={2}>
            {cycle.hypothesis}
          </Text>
        ) : null}
        <Text style={styles.cycleMeta}>
          {cycle.durationMin}dk · {new Date(cycle.createdAt).toLocaleString("tr-TR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
      <Pressable onPress={onDelete} hitSlop={12} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
        <Trash2 color={Colors.textMuted} size={16} />
      </Pressable>
    </View>
  );
}

void RotateCcw;

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 80, gap: 16 },
  header: { marginBottom: 8 },
  eyebrow: {
    color: Colors.accent,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: { color: Colors.text, fontSize: 26, fontWeight: "700" },
  statRow: { flexDirection: "row", gap: 10 },
  stat: {
    flex: 1,
    backgroundColor: Colors.bgElevated,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 12,
    alignItems: "center",
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  statValue: { color: Colors.text, fontSize: 24, fontWeight: "700", marginTop: 4 },
  statTarget: { color: Colors.textDim, fontSize: 11, marginTop: 2 },
  cyclesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  sectionTitle: { color: Colors.text, fontSize: 18, fontWeight: "600" },
  addBtn: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.accent,
  },
  addBtnText: { color: Colors.bg, fontSize: 12, fontWeight: "700" },
  form: {
    backgroundColor: Colors.bgElevated,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 14,
    gap: 10,
  },
  formInput: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.text,
    borderWidth: 0.5,
    borderColor: Colors.border,
    fontSize: 13,
  },
  statusRow: { flexDirection: "row", gap: 8 },
  statusChip: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  statusChipText: { color: Colors.textMuted, fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  auditPicker: { marginVertical: 2 },
  subLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  auditChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bgElevated,
    maxWidth: 160,
  },
  auditChipText: { color: Colors.textMuted, fontSize: 12 },
  submit: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    marginTop: 4,
  },
  submitText: { color: Colors.bg, fontSize: 14, fontWeight: "700" },
  empty: {
    padding: 18,
    backgroundColor: Colors.bgElevated,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  emptyText: { color: Colors.textMuted, fontSize: 13, lineHeight: 19 },
  list: { gap: 10 },
  cycle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bgElevated,
  },
  statusPill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 0.5,
  },
  statusPillText: { fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  cycleSlug: { color: Colors.text, fontSize: 14, fontWeight: "600" },
  cycleHyp: { color: Colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 2 },
  cycleMeta: { color: Colors.textDim, fontSize: 10, marginTop: 4, letterSpacing: 0.5 },
});

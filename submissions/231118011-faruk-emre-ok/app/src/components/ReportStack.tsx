import { StyleSheet, Text, View } from "react-native";

const reports = [
  {
    agent: "Tighten capture action spacing without touching the audit mount.",
    bounds: "x38 y602 304x86",
    note: "CTA row competes with the floating audit action.",
    screen: "Capture"
  },
  {
    agent: "Keep exported report ownership visible and filenames stable.",
    bounds: "x28 y188 326x118",
    note: "Report shelf needs clearer artifact identity.",
    screen: "Reports"
  },
  {
    agent: "Preserve rollback evidence in the ratchet ledger.",
    bounds: "x24 y452 332x112",
    note: "Forge cycles should show failed hypotheses, not only wins.",
    screen: "Forge"
  }
];

export function ReportStack() {
  return (
    <View style={styles.stack}>
      {reports.map((report) => (
        <View key={report.screen} style={styles.reportRow}>
          <View style={styles.reportHeader}>
            <Text style={styles.screen}>{report.screen}</Text>
            <Text style={styles.bounds}>{report.bounds}</Text>
          </View>
          <Text style={styles.note}>{report.note}</Text>
          <Text style={styles.agent}>{report.agent}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 10
  },
  reportRow: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D7DEE8",
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 14
  },
  reportHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between"
  },
  screen: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 22
  },
  bounds: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 16
  },
  note: {
    color: "#334155",
    fontSize: 14,
    lineHeight: 20
  },
  agent: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18
  }
});

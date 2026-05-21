import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { screens, tabs, type RoutePath } from "./screens";

type Props = {
  route: RoutePath;
};

export function NoktaScreen({ route }: Props) {
  const screen = screens[route];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.shell}>
        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const active = tab.href === route;
            return (
              <Link key={tab.href} href={tab.href} style={StyleSheet.flatten([styles.tab, active && styles.activeTab])}>
                {tab.label}
              </Link>
            );
          })}
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.headerBand, { borderColor: screen.accent }]}>
            <Text style={styles.eyebrow}>{screen.eyebrow}</Text>
            <Text style={styles.title}>{screen.title}</Text>
            <Text style={styles.body}>{screen.body}</Text>
          </View>

          <View style={styles.metricGrid}>
            {screen.metrics.map((metric) => (
              <View key={metric.label} style={styles.metricCard}>
                <Text style={styles.metricValue}>{metric.value}</Text>
                <Text style={styles.metricLabel}>{metric.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.workBand}>
            <View style={[styles.accentLine, { backgroundColor: screen.accent }]} />
            <View style={styles.workCopy}>
              <Text style={styles.workTitle}>{screen.primary}</Text>
              <Text style={styles.workText}>{screen.secondary}</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC"
  },
  shell: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 8
  },
  tabBar: {
    alignItems: "center",
    backgroundColor: "#E2E8F0",
    borderRadius: 8,
    flexDirection: "row",
    gap: 6,
    height: 48,
    justifyContent: "space-between",
    padding: 4
  },
  tab: {
    borderRadius: 6,
    color: "#475569",
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 38,
    minHeight: 38,
    overflow: "hidden",
    textAlign: "center"
  },
  activeTab: {
    backgroundColor: "#FFFFFF",
    color: "#0F172A"
  },
  content: {
    gap: 16,
    paddingBottom: 136,
    paddingTop: 18
  },
  headerBand: {
    backgroundColor: "#FFFFFF",
    borderLeftWidth: 5,
    borderRadius: 8,
    padding: 20
  },
  eyebrow: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
    textTransform: "uppercase"
  },
  title: {
    color: "#0F172A",
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 44,
    marginBottom: 10
  },
  body: {
    color: "#334155",
    fontSize: 16,
    lineHeight: 23
  },
  metricGrid: {
    flexDirection: "row",
    gap: 10
  },
  metricCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 92,
    padding: 12
  },
  metricValue: {
    color: "#0F172A",
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 28
  },
  metricLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
    marginTop: 6
  },
  workBand: {
    alignItems: "stretch",
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 132,
    overflow: "hidden"
  },
  accentLine: {
    width: 8
  },
  workCopy: {
    flex: 1,
    gap: 8,
    padding: 16
  },
  workTitle: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 23
  },
  workText: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 20
  }
});

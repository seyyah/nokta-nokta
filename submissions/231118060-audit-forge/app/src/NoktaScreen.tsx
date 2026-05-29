import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BridgePanel } from "./components/BridgePanel";
import { VoiceAvatarPanel } from "./components/VoiceAvatarPanel";
import { getScreen, screens, type ScreenKey } from "./screens";

type Props = {
  screenKey: ScreenKey;
};

export function NoktaScreen({ screenKey }: Props) {
  const screen = getScreen(screenKey);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{screen.eyebrow}</Text>
        <Text style={styles.title}>{screen.title}</Text>
        <Text style={styles.summary}>{screen.summary}</Text>
      </View>

      <View style={styles.tabs} accessibilityRole="tablist">
        {screens.map((item) => {
          const isActive = item.key === screen.key;
          return (
            <Link href={item.route} asChild key={item.key}>
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                style={[
                  styles.tab,
                  isActive && { backgroundColor: item.accent, borderColor: item.accent }
                ]}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{item.label}</Text>
              </Pressable>
            </Link>
          );
        })}
      </View>

      <View style={styles.metrics}>
        {screen.metrics.map((metric) => (
          <View style={styles.metric} key={metric.label}>
            <Text style={styles.metricValue}>{metric.value}</Text>
            <Text style={styles.metricLabel}>{metric.label}</Text>
          </View>
        ))}
      </View>

      {screen.key === "capture" ? <VoiceAvatarPanel /> : null}
      {screen.key === "bridge" ? <BridgePanel /> : null}

      <View style={[styles.focusBand, { borderLeftColor: screen.accent }]}>
        <Text style={styles.bandTitle}>Audit focus</Text>
        <Text style={styles.bandCopy}>
          FAB bu ekranda route adini {screen.label} olarak alir; storage, capture ve share isleri host
          deps uzerinden enjekte edilir.
        </Text>
      </View>

      <View style={styles.list}>
        {screen.actions.map((action) => (
          <View style={styles.row} key={action.title}>
            <View style={[styles.dot, { backgroundColor: screen.accent }]} />
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{action.title}</Text>
              <Text style={styles.rowDetail}>{action.detail}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 130,
    backgroundColor: "#f4f5f2",
    gap: 18
  },
  header: {
    gap: 8,
    paddingTop: 10
  },
  eyebrow: {
    color: "#6f4e1f",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  title: {
    color: "#1f1f1f",
    fontSize: 30,
    fontWeight: "900"
  },
  summary: {
    color: "#4a4a4a",
    fontSize: 16,
    lineHeight: 23
  },
  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  tab: {
    minHeight: 44,
    flexGrow: 1,
    flexBasis: "47%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d0c6b8",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fffaf2"
  },
  tabText: {
    color: "#2f2f2f",
    fontSize: 13,
    fontWeight: "800"
  },
  tabTextActive: {
    color: "#ffffff"
  },
  metrics: {
    flexDirection: "row",
    gap: 10
  },
  metric: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dfd5c8",
    backgroundColor: "#ffffff",
    padding: 12,
    minHeight: 82,
    justifyContent: "center"
  },
  metricValue: {
    color: "#1f1f1f",
    fontSize: 21,
    fontWeight: "900"
  },
  metricLabel: {
    color: "#625b52",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
    textTransform: "uppercase"
  },
  focusBand: {
    borderLeftWidth: 5,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    padding: 16,
    gap: 6
  },
  bandTitle: {
    color: "#1f1f1f",
    fontSize: 18,
    fontWeight: "900"
  },
  bandCopy: {
    color: "#4a4a4a",
    fontSize: 15,
    lineHeight: 22
  },
  list: {
    gap: 10
  },
  row: {
    flexDirection: "row",
    gap: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dfd5c8",
    backgroundColor: "#ffffff",
    padding: 14
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6
  },
  rowText: {
    flex: 1,
    gap: 4
  },
  rowTitle: {
    color: "#1f1f1f",
    fontSize: 16,
    fontWeight: "900"
  },
  rowDetail: {
    color: "#56524c",
    fontSize: 14,
    lineHeight: 20
  }
});

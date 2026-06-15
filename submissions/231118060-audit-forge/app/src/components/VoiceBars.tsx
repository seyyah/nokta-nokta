import { StyleSheet, View } from "react-native";

type Props = {
  amplitude: number;
};

const weights = [0.28, 0.45, 0.72, 0.95, 0.78, 0.52, 0.36, 0.62, 0.84, 0.5, 0.32, 0.68];

export function VoiceBars({ amplitude }: Props) {
  return (
    <View style={styles.wrap} accessibilityLabel="Live microphone level visualization">
      {weights.map((weight, index) => {
        const height = 10 + Math.round(amplitude * weight * 52);
        const opacity = 0.32 + amplitude * 0.58;
        return (
          <View
            key={`${weight}-${index}`}
            style={[
              styles.bar,
              {
                height,
                opacity,
                backgroundColor: amplitude > 0.18 ? "#2f6f66" : "#89938f"
              }
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    paddingHorizontal: 4
  },
  bar: {
    width: 10,
    borderRadius: 5
  }
});

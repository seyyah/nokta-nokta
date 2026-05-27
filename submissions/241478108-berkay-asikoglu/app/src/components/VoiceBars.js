import React, { memo } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const BAR_COUNT = 12;

function VoiceBars({ rms }) {
  const masterValue = React.useRef(new Animated.Value(0.1)).current;

  React.useEffect(() => {
    const target = Math.min(1, Math.max(0.05, rms));
    Animated.spring(masterValue, {
      toValue: target,
      useNativeDriver: true,
      friction: 6,
      tension: 80,
    }).start();
  }, [rms, masterValue]);

  return (
    <View style={styles.container}>
      {Array.from({ length: BAR_COUNT }).map((_, i) => {
        const scale = masterValue.interpolate({
          inputRange: [0, 1],
          outputRange: [
            0.05 + 0.05 * Math.sin(i * 0.8),
            0.3 + 0.7 * Math.abs(Math.sin(i * 0.8)),
          ],
        });
        return (
          <Animated.View
            key={i}
            style={[
              styles.bar,
              {
                opacity: rms > 0.02 ? 1 : 0.3,
                transform: [{ scaleY: scale }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

export default memo(VoiceBars);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 120,
    gap: 6,
  },
  bar: {
    width: 8,
    height: 100,
    borderRadius: 4,
    backgroundColor: '#a855f7',
  },
});

import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Dimensions, Animated, Easing, TouchableOpacity } from 'react-native';

const { width } = Dimensions.get('window');
const graphWidth = width - 40;
const graphHeight = 300;

// Connect parent to child
const drawLine = (p1, p2, isSuggestion = false) => {
  if (!p1 || !p2) return null;
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;

  const color = isSuggestion ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.6)';

  return (
    <View
      key={`${p1.id}-${p2.id}-line`}
      style={{
        position: 'absolute',
        top: midY,
        left: midX - length / 2,
        width: length,
        height: isSuggestion ? 1 : 2,
        backgroundColor: color,
        transform: [{ rotate: `${angle}deg` }],
        zIndex: 1,
        borderStyle: isSuggestion ? 'dashed' : 'solid',
      }}
    />
  );
};

export default function NodeGraph({ nodes = [] }) {
  const opacities = useRef({}).current;
  const [pulse] = useState(new Animated.Value(1));

  useEffect(() => {
    // Pulse animation for suggestions
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true })
      ])
    ).start();
  }, []);

  useEffect(() => {
    // Fade in animation for any new node
    nodes.forEach(node => {
      if (!opacities[node.id]) {
        opacities[node.id] = new Animated.Value(0);
        Animated.timing(opacities[node.id], {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();
      }
    });
  }, [nodes]);

  return (
    <View style={styles.graphContainer}>
      
      {/* Draw lines for confirmed nodes */}
      {nodes.map((node) => {
        if (!node.parentId) return null;
        const parent = nodes.find(n => n.id === node.parentId);
        return drawLine(node, parent);
      })}
      
      {/* Draw Confirmed Nodes */}
      {nodes.map((node) => (
        <Animated.View
          key={node.id}
          style={[
            styles.nodeWrapper,
            { top: node.y - 20, left: node.x - 40, opacity: opacities[node.id] || 1 }
          ]}
        >
          <View style={styles.nodeBubble}>
            <Text style={styles.nodeText} numberOfLines={1}>{node.text}</Text>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  graphContainer: {
    width: graphWidth,
    height: graphHeight,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.1)',
    position: 'relative',
    marginBottom: 20,
  },
  nodeWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  nodeBubble: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#a855f7',
    shadowColor: '#a855f7',
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  nodeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase'
  }
});

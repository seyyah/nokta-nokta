import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface CardProps {
  title: string;
  subtitle?: string;
  value?: string;
  progress?: number;
  icon?: string;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, value, progress, icon, onPress }) => {
  const CardComponent = onPress ? TouchableOpacity : View;
  const extraProps = onPress ? { activeOpacity: 0.8, onPress } : {};

  return (
    <CardComponent style={styles.card} {...extraProps}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={styles.title}>{title}</Text>
        </View>
        {value && <Text style={styles.value}>{value}</Text>}
      </View>
      
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      {progress !== undefined && (
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>%{progress}</Text>
        </View>
      )}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    flexShrink: 1,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4f46e5',
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4f46e5',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
});

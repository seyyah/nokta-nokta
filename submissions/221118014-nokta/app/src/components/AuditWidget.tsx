import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';

export default function AuditWidget({ 
  onExpertCall, 
  onDictateStart, 
  onDictateEnd 
}: { 
  onExpertCall: () => void; 
  onDictateStart?: () => void; 
  onDictateEnd?: () => void; 
}) {
  const [reports, setReports] = useState<string[]>([]);
  const [isDictating, setIsDictating] = useState(false);
  const [forgeState, setForgeState] = useState<'idle'|'running'|'fail'|'stuck'>('idle');

  const dictateReport = () => {
    setIsDictating(true);
    if (onDictateStart) onDictateStart();
    // Simulate Voice -> STT -> Markdown delay
    setTimeout(() => {
      setIsDictating(false);
      if (onDictateEnd) onDictateEnd();
      setReports(prev => [...prev, `[Markdown] Audit Raporu #${prev.length + 1} - Burn-in tesisi incelendi.`]);
    }, 2000);
  };

  const simulateForgeStuck = () => {
    setForgeState('running');
    // Simulate Forge cycle: >=2 success, >=1 rollback, then STUCK
    setTimeout(() => {
      setForgeState('fail'); // Cycle 1 FAIL
      setTimeout(() => {
         setForgeState('stuck'); // Cycle 2 FAIL -> STUCK
         // Trigger Expert Call automatically
         onExpertCall();
      }, 2000);
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audit & Forge (Nokta-Nokta)</Text>
      
      <View style={styles.reportsContainer}>
        {reports.length === 0 && <Text style={styles.emptyText}>Henüz rapor yok. Dikte edin.</Text>}
        {reports.map((r, i) => (
          <Text key={i} style={styles.reportText}>✓ {r}</Text>
        ))}
        {isDictating && <ActivityIndicator color="#00ffcc" style={{marginTop: 10}}/>}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.btn, isDictating && styles.btnActive]} 
          onPress={dictateReport}
          disabled={isDictating || reports.length >= 3}
        >
          <Text style={styles.btnText}>
            {isDictating ? 'Ses Dinleniyor...' : `Rapor Dikte Et (${reports.length}/3)`}
          </Text>
        </TouchableOpacity>

        {reports.length >= 3 && (
          <TouchableOpacity 
            style={[styles.btn, styles.forgeBtn]} 
            onPress={simulateForgeStuck}
            disabled={forgeState === 'running' || forgeState === 'fail'}
          >
            <Text style={styles.btnText}>
               {forgeState === 'idle' ? 'Forge Döngüsünü Başlat' : 
                forgeState === 'running' ? 'Agent Çalışıyor... (Cycle 1)' : 
                forgeState === 'fail' ? 'FAIL - Rollback... (Cycle 2)' : 'STUCK!'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  reportsContainer: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 10,
    minHeight: 80,
    marginBottom: 15,
  },
  reportText: {
    color: '#ccc',
    marginBottom: 5,
    fontFamily: 'monospace',
    fontSize: 12,
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
  },
  actions: {
    gap: 10,
  },
  btn: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  btnActive: {
    borderColor: '#00ffcc',
    backgroundColor: '#1a332d',
  },
  forgeBtn: {
    backgroundColor: '#4a235a',
    borderColor: '#8e44ad',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});

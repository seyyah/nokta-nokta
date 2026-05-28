import React, { useState, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, PanResponder, Dimensions } from 'react-native';
import { ProposalModal } from './ProposalModal';
import { captureScreen } from 'react-native-view-shot';

export const ProposalFAB = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  
  const [startPoint, setStartPoint] = useState<{x: number, y: number} | null>(null);
  const [currentPoint, setCurrentPoint] = useState<{x: number, y: number} | null>(null);
  
  // Seçilen alanın koordinatlarını tutacak (x, y, width, height)
  const [selectedArea, setSelectedArea] = useState<{x: number, y: number, w: number, h: number} | null>(null);
  const [screenshotUri, setScreenshotUri] = useState<string | null>(null);

  const handleFabPress = () => {
    if (selectionMode) {
      setSelectionMode(false);
      setStartPoint(null);
      setCurrentPoint(null);
    } else {
      setSelectionMode(true);
      setStartPoint(null);
      setCurrentPoint(null);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        setStartPoint({ x: pageX, y: pageY });
        setCurrentPoint({ x: pageX, y: pageY });
      },
      onPanResponderMove: (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        setCurrentPoint({ x: pageX, y: pageY });
      },
      onPanResponderRelease: async () => {
        // Seçim alanını hesapla
        if (startPoint && currentPoint) {
          const minX = Math.min(startPoint.x, currentPoint.x);
          const minY = Math.min(startPoint.y, currentPoint.y);
          const w = Math.abs(currentPoint.x - startPoint.x);
          const h = Math.abs(currentPoint.y - startPoint.y);
          
          setSelectedArea({ x: Math.round(minX), y: Math.round(minY), w: Math.round(w), h: Math.round(h) });
        }
        
        // Ekran görüntüsü al
        // Render güncellemelerini beklemek için ufak bir timeout
        setTimeout(async () => {
          try {
            const uri = await captureScreen({
              format: "jpg",
              quality: 0.6,
              result: "base64" // Direkt base64 dönüyor, dosya yolu değil
            });
            setScreenshotUri(uri);
          } catch (error) {
            console.error("Capture Error:", error);
          }
          
          setSelectionMode(false);
          setModalVisible(true);
          setStartPoint(null);
          setCurrentPoint(null);
        }, 100);
      },
    })
  ).current;

  const renderSelectionBox = () => {
    if (!startPoint || !currentPoint) return null;
    const minX = Math.min(startPoint.x, currentPoint.x);
    const minY = Math.min(startPoint.y, currentPoint.y);
    const w = Math.abs(currentPoint.x - startPoint.x);
    const h = Math.abs(currentPoint.y - startPoint.y);

    return (
      <View style={[styles.selectionBox, { left: minX, top: minY, width: w, height: h }]} />
    );
  };

  return (
    <>
      {selectionMode && (
        <View style={styles.selectionOverlay} {...panResponder.panHandlers}>
          {!startPoint && (
            <View style={styles.selectionBanner}>
              <Text style={styles.selectionText}>İşaretlemek için ekranda parmağınızı sürükleyin</Text>
            </View>
          )}
          {renderSelectionBox()}
        </View>
      )}

      <TouchableOpacity 
        style={[styles.fab, selectionMode && styles.fabCancel]} 
        activeOpacity={0.8}
        onPress={handleFabPress}
      >
        <Text style={styles.icon}>{selectionMode ? '✕' : '💡'}</Text>
      </TouchableOpacity>

      <ProposalModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        area={selectedArea}
        screenshotBase64={screenshotUri}
      />
    </>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  selectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    backgroundColor: 'rgba(0,0,0,0.15)',
    zIndex: 998,
  },
  selectionBox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
  },
  selectionBanner: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  selectionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 40,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 999, 
  },
  fabCancel: {
    backgroundColor: '#e53e3e',
    shadowColor: '#e53e3e',
  },
  icon: {
    fontSize: 24,
    color: '#fff',
  },
});

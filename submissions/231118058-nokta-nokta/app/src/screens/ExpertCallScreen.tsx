import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Mic, CheckCircle } from 'lucide-react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';

const ExpertCallScreen = () => {
    const navigation = useNavigation<any>();
    const jitsiUrl = "https://meet.jit.si/nokta-nokta-231118058#config.disableDeepLinking=true";

    // Audio & UI States
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPreparing, setIsPreparing] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showWebView, setShowWebView] = useState(true);

    const startRecording = async () => {
        if (isPreparing || isProcessing) return;
        
        setShowWebView(false);
        setIsPreparing(true);
        
        // Jitsi'nin mikrofonu tamamen bırakması için 1 saniye bekle
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            if (recording) {
                await recording.stopAndUnloadAsync().catch(() => {});
            }
            
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            // Manuel obje oluşturuyoruz ki hata durumunda native'de asılı kalmasın
            const newRecording = new Audio.Recording();
            await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            
            try {
                await newRecording.startAsync();
                setRecording(newRecording);
                setIsRecording(true);
                setSuccessMessage('');
            } catch (startError) {
                // Başlatılamazsa (örn. donanım hala meşgulse) temizle!
                await newRecording.stopAndUnloadAsync().catch(() => {});
                throw startError;
            }
        } catch (err) {
            console.error('Kayıt başlatılamadı:', err);
            setShowWebView(true);
        } finally {
            setIsPreparing(false);
        }
    };

    const stopRecordingAndTranscribe = async () => {
        if (!recording) return;
        
        setIsRecording(false);
        setIsProcessing(true);

        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            
            if (!uri) throw new Error("URI bulunamadı");

            const base64Audio = await FileSystem.readAsStringAsync(uri, {
                encoding: 'base64' as any,
            });

            const host = '192.168.1.101'; 
            const sttResponse = await fetch(`http://${host}:3000/transcribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audioBase64: base64Audio, mimeType: 'audio/m4a' })
            });

            const sttData = await sttResponse.json();

            if (sttData.success && sttData.text) {
                await fetch(`http://${host}:3000/append-bridge`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ transcript: sttData.text })
                });

                setSuccessMessage('Transkript BRIDGE.md dosyasına eklendi!');
            } else {
                setSuccessMessage('Çeviri başarısız oldu.');
            }
        } catch (error) {
            console.error('İşlem hatası:', error);
            setSuccessMessage('Bağlantı hatası.');
        }

        setRecording(null);
        setIsProcessing(false);
        setShowWebView(true); // İşlem bitince görüşmeye geri dönme şansı
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft color="#fff" size={24} />
                    <Text style={styles.backText}>Geri</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Uzmana Bağlan</Text>
                <View style={{ width: 60 }} />
            </View>
            
            {showWebView ? (
                <WebView
                    source={{ uri: jitsiUrl }}
                    style={styles.webview}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    mediaPlaybackRequiresUserAction={false}
                    allowsInlineMediaPlayback={true}
                    allowsFullscreenVideo={true}
                    originWhitelist={['*']}
                />
            ) : (
                <View style={styles.webviewPlaceholder}>
                    <Mic color="#555" size={48} />
                    <Text style={styles.placeholderText}>Ses kaydı alınıyor...</Text>
                    <Text style={styles.placeholderSub}>Donanım çakışmasını önlemek için görüşme duraklatıldı.</Text>
                </View>
            )}
            
            {/* Otonom Ses Kayıt Kontrolleri */}
            <View style={styles.recordingContainer}>
                {successMessage ? (
                    <View style={styles.successBox}>
                        <CheckCircle color="#2ecc71" size={16} />
                        <Text style={styles.successText}>{successMessage}</Text>
                    </View>
                ) : null}

                <TouchableOpacity 
                    style={[styles.recordBtn, isRecording && styles.recordBtnActive, (isProcessing || isPreparing) && { opacity: 0.7 }]} 
                    onPress={isRecording ? stopRecordingAndTranscribe : startRecording}
                    disabled={isProcessing || isPreparing}
                >
                    {(isProcessing || isPreparing) ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Mic color="#fff" size={20} />
                    )}
                    <Text style={styles.recordBtnText}>
                        {isProcessing ? 'Yazıya Dökülüyor...' : isPreparing ? 'Mikrofon Açılıyor...' : isRecording ? 'Kaydı Bitir & Otonom Aktar' : 'Görüşme Özetini Kaydet'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: '#1E1E1E',
        marginTop: Platform.OS === 'android' ? 30 : 0,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
        width: 60,
    },
    backText: {
        color: '#fff',
        marginLeft: 5,
        fontSize: 16,
    },
    webview: {
        flex: 1,
    },
    recordingContainer: {
        backgroundColor: '#1E1E1E',
        padding: 20,
        alignItems: 'center',
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    },
    recordBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3b5bfc',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 30,
        gap: 10,
        width: '100%',
        justifyContent: 'center',
    },
    recordBtnActive: {
        backgroundColor: '#e74c3c',
    },
    recordBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    successBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        gap: 8,
        backgroundColor: 'rgba(46, 204, 113, 0.1)',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(46, 204, 113, 0.3)',
        width: '100%',
        justifyContent: 'center',
    },
    successText: {
        color: '#2ecc71',
        fontSize: 14,
        fontWeight: 'bold',
    },
    webviewPlaceholder: {
        flex: 1,
        backgroundColor: '#111',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    placeholderText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 15,
    },
    placeholderSub: {
        color: '#aaa',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 5,
    }
});

export default ExpertCallScreen;

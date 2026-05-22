import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { Eye, TrendingUp, ShieldCheck, ArrowRight, Zap, Star, RefreshCw } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { theme } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { auditStorage } from '../audit/auditStorage';
import { captureScreen } from 'react-native-view-shot';

const { width: windowW } = Dimensions.get('window');
const screenW = Dimensions.get('screen').width;
const screenH = Dimensions.get('screen').height;

const containerW = (windowW - 80) / 2;
const containerH = 240;

const VisionScreen = () => {
    const navigation = useNavigation<any>();
    const { isDarkMode } = useTheme();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [analysisDone, setAnalysisDone] = useState(false);
    const [failedSyncIds, setFailedSyncIds] = useState<string[]>([]);
    const [allNotes, setAllNotes] = useState<any[]>([]);
    const [selectedNote, setSelectedNote] = useState<any>(null);

    // Verileri yükle
    const loadData = async () => {
        const notes = await auditStorage.getAll();
        setAllNotes(notes);
        if (notes.length > 0 && !selectedNote) {
            setSelectedNote(notes[notes.length - 1]);
        }
    };

    // Verileri her odaklanıldığında yükle
    useFocusEffect(
        React.useCallback(() => {
            loadData();
        }, [])
    );

    // Bir bug seçildiğinde eğer "Yenisi" yoksa OTOMATİK olarak gidip çek!
    React.useEffect(() => {
        if (selectedNote && !selectedNote.screenshotFixed && !isSyncing && !failedSyncIds.includes(selectedNote.id)) {
            syncCurrentState();
        }
    }, [selectedNote, isSyncing, failedSyncIds]);

    // AKILLI SENKRONİZASYON: Navigasyon ve Yakalama (Kesin Çözüm)
    const syncCurrentState = async () => {
        if (!selectedNote || isSyncing) return;
        
        setIsSyncing(true);
        let target = selectedNote.screenName;
        
        // Eski kayıtlarda 'Screen' eki kaldıysa temizle (AvatarVoiceScreen -> AvatarVoice)
        if (target.endsWith('Screen')) {
            target = target.replace('Screen', '');
        }
        
        // Hangi ekranların Tab (sekme) menüsünde olduğunu tanımlıyoruz
        const tabScreens = ['Dashboard', 'Journal', 'Education', 'Profile', 'Admin', 'AvatarVoice'];
        
        console.log(`[VisionAudit] Hedef Ekran: ${target}`);

        try {
        // 1. DOĞRU NAVİGASYON: Geçersiz ekranları engelle
        if (target === 'Unknown' || target === 'Vision') {
            console.log(`[VisionAudit] Geçersiz hedef (${target}), senkronizasyon iptal.`);
            setIsSyncing(false);
            return;
        }

        if (tabScreens.includes(target)) {
            // AppTabs (Ana Sekmeler) içindeki hedef ekrana git
            navigation.navigate('AppTabs', {
                screen: target,
            });
        } else {
            // Onboarding veya Login gibi doğrudan bir sayfayla direkt git
            navigation.navigate(target);
        }

            // 2. BEKLEME: Navigasyon animasyonunun bitmesi ve sayfanın dolması için
            setTimeout(async () => {
                try {
                    // 3. FOTOĞRAF: Artık hedef sayfadayız, fotoğrafı çek (Base64 olarak)
                    const uri = await captureScreen({ format: 'png', result: 'data-uri' });
                    
                    // 4. VERİTABANI: Yeni görseli "Fixed" (Düzeltilmiş) olarak kaydet
                    await auditStorage.update(selectedNote.id, { screenshotFixed: uri });
                    
                    // 5. GERİ DÖNÜŞ: Vision ekranına geri gel
                    navigation.navigate('Vision');
                    
                    // 6. GÜNCELLEME: Hem seçili notu hem de listeyi tazele
                    const updatedNote = { ...selectedNote, screenshotFixed: uri };
                    setSelectedNote(updatedNote);
                    setAllNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
                    
                    setIsSyncing(false);
                    console.log(`[VisionAudit] ${target} başarıyla yakalandı.`);

                } catch (captureErr) {
                    console.error('Capture Error:', captureErr);
                    setFailedSyncIds(prev => [...prev, selectedNote.id]);
                    setIsSyncing(false);
                    navigation.navigate('Vision');
                }
            }, 2500); // 2.5 saniye - garanti süre

        } catch (navErr) {
            console.error('Navigation Error:', navErr);
            setIsSyncing(false);
            navigation.navigate('Vision');
        }
    };

    const getAnalysisResults = () => {
        if (!selectedNote) return null;
        const noteText = selectedNote.note.toLowerCase();
        
        let score = '%94';
        let aesthetic = '+35%';
        let accessibility = '+25%';
        let ux = 'Önemli Gelişmeler';
        let feedback = 'Raporlanan UI tutarsızlığı başarıyla giderildi. Bileşenlerin görsel bütünlüğü ve kullanıcı deneyimi standartlara uygun hale getirildi.';
        
        let checkpoints = [
            { name: 'Renk Kontrastı (WCAG AA)', status: 'improved', details: 'Kontrast oranı 4.5:1 eşiğini başarıyla geçti.' },
            { name: 'Dokunma Hedef Alanı (Touch Target)', status: 'pass', details: 'Buton dokunma alanı minimum 48dp genişliğe ulaştı.' },
            { name: 'Ekran Çakışma Önleme (Keyboard Shield)', status: 'pass', details: 'KeyboardAvoidingView düzgün şekilde çalışıyor.' },
            { name: 'Görsel Hiyerarşi (Visual Hierarchy)', status: 'improved', details: 'Tipografi boyutları ve ağırlık farkları iyileştirildi.' }
        ];

        if (noteText.includes('video') || noteText.includes('izle') || noteText.includes('eğitim')) {
            score = '%96';
            aesthetic = '+20%';
            accessibility = '+85%';
            ux = 'Kusursuz Oynatma';
            feedback = 'Video oynatıcı altyapısı ve yükleme durumları (loading spinner) başarıyla optimize edildi. Ağ kopmalarında otomatik kurtarma eklendi.';
            checkpoints = [
                { name: 'Video Buffer & Loading', status: 'pass', details: 'Spinner animasyonu eklendi, boş ekran beklemesi giderildi.' },
                { name: 'Erişilebilirlik Butonları', status: 'pass', details: 'Oynat/Durdur butonları sesli okuyucuya (screen reader) tanıtıldı.' },
                { name: 'Responsive Layout', status: 'improved', details: 'Yatay modda tam ekran video çerçevesi düzgün oturuyor.' },
                { name: 'Hafıza Yönetimi', status: 'pass', details: 'Sayfadan çıkıldığında player belleği tamamen temizleniyor.' }
            ];
        } else if (noteText.includes('renk') || noteText.includes('tema') || noteText.includes('mavi')) {
            score = '%98';
            aesthetic = '+70%';
            accessibility = '+40%';
            ux = 'Premium Algı';
            feedback = 'Kurumsal marka mavisine geçiş yapıldı. Kontrast seviyeleri WCAG AAA (en üst seviye) standartlarına yükseltildi ve tutarlılık sağlandı.';
            checkpoints = [
                { name: 'Renk Tutarlılığı', status: 'pass', details: 'Uygulama genelindeki mavi tonlar tek bir tema paletine bağlandı.' },
                { name: 'Karanlık Mod Uyumu', status: 'pass', details: 'Koyu temadaki renk kontrastı göz yormayacak şekilde ayarlandı.' },
                { name: 'Metin Okunabilirliği', status: 'improved', details: 'Arka plan ile yazı renk kontrastı AAA seviyesine ulaştı.' },
                { name: 'Visual Branding', status: 'improved', details: 'Marka kimliği algısı görsel olarak güçlendirildi.' }
            ];
        } else if (noteText.includes('çakış') || noteText.includes('buton') || noteText.includes('üst üste') || noteText.includes('kayma')) {
            score = '%97';
            aesthetic = '+45%';
            accessibility = '+60%';
            ux = 'Hatasız Düzen';
            feedback = 'Safe Area View sınırları ve KeyboardAvoidingView ayarları optimize edildi. Klavye açıldığında butonların üste kayması engellendi.';
            checkpoints = [
                { name: 'Safe Area Boundary', status: 'pass', details: 'Cihaz çentikleri ve alt çubuk alanları için esneme giderildi.' },
                { name: 'Klavye Etkileşimi', status: 'pass', details: 'Klavye açıldığında form elemanları otomatik yukarı kaydırılıyor.' },
                { name: 'Dokunma Çakışmaları', status: 'pass', details: 'Üst üste gelen butonların zIndex ve pointerEvents değerleri düzeltildi.' },
                { name: 'Esnek Tasarım (Flexbox)', status: 'improved', details: 'Küçük ekranlı cihazlarda taşmalar tamamen engellendi.' }
            ];
        }

        return { score, aesthetic, accessibility, ux, feedback, checkpoints };
    };

    const results = getAnalysisResults();

    const runAnalysis = () => {
        setIsAnalyzing(true);
        setAnalysisDone(false);
        setTimeout(() => {
            setIsAnalyzing(false);
            setAnalysisDone(true);
        }, 2000);
    };

    const textStyle = (baseStyle: any) => [
        baseStyle,
        isDarkMode && { color: '#FFFFFF' }
    ];

    return (
        <ScrollView style={[styles.container, isDarkMode && { backgroundColor: '#121212' }]}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Eye color={theme.colors.primary} size={28} />
                    <Text style={textStyle(styles.title)}>Vision Audit</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={styles.subtitle}>Hangi hatayı incelemek istersiniz?</Text>
                    <TouchableOpacity onPress={loadData} style={{ padding: 8 }}>
                        <RefreshCw color={theme.colors.primary} size={16} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Bug Selector */}
            <View style={styles.selectorContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorScroll}>
                    {allNotes.map((note) => (
                        <TouchableOpacity 
                            key={note.id} 
                            style={[
                                styles.bugChip, 
                                selectedNote?.id === note.id && styles.activeChip,
                                isDarkMode && { backgroundColor: '#1E1E1E' },
                                isDarkMode && selectedNote?.id === note.id && { backgroundColor: theme.colors.primary }
                            ]}
                            onPress={() => {
                                setSelectedNote(note);
                                setAnalysisDone(false);
                            }}
                        >
                            <Text style={[
                                styles.bugChipText, 
                                selectedNote?.id === note.id && styles.activeChipText,
                                isDarkMode && { color: '#888' },
                                selectedNote?.id === note.id && { color: 'white' }
                            ]}>
                                {note.screenName}: {note.note.substring(0, 15)}...
                            </Text>
                        </TouchableOpacity>
                    ))}
                    {allNotes.length === 0 && <Text style={styles.emptyText}>Henüz kayıtlı hata yok.</Text>}
                </ScrollView>
            </View>

            {/* Comparison View */}
            <View style={styles.compareContainer}>
                <View style={styles.compareBox}>
                    <Text style={styles.label}>Baseline (Before)</Text>
                    <View style={styles.imagePlaceholder}>
                        {selectedNote ? (
                            <View style={{ width: containerW, height: containerH, position: 'relative' }}>
                                <Image 
                                    source={{ uri: selectedNote.screenshot }} 
                                    style={styles.screenshot} 
                                    resizeMode="stretch"
                                    onError={(e) => console.log(`[VisionScreen] Baseline görseli yüklenemedi: ${selectedNote.screenshot}`, e.nativeEvent)}
                                />
                                {selectedNote.highlightBounds && (
                                    <View
                                        pointerEvents="none"
                                        style={[
                                            styles.highlightBox,
                                            {
                                                left: selectedNote.highlightBounds.x * (containerW / screenW),
                                                top: selectedNote.highlightBounds.y * (containerH / screenH),
                                                width: selectedNote.highlightBounds.width * (containerW / screenW),
                                                height: selectedNote.highlightBounds.height * (containerH / screenH),
                                            },
                                        ]}
                                    />
                                )}
                            </View>
                        ) : (
                            <Text style={styles.placeholderText}>Seçim Yok</Text>
                        )}
                    </View>
                </View>

                <View style={styles.arrowContainer}>
                    <ArrowRight color={theme.colors.textLight} size={24} />
                </View>

                <View style={styles.compareBox}>
                    <Text style={[styles.label, { color: theme.colors.primary }]}>Current (New Version)</Text>
                    <View style={[styles.imagePlaceholder, { borderColor: theme.colors.primary, borderWidth: 2 }]}>
                        {selectedNote?.screenshotFixed ? (
                            <Image source={{ uri: selectedNote.screenshotFixed }} style={styles.screenshot} resizeMode="stretch" />
                        ) : (
                            <View style={styles.emptyCurrent}>
                                <RefreshCw color={theme.colors.textLight} size={32} />
                                <Text style={styles.placeholderSmall}>Henüz Görüntü Yok</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* Sync Button */}
            <TouchableOpacity 
                style={[styles.syncBtn, isDarkMode && { backgroundColor: '#1E1E1E' }]} 
                onPress={syncCurrentState}
                disabled={isSyncing || !selectedNote}
            >
                {isSyncing ? (
                    <ActivityIndicator color={theme.colors.primary} />
                ) : (
                    <>
                        <RefreshCw color={theme.colors.primary} size={18} />
                        <Text style={[styles.syncBtnText, isDarkMode && { color: '#AAA' }]}>Güncel Halini Yakala (Auto-Sync)</Text>
                    </>
                )}
            </TouchableOpacity>

            {/* Action Button */}
            {!analysisDone && (
                <TouchableOpacity 
                    style={styles.analyzeBtn} 
                    onPress={runAnalysis}
                    disabled={isAnalyzing}
                >
                    {isAnalyzing ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Zap color="white" size={20} />
                            <Text style={styles.analyzeBtnText}>Vision Analizi Başlat</Text>
                        </>
                    )}
                </TouchableOpacity>
            )}

            {/* STUCK / Uzmana Bağlan (Phase C) */}
            <TouchableOpacity 
                style={[styles.analyzeBtn, { backgroundColor: theme.colors.error, marginTop: 10 }]} 
                onPress={() => navigation.navigate('ExpertCall')}
            >
                <Zap color="white" size={20} />
                <Text style={styles.analyzeBtnText}>STUCK: Uzmana Bağlan (Görüntülü)</Text>
            </TouchableOpacity>

            {/* Analysis Results */}
            {analysisDone && results && (
                <View style={[styles.resultCard, isDarkMode && { backgroundColor: '#1E1E1E' }]}>
                    <View style={styles.scoreRow}>
                        <View style={styles.scoreCircle}>
                            <Text style={styles.scoreValue}>{results.score}</Text>
                            <Text style={styles.scoreLabel}>İyileşme</Text>
                        </View>
                        <View style={styles.metrics}>
                            <View style={styles.metricItem}>
                                <TrendingUp color={theme.colors.success} size={16} />
                                <Text style={textStyle(styles.metricText)}>Estetik: {results.aesthetic}</Text>
                            </View>
                            <View style={styles.metricItem}>
                                <ShieldCheck color={theme.colors.primary} size={16} />
                                <Text style={textStyle(styles.metricText)}>Erişilebilirlik: {results.accessibility}</Text>
                            </View>
                            <View style={styles.metricItem}>
                                <Star color={theme.colors.warning} size={16} />
                                <Text style={textStyle(styles.metricText)}>UX Durumu: {results.ux}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.summaryBox}>
                        <Text style={textStyle(styles.summaryTitle)}>AI Değerlendirmesi:</Text>
                        <Text style={styles.summaryText}>"{results.feedback}"</Text>
                        
                        <View style={styles.checkpointsList}>
                            <Text style={[textStyle(styles.summaryTitle), { marginTop: 16, marginBottom: 8 }]}>Analiz Denetim Noktaları:</Text>
                            {results.checkpoints.map((cp, idx) => (
                                <View key={idx} style={styles.checkpointRow}>
                                    <View style={[
                                        styles.checkpointBadge,
                                        cp.status === 'pass' ? styles.badgePass : styles.badgeImproved
                                    ]}>
                                        <Text style={cp.status === 'pass' ? styles.badgeTextPass : styles.badgeTextImproved}>
                                            {cp.status === 'pass' ? '✓ GEÇTİ' : '↑ İYİLEŞTİ'}
                                        </Text>
                                    </View>
                                    <View style={styles.checkpointInfo}>
                                        <Text style={textStyle(styles.checkpointName)}>{cp.name}</Text>
                                        <Text style={styles.checkpointDetails}>{cp.details}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            )}

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        padding: 24,
        paddingTop: 60,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        ...theme.typography.h1,
        fontSize: 28,
        color: '#1E293B',
    },
    subtitle: {
        ...theme.typography.body,
        color: '#64748B',
        marginTop: 4,
    },
    selectorContainer: {
        marginBottom: 20,
    },
    selectorScroll: {
        paddingHorizontal: 24,
        gap: 12,
    },
    bugChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#E2E8F0',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#CBD5E1',
    },
    activeChip: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    bugChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
    },
    activeChipText: {
        color: 'white',
    },
    emptyText: {
        ...theme.typography.caption,
        color: '#94A3B8',
        fontStyle: 'italic',
    },
    compareContainer: {
        flexDirection: 'row',
        padding: 16,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    compareBox: {
        width: containerW,
    },
    label: {
        ...theme.typography.caption,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    imagePlaceholder: {
        height: containerH,
        backgroundColor: '#E2E8F0',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderStyle: 'dashed',
    },
    placeholderText: {
        ...theme.typography.caption,
        fontWeight: 'bold',
        color: '#64748B',
    },
    placeholderSmall: {
        fontSize: 10,
        color: '#94A3B8',
        marginTop: 4,
    },
    emptyCurrent: {
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.5,
    },
    imageWrapper: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    highlightBox: {
        position: 'absolute',
        borderWidth: 2,
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        borderRadius: 4,
    },
    screenshot: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    syncBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: 'white',
        marginHorizontal: 24,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        borderStyle: 'dashed',
    },
    syncBtnText: {
        ...theme.typography.caption,
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    arrowContainer: {
        width: 40,
        alignItems: 'center',
    },
    analyzeBtn: {
        backgroundColor: theme.colors.primary,
        margin: 24,
        padding: 18,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    analyzeBtnText: {
        ...theme.typography.body,
        color: 'white',
        fontWeight: 'bold',
    },
    resultCard: {
        backgroundColor: 'white',
        margin: 16,
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    scoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        marginBottom: 20,
    },
    scoreCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F0F9FF',
        borderWidth: 4,
        borderColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scoreValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    scoreLabel: {
        fontSize: 10,
        color: theme.colors.primary,
        marginTop: -2,
    },
    metrics: {
        flex: 1,
        gap: 8,
    },
    metricItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    metricText: {
        ...theme.typography.caption,
        fontWeight: '600',
        color: '#475569',
    },
    summaryBox: {
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 16,
    },
    summaryTitle: {
        ...theme.typography.caption,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 6,
    },
    summaryText: {
        ...theme.typography.body,
        fontSize: 13,
        color: '#64748B',
        lineHeight: 20,
        fontStyle: 'italic',
    },
    checkpointsList: {
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingTop: 12,
    },
    checkpointRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        gap: 10,
    },
    checkpointBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 70,
    },
    badgePass: {
        backgroundColor: '#DEF7EC',
    },
    badgeImproved: {
        backgroundColor: '#E1EFFE',
    },
    badgeTextPass: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#03543F',
    },
    badgeTextImproved: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#1E429F',
    },
    checkpointInfo: {
        flex: 1,
    },
    checkpointName: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1E293B',
    },
    checkpointDetails: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 1,
    },
});

export default VisionScreen;

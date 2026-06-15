import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    Alert,
    Modal,
    ActivityIndicator,
    SafeAreaView, // Import SafeAreaView
} from 'react-native';
import { Book, CheckCircle, Play, ChevronRight, X, Clock, Award, GraduationCap } from 'lucide-react-native'; // Add GraduationCap for header
import { theme } from '../theme';
import { useTheme } from '../context/ThemeContext';

const MODULES = [
    {
        id: '1',
        title: 'Multipl Miyelom Nedir?',
        status: 'Tamamlandı',
        icon: <Book color={theme.colors.secondary} size={24} />,
        completed: true,
    },
    {
        id: '2',
        title: 'Ağrı Yönetimi',
        status: 'Devam Et',
        icon: <Play color={theme.colors.white} size={24} />, // Changed icon color for 'Devam Et' to white for better contrast on primary background
        completed: false,
    },
    {
        id: '3',
        title: 'Enfeksiyon Önleme',
        status: 'Başlamadı',
        icon: <Book color={theme.colors.textLight} size={24} />,
        completed: false,
    },
    {
        id: '4',
        title: 'Beslenme İpuçları',
        status: 'Başlamadı',
        icon: <Book color={theme.colors.textLight} size={24} />,
        completed: false,
    },
];

const EducationScreen = () => {
    const { isDarkMode, fontSize } = useTheme();
    const [selectedModule, setSelectedModule] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [moduleContent, setModuleContent] = React.useState<string | null>(null);

    const onSelectModule = (item: any) => {
        setModuleContent(null);
        setSelectedModule(item);
    };

    const containerStyle = [
        styles.container,
        isDarkMode && { backgroundColor: '#121212' }
    ];

    const textStyle = (baseStyle: any) => [
        baseStyle,
        isDarkMode && { color: '#FFFFFF' },
        { fontSize: (baseStyle.fontSize || 16) + (fontSize - 16) }
    ];

    const cardStyle = (baseStyle: any) => [
        baseStyle,
        isDarkMode && { backgroundColor: '#1E1E1E', borderColor: '#333' }
    ];

    const renderItem = ({ item }: { item: any }) => {
        const isContinuing = item.status === 'Devam Et';
        const isNotStarted = item.status === 'Başlamadı';

        return (
            <TouchableOpacity
                style={[
                    cardStyle(styles.card),
                    theme.shadows.soft,
                    isContinuing && { borderWidth: 1, borderColor: theme.colors.primary }, // Highlight 'Devam Et'
                ]}
                onPress={() => onSelectModule(item)}
            >
                <View style={[
                    styles.iconContainer,
                    isDarkMode && { backgroundColor: '#333' },
                    isContinuing && { backgroundColor: theme.colors.primary }, // Primary background for 'Devam Et'
                ]}>
                    {item.icon}
                </View>
                <View style={styles.cardInfo}>
                    <Text style={textStyle(styles.cardTitle)}>{item.title}</Text>
                    <Text style={[
                        styles.cardStatus,
                        item.completed && styles.completedText,
                        isContinuing && styles.inProgressText, // New style for 'Devam Et'
                        isNotStarted && styles.notStartedText, // New style for 'Başlamadı'
                        isDarkMode && !item.completed && !isContinuing && !isNotStarted && { color: '#888' } // Fallback for dark mode
                    ]}>
                        {item.status}
                    </Text>
                </View>
                {item.completed ? (
                    <CheckCircle color={theme.colors.success} size={20} />
                ) : (
                    <ChevronRight color={isContinuing ? theme.colors.primary : theme.colors.textLight} size={20} /> // Chevron color based on status
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={containerStyle}>
            <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                    <GraduationCap color={isDarkMode ? theme.colors.white : theme.colors.primary} size={28} />
                    <Text style={textStyle(styles.title)}>Eğitim Kütüphanesi</Text>
                </View>
                <Text style={[styles.subtitle, isDarkMode && { color: '#888' }]}>Sağlığınız hakkında her şeyi öğrenin.</Text>
            </View>

            <FlatList
                data={MODULES}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={!!selectedModule}
                onRequestClose={() => setSelectedModule(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, isDarkMode && { backgroundColor: '#1E1E1E' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={textStyle(styles.modalTitle)}>Eğitim İçeriği</Text>
                            <TouchableOpacity onPress={() => setSelectedModule(null)}>
                                <X color={isDarkMode ? '#FFF' : theme.colors.text} size={24} />
                            </TouchableOpacity>
                        </View>

                        {selectedModule && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={styles.moduleHero}>
                                    <View style={[styles.moduleIconLarge, isDarkMode && { backgroundColor: '#333' }]}>
                                        {selectedModule.icon}
                                    </View>
                                    <Text style={textStyle(styles.moduleTitleLarge)}>{selectedModule.title}</Text>
                                    <View style={styles.badgeRow}>
                                        <View style={[styles.badge, isDarkMode && { backgroundColor: '#333' }]}>
                                            <Clock size={14} color={theme.colors.secondary} />
                                            <Text style={[styles.badgeText, isDarkMode && { color: '#AAA' }]}>15 Dakika</Text>
                                        </View>
                                        <View style={[styles.badge, isDarkMode && { backgroundColor: '#333' }]}>
                                            <Award size={14} color={theme.colors.warning} />
                                            <Text style={[styles.badgeText, isDarkMode && { color: '#AAA' }]}>Sertifikalı</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.contentSection}>
                                    <Text style={textStyle(styles.sectionHeading)}>Giriş</Text>
                                    <Text style={[styles.sectionBody, isDarkMode && { color: '#888' }]}>
                                        Bu eğitim modülünde {selectedModule.title.toLowerCase()} hakkında temel bilgileri ve günlük yaşamda dikkat etmeniz gerekenleri öğreneceksiniz.
                                    </Text>

                                    <TouchableOpacity
                                        style={styles.startBtn}
                                        onPress={() => {
                                            setIsLoading(true);
                                            setTimeout(() => {
                                                setIsLoading(false);
                                                setModuleContent('Bu bölümün video içeriği başarıyla yüklendi. Aşağıdaki oynatıcıdan izlemeye başlayabilirsiniz.');
                                            }, 1000);
                                        }}
                                    >
                                        {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.startBtnText}>Dersi Başlat / Videoyu Aç</Text>}
                                    </TouchableOpacity>

                                    {moduleContent && (
                                        <View style={[styles.videoPlayer, isDarkMode && { backgroundColor: '#000' }]}>
                                            <Play color="white" size={40} />
                                            <Text style={styles.videoPlayerText}>Video Oynatılıyor...</Text>
                                        </View>
                                    )}

                                    <Text style={textStyle(styles.sectionHeading)}>Önemli Notlar</Text>
                                    <View style={styles.bulletItem}>
                                        <CheckCircle size={16} color={theme.colors.success} />
                                        <Text style={textStyle(styles.bulletText)}>Düzenli takip hayati önem taşır.</Text>
                                    </View>
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.xl, // Adjusted in SafeAreaView, but keep for consistency
        marginBottom: theme.spacing.md,
    },
    headerTitleRow: { // New style for title and icon
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 10,
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.text,
        // marginBottom: 4, // Removed, now handled by headerTitleRow
        fontSize: theme.typography.h1.fontSize + 4, // Slightly larger
        fontWeight: '800', // Bolder
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.textLight,
    },
    listContent: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.lg,
    },
    card: {
        backgroundColor: theme.colors.white,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.md + 4, // Increased vertical padding
        paddingHorizontal: theme.spacing.lg, // Increased horizontal padding
        borderRadius: theme.borderRadius.xl, // Larger border radius
        marginBottom: theme.spacing.md,
        // Added a subtle border for definition
        borderWidth: 1,
        borderColor: theme.colors.surface, // Default border color
    },
    iconContainer: {
        width: 56, // Larger icon container
        height: 56,
        borderRadius: 16, // Larger border radius
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    cardInfo: {
        flex: 1,
    },
    cardTitle: {
        ...theme.typography.body,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 2,
    },
    cardStatus: {
        ...theme.typography.caption,
    },
    completedText: {
        color: theme.colors.success,
        fontWeight: '600',
    },
    inProgressText: { // New style for 'Devam Et'
        color: theme.colors.primary,
        fontWeight: '600',
    },
    notStartedText: { // New style for 'Başlamadı'
        color: theme.colors.textLight,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.white,
        height: '80%',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: theme.spacing.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        ...theme.typography.h2, // Slightly larger for modal title
        color: theme.colors.text, // Changed from textLight for better prominence
        fontWeight: '700',
    },
    moduleHero: {
        alignItems: 'center',
        marginBottom: 30,
    },
    moduleIconLarge: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    moduleTitleLarge: {
        ...theme.typography.h2,
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: 12,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 12,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    badgeText: {
        ...theme.typography.caption,
        fontWeight: '600',
        color: theme.colors.text,
    },
    contentSection: {
        marginBottom: 30,
    },
    sectionHeading: {
        ...theme.typography.body,
        fontWeight: '700',
        color: theme.colors.text,
        marginTop: 20,
        marginBottom: 8,
    },
    sectionBody: {
        ...theme.typography.body,
        color: theme.colors.textLight,
        lineHeight: 24,
    },
    bulletItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 8,
    },
    bulletText: {
        ...theme.typography.body,
        color: theme.colors.text,
        fontSize: 15,
    },
    startBtn: {
        backgroundColor: theme.colors.primary,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 40,
    },
    startBtnText: {
        ...theme.typography.body,
        color: theme.colors.white,
        fontWeight: '700',
    },
    videoPlayer: {
        width: '100%',
        height: 180,
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    videoPlayerText: {
        ...theme.typography.caption,
        color: '#FFF',
        marginTop: 10,
        fontWeight: '600',
    },
});

export default EducationScreen;
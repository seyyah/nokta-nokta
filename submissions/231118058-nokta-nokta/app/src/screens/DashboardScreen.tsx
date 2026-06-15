import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Alert,
    Modal,
} from 'react-native';
import {
    CheckCircle2,
    TrendingDown,
    BookOpen,
    Bell,
    ChevronRight,
    Activity,
    Brain,
    Info,
    X,
} from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { theme } from '../theme';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
    const navigation = useNavigation<any>();
    const { isDarkMode, fontSize } = useTheme();
    const [selectedTip, setSelectedTip] = React.useState<any>(null);
    const progress = 78; // Progress percentage
    const size = 100;
    const strokeWidth = 8;
    const center = size / 2;
    const radius = size / 2 - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;

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

    return (
        <ScrollView
            style={containerStyle}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.greeting, isDarkMode && { color: '#888' }]}>Hoş geldiniz,</Text>
                    <Text style={textStyle(styles.username)}>Mehmet Bey</Text>
                </View>
                <TouchableOpacity
                    style={[styles.notificationBtn, isDarkMode && { backgroundColor: '#333' }]}
                    onPress={() => Alert.alert('Bildirimler', 'Henüz yeni bir bildirim yok.')}
                >
                    <Bell color={isDarkMode ? '#FFF' : theme.colors.text} size={24} />
                    <View style={styles.dot} />
                </TouchableOpacity>
            </View>

            {/* Progress Card */}
            <View style={[styles.progressCard, theme.shadows.medium]}>
                <View style={styles.progressInfo}>
                    <Text style={styles.progressLabel}>Tedavi Süreci</Text>
                    <Text style={styles.progressValue}>78%</Text>
                    <Text style={styles.progressSubtitle}>Kür Başarıyla İlerliyor</Text>
                </View>
                <View style={styles.svgContainer}>
                    <Svg width={size} height={size}>
                        <Circle
                            stroke={theme.colors.surface}
                            fill="transparent"
                            cx={center}
                            cy={center}
                            r={radius}
                            strokeWidth={strokeWidth}
                        />
                        <Circle
                            stroke={theme.colors.primary}
                            fill="transparent"
                            cx={center}
                            cy={center}
                            r={radius}
                            strokeWidth={strokeWidth}
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference - (circumference * progress) / 100}
                            strokeLinecap="round"
                        />
                    </Svg>
                    <Activity color={theme.colors.primary} size={24} style={styles.innerIcon} />
                </View>
            </View>

            {/* Main Action Grid */}
            <View style={styles.grid}>
                <TouchableOpacity
                    style={[cardStyle(styles.actionBtn), theme.shadows.soft]}
                    onPress={() => navigation.navigate('Journal')}
                >
                    <View style={[styles.actionIcon, { backgroundColor: isDarkMode ? '#432' : '#FFEDD5' }]}>
                        <Activity color={theme.colors.primary} size={24} />
                    </View>
                    <Text style={textStyle(styles.actionTitle)}>Semptom Kaydı</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[cardStyle(styles.actionBtn), theme.shadows.soft]}
                    onPress={() => navigation.navigate('Education')}
                >
                    <View style={[styles.actionIcon, { backgroundColor: isDarkMode ? '#234' : '#DBEAFE' }]}>
                        <BookOpen color={theme.colors.secondary} size={24} />
                    </View>
                    <Text style={textStyle(styles.actionTitle)}>Eğitim Rehberi</Text>
                </TouchableOpacity>
            </View>

            {/* Health Stats */}
            <View style={styles.statsContainer}>
                <View style={[cardStyle(styles.statItem), theme.shadows.soft]}>
                    <View style={styles.statHeader}>
                        <Text style={[styles.statLabel, isDarkMode && { color: '#888' }]}>Ağrı</Text>
                        <Info size={14} color={isDarkMode ? '#888' : theme.colors.textLight} />
                    </View>
                    <Text style={textStyle(styles.statValue)}>Düşük</Text>
                    <View style={[styles.progressLine, { backgroundColor: theme.colors.success, width: '30%' }]} />
                </View>
                <View style={[cardStyle(styles.statItem), theme.shadows.soft]}>
                    <View style={styles.statHeader}>
                        <Text style={[styles.statLabel, isDarkMode && { color: '#888' }]}>Halsizlik</Text>
                        <Info size={14} color={isDarkMode ? '#888' : theme.colors.textLight} />
                    </View>
                    <Text style={textStyle(styles.statValue)}>Orta</Text>
                    <View style={[styles.progressLine, { backgroundColor: theme.colors.warning, width: '60%' }]} />
                </View>
            </View>

            {/* Latest Content */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Sizin İçin Öneriler</Text>
            </View>

            <TouchableOpacity
                style={[cardStyle(styles.tipCard), theme.shadows.soft]}
                onPress={() => setSelectedTip({
                    title: 'Yorgunlukla Baş Çıkma',
                    description: 'Gün içinde 15 dakikalık kısa uykular enerjinizi toplayabilir. Ayrıca bol su içmek ve hafif yürüyüşler yapmak yorgunluk hissini azaltmaya yardımcı olur.',
                    icon: <Brain color={theme.colors.secondary} size={32} />
                })}
            >
                <View style={[styles.tipIconContainer, isDarkMode && { backgroundColor: '#223' }]}>
                    <Brain color={theme.colors.secondary} size={24} />
                </View>
                <View style={styles.tipContent}>
                    <Text style={textStyle(styles.tipTitle)}>Yorgunlukla Baş Çıkma</Text>
                    <Text style={[styles.tipDesc, isDarkMode && { color: '#888' }]}>Gün içinde 15 dakikalık kısa uykular enerjinizi toplayabilir.</Text>
                </View>
                <ChevronRight size={20} color={isDarkMode ? '#666' : theme.colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity
                style={[cardStyle(styles.tipCard), theme.shadows.soft, { marginTop: 12 }]}
                onPress={() => setSelectedTip({
                    title: 'Beslenme Düzeni',
                    description: 'Kemik sağlığınız için kalsiyum zengini gıdaları unutmayın. Süt ürünleri, yeşil yapraklı sebzeler ve doktorunuzun önerdiği takviyeleri düzenli kullanın.',
                    icon: <Activity color="#10B981" size={32} />
                })}
            >
                <View style={[styles.tipIconContainer, { backgroundColor: isDarkMode ? '#132' : '#F0FDF4' }]}>
                    <Activity color="#10B981" size={24} />
                </View>
                <View style={styles.tipContent}>
                    <Text style={textStyle(styles.tipTitle)}>Beslenme Düzeni</Text>
                    <Text style={[styles.tipDesc, isDarkMode && { color: '#888' }]}>Kemik sağlığınız için kalsiyum zengini gıdaları unutmayın.</Text>
                </View>
                <ChevronRight size={20} color={isDarkMode ? '#666' : theme.colors.textLight} />
            </TouchableOpacity>

            <Modal
                animationType="fade"
                transparent={true}
                visible={!!selectedTip}
                onRequestClose={() => setSelectedTip(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, isDarkMode && { backgroundColor: '#1E1E1E' }]}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setSelectedTip(null)} style={styles.closeBtn}>
                                <X color={isDarkMode ? '#FFF' : theme.colors.text} size={24} />
                            </TouchableOpacity>
                        </View>
                        {selectedTip && (
                            <View style={styles.tipDetailBody}>
                                <View style={[styles.tipDetailIcon, isDarkMode && { backgroundColor: '#333' }]}>
                                    {selectedTip.icon}
                                </View>
                                <Text style={textStyle(styles.tipDetailTitle)}>{selectedTip.title}</Text>
                                <Text style={[styles.tipDetailDesc, isDarkMode && { color: '#888' }]}>{selectedTip.description}</Text>
                                <TouchableOpacity
                                    style={styles.understandBtn}
                                    onPress={() => setSelectedTip(null)}
                                >
                                    <Text style={styles.understandBtnText}>Anladım</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    contentContainer: {
        padding: theme.spacing.lg,
        paddingTop: theme.spacing.xl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    greeting: {
        ...theme.typography.body,
        color: theme.colors.textLight,
    },
    username: {
        ...theme.typography.h1,
        color: theme.colors.text,
    },
    notificationBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.primary,
        borderWidth: 2,
        borderColor: theme.colors.surface,
    },
    progressCard: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    progressInfo: {
        flex: 1,
    },
    progressLabel: {
        ...theme.typography.caption,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 4,
    },
    progressValue: {
        ...theme.typography.h1,
        color: theme.colors.white,
        fontSize: 32,
    },
    progressSubtitle: {
        ...theme.typography.caption,
        color: theme.colors.white,
        fontWeight: '600',
    },
    svgContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        padding: 10,
        borderRadius: 60,
    },
    innerIcon: {
        position: 'absolute',
    },
    grid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.lg,
    },
    actionBtn: {
        width: (width - theme.spacing.lg * 2 - theme.spacing.md) / 2,
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        alignItems: 'center',
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    actionTitle: {
        ...theme.typography.caption,
        fontWeight: '600',
        color: theme.colors.text,
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.lg,
    },
    statItem: {
        width: (width - theme.spacing.lg * 2 - theme.spacing.md) / 2,
        backgroundColor: theme.colors.white,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    statLabel: {
        ...theme.typography.caption,
        color: theme.colors.textLight,
        fontWeight: '600',
    },
    statValue: {
        ...theme.typography.h3,
        color: theme.colors.text,
        marginBottom: 8,
    },
    progressLine: {
        height: 4,
        borderRadius: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
    },
    tipCard: {
        backgroundColor: theme.colors.white,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        flexDirection: 'row',
        alignItems: 'center',
    },
    tipIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: theme.colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    tipContent: {
        flex: 1,
    },
    tipTitle: {
        ...theme.typography.body,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 2,
    },
    tipDesc: {
        ...theme.typography.caption,
        color: theme.colors.textLight,
        lineHeight: 18,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: theme.colors.white,
        width: '100%',
        borderRadius: 24,
        padding: 24,
        ...theme.shadows.medium,
    },
    modalHeader: {
        alignItems: 'flex-end',
    },
    closeBtn: {
        padding: 4,
    },
    tipDetailBody: {
        alignItems: 'center',
    },
    tipDetailIcon: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    tipDetailTitle: {
        ...theme.typography.h2,
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: 12,
    },
    tipDetailDesc: {
        ...theme.typography.body,
        color: theme.colors.textLight,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    understandBtn: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    understandBtnText: {
        ...theme.typography.body,
        color: theme.colors.white,
        fontWeight: '700',
    },
});

export default DashboardScreen;

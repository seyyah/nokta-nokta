import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    Modal,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Plus, ChevronRight, Filter, X } from 'lucide-react-native';
import { theme } from '../theme';
import { useTheme } from '../context/ThemeContext';

const MOCK_JOURNAL_ENTRIES = [
    {
        id: '1',
        date: '26 Şubat 2025',
        pain: '4/10', // Updated to match new entry format
        fatigue: 'Var',
        appetite: 'İyi',
    },
    {
        id: '2',
        date: '25 Şubat 2025',
        pain: '2/10', // Updated to match new entry format
        fatigue: 'Yok',
        appetite: 'Az',
    },
    {
        id: '3',
        date: '24 Şubat 2025',
        pain: '0/10', // Updated to match new entry format
        fatigue: 'Yok',
        appetite: 'İyi',
    },
];

const JournalScreen = () => {
    const { isDarkMode, fontSize } = useTheme();
    const [modalVisible, setModalVisible] = useState(false);
    const [entries, setEntries] = useState(MOCK_JOURNAL_ENTRIES);
    const [newEntry, setNewEntry] = useState({
        pain: '', // Stored as a number string (e.g., "4")
        fatigue: 'Yok',
        appetite: 'İyi',
    });

    const containerStyle = [
        styles.container,
        isDarkMode && { backgroundColor: '#121212' }
    ];

    const textStyle = (baseStyle) => [
        baseStyle,
        isDarkMode && { color: '#FFFFFF' },
        { fontSize: (baseStyle.fontSize || 16) + (fontSize - 16) }
    ];

    const cardStyle = (baseStyle) => [
        baseStyle,
        isDarkMode && { backgroundColor: '#1E1E1E', borderColor: '#333' }
    ];

    const addEntry = () => {
        const painValue = parseInt(newEntry.pain);
        if (isNaN(painValue) || painValue < 0 || painValue > 10) {
            Alert.alert('Hata', 'Ağrı seviyesi 0 ile 10 arasında bir sayı olmalıdır.');
            return;
        }

        const entry = {
            id: (entries.length + 1).toString(),
            date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
            ...newEntry,
            pain: `${newEntry.pain}/10`, // Store as "X/10" for consistency with mock data and display
        };
        setEntries([entry, ...entries]);
        setModalVisible(false);
        setNewEntry({ pain: '', fatigue: 'Yok', appetite: 'İyi' });
        Alert.alert('Başarılı', 'Günlük kaydınız başarıyla eklendi.');
    };

    const renderSummary = () => (
        <View style={[
            styles.summaryCard, 
            theme.shadows.medium,
            isDarkMode ? { backgroundColor: '#2C2C2E', borderColor: '#444', borderWidth: 1 } : { backgroundColor: theme.colors.primary }
        ]}>
            <Text style={[styles.summaryTitle, { color: '#FFFFFF' }]}>Haftalık Özet</Text>
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: '#FFFFFF' }]}>4.2</Text>
                    <Text style={[styles.statLabel, { color: '#E0E0E0' }]}>Ort. Ağrı</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: '#FFFFFF' }]}>%85</Text>
                    <Text style={[styles.statLabel, { color: '#E0E0E0' }]}>İştah</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: '#FFFFFF' }]}>5/7</Text>
                    <Text style={[styles.statLabel, { color: '#E0E0E0' }]}>Kayıt</Text>
                </View>
            </View>
        </View>
    );

    const renderItem = ({ item }) => {
        // Extract number from "X/10" format
        const painNum = parseInt(item.pain.split('/')[0]) || 0;
        const painColor = painNum > 7 ? '#e53e3e' : painNum > 3 ? '#ecc94b' : '#38a169';

        return (
            <TouchableOpacity
                style={[cardStyle(styles.card), theme.shadows.soft]}
                onPress={() => Alert.alert('Detay', `${item.date} tarihli kayıt özeti.`)}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.dateRow}>
                        <View style={[styles.painIndicator, { backgroundColor: painColor }]} />
                        <Text style={textStyle(styles.dateText)}>{item.date}</Text>
                    </View>
                    <ChevronRight color={isDarkMode ? '#666' : theme.colors.textLight} size={20} />
                </View>
                <View style={styles.cardBody}>
                    <View style={styles.tagRow}>
                        <View style={[styles.tag, isDarkMode && { backgroundColor: '#333' }]}>
                            <Text style={[styles.tagText, isDarkMode && { color: '#AAA' }]}>🔥 Ağrı: {item.pain}</Text>
                        </View>
                        <View style={[styles.tag, isDarkMode && { backgroundColor: '#333' }]}>
                            <Text style={[styles.tagText, isDarkMode && { color: '#AAA' }]}>💤 Halsizlik: {item.fatigue}</Text>
                        </View>
                        <View style={[styles.tag, isDarkMode && { backgroundColor: '#333' }]}>
                            <Text style={[styles.tagText, isDarkMode && { color: '#AAA' }]}>🍽️ {item.appetite}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={containerStyle}>
            <View style={styles.header}>
                <Text style={textStyle(styles.title)}>Belirti Günlüğü</Text>
                <TouchableOpacity
                    style={[styles.filterBtn, isDarkMode && { backgroundColor: '#333' }]}
                    onPress={() => Alert.alert('Filtrele', 'Kayıtları tarihe göre filtreleyin.')}
                >
                    <Filter color={isDarkMode ? '#FFF' : theme.colors.text} size={20} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={entries}
                ListHeaderComponent={renderSummary}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity
                style={[styles.fab, theme.shadows.medium]}
                onPress={() => setModalVisible(true)}
            >
                <Plus color={theme.colors.white} size={28} />
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView 
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardView}
                    >
                        <View style={[styles.modalContent, isDarkMode && { backgroundColor: '#1E1E1E' }]}>
                            <View style={styles.modalHeader}>
                                <Text style={textStyle(styles.modalTitle)}>Bugün Nasıl Hissediyorsun?</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                                    <X color={isDarkMode ? '#FFF' : theme.colors.text} size={24} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollContent}>
                                <Text style={textStyle(styles.inputLabel)}>Ağrı Seviyesi (0-10)</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scoreRowContent}>
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                        <TouchableOpacity
                                            key={num}
                                            style={[
                                                styles.scoreBtn,
                                                newEntry.pain === num.toString() && styles.selectedScore,
                                                isDarkMode && { backgroundColor: '#333' },
                                                newEntry.pain === num.toString() && { backgroundColor: theme.colors.primary }
                                            ]}
                                            onPress={() => setNewEntry({ ...newEntry, pain: num.toString() })}
                                        >
                                            <Text style={[
                                                styles.scoreText,
                                                newEntry.pain === num.toString() && { color: 'white' }
                                            ]}>{num}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                <Text style={textStyle(styles.inputLabel)}>Halsizlik Durumu</Text>
                                <View style={styles.optionRow}>
                                    {['Yok', 'Az', 'Orta', 'Çok'].map((level) => (
                                        <TouchableOpacity
                                            key={level}
                                            style={[
                                                styles.optionBtn,
                                                newEntry.fatigue === level && styles.selectedOption,
                                                isDarkMode && { backgroundColor: '#333' },
                                                isDarkMode && newEntry.fatigue === level && { backgroundColor: theme.colors.primary }
                                            ]}
                                            onPress={() => setNewEntry({ ...newEntry, fatigue: level })}
                                        >
                                            <Text style={[
                                                styles.optionText,
                                                newEntry.fatigue === level && styles.selectedOptionText,
                                                isDarkMode && { color: '#AAA' },
                                                newEntry.fatigue === level && { color: theme.colors.white }
                                            ]}>{level}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={textStyle(styles.inputLabel)}>İştah Durumu</Text>
                                <View style={styles.optionRow}>
                                    {['İyi', 'Normal', 'Kötü'].map((status) => (
                                        <TouchableOpacity
                                            key={status}
                                            style={[
                                                styles.optionBtn,
                                                newEntry.appetite === status && styles.selectedOption,
                                                isDarkMode && { backgroundColor: '#333' },
                                                isDarkMode && newEntry.appetite === status && { backgroundColor: theme.colors.primary }
                                            ]}
                                            onPress={() => setNewEntry({ ...newEntry, appetite: status })}
                                        >
                                            <Text style={[
                                                styles.optionText,
                                                newEntry.appetite === status && styles.selectedOptionText,
                                                isDarkMode && { color: '#AAA' },
                                                newEntry.appetite === status && { color: theme.colors.white }
                                            ]}>{status}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <TouchableOpacity style={styles.saveBtn} onPress={addEntry}>
                                    <Text style={styles.saveBtnText}>Kaydı Tamamla</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.xl,
        marginBottom: theme.spacing.md,
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.text,
    },
    filterBtn: {
        width: 44,
        height: 44,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    summaryCard: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        marginHorizontal: theme.spacing.lg,
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.xl,
    },
    summaryTitle: {
        ...theme.typography.body,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        ...theme.typography.h2,
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    statLabel: {
        ...theme.typography.caption,
        color: theme.colors.textLight,
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: theme.colors.border,
    },
    card: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        marginHorizontal: theme.spacing.lg,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    painIndicator: {
        width: 4,
        height: 16,
        borderRadius: 2,
        marginRight: 8,
    },
    dateText: {
        ...theme.typography.body,
        fontWeight: '600',
        color: theme.colors.text,
    },
    cardBody: {
        marginTop: 4,
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    tag: {
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 11,
        color: theme.colors.text,
        fontWeight: '500',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    keyboardView: {
        width: '100%',
        flex: 1, // Allow KeyboardAvoidingView to take full height
        justifyContent: 'flex-end', // Push content to bottom
    },
    modalContent: {
        backgroundColor: theme.colors.white,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        flex: 1, // Allow modalContent to expand within KeyboardAvoidingView
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        ...theme.typography.h2,
        color: theme.colors.text,
    },
    closeBtn: {
        padding: 4,
    },
    modalScrollContent: { // Renamed and modified
        flexGrow: 1, // Allow content to push scroll view to fill available space
        paddingBottom: 60, // Increased padding to ensure save button is visible above keyboard
    },
    inputLabel: {
        ...theme.typography.body,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 12,
        marginTop: 8,
    },
    scoreRowContent: { // New style for horizontal ScrollView's contentContainerStyle
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 0, // Ensure no extra padding from parent
    },
    scoreBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        borderWidth: 1,
        borderColor: theme.colors.border,
        flexShrink: 0, // Prevent buttons from shrinking
    },
    selectedScore: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    scoreText: {
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    optionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 24,
    },
    optionBtn: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    selectedOption: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    optionText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.text,
    },
    selectedOptionText: {
        color: 'white',
    },
    saveBtn: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    saveBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    listContent: {
        paddingBottom: 100,
    },
});

export default JournalScreen;

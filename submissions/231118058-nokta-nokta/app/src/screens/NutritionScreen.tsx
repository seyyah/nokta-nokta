import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    TextInput,
    Alert,
} from 'react-native';
import { Apple, Dumbbell, Plus, ChevronRight, Calculator } from 'lucide-react-native';
import { theme } from '../theme';

const MOCK_DATA = [
    { id: '1', date: 'Bugün', exercise: '30 dk Yürüyüş', diet: '150gr Sebze' },
    { id: '2', date: 'Dün', exercise: '15 dk Yoga', diet: '200gr Meyve' },
];

const NutritionScreen = () => {
    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.card, theme.shadows.soft]}
            onPress={() => Alert.alert('Detay', `${item.date} tarihli özetiniz.`)}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.dateText}>{item.date}</Text>
                <ChevronRight color={theme.colors.textLight} size={20} />
            </View>
            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <Dumbbell color={theme.colors.primary} size={16} />
                    <Text style={styles.infoText}>{item.exercise}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Apple color={theme.colors.secondary} size={16} />
                    <Text style={styles.infoText}>{item.diet}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Beslenme & Egzersiz</Text>
                <TouchableOpacity
                    style={styles.statsBtn}
                    onPress={() => Alert.alert('Hesaplayıcı', 'Kalori ve egzersiz hesaplayıcı açılıyor...')}
                >
                    <Calculator color={theme.colors.text} size={20} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={MOCK_DATA}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <View style={styles.summaryBox}>
                        <Text style={styles.summaryTitle}>Günlük Hedefler</Text>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: '70%' }]} />
                        </View>
                        <Text style={styles.progressText}>Hedefinize %70 yaklaştınız!</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={[styles.fab, theme.shadows.medium]}
                onPress={() => Alert.alert('Yeni Kayıt', 'Yeni veri ekleme formu açılıyor...')}
            >
                <Plus color={theme.colors.white} size={28} />
            </TouchableOpacity>
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
    statsBtn: {
        width: 44,
        height: 44,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: 100,
    },
    summaryBox: {
        backgroundColor: theme.colors.primaryLight,
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.xl,
        marginBottom: theme.spacing.lg,
    },
    summaryTitle: {
        ...theme.typography.h3,
        color: theme.colors.primary,
        marginBottom: theme.spacing.sm,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: 'rgba(255,133,51,0.1)',
        borderRadius: 4,
        marginBottom: 8,
    },
    progressBarFill: {
        height: 8,
        backgroundColor: theme.colors.primary,
        borderRadius: 4,
    },
    progressText: {
        ...theme.typography.caption,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    card: {
        backgroundColor: theme.colors.white,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        marginBottom: theme.spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    dateText: {
        ...theme.typography.body,
        fontWeight: '600',
        color: theme.colors.text,
    },
    cardBody: {},
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    infoText: {
        ...theme.typography.body,
        marginLeft: 8,
        color: theme.colors.textLight,
    },
    fab: {
        position: 'absolute',
        bottom: theme.spacing.xl,
        right: theme.spacing.lg,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default NutritionScreen;

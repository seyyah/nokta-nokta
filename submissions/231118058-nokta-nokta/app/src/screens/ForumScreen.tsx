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
import { MessageCircle, Heart, Plus, Search } from 'lucide-react-native';
import { theme } from '../theme';

const TOPICS = [
    { id: '1', title: 'Beslenme İpuçları', category: 'Beslenme', replies: 8, likes: 12 },
    { id: '2', title: 'Tedavi Deneyimleri', category: 'Destek', replies: 15, likes: 24 },
    { id: '3', title: 'Yorgunlukla Başa Çıkma', category: 'Yaşam', replies: 4, likes: 9 },
];

const ForumScreen = () => {
    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.card, theme.shadows.soft]}
            onPress={() => Alert.alert('Forum', `"${item.title}" konusu açılıyor...`)}
        >
            <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{item.category}</Text>
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <View style={styles.cardFooter}>
                <View style={styles.stat}>
                    <MessageCircle color={theme.colors.textLight} size={16} />
                    <Text style={styles.statText}>{item.replies} Yorum</Text>
                </View>
                <View style={styles.stat}>
                    <Heart color={theme.colors.primary} size={16} />
                    <Text style={styles.statText}>{item.likes} Beğeni</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Topluluk Forumu</Text>
                <TouchableOpacity
                    style={styles.searchBtn}
                    onPress={() => Alert.alert('Arama', 'Forumda arama yapabilirsiniz.')}
                >
                    <Search color={theme.colors.text} size={20} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={TOPICS}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity
                style={[styles.fab, theme.shadows.medium]}
                onPress={() => Alert.alert('Yeni Konu', 'Yeni forum konusu oluşturma ekranı açılıyor...')}
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
    searchBtn: {
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
    card: {
        backgroundColor: theme.colors.white,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        marginBottom: theme.spacing.md,
    },
    categoryBadge: {
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginBottom: theme.spacing.sm,
    },
    categoryText: {
        ...theme.typography.caption,
        color: theme.colors.secondary,
        fontWeight: '700',
    },
    cardTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: theme.spacing.lg,
    },
    statText: {
        ...theme.typography.caption,
        color: theme.colors.textLight,
        marginLeft: 4,
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

export default ForumScreen;

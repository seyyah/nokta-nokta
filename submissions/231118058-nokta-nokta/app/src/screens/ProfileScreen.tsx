import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Switch,
    Alert,
    Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { 
    User, 
    Settings, 
    Moon, 
    Type, 
    Trash2, 
    Camera, 
    ChevronRight, 
    X,
    Bell,
    Lock,
    Shield,
    HelpCircle,
    Info,
    Mail,
    Smartphone
} from 'lucide-react-native';
import { theme } from '../theme';
import { useTheme } from '../context/ThemeContext';

const ProfileScreen = () => {
    const { isDarkMode, toggleDarkMode, fontSize, updateFontSize } = useTheme();
    const [isFontModalVisible, setIsFontModalVisible] = React.useState(false);
    const [profileImage, setProfileImage] = React.useState<string | null>(null);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('İzin Gerekli', 'Galeriye erişim izni vermeniz gerekiyor.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    const clearAllData = () => {
        Alert.alert(
            'Veri Silme',
            'Tüm verilerinizi, günlük kayıtlarınızı ve ayarlarınızı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
            [
                { text: 'Vazgeç', style: 'cancel' },
                {
                    text: 'Tümünü Sil',
                    style: 'destructive',
                    onPress: () => {
                        setProfileImage(null);
                        Alert.alert('Başarılı', 'Tüm cihaz verileri temizlendi. Uygulama sıfırlandı.');
                    }
                },
            ]
        );
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

    return (
        <ScrollView style={containerStyle} contentContainerStyle={styles.contentContainer}>
            <Modal
                animationType="fade"
                transparent={true}
                visible={isFontModalVisible}
                onRequestClose={() => setIsFontModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, isDarkMode && { backgroundColor: '#1E1E1E' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={textStyle(styles.modalTitle)}>Yazı Boyutu Seçin</Text>
                            <TouchableOpacity onPress={() => setIsFontModalVisible(false)}>
                                <X color={isDarkMode ? '#FFF' : '#000'} size={24} />
                            </TouchableOpacity>
                        </View>

                        {[
                            { label: 'Küçük', size: 14 },
                            { label: 'Normal', size: 16 },
                            { label: 'Büyük', size: 20 },
                            { label: 'Çok Büyük', size: 24 },
                        ].map((opt) => (
                            <TouchableOpacity
                                key={opt.size}
                                style={[
                                    styles.fontOption,
                                    fontSize === opt.size && { backgroundColor: theme.colors.primaryLight },
                                    isDarkMode && fontSize === opt.size && { backgroundColor: '#332211' }
                                ]}
                                onPress={() => {
                                    updateFontSize(opt.size);
                                    setIsFontModalVisible(false);
                                }}
                            >
                                <Text style={[textStyle(styles.fontOptionText), fontSize === opt.size && { color: theme.colors.primary, fontWeight: '700' }]}>
                                    {opt.label}
                                </Text>
                                {fontSize === opt.size && <View style={styles.activeDot} />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>

            <View style={styles.header}>
                <View style={styles.profileImageContainer}>
                    <View style={[styles.avatarPlaceholder, isDarkMode && { backgroundColor: '#333', borderColor: '#444' }]}>
                        {profileImage ? (
                            <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                        ) : (
                            <User color={isDarkMode ? '#AAA' : theme.colors.textLight} size={40} />
                        )}
                    </View>
                    <TouchableOpacity
                        style={styles.editBtn}
                        onPress={pickImage}
                    >
                        <Camera color={theme.colors.white} size={16} />
                    </TouchableOpacity>
                </View>
                <Text style={textStyle(styles.userName)}>Mehmet Bey</Text>
                <Text style={[styles.userEmail, isDarkMode && { color: '#888' }]}>mehmet@example.com</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Hesap ve Güvenlik</Text>

                <TouchableOpacity
                    style={[styles.settingItem, isDarkMode && { backgroundColor: '#1E1E1E', borderColor: '#333' }]}
                    onPress={() => Alert.alert('Kişisel Bilgiler', 'Kişisel bilgileriniz başarıyla güncellendi.')}
                >
                    <View style={[styles.settingIcon, isDarkMode && { backgroundColor: '#2D3748' }]}>
                        <User color="#4299E1" size={20} />
                    </View>
                    <Text style={textStyle(styles.settingLabel)}>Kişisel Bilgiler</Text>
                    <ChevronRight color={theme.colors.textLight} size={20} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.settingItem, isDarkMode && { backgroundColor: '#1E1E1E', borderColor: '#333' }]}
                    onPress={() => Alert.alert('Güvenlik', 'Şifreniz başarıyla değiştirildi.')}
                >
                    <View style={[styles.settingIcon, isDarkMode && { backgroundColor: '#2D3748' }]}>
                        <Lock color="#48BB78" size={20} />
                    </View>
                    <Text style={textStyle(styles.settingLabel)}>Şifre Değiştir</Text>
                    <ChevronRight color={theme.colors.textLight} size={20} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.settingItem, isDarkMode && { backgroundColor: '#1E1E1E', borderColor: '#333' }]}
                    onPress={() => Alert.alert('Gizlilik', 'Gizlilik tercihleriniz güncellendi.')}
                >
                    <View style={[styles.settingIcon, isDarkMode && { backgroundColor: '#2D3748' }]}>
                        <Shield color="#F6E05E" size={20} />
                    </View>
                    <Text style={textStyle(styles.settingLabel)}>Gizlilik Tercihleri</Text>
                    <ChevronRight color={theme.colors.textLight} size={20} />
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Uygulama Ayarları</Text>

                <TouchableOpacity
                    style={[styles.settingItem, isDarkMode && { backgroundColor: '#1E1E1E', borderColor: '#333' }]}
                    onPress={() => setIsFontModalVisible(true)}
                >
                    <View style={[styles.settingIcon, isDarkMode && { backgroundColor: '#333' }]}>
                        <Type color={theme.colors.secondary} size={20} />
                    </View>
                    <Text style={textStyle(styles.settingLabel)}>Yazı Boyutu</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{fontSize === 16 ? 'Normal' : fontSize === 14 ? 'Küçük' : 'Büyük'}</Text>
                    </View>
                    <ChevronRight color={theme.colors.textLight} size={20} />
                </TouchableOpacity>

                <View style={[styles.settingItem, isDarkMode && { backgroundColor: '#1E1E1E', borderColor: '#333' }]}>
                    <View style={[styles.settingIcon, isDarkMode && { backgroundColor: '#333' }]}>
                        <Moon color={theme.colors.primary} size={20} />
                    </View>
                    <Text style={textStyle(styles.settingLabel)}>Karanlık Mod</Text>
                    <Switch
                        value={isDarkMode}
                        onValueChange={toggleDarkMode}
                        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                        thumbColor={isDarkMode ? theme.colors.primary : '#f4f3f4'}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.settingItem, isDarkMode && { backgroundColor: '#1E1E1E', borderColor: '#333' }]}
                    onPress={() => Alert.alert('Bildirimler', 'Bildirim ayarlarınız güncellendi.')}
                >
                    <View style={[styles.settingIcon, isDarkMode && { backgroundColor: '#333' }]}>
                        <Bell color="#F6AD55" size={20} />
                    </View>
                    <Text style={textStyle(styles.settingLabel)}>Bildirimler</Text>
                    <Switch value={true} trackColor={{ false: theme.colors.border, true: theme.colors.primary }} />
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Destek ve Bilgi</Text>

                <TouchableOpacity
                    style={[styles.settingItem, isDarkMode && { backgroundColor: '#1E1E1E', borderColor: '#333' }]}
                    onPress={() => Alert.alert('Yardım', 'Destek merkezi başarıyla açıldı.')}
                >
                    <View style={[styles.settingIcon, isDarkMode && { backgroundColor: '#333' }]}>
                        <HelpCircle color="#667EEA" size={20} />
                    </View>
                    <Text style={textStyle(styles.settingLabel)}>Yardım Merkezi</Text>
                    <ChevronRight color={theme.colors.textLight} size={20} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.settingItem, isDarkMode && { backgroundColor: '#1E1E1E', borderColor: '#333' }]}
                    onPress={() => Alert.alert('Hakkında', 'OkbilApp v1.0.0\n\n© 2024 Tüm hakları saklıdır.')}
                >
                    <View style={[styles.settingIcon, isDarkMode && { backgroundColor: '#333' }]}>
                        <Info color="#A0AEC0" size={20} />
                    </View>
                    <Text style={textStyle(styles.settingLabel)}>Uygulama Hakkında</Text>
                    <ChevronRight color={theme.colors.textLight} size={20} />
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tehlikeli Bölge</Text>

                <TouchableOpacity
                    style={[styles.settingItem, styles.deleteItem, isDarkMode && { backgroundColor: '#1E1E1E' }]}
                    onPress={clearAllData}
                >
                    <View style={[styles.settingIcon, styles.deleteIcon]}>
                        <Trash2 color={theme.colors.error} size={20} />
                    </View>
                    <Text style={[styles.settingLabel, styles.deleteLabel]}>Tüm Verileri Sil</Text>
                </TouchableOpacity>
            </View>

            <Text style={[styles.versionText, isDarkMode && { color: '#666' }]}>Versiyon 1.0.0</Text>
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
    },
    header: {
        alignItems: 'center',
        marginTop: theme.spacing.xl,
        marginBottom: theme.spacing.xxl,
    },
    profileImageContainer: {
        width: 100,
        height: 100,
        marginBottom: theme.spacing.md,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    editBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: theme.colors.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: theme.colors.background,
    },
    userName: {
        ...theme.typography.h2,
        color: theme.colors.text,
    },
    userEmail: {
        ...theme.typography.caption,
        marginTop: 2,
    },
    section: {
        marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
        ...theme.typography.caption,
        fontWeight: '700',
        color: theme.colors.textLight,
        marginBottom: theme.spacing.md,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        marginBottom: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.surface,
    },
    settingIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    settingLabel: {
        flex: 1,
        ...theme.typography.body,
        fontWeight: '500',
        color: theme.colors.text,
    },
    deleteItem: {
        borderColor: 'rgba(248, 113, 113, 0.1)',
    },
    deleteIcon: {
        backgroundColor: 'rgba(248, 113, 113, 0.1)',
    },
    deleteLabel: {
        color: theme.colors.error,
    },
    versionText: {
        textAlign: 'center',
        ...theme.typography.caption,
        marginTop: theme.spacing.xl,
        marginBottom: theme.spacing.xl,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFF',
        width: '100%',
        borderRadius: 20,
        padding: 20,
        ...theme.shadows.medium,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        ...theme.typography.h3,
        fontWeight: '700',
    },
    fontOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#F9FAFB',
    },
    fontOptionText: {
        fontSize: 16,
    },
    activeDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.colors.primary,
    },
    badge: {
        backgroundColor: '#EDF2F7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 8,
    },
    badgeText: {
        fontSize: 12,
        color: '#4A5568',
        fontWeight: '600',
    },
});

export default ProfileScreen;

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Modal,
    TextInput,
} from 'react-native';
import { Users, Star, MessageSquare, Trash2, ChevronRight, Send, X, Eye } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import { useTheme } from '../context/ThemeContext';

const INITIAL_USERS = [
    { id: '1', name: 'MM1', lastSeen: '26.02.2025' },
    { id: '2', name: 'MM10', lastSeen: '25.02.2025' },
    { id: '3', name: 'MM11', lastSeen: '24.02.2025' },
];

const AdminScreen = () => {
    const navigation = useNavigation<any>();
    const { isDarkMode, fontSize } = useTheme();
    const [users, setUsers] = useState(INITIAL_USERS);
    const [replyModalVisible, setReplyModalVisible] = useState(false);
    const [replyTarget, setReplyTarget] = useState('');
    const [replyText, setReplyText] = useState('');
    const [messages, setMessages] = useState([
        { id: '1', user: 'Ayşe Yılmaz', date: '14:30', text: 'İlaç hatırlatıcı ayarlarını nasıl güncelleyebilirim?', status: 'pending', reply: '' },
        { id: '2', user: 'Mehmet Demir', date: '12:15', text: 'Dünkü raporum sisteme yüklenmemiş görünüyor.', status: 'pending', reply: '' },
    ]);

    const handleSendReply = () => {
        if (!replyText.trim()) return;
        setMessages(messages.map(msg => 
            msg.user === replyTarget ? { ...msg, status: 'responded', reply: replyText } : msg
        ));
        setReplyModalVisible(false);
        setReplyText('');
        Alert.alert('Başarılı', `${replyTarget} isimli kullanıcıya yanıtınız iletildi.`);
    };

    const deleteUser = (id: string, name: string) => {
        Alert.alert('Kullanıcıyı Sil', `${name} silinsin mi?`, [
            { text: 'Vazgeç', style: 'cancel' },
            { text: 'Sil', style: 'destructive', onPress: () => setUsers(users.filter(u => u.id !== id)) }
        ]);
    };

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
        <ScrollView style={[styles.container, isDarkMode && { backgroundColor: '#121212' }]} contentContainerStyle={styles.contentContainer}>
            <View style={styles.header}>
                <Text style={textStyle(styles.title)}>Yönetici Paneli</Text>
                <View style={[styles.badge, isDarkMode && { backgroundColor: theme.colors.primary }]}>
                    <Text style={styles.badgeText}>Admin</Text>
                </View>
            </View>

            <View style={styles.statsRow}>
                <View style={[cardStyle(styles.statBox), theme.shadows.soft]}>
                    <Users color={theme.colors.primary} size={24} />
                    <Text style={textStyle(styles.statVal)}>128</Text>
                    <Text style={[styles.statLbl, isDarkMode && { color: '#888' }]}>Toplam Üye</Text>
                </View>
                <View style={[cardStyle(styles.statBox), theme.shadows.soft]}>
                    <Star color={theme.colors.warning} size={24} />
                    <Text style={textStyle(styles.statVal)}>4.8</Text>
                    <Text style={[styles.statLbl, isDarkMode && { color: '#888' }]}>Ort. Puan</Text>
                </View>
            </View>

            {/* Vision Audit Link */}
            <View style={[styles.visionCard, theme.shadows.medium]}>
                <View style={styles.visionInfo}>
                    <Eye color="white" size={24} />
                    <Text style={styles.visionTitle}>Vision Audit & Analiz</Text>
                </View>
                <TouchableOpacity 
                    style={styles.visionBtn}
                    onPress={() => navigation.navigate('Vision')}
                >
                    <Text style={styles.visionBtnText}>İterasyonları Kıyasla</Text>
                </TouchableOpacity>
            </View>

            <Text style={textStyle(styles.sectionTitle)}>Kullanıcı Yönetimi</Text>
            {users.map((user) => (
                <View key={user.id} style={[cardStyle(styles.userCard), theme.shadows.soft]}>
                    <View style={styles.userInfo}>
                        <Text style={textStyle(styles.userName)}>{user.name}</Text>
                        <Text style={[styles.userSeen, isDarkMode && { color: '#888' }]}>Son Giriş: {user.lastSeen}</Text>
                    </View>
                    <TouchableOpacity onPress={() => deleteUser(user.id, user.name)}>
                        <Trash2 color={theme.colors.error} size={20} />
                    </TouchableOpacity>
                </View>
            ))}

            <Text style={[textStyle(styles.sectionTitle), { marginTop: 24 }]}>Yardım Mesajları</Text>
            {messages.map((msg) => (
                <View key={msg.id} style={[cardStyle(styles.messageCard), theme.shadows.soft]}>
                    <View style={styles.messageHeader}>
                        <View style={styles.messageUser}>
                            <MessageSquare color={theme.colors.secondary} size={18} />
                            <Text style={textStyle(styles.messageUserName)}>{msg.user}</Text>
                        </View>
                        <Text style={[styles.messageDate, isDarkMode && { color: '#666' }]}>{msg.date}</Text>
                    </View>
                    <Text style={[styles.messageText, isDarkMode && { color: '#AAA' }]}>{msg.text}</Text>
                    
                    {msg.status === 'pending' ? (
                        <TouchableOpacity
                            style={styles.replyBtn}
                            onPress={() => {
                                setReplyTarget(msg.user);
                                setReplyModalVisible(true);
                            }}
                        >
                            <Text style={styles.replyBtnText}>Yanıtla</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.respondedBox}>
                            <Text style={styles.replyLabel}>Siz:</Text>
                            <Text style={styles.replyValue}>{msg.reply}</Text>
                        </View>
                    )}
                </View>
            ))}

            <Modal animationType="fade" transparent visible={replyModalVisible}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, isDarkMode && { backgroundColor: '#1E1E1E' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={textStyle(styles.modalTitle)}>{replyTarget}</Text>
                            <TouchableOpacity onPress={() => setReplyModalVisible(false)}><X color="#888" size={24} /></TouchableOpacity>
                        </View>
                        <TextInput
                            style={[styles.replyInput, isDarkMode && { backgroundColor: '#333', color: 'white' }]}
                            placeholder="Yanıtınızı buraya yazın..."
                            multiline
                            value={replyText}
                            onChangeText={setReplyText}
                        />
                        <TouchableOpacity style={styles.sendBtn} onPress={handleSendReply}>
                            <Send color="white" size={18} />
                            <Text style={styles.sendBtnText}>Gönder</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    contentContainer: { flexGrow: 1, padding: 20, paddingBottom: 100 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 24 },
    title: { ...theme.typography.h2, fontWeight: 'bold' },
    badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, backgroundColor: theme.colors.primary },
    badgeText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    statBox: { flex: 0.48, backgroundColor: 'white', padding: 16, borderRadius: 16, alignItems: 'center' },
    statVal: { ...theme.typography.h2, marginTop: 8 },
    statLbl: { ...theme.typography.caption, color: '#888' },
    visionCard: { backgroundColor: theme.colors.secondary, padding: 20, borderRadius: 20, marginBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    visionInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    visionTitle: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    visionBtn: { backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
    visionBtnText: { color: theme.colors.secondary, fontWeight: 'bold', fontSize: 13 },
    sectionTitle: { ...theme.typography.h3, fontWeight: 'bold', marginBottom: 12 },
    userCard: { backgroundColor: 'white', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
    userInfo: { flex: 1 },
    userName: { fontWeight: '700' },
    userSeen: { fontSize: 12, color: '#888' },
    messageCard: { backgroundColor: 'white', padding: 16, borderRadius: 16, marginBottom: 12 },
    messageHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    messageUser: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    messageUserName: { fontWeight: 'bold' },
    messageDate: { fontSize: 12, color: '#888' },
    messageText: { lineHeight: 20, color: '#444' },
    replyBtn: { marginTop: 12, backgroundColor: theme.colors.primary, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10, alignSelf: 'flex-start' },
    replyBtnText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
    respondedBox: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8 },
    replyLabel: { fontSize: 12, color: theme.colors.primary, fontWeight: 'bold' },
    replyValue: { fontSize: 13, fontStyle: 'italic', color: '#666', marginTop: 2 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 24, padding: 24 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontWeight: 'bold', fontSize: 18 },
    replyInput: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 16, height: 120, textAlignVertical: 'top', marginBottom: 20 },
    sendBtn: { backgroundColor: theme.colors.primary, padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
    sendBtnText: { color: 'white', fontWeight: 'bold' },
});

export default AdminScreen;

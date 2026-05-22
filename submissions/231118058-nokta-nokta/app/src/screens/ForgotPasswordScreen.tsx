import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { Mail, ArrowLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const ForgotPasswordScreen = () => {
    const navigation = useNavigation<any>();
    const { isDarkMode } = useTheme();
    const [email, setEmail] = useState('');

    const handleResetPassword = () => {
        if (email) {
            Alert.alert('Şifre Sıfırlama', `Şifre sıfırlama bağlantısı ${email} adresine gönderildi.`);
            navigation.goBack();
        } else {
            Alert.alert('Hata', 'Lütfen e-posta adresinizi girin.');
        }
    };

    const isDark = isDarkMode;

    return (
        <KeyboardAvoidingView
            style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <ArrowLeft color={isDark ? theme.colors.textLight : theme.colors.textDark} size={24} />
            </TouchableOpacity>

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={[styles.title, isDark && styles.textWhite]}>
                        Şifremi <Text style={{ color: theme.colors.primary }}>Unuttum</Text>
                    </Text>
                    <Text style={[styles.subtitle, isDark && styles.textGray]}>
                        Hesabınızla ilişkili e-posta adresinizi girin. Size şifrenizi sıfırlamanız için bir bağlantı göndereceğiz.
                    </Text>
                </View>

                <View style={styles.inputContainer}>
                    <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
                        <Mail color={isDark ? '#aaa' : '#666'} size={20} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, isDark && styles.textWhite]}
                            placeholder="E-posta Adresi"
                            placeholderTextColor={isDark ? '#888' : '#999'}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>
                </View>

                <TouchableOpacity style={styles.resetButton} onPress={handleResetPassword} activeOpacity={0.8}>
                    <Text style={styles.resetButtonText}>Şifreyi Sıfırla</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerLight: {
        backgroundColor: '#F8FAFC',
    },
    containerDark: {
        backgroundColor: '#0F172A',
    },
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 30,
        left: 20,
        zIndex: 10,
        padding: 10,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -1,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 15,
        color: '#64748B',
        lineHeight: 22,
    },
    inputContainer: {
        marginBottom: 30,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 15,
        height: 60,
    },
    inputWrapperDark: {
        backgroundColor: '#1E293B',
        borderColor: '#334155',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#0F172A',
        height: '100%',
    },
    resetButton: {
        backgroundColor: theme.colors.primary,
        height: 60,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 5,
    },
    resetButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    // Utilities
    textWhite: { color: '#F8FAFC' },
    textGray: { color: '#94A3B8' },
});

export default ForgotPasswordScreen;

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
import { ArrowRight, Lock, Mail } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const LoginScreen = () => {
    const navigation = useNavigation<any>();
    const { isDarkMode, fontSize } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        // Dummy login logic for demonstration
        if (email === 'test@example.com' && password === 'password') {
            navigation.navigate('AppTabs');
        } else {
            Alert.alert('Hata', 'Geçersiz e-posta veya şifre.');
        }
    };

    const handleGuestLogin = () => {
        navigation.navigate('AppTabs');
    };

    const isDark = isDarkMode;

    return (
        <KeyboardAvoidingView
            style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Greenery Background - Added for visual appeal as requested */}
            <View style={styles.greeneryBackground} />

            <View style={styles.content}>
                {/* Header Area */}
                <View style={styles.header}>
                    <Text style={[styles.title, isDark && styles.textWhite]}>
                        Okbil<Text style={{ color: theme.colors.primary }}>App</Text>
                    </Text>
                    <Text style={[styles.subtitle, isDark && styles.textGray]}>
                        Yapay zeka destekli otonom asistanınıza hoş geldiniz.
                    </Text>
                </View>

                {/* Input Fields */}
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

                    <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
                        <Lock color={isDark ? '#aaa' : '#666'} size={20} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, isDark && styles.textWhite]}
                            placeholder="Şifre"
                            placeholderTextColor={isDark ? '#888' : '#999'}
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate('ForgotPassword')}>
                        <Text style={styles.forgotPasswordText}>Şifremi Unuttum?</Text>
                    </TouchableOpacity>
                </View>

                {/* Actions (Buttons) */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.8}>
                        <Text style={styles.loginButtonText}>Giriş Yap</Text>
                        <ArrowRight color="#fff" size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.guestButton} 
                        onPress={handleGuestLogin}
                    >
                        <Text style={styles.guestButtonText}>
                            Misafir Olarak Devam Et
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, isDark && styles.textGray]}>Henüz hesabınız yok mu? </Text>
                    <TouchableOpacity>
                        <Text style={styles.registerText}>Kayıt Ol</Text>
                    </TouchableOpacity>
                </View>
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
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
        zIndex: 1, // Ensure content is above the background greenery
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: 36,
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
        gap: 15,
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
    forgotPassword: {
        alignSelf: 'flex-end',
        marginTop: 5,
    },
    forgotPasswordText: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    actionContainer: {
        gap: 15,
    },
    loginButton: {
        backgroundColor: theme.colors.primary,
        height: 60,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 5,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    guestButton: {
        height: 60,
        borderRadius: 16,
        borderWidth: 1,
        backgroundColor: '#EF4444', // Red background as requested
        borderColor: '#EF4444', // Red border as requested
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 5,
    },
    guestButtonText: {
        color: '#fff', // White text for readability on red background
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    footerText: {
        color: '#64748B',
        fontSize: 14,
    },
    registerText: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: '700',
    },
    // Utilities
    textWhite: { color: '#F8FAFC' },
    textGray: { color: '#94A3B8' },
    greeneryBackground: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 200, // Height of the green background element
        backgroundColor: '#4CAF50', // A pleasant shade of green
        opacity: 0.05, // Make it very subtle
        zIndex: 0, // Ensure it stays in the background
    },
});

export default LoginScreen;

import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Dimensions,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Shield, Sparkles, HeartHandshake } from 'lucide-react-native';
import { theme } from '../theme';

const { width, height } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        title: 'Multipl Miyelom Bakımı',
        description: 'Tedavi sürecinizi takip edin, belirtilerinizi yönetin ve hayat kalitenizi artırın.',
        icon: <Shield size={80} color={theme.colors.primary} />,
    },
    {
        id: '2',
        title: 'Kişisel Takip',
        description: 'Günlük ağrı, yorgunluk ve iştah durumunuzu kaydederek doktorunuzla paylaşın.',
        icon: <Sparkles size={80} color={theme.colors.secondary} />,
    },
    {
        id: '3',
        title: 'Birlikte Güçlüyüz',
        description: 'Topluluğumuza katılın, deneyimlerinizi paylaşın ve güncel bilgilere ulaşın.',
        icon: <HeartHandshake size={80} color={theme.colors.primary} />,
    },
];

const OnboardingScreen = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef(null);
    const navigation = useNavigation<any>();

    const viewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const scrollToNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            (slidesRef.current as any).scrollToIndex({ index: currentIndex + 1 });
        } else {
            // Hata raporuna göre, onboarding bittikten sonra Login ekranına yönlendirme yapılmalı.
            navigation.navigate('Login'); // 'AppTabs' yerine 'Login' olarak değiştirildi
        }
    };

    const skip = () => {
        // Hata raporuna göre, atla butonuna basıldığında Login ekranına yönlendirme yapılmalı.
        navigation.navigate('Login'); // 'AppTabs' yerine 'Login' olarak değiştirildi
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={SLIDES}
                renderItem={({ item }) => (
                    <View style={styles.slide}>
                        <View style={styles.iconContainer}>{item.icon}</View>
                        <View style={styles.textContainer}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.description}>{item.description}</Text>
                        </View>
                    </View>
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                bounces={false}
                keyExtractor={(item) => item.id}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                    useNativeDriver: false,
                })}
                onViewableItemsChanged={viewableItemsChanged}
                viewabilityConfig={viewConfig}
                ref={slidesRef}
            />

            <View style={styles.footer}>
                <View style={styles.paginator}>
                    {SLIDES.map((_, i) => {
                        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                        const dotWidth = scrollX.interpolate({
                            inputRange,
                            outputRange: [10, 20, 10],
                            extrapolate: 'clamp',
                        });
                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.3, 1, 0.3],
                            extrapolate: 'clamp',
                        });
                        return (
                            <Animated.View
                                style={[styles.dot, { width: dotWidth, opacity }]}
                                key={i.toString()}
                            />
                        );
                    })}
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={skip} style={styles.skipBtn}>
                        <Text style={styles.skipText}>Atla</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={scrollToNext} style={styles.nextBtn}>
                        <Text style={styles.nextText}>
                            {currentIndex === SLIDES.length - 1 ? 'Başla' : 'İleri'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    slide: {
        width,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
    },
    iconContainer: {
        flex: 0.5,
        justifyContent: 'center',
    },
    textContainer: {
        flex: 0.3,
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.primary,
        textAlign: 'center',
        marginBottom: theme.spacing.md,
    },
    description: {
        ...theme.typography.body,
        color: theme.colors.textLight,
        textAlign: 'center',
        paddingHorizontal: theme.spacing.lg,
    },
    footer: {
        height: 120,
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.xl,
    },
    paginator: {
        flexDirection: 'row',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.colors.primary,
        marginHorizontal: 8,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    skipBtn: {
        padding: theme.spacing.md,
    },
    skipText: {
        ...theme.typography.body,
        color: theme.colors.textLight,
    },
    nextBtn: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: theme.borderRadius.full,
        ...theme.shadows.medium,
    },
    nextText: {
        ...theme.typography.body,
        color: theme.colors.white,
        fontWeight: '600',
    },
});

export default OnboardingScreen;

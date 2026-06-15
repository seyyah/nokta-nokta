export const theme = {
    colors: {
        primary: '#0EA5E9', // Premium Health Blue
        primaryLight: '#F0F9FF',
        secondary: '#6366F1', // Indigo
        success: '#4ADE80',
        error: '#F87171',
        warning: '#FBBF24',
        background: '#FFFFFF',
        surface: '#F8F9FA',
        text: '#1F2937',
        textLight: '#6B7280',
        border: '#E5E7EB',
        white: '#FFFFFF',
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    },
    borderRadius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        full: 9999,
    },
    typography: {
        h1: {
            fontSize: 28,
            fontWeight: '700' as const,
        },
        h2: {
            fontSize: 24,
            fontWeight: '600' as const,
        },
        h3: {
            fontSize: 20,
            fontWeight: '600' as const,
        },
        body: {
            fontSize: 16,
            fontWeight: '400' as const,
        },
        caption: {
            fontSize: 14,
            fontWeight: '400' as const,
            color: '#6B7280',
        },
    },
    shadows: {
        soft: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 2,
        },
        medium: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.1,
            shadowRadius: 15,
            elevation: 4,
        },
    },
};

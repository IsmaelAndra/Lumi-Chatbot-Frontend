export interface Question {
    chat_message: string;
    message?: string;  // Opcional por si viene con diferente nombre
    count: number | string; // Puede venir como número o string desde el API
}

export interface GeneralStatsResponse {
    totalInteractions: number;
    unansweredQuestions: number;
    topQuestions: Array<{
        chat_message: string;
        count: number;
    }>;
    responseDistribution: {
        local: number;
        gpt: number;
    };
    responseEffectiveness?: number;
}

export interface FormattedQuestion {
    question: string;
    count: number;
}

export interface DashboardData {
    generalStats: {
        totalInteractions: number;
        unansweredQuestions: number;
        topQuestions: QuestionStats[];
        responseDistribution: {
            local: number;
            gpt: number;
        };
        responseEffectiveness: number; // Cambiado a requerido
    };
    activeUsersCount: number;
    emotionTrends: EmotionTrend[];
    peakHours: PeakHour[];
    frequentQuestions: FormattedQuestion[];
}

export interface GeneralStats {
    totalInteractions: number;
    unansweredQuestions: number;
    topQuestions: QuestionStats[];
    responseDistribution: {
        local: number;
        gpt: number;
    };
    responseEffectiveness?: number;
}

export interface EmotionTrend {
    date: string;  // Formato: 'YYYY-MM-DD'
    avgScale: number;
}

export interface PeakHour {
    hour: number;  // 0-23
    count: number;
}

export interface QuestionStats {
    chat_message: string;
    count: number;
}

export interface User {
    phoneNumber: string;
    userName?: string;
    // ... otras propiedades de usuario que necesites
}
// user.models.ts
export interface EmotionalRecord {
    id: number;
    scale: number;
    timestamp: Date;
    user?: User;
}

export interface User {
    phoneNumber: string;
    userName?: string;
    emotionalScale?: number;
    emotionalState?: string;
    wantsSupport?: boolean;
    lastInteraction?: Date;
    emotionalScales?: EmotionalRecord[];
}

export interface EmotionalStatistics {
    scaleDistribution: number[];
    emotionalStates: { name: string; value: number }[];
    averageScale: number;
    totalRecords: number;
    totalUsers: number;
}

export interface UserWithEmotionStats extends User {
    lastEmotion?: EmotionalRecord;
    emotionCount: number;
}
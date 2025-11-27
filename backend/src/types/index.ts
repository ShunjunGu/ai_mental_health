// 用户角色枚举
export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  COUNSELOR = 'counselor',
  ADMIN = 'admin'
}

// 预警级别枚举
export enum AlertLevel {
  NORMAL = 'normal',
  MILD = 'mild',
  MODERATE = 'moderate',
  SEVERE = 'severe'
}

// 情绪类型枚举
export enum EmotionType {
  HAPPY = 'happy',
  SAD = 'sad',
  ANGRY = 'angry',
  ANXIOUS = 'anxious',
  FEARFUL = 'fearful',
  SURPRISED = 'surprised',
  NEUTRAL = 'neutral'
}

// 情绪识别类型枚举
export enum RecognitionType {
  TEXT = 'text',
  VOICE = 'voice',
  IMAGE = 'image'
}

// 预约状态枚举
export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// 咨询效果评估枚举
export enum ConsultationEffect {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor'
}
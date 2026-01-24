import React, { createContext } from 'react';

// 情绪到颜色的映射 - 日间模式
export const emotionToColors: Record<string, {
  background: string
  primary: string
  secondary: string
  text: string
}> = {
  happy: {
    background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
    primary: '#FF9800',
    secondary: '#FFB74D',
    text: '#E65100'
  },
  sad: {
    background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
    primary: '#2196F3',
    secondary: '#64B5F6',
    text: '#0D47A1'
  },
  neutral: {
    background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 100%)',
    primary: '#4CAF50',
    secondary: '#81C784',
    text: '#212121'
  },
  fear: {
    background: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)',
    primary: '#9C27B0',
    secondary: '#BA68C8',
    text: '#4A148C'
  },
  angry: {
    background: 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)',
    primary: '#F44336',
    secondary: '#EF5350',
    text: '#B71C1C'
  },
  surprised: {
    background: 'linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%)',
    primary: '#4CAF50',
    secondary: '#81C784',
    text: '#1B5E20'
  },
  disgusted: {
    background: 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)',
    primary: '#FFEB3B',
    secondary: '#FFF176',
    text: '#F57F17'
  }
};

// 情绪到颜色的映射 - 夜间模式（优化版：更鲜艳、更有层次感）
export const emotionToColorsDark: Record<string, {
  background: string
  primary: string
  secondary: string
  text: string
}> = {
  happy: {
    // 混合了深蓝背景和明亮橙色的渐变
    background: 'linear-gradient(135deg, rgba(26, 31, 53, 0.95) 0%, rgba(66, 31, 10, 0.9) 100%)',
    primary: '#FF9800',
    secondary: '#FFB74D',
    text: '#FFE0B2'
  },
  sad: {
    // 深蓝背景渐变，突出蓝色情绪
    background: 'linear-gradient(135deg, rgba(26, 31, 53, 0.95) 0%, rgba(13, 43, 69, 0.9) 100%)',
    primary: '#42A5F5',
    secondary: '#64B5F6',
    text: '#BBDEFB'
  },
  neutral: {
    // 深紫蓝渐变，保持专业感
    background: 'linear-gradient(135deg, #1a1f35 0%, #242845 100%)',
    primary: '#8b5cf6',
    secondary: '#a78bfa',
    text: '#e8eaf0'
  },
  fear: {
    // 深紫背景，突出紫色情绪
    background: 'linear-gradient(135deg, rgba(26, 31, 53, 0.95) 0%, rgba(61, 27, 77, 0.9) 100%)',
    primary: '#AB47BC',
    secondary: '#BA68C8',
    text: '#E1BEE7'
  },
  angry: {
    // 深红背景，突出红色情绪
    background: 'linear-gradient(135deg, rgba(26, 31, 53, 0.95) 0%, rgba(69, 27, 27, 0.9) 100%)',
    primary: '#EF5350',
    secondary: '#F44336',
    text: '#FFCDD2'
  },
  surprised: {
    // 深绿背景，突出绿色情绪
    background: 'linear-gradient(135deg, rgba(26, 31, 53, 0.95) 0%, rgba(27, 51, 37, 0.9) 100%)',
    primary: '#66BB6A',
    secondary: '#81C784',
    text: '#C8E6C9'
  },
  disgusted: {
    // 深黄背景，突出黄色情绪
    background: 'linear-gradient(135deg, rgba(26, 31, 53, 0.95) 0%, rgba(69, 60, 27, 0.9) 100%)',
    primary: '#FFEE58',
    secondary: '#FFF176',
    text: '#FFECB3'
  }
};

// 情绪上下文类型
interface EmotionContextType {
  emotion: string
  setEmotion: (emotion: string) => void
}

// 创建情绪上下文
export const EmotionContext = createContext<EmotionContextType>({
  emotion: 'neutral',
  setEmotion: () => {}
});

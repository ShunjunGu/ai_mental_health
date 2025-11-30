import { AlertLevel, EmotionType } from '../types';
import EmotionRecord from '../models/EmotionRecord';
import Alert, { IAlert } from '../models/Alert';
import mongoose from 'mongoose';

// 预警规则配置
const ALERT_RULES = {
  // 连续出现负面情绪的天数阈值
  CONSECUTIVE_NEGATIVE_DAYS: {
    [AlertLevel.MILD]: 3,
    [AlertLevel.MODERATE]: 5,
    [AlertLevel.SEVERE]: 7
  },
  // 单次负面情绪得分阈值
  SINGLE_NEGATIVE_SCORE: {
    [AlertLevel.MILD]: 70,
    [AlertLevel.MODERATE]: 80,
    [AlertLevel.SEVERE]: 90
  },
  // 负面情绪类型列表
  NEGATIVE_EMOTIONS: [
    EmotionType.SAD,
    EmotionType.ANGRY,
    EmotionType.ANXIOUS,
    EmotionType.FEARFUL
  ]
};

// 检查是否需要生成预警
export const checkAlert = async (userId: string): Promise<IAlert | null> => {
  try {
    // 获取用户最近7天的情绪记录
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentEmotions = await EmotionRecord.find({
      userId,
      createdAt: { $gte: sevenDaysAgo }
    }).sort({ createdAt: -1 });
    
    if (recentEmotions.length === 0) {
      return null;
    }
    
    // 1. 检查单次负面情绪得分是否超过阈值
    const latestEmotion = recentEmotions[0];
    let alertLevel: AlertLevel | null = null;
    let alertReason = '';
    
    if (ALERT_RULES.NEGATIVE_EMOTIONS.includes(latestEmotion.emotion)) {
      if (latestEmotion.score >= ALERT_RULES.SINGLE_NEGATIVE_SCORE[AlertLevel.SEVERE]) {
        alertLevel = AlertLevel.SEVERE;
        alertReason = `单次${latestEmotion.emotion}情绪得分过高（${latestEmotion.score}）`;
      } else if (latestEmotion.score >= ALERT_RULES.SINGLE_NEGATIVE_SCORE[AlertLevel.MODERATE]) {
        alertLevel = AlertLevel.MODERATE;
        alertReason = `单次${latestEmotion.emotion}情绪得分较高（${latestEmotion.score}）`;
      } else if (latestEmotion.score >= ALERT_RULES.SINGLE_NEGATIVE_SCORE[AlertLevel.MILD]) {
        alertLevel = AlertLevel.MILD;
        alertReason = `单次${latestEmotion.emotion}情绪得分略高（${latestEmotion.score}）`;
      }
    }
    
    // 2. 检查连续负面情绪天数
    if (!alertLevel) {
      let consecutiveNegativeDays = 0;
      const processedDates = new Set<string>();
      
      for (const emotion of recentEmotions) {
        const dateStr = emotion.createdAt.toISOString().split('T')[0];
        
        if (processedDates.has(dateStr)) {
          continue;
        }
        
        processedDates.add(dateStr);
        
        if (ALERT_RULES.NEGATIVE_EMOTIONS.includes(emotion.emotion)) {
          consecutiveNegativeDays++;
        } else {
          break;
        }
      }
      
      if (consecutiveNegativeDays >= ALERT_RULES.CONSECUTIVE_NEGATIVE_DAYS[AlertLevel.SEVERE]) {
        alertLevel = AlertLevel.SEVERE;
        alertReason = `连续${consecutiveNegativeDays}天出现负面情绪`;
      } else if (consecutiveNegativeDays >= ALERT_RULES.CONSECUTIVE_NEGATIVE_DAYS[AlertLevel.MODERATE]) {
        alertLevel = AlertLevel.MODERATE;
        alertReason = `连续${consecutiveNegativeDays}天出现负面情绪`;
      } else if (consecutiveNegativeDays >= ALERT_RULES.CONSECUTIVE_NEGATIVE_DAYS[AlertLevel.MILD]) {
        alertLevel = AlertLevel.MILD;
        alertReason = `连续${consecutiveNegativeDays}天出现负面情绪`;
      }
    }
    
    // 如果需要生成预警
    if (alertLevel) {
      // 检查是否已有未处理的相同级别或更高级别的预警
      const existingAlert = await Alert.findOne({
        studentId: userId,
        isHandled: false,
        level: { $gte: alertLevel }
      });
      
      if (existingAlert) {
        return null; // 已有未处理的预警，不需要重复生成
      }
      
      // 创建新预警
        const alert = new Alert({
          _id: new mongoose.Types.ObjectId(),
          studentId: userId,
          level: alertLevel,
          reason: alertReason,
          description: `学生最近情绪状态异常，建议关注。最近一次情绪：${latestEmotion.emotion}（得分：${latestEmotion.score}）`
        });
      
      await alert.save();
      return alert;
    }
    
    return null;
  } catch (error) {
    console.error('检查预警失败:', error);
    return null;
  }
};

// 生成预警
export const generateAlert = async (userId: string, level: AlertLevel, reason: string, description?: string): Promise<IAlert> => {
  try {
    const alert = new Alert({
      studentId: userId,
      level,
      reason,
      description
    });
    
    await alert.save();
    return alert;
  } catch (error) {
    console.error('生成预警失败:', error);
    throw error;
  }
};

// 处理预警
export const handleAlert = async (alertId: string, handledBy: string, handledNote?: string): Promise<IAlert> => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      alertId,
      {
        isHandled: true,
        handledBy,
        handledAt: new Date(),
        handledNote
      },
      { new: true }
    );
    
    if (!alert) {
      throw new Error('预警不存在');
    }
    
    return alert;
  } catch (error) {
    console.error('处理预警失败:', error);
    throw error;
  }
};
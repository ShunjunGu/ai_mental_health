import User from '../models/User';
import EmotionRecord from '../models/EmotionRecord';
import Alert from '../models/Alert';
import ConsultationRecord from '../models/ConsultationRecord';
import { AlertLevel, EmotionType } from '../types';

// 生成智能干预建议
export const generateInterventionSuggestions = async (studentId: string): Promise<string[]> => {
  try {
    // 获取学生最近的情绪记录和预警信息
    const recentEmotions = await EmotionRecord.find({ userId: studentId })
      .sort({ createdAt: -1 })
      .limit(5);

    const recentAlerts = await Alert.find({ studentId })
      .sort({ createdAt: -1 })
      .limit(3);

    const consultationRecords = await ConsultationRecord.find({ studentId })
      .sort({ createdAt: -1 })
      .limit(2);

    const suggestions: string[] = [];

    // 基于情绪记录生成建议
    if (recentEmotions.length > 0) {
      const negativeEmotions = recentEmotions.filter(emotion => 
        [EmotionType.SAD, EmotionType.ANGRY, EmotionType.ANXIOUS, EmotionType.FEARFUL].includes(emotion.emotion)
      );

      if (negativeEmotions.length >= 3) {
        suggestions.push('该学生近期负面情绪较为频繁，建议班主任进行一对一谈话，了解具体情况。');
      }

      // 检查是否有严重的负面情绪
      const severeNegativeEmotions = negativeEmotions.filter(emotion => emotion.score >= 80);
      if (severeNegativeEmotions.length > 0) {
        suggestions.push('该学生出现严重负面情绪，建议立即联系心理咨询师进行专业干预。');
      }
    }

    // 基于预警信息生成建议
    if (recentAlerts.length > 0) {
      const severeAlerts = recentAlerts.filter(alert => alert.level === AlertLevel.SEVERE);
      if (severeAlerts.length > 0) {
        suggestions.push('该学生已触发严重预警，建议启动学校心理健康应急预案，通知家长并安排专业心理咨询。');
      }

      const moderateAlerts = recentAlerts.filter(alert => alert.level === AlertLevel.MODERATE);
      if (moderateAlerts.length > 0) {
        suggestions.push('该学生已触发中度预警，建议班主任加强关注，定期进行心理疏导，并考虑推荐心理咨询。');
      }

      const mildAlerts = recentAlerts.filter(alert => alert.level === AlertLevel.MILD);
      if (mildAlerts.length > 0) {
        suggestions.push('该学生已触发轻度预警，建议班主任进行适当关注，提供必要的支持和鼓励。');
      }
    }

    // 基于咨询记录生成建议
    if (consultationRecords.length > 0) {
      const latestConsultation = consultationRecords[0];
      if (latestConsultation.effect === 'poor' || latestConsultation.effect === 'fair') {
        suggestions.push('该学生近期咨询效果不佳，建议与心理咨询师沟通，调整咨询方案。');
      } else {
        suggestions.push('该学生近期咨询效果良好，建议继续保持关注，巩固咨询成果。');
      }
    }

    // 默认建议
    if (suggestions.length === 0) {
      suggestions.push('该学生近期心理健康状况稳定，建议继续保持关注，鼓励积极参与班级活动。');
    }

    return suggestions;
  } catch (error) {
    console.error('生成干预建议失败:', error);
    return ['生成干预建议失败，请稍后重试。'];
  }
};

// 获取班级心理健康统计报表
export const getClassMentalHealthReport = async (grade: string, className: string): Promise<any> => {
  try {
    // 获取班级学生列表
    const students = await User.find({ 
      role: 'student',
      grade,
      class: className
    });

    const studentIds = students.map(student => student._id);

    // 统计班级整体情况
    const totalStudents = students.length;

    // 获取最近30天的情绪记录
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 统计情绪分布
    const emotionStats = await EmotionRecord.aggregate([
      { $match: { userId: { $in: studentIds }, createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: '$emotion',
          count: { $sum: 1 },
          averageScore: { $avg: '$score' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // 统计预警情况
    const alertStats = await Alert.aggregate([
      { $match: { studentId: { $in: studentIds }, createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // 统计咨询情况
    const consultationStats = await ConsultationRecord.aggregate([
      { $match: { studentId: { $in: studentIds }, createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: null,
          totalConsultations: { $sum: 1 },
          averageDuration: { $avg: '$duration' }
        }
      }
    ]);

    // 获取需要关注的学生（有预警记录的学生）
    const studentsWithAlerts = await User.aggregate([
      { $match: { _id: { $in: studentIds } } },
      {
        $lookup: {
          from: 'alerts',
          localField: '_id',
          foreignField: 'studentId',
          as: 'alerts'
        }
      },
      { $match: { 'alerts.0': { $exists: true } } },
      { $project: { name: 1, studentId: 1, grade: 1, class: 1, alerts: { $size: '$alerts' } } },
      { $sort: { alerts: -1 } }
    ]);

    return {
      grade,
      className,
      totalStudents,
      period: '最近30天',
      emotionDistribution: emotionStats,
      alertDistribution: alertStats,
      consultationSummary: consultationStats[0] || { totalConsultations: 0, averageDuration: 0 },
      studentsWithAlerts: studentsWithAlerts
    };
  } catch (error) {
    console.error('获取班级心理健康报表失败:', error);
    throw error;
  }
};

// 获取年级心理健康统计报表
export const getGradeMentalHealthReport = async (grade: string): Promise<any> => {
  try {
    // 获取年级学生列表
    const students = await User.find({ 
      role: 'student',
      grade
    });

    const studentIds = students.map(student => student._id);

    // 统计年级整体情况
    const totalStudents = students.length;
    const classes = await User.distinct('class', { role: 'student', grade });
    const totalClasses = classes.length;

    // 获取最近30天的数据
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 统计情绪分布
    const emotionStats = await EmotionRecord.aggregate([
      { $match: { userId: { $in: studentIds }, createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: '$emotion',
          count: { $sum: 1 },
          averageScore: { $avg: '$score' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // 统计预警情况
    const alertStats = await Alert.aggregate([
      { $match: { studentId: { $in: studentIds }, createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // 统计咨询情况
    const consultationStats = await ConsultationRecord.aggregate([
      { $match: { studentId: { $in: studentIds }, createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: null,
          totalConsultations: { $sum: 1 },
          averageDuration: { $avg: '$duration' }
        }
      }
    ]);

    // 按班级统计预警情况
    const alertByClass = await User.aggregate([
      { $match: { _id: { $in: studentIds } } },
      {
        $lookup: {
          from: 'alerts',
          localField: '_id',
          foreignField: 'studentId',
          as: 'alerts'
        }
      },
      {
        $group: {
          _id: '$class',
          totalStudents: { $sum: 1 },
          totalAlerts: { $sum: { $size: '$alerts' } },
          studentsWithAlerts: { $sum: { $cond: [{ $gt: [{ $size: '$alerts' }, 0] }, 1, 0] } }
        }
      },
      { $sort: { totalAlerts: -1 } }
    ]);

    return {
      grade,
      totalStudents,
      totalClasses,
      period: '最近30天',
      emotionDistribution: emotionStats,
      alertDistribution: alertStats,
      consultationSummary: consultationStats[0] || { totalConsultations: 0, averageDuration: 0 },
      alertByClass
    };
  } catch (error) {
    console.error('获取年级心理健康报表失败:', error);
    throw error;
  }
};

// 获取学生心理健康概览
export const getStudentMentalHealthOverview = async (studentId: string): Promise<any> => {
  try {
    // 获取学生基本信息
    const student = await User.findById(studentId).select('-password');
    if (!student) {
      throw new Error('学生不存在');
    }

    // 获取最近30天的情绪记录
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentEmotions = await EmotionRecord.find({ userId: studentId, createdAt: { $gte: thirtyDaysAgo } })
      .sort({ createdAt: -1 })
      .limit(10);

    // 获取最近的预警信息
    const recentAlerts = await Alert.find({ studentId })
      .sort({ createdAt: -1 })
      .limit(3);

    // 获取最近的咨询记录
    const recentConsultations = await ConsultationRecord.find({ studentId })
      .sort({ createdAt: -1 })
      .limit(2);

    // 生成干预建议
    const interventionSuggestions = await generateInterventionSuggestions(studentId);

    return {
      student,
      recentEmotions,
      recentAlerts,
      recentConsultations,
      interventionSuggestions
    };
  } catch (error) {
    console.error('获取学生心理健康概览失败:', error);
    throw error;
  }
};
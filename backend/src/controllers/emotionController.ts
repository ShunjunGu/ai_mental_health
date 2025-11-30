import { Request, Response } from 'express';
import EmotionRecord from '../models/EmotionRecord';
import { recognizeEmotion, recognizeTextEmotion } from '../services/emotionRecognitionService';
import { checkAlert } from '../services/alertService';
import { RecognitionType, EmotionType } from '../types';

// 创建情绪记录
export const createEmotionRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { type, content, fileUrl } = req.body;

    // 验证请求参数
    if (!type || !Object.values(RecognitionType).includes(type)) {
      res.status(400).json({ message: '无效的情绪识别类型' });
      return;
    }

    if (type === RecognitionType.TEXT && !content) {
      res.status(400).json({ message: '文本内容不能为空' });
      return;
    }

    if ([RecognitionType.VOICE, RecognitionType.IMAGE].includes(type) && !fileUrl) {
      res.status(400).json({ message: '文件URL不能为空' });
      return;
    }

    // 调用情绪识别服务
    const recognitionResult = await recognizeEmotion(type, content, fileUrl);

    // 创建情绪记录
    const emotionRecord = new EmotionRecord({
      userId,
      type,
      content,
      fileUrl,
      emotion: recognitionResult.emotion,
      score: recognitionResult.score,
      additionalEmotions: recognitionResult.additionalEmotions
    });

    await emotionRecord.save();

    // 检查是否需要生成预警
    await checkAlert(userId);

    res.status(201).json({
      message: '情绪记录创建成功',
      emotionRecord
    });
  } catch (error) {
    console.error('创建情绪记录失败:', error);
    res.status(500).json({ message: '创建情绪记录失败', error });
  }
};

// 获取用户的情绪记录列表
export const getEmotionRecords = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { page = 1, limit = 10, type, startDate, endDate } = req.query;

    const query: any = { userId };

    // 添加过滤条件
    if (type && Object.values(RecognitionType).includes(type as RecognitionType)) {
      query.type = type;
    }

    if (startDate) {
      query.createdAt = { ...query.createdAt, $gte: new Date(startDate as string) };
    }

    if (endDate) {
      query.createdAt = { ...query.createdAt, $lte: new Date(endDate as string) };
    }

    // 分页查询
    const skip = (Number(page) - 1) * Number(limit);
    const emotionRecords = await EmotionRecord.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await EmotionRecord.countDocuments(query);

    res.status(200).json({
      message: '获取情绪记录成功',
      emotionRecords,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('获取情绪记录失败:', error);
    res.status(500).json({ message: '获取情绪记录失败', error });
  }
};

// 获取情绪记录详情
export const getEmotionRecordById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    const emotionRecord = await EmotionRecord.findOne({ _id: id, userId });

    if (!emotionRecord) {
      res.status(404).json({ message: '情绪记录不存在' });
      return;
    }

    res.status(200).json({
      message: '获取情绪记录详情成功',
      emotionRecord
    });
  } catch (error) {
    console.error('获取情绪记录详情失败:', error);
    res.status(500).json({ message: '获取情绪记录详情失败', error });
  }
};

// 删除情绪记录
export const deleteEmotionRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    const emotionRecord = await EmotionRecord.findOneAndDelete({ _id: id, userId });

    if (!emotionRecord) {
      res.status(404).json({ message: '情绪记录不存在或无权限删除' });
      return;
    }

    res.status(200).json({ message: '删除情绪记录成功' });
  } catch (error) {
    console.error('删除情绪记录失败:', error);
    res.status(500).json({ message: '删除情绪记录失败', error });
  }
};

// 获取用户情绪统计
export const getEmotionStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { startDate, endDate } = req.query;

    const query: any = { userId };

    // 添加时间范围过滤
    if (startDate) {
      query.createdAt = { ...query.createdAt, $gte: new Date(startDate as string) };
    }

    if (endDate) {
      query.createdAt = { ...query.createdAt, $lte: new Date(endDate as string) };
    }

    // 统计每种情绪的数量和平均分数
    const statistics = await EmotionRecord.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$emotion',
          count: { $sum: 1 },
          averageScore: { $avg: '$score' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      message: '获取情绪统计成功',
      statistics
    });
  } catch (error) {
    console.error('获取情绪统计失败:', error);
    res.status(500).json({ message: '获取情绪统计失败', error });
  }
};

// 分析情绪（无需身份验证，用于前端直接分析）
export const analyzeEmotion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      res.status(400).json({ message: '文本内容不能为空' });
      return;
    }

    // 调用文本情绪识别服务
    const result = await recognizeTextEmotion(text);

    // 生成建议
    const getSuggestion = (emotion: string): string => {
      const suggestions: Record<string, string> = {
        [EmotionType.HAPPY]: '保持好心情，继续享受生活！',
        [EmotionType.SAD]: '不要难过，一切都会好起来的。可以尝试做一些自己喜欢的事情。',
        [EmotionType.ANGRY]: '深呼吸，冷静一下。生气解决不了问题，试着换个角度看事情。',
        [EmotionType.ANXIOUS]: '放松心情，不要给自己太大压力。可以尝试冥想或运动来缓解焦虑。',
        [EmotionType.FEARFUL]: '不要害怕，面对恐惧是克服它的第一步。',
        [EmotionType.SURPRISED]: '生活充满惊喜，享受每一个瞬间！',
        [EmotionType.NEUTRAL]: '保持平和的心态，也是一种很好的状态。'
      };
      return suggestions[emotion] || '保持积极乐观的心态！';
    };

    // 返回符合前端期望格式的响应
    res.status(200).json({
      emotion: result.emotion,
      confidence: result.score / 100,
      suggestion: getSuggestion(result.emotion),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('情绪分析失败:', error);
    res.status(500).json({ message: '情绪分析失败', error });
  }
};
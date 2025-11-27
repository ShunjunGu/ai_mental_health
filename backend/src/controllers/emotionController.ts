import { Request, Response } from 'express';
import EmotionRecord from '../models/EmotionRecord';
import { recognizeEmotion } from '../services/emotionRecognitionService';
import { checkAlert } from '../services/alertService';
import { RecognitionType } from '../types';

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
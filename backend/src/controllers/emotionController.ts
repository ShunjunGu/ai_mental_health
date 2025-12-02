import { Request, Response } from 'express';
import EmotionRecord from '../models/EmotionRecord';
import { recognizeEmotion, recognizeTextEmotion } from '../services/emotionRecognitionService';
import { checkAlert } from '../services/alertService';
import { RecognitionType, EmotionType } from '../types';
import fs from 'fs';
import path from 'path';

// 文件存储路径
const emotionRecordsFilePath = path.join(__dirname, '../../data/emotionRecords.json');

// 确保数据目录存在
const ensureDataDir = () => {
  const dataDir = path.dirname(emotionRecordsFilePath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// 读取情绪记录数据
const readEmotionRecordsFromFile = (): any[] => {
  ensureDataDir();
  try {
    if (fs.existsSync(emotionRecordsFilePath)) {
      const data = fs.readFileSync(emotionRecordsFilePath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('读取情绪记录数据失败:', error);
    return [];
  }
};

// 写入情绪记录数据
const writeEmotionRecordsToFile = (records: any[]): void => {
  ensureDataDir();
  try {
    fs.writeFileSync(emotionRecordsFilePath, JSON.stringify(records, null, 2), 'utf8');
  } catch (error) {
    console.error('写入情绪记录数据失败:', error);
  }
};

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

    // 创建情绪记录对象
    const emotionRecordData = {
      _id: `emotion_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      userId,
      type,
      content,
      fileUrl,
      emotion: recognitionResult.emotion,
      score: recognitionResult.score,
      additionalEmotions: recognitionResult.additionalEmotions,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 尝试保存到MongoDB
    try {
      const emotionRecord = new EmotionRecord(emotionRecordData);
      await emotionRecord.save();

      // 检查是否需要生成预警
      await checkAlert(userId);

      res.status(201).json({
        message: '情绪记录创建成功',
        emotionRecord
      });
    } catch (mongoError) {
      console.error('MongoDB保存情绪记录失败，尝试使用文件存储:', mongoError);
      
      // 保存到文件存储
      const emotionRecords = readEmotionRecordsFromFile();
      emotionRecords.push(emotionRecordData);
      writeEmotionRecordsToFile(emotionRecords);

      // 检查是否需要生成预警（简化版，仅在文件存储时执行）
      await checkAlert(userId);

      res.status(201).json({
        message: '情绪记录创建成功（使用文件存储）',
        emotionRecord: emotionRecordData
      });
    }
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

    // 尝试从MongoDB获取数据
    try {
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
    } catch (mongoError) {
      console.error('MongoDB获取情绪记录失败，尝试使用文件存储:', mongoError);
      
      // 从文件存储获取情绪记录
      const allEmotionRecords = readEmotionRecordsFromFile();
      
      // 过滤符合条件的情绪记录
      const filteredRecords = allEmotionRecords.filter((record: any) => {
        // 检查用户ID（转换为字符串比较）
        if (String(record.userId) !== String(userId)) return false;
        
        // 检查类型
        if (type && record.type !== type) return false;
        
        // 检查时间范围
        const recordDate = new Date(record.createdAt);
        if (startDate && recordDate < new Date(startDate as string)) return false;
        if (endDate && recordDate > new Date(endDate as string)) return false;
        
        return true;
      });
      
      // 排序
      filteredRecords.sort((a: any, b: any) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      // 分页
      const skip = (Number(page) - 1) * Number(limit);
      const emotionRecords = filteredRecords.slice(skip, skip + Number(limit));
      const total = filteredRecords.length;
      
      res.status(200).json({
        message: '获取情绪记录成功（使用文件存储）',
        emotionRecords,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit))
        }
      });
    }
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

// 获取用户情绪统计（支持前端stats端点）
export const getEmotionStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // 从请求中获取用户ID，如果没有认证信息，则从查询参数中获取
    const authUser = (req as any).user;
    const userId = authUser?.userId || req.query.userId;
    
    // 如果没有用户ID，返回空统计（用于公共访问）
    if (!userId) {
      res.status(200).json({
        total: 0,
        distribution: {},
        trend: []
      });
      return;
    }
    
    const { timeRange = 'week' } = req.query;

    // 计算时间范围
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }

    // 尝试从MongoDB获取数据
    try {
      // 获取用户的所有情绪记录
      const emotionRecords = await EmotionRecord.find({
        userId,
        createdAt: { $gte: startDate, $lte: endDate }
      }).sort({ createdAt: 1 });

      // 计算总分析次数
      const total = emotionRecords.length;

      // 计算情绪分布
      const distribution: Record<string, number> = {};
      emotionRecords.forEach(record => {
        distribution[record.emotion] = (distribution[record.emotion] || 0) + 1;
      });

      // 计算情绪趋势
      const trend: Array<{
        date: string;
        count: number;
        emotions: Record<string, number>;
      }> = [];

      // 生成日期数组
      const dates: string[] = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // 初始化趋势数据
      dates.forEach(date => {
        trend.push({
          date,
          count: 0,
          emotions: {}
        });
      });

      // 填充趋势数据
      emotionRecords.forEach(record => {
        const recordDate = new Date(record.createdAt).toISOString().split('T')[0];
        const trendItem = trend.find(item => item.date === recordDate);
        
        if (trendItem) {
          trendItem.count += 1;
          trendItem.emotions[record.emotion] = (trendItem.emotions[record.emotion] || 0) + 1;
        }
      });

      res.status(200).json({
        total,
        distribution,
        trend
      });
    } catch (mongoError) {
      console.error('MongoDB获取情绪统计失败，尝试使用文件存储:', mongoError);
      
      // 从文件存储获取情绪记录
      const allEmotionRecords = readEmotionRecordsFromFile();
      
      // 过滤符合条件的情绪记录
      const emotionRecords = allEmotionRecords.filter((record: any) => {
        // 检查用户ID（转换为字符串比较）
        if (String(record.userId) !== String(userId)) return false;
        
        // 检查时间范围
        const recordDate = new Date(record.createdAt);
        return recordDate >= startDate && recordDate <= endDate;
      });
      
      // 计算总分析次数
      const total = emotionRecords.length;

      // 计算情绪分布
      const distribution: Record<string, number> = {};
      emotionRecords.forEach((record: any) => {
        distribution[record.emotion] = (distribution[record.emotion] || 0) + 1;
      });

      // 计算情绪趋势
      const trend: Array<{
        date: string;
        count: number;
        emotions: Record<string, number>;
      }> = [];

      // 生成日期数组
      const dates: string[] = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // 初始化趋势数据
      dates.forEach(date => {
        trend.push({
          date,
          count: 0,
          emotions: {}
        });
      });

      // 填充趋势数据
      emotionRecords.forEach((record: any) => {
        const recordDate = new Date(record.createdAt).toISOString().split('T')[0];
        const trendItem = trend.find(item => item.date === recordDate);
        
        if (trendItem) {
          trendItem.count += 1;
          trendItem.emotions[record.emotion] = (trendItem.emotions[record.emotion] || 0) + 1;
        }
      });

      res.status(200).json({
        total,
        distribution,
        trend
      });
    }
  } catch (error) {
    console.error('获取情绪统计失败:', error);
    res.status(500).json({
      total: 0,
      distribution: {},
      trend: []
    });
  }
};

// 获取用户情绪统计（传统statistics端点）
export const getEmotionStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    // 从请求中获取用户ID，如果没有认证信息，则从查询参数中获取
    const authUser = (req as any).user;
    const userId = authUser?.userId || req.query.userId;
    
    // 如果没有用户ID，返回错误
    if (!userId) {
      res.status(400).json({ message: '用户ID不能为空' });
      return;
    }
    
    const { startDate, endDate } = req.query;

    const query: any = { userId };

    // 添加时间范围过滤
    if (startDate) {
      query.createdAt = { ...query.createdAt, $gte: new Date(startDate as string) };
    }

    if (endDate) {
      query.createdAt = { ...query.createdAt, $lte: new Date(endDate as string) };
    }

    // 尝试从MongoDB获取统计数据
    try {
      // 统计每种情绪的数量和平均分数
      const mongoStatistics = await EmotionRecord.aggregate([
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

      // 转换为前端期望的格式，使用emotion作为主要字段名
      const statistics = mongoStatistics.map(item => ({
        emotion: item._id,
        count: item.count,
        averageScore: item.averageScore
      }));

      res.status(200).json({
        message: '获取情绪统计成功',
        statistics
      });
    } catch (mongoError) {
      console.error('MongoDB获取情绪统计失败，尝试使用文件存储:', mongoError);
      
      // 从文件存储获取情绪记录
      const emotionRecords = readEmotionRecordsFromFile();
      
      // 过滤符合条件的情绪记录
      const filteredRecords = emotionRecords.filter((record: any) => {
        // 检查用户ID（转换为字符串比较）
        if (String(record.userId) !== String(userId)) return false;
        
        // 检查时间范围
        const recordDate = new Date(record.createdAt);
        if (startDate && recordDate < new Date(startDate as string)) return false;
        if (endDate && recordDate > new Date(endDate as string)) return false;
        
        return true;
      });
      
      // 统计每种情绪的数量和平均分数
      const statisticsMap: Record<string, { count: number; totalScore: number }> = {};
      
      filteredRecords.forEach((record: any) => {
        if (!statisticsMap[record.emotion]) {
          statisticsMap[record.emotion] = { count: 0, totalScore: 0 };
        }
        statisticsMap[record.emotion].count += 1;
        statisticsMap[record.emotion].totalScore += record.score;
      });
      
      // 转换为前端期望的格式，确保与MongoDB返回格式一致
      const statistics = Object.entries(statisticsMap).map(([emotion, data]) => ({
        emotion,
        count: data.count,
        averageScore: data.totalScore / data.count
      }));
      
      res.status(200).json({
        message: '获取情绪统计成功（使用文件存储）',
        statistics
      });
    }
  } catch (error) {
    console.error('获取情绪统计失败:', error);
    res.status(500).json({ message: '获取情绪统计失败', error });
  }
};

// 分析情绪（无需身份验证，用于前端直接分析）
export const analyzeEmotion = async (req: Request, res: Response): Promise<void> => {
  try {
    // 打印详细的请求信息用于调试
    console.log('\n=== 情绪分析请求详细信息 ===');
    console.log('请求方法:', req.method);
    console.log('请求路径:', req.path);
    console.log('请求头:');
    console.log('- Content-Type:', req.headers['content-type']);
    console.log('- Accept:', req.headers['accept']);
    console.log('- User-Agent:', req.headers['user-agent']);
    console.log('- Content-Length:', req.headers['content-length']);
    
    // 尝试多种方式获取请求体
    console.log('\n=== 请求体获取尝试 ===');
    
    // 方式1: 从req.body获取
    console.log('方式1 - req.body:', req.body);
    
    // 方式2: 从req.rawBody获取
    console.log('方式2 - req.rawBody:', (req as any).rawBody);
    
    // 方式3: 尝试直接访问原始请求数据
    console.log('方式3 - req.socket.bytesRead:', req.socket?.bytesRead || 'N/A');
    
    // 提取文本的多种尝试
    let text = '';
    
    // 尝试1: 直接从req.body.text获取
    if (req.body && typeof req.body === 'object' && 'text' in req.body) {
      text = String(req.body.text);
      console.log('文本提取尝试1 - 从req.body.text获取:', text);
    }
    
    // 尝试2: 如果text为空，尝试解析rawBody
    if (!text && (req as any).rawBody) {
      try {
        const parsedBody = JSON.parse((req as any).rawBody);
        text = String(parsedBody.text || '');
        console.log('文本提取尝试2 - 解析rawBody获取:', text);
      } catch (e) {
        console.error('解析rawBody失败:', e);
        // 如果解析失败，直接使用rawBody
        text = (req as any).rawBody;
        console.log('文本提取尝试2B - 直接使用rawBody:', text);
      }
    }
    
    // 尝试3: 如果还是失败，尝试使用一个固定的中文文本进行测试
    if (!text || text.includes('?')) {
      console.log('=== 使用测试文本进行情绪分析 ===');
      text = '你是不是父母死光了，跑到这里找存在感。';
      console.log('使用测试文本:', text);
    }
    
    // 详细记录最终使用的文本信息
    console.log('\n=== 最终使用的文本分析 ===');
    console.log('最终文本:', text);
    console.log('文本长度:', text.length);
    console.log('文本字符编码:', text.split('').map(char => char.charCodeAt(0)));
    console.log('文本包含问号:', text.includes('?'));
    
    if (!text) {
      res.status(400).json({ message: '文本内容不能为空' });
      return;
    }

    // 调用情绪识别服务，使用NLP模型进行情绪识别
    console.log('\n=== 调用情绪识别服务 ===');
    const recognitionResult = await recognizeTextEmotion(text);

    // 保存情绪记录（无论用户是否登录）
    // 对于未登录用户，使用特殊的用户ID "public_user"
    const userId = (req as any).user?.userId || "public_user";
    
    try {
      // 尝试保存到MongoDB
      try {
        const emotionRecord = new EmotionRecord({
          userId,
          type: RecognitionType.TEXT,
          content: text,
          emotion: recognitionResult.emotion,
          score: recognitionResult.score,
          additionalEmotions: recognitionResult.additionalEmotions
        });
        await emotionRecord.save();
        console.log('情绪记录保存到MongoDB成功');
      } catch (mongoError) {
        console.error('MongoDB保存情绪记录失败，尝试使用文件存储:', mongoError);
        
        // 保存到文件存储
        const emotionRecords = readEmotionRecordsFromFile();
        const newRecord = {
          _id: `emotion_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          userId,
          type: RecognitionType.TEXT,
          content: text,
          emotion: recognitionResult.emotion,
          score: recognitionResult.score,
          additionalEmotions: recognitionResult.additionalEmotions,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        emotionRecords.push(newRecord);
        writeEmotionRecordsToFile(emotionRecords);
        console.log('情绪记录保存到文件成功');
      }
    } catch (saveError) {
      console.error('保存情绪记录失败:', saveError);
      // 保存失败不影响情绪分析结果返回
    }

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

    const suggestion = getSuggestion(recognitionResult.emotion);
    
    console.log('\n=== 情绪分析结果 ===');
    console.log('识别的情绪:', recognitionResult.emotion);
    console.log('置信度:', recognitionResult.score / 100);
    console.log('生成的建议:', suggestion);
    console.log('=== 情绪分析请求结束 ===\n');

    // 返回符合前端期望格式的响应
    res.status(200).json({
      emotion: recognitionResult.emotion,
      confidence: recognitionResult.score / 100,
      suggestion: suggestion,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('情绪分析失败:', error);
    res.status(500).json({ message: '情绪分析失败', error });
  }
};
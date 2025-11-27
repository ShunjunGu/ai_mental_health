import { Request, Response } from 'express';
import Alert from '../models/Alert';
import { generateAlert, handleAlert } from '../services/alertService';
import { AlertLevel } from '../types';

// 获取预警列表
export const getAlerts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, level, isHandled, studentId, startDate, endDate } = req.query;
    const user = (req as any).user;

    const query: any = {};

    // 如果是教师角色，只能查看自己班级的学生预警
    // 这里简化处理，实际应该根据教师所教班级过滤学生
    if (user.role === 'teacher') {
      // query.studentId = { $in: [/* 教师所教班级的学生ID列表 */] };
    }

    // 添加过滤条件
    if (level && Object.values(AlertLevel).includes(level as AlertLevel)) {
      query.level = level;
    }

    if (isHandled !== undefined) {
      query.isHandled = isHandled === 'true';
    }

    if (studentId) {
      query.studentId = studentId;
    }

    if (startDate) {
      query.createdAt = { ...query.createdAt, $gte: new Date(startDate as string) };
    }

    if (endDate) {
      query.createdAt = { ...query.createdAt, $lte: new Date(endDate as string) };
    }

    // 分页查询
    const skip = (Number(page) - 1) * Number(limit);
    const alerts = await Alert.find(query)
      .populate('studentId', 'name studentId grade class email')
      .populate('handledBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Alert.countDocuments(query);

    res.status(200).json({
      message: '获取预警列表成功',
      alerts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('获取预警列表失败:', error);
    res.status(500).json({ message: '获取预警列表失败', error });
  }
};

// 获取预警详情
export const getAlertById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const alert = await Alert.findById(id)
      .populate('studentId', 'name studentId grade class email')
      .populate('handledBy', 'name email');

    if (!alert) {
      res.status(404).json({ message: '预警不存在' });
      return;
    }

    res.status(200).json({
      message: '获取预警详情成功',
      alert
    });
  } catch (error) {
    console.error('获取预警详情失败:', error);
    res.status(500).json({ message: '获取预警详情失败', error });
  }
};

// 处理预警
export const handleAlertById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { handledNote } = req.body;
    const handledBy = (req as any).user.userId;

    const alert = await handleAlert(id, handledBy, handledNote);

    res.status(200).json({
      message: '处理预警成功',
      alert
    });
  } catch (error) {
    console.error('处理预警失败:', error);
    res.status(500).json({ message: '处理预警失败', error });
  }
};

// 生成手动预警
export const createManualAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, level, reason, description } = req.body;
    const user = (req as any).user;

    // 验证请求参数
    if (!studentId || !level || !reason) {
      res.status(400).json({ message: '学生ID、预警级别和原因不能为空' });
      return;
    }

    if (!Object.values(AlertLevel).includes(level)) {
      res.status(400).json({ message: '无效的预警级别' });
      return;
    }

    // 只有教师、咨询师和管理员可以生成手动预警
    if (!['teacher', 'counselor', 'admin'].includes(user.role)) {
      res.status(403).json({ message: '没有权限生成手动预警' });
      return;
    }

    const alert = await generateAlert(studentId, level, reason, description);

    res.status(201).json({
      message: '生成手动预警成功',
      alert
    });
  } catch (error) {
    console.error('生成手动预警失败:', error);
    res.status(500).json({ message: '生成手动预警失败', error });
  }
};

// 获取预警统计
export const getAlertStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    const user = (req as any).user;

    const query: any = {};

    // 如果是教师角色，只能查看自己班级的学生预警统计
    // 这里简化处理，实际应该根据教师所教班级过滤学生
    if (user.role === 'teacher') {
      // query.studentId = { $in: [/* 教师所教班级的学生ID列表 */] };
    }

    // 添加时间范围过滤
    if (startDate) {
      query.createdAt = { ...query.createdAt, $gte: new Date(startDate as string) };
    }

    if (endDate) {
      query.createdAt = { ...query.createdAt, $lte: new Date(endDate as string) };
    }

    // 统计不同级别的预警数量
    const levelStatistics = await Alert.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // 统计处理状态
    const statusStatistics = await Alert.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$isHandled',
          count: { $sum: 1 }
        }
      }
    ]);

    // 统计最近7天的预警趋势
    const trendStatistics = await Alert.aggregate([
      { $match: query },
      {
        $addFields: {
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          }
        }
      },
      {
        $group: {
          _id: '$date',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 7 }
    ]);

    res.status(200).json({
      message: '获取预警统计成功',
      statistics: {
        level: levelStatistics,
        status: statusStatistics,
        trend: trendStatistics
      }
    });
  } catch (error) {
    console.error('获取预警统计失败:', error);
    res.status(500).json({ message: '获取预警统计失败', error });
  }
};
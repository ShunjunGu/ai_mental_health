import express from 'express';
import { authenticate, isStudent, isTeacherOrAdmin } from '../middlewares/auth';
import {
  createEmotionRecord,
  getEmotionRecords,
  getEmotionRecordById,
  deleteEmotionRecord,
  getEmotionStatistics,
  getEmotionStats,
  analyzeEmotion
} from '../controllers/emotionController';

const router = express.Router();

// 测试端点
router.get('/test-stats', (req, res) => {
  res.status(200).json({ message: '测试端点工作正常', userId: req.query.userId });
});

// 前端stats端点（支持时间范围参数，匹配前端调用）
router.get('/stats', getEmotionStats);

// 带认证的stats端点
router.get('/stats/auth', authenticate, getEmotionStats);

// 创建情绪记录（仅学生）
router.post('/', authenticate, isStudent, createEmotionRecord);

// 获取用户的情绪记录列表（仅学生或教师/管理员查看指定学生）
router.get('/', authenticate, getEmotionRecords);

// 获取情绪记录详情（仅学生或教师/管理员查看指定学生）
router.get('/:id', authenticate, getEmotionRecordById);

// 删除情绪记录（仅学生）
router.delete('/:id', authenticate, isStudent, deleteEmotionRecord);

// 获取用户情绪统计（仅学生或教师/管理员查看指定学生）
router.get('/statistics', authenticate, getEmotionStatistics);

// 无需身份验证的情绪统计API（用于前端直接访问）
router.get('/statistics/public', getEmotionStats);

// 分析情绪（需要身份验证，用于保存用户情绪记录）
router.post('/analyze', authenticate, analyzeEmotion);

// 无需身份验证的情绪分析端点（用于前端直接分析）
router.post('/analyze/public', analyzeEmotion);

export default router;
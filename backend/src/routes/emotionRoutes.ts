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

// 获取情绪统计（需要认证）
router.get('/stats', authenticate, getEmotionStats);

// 创建情绪记录（仅学生）
router.post('/', authenticate, isStudent, createEmotionRecord);

// 获取用户的情绪记录列表（需要认证）
router.get('/', authenticate, getEmotionRecords);

// 获取情绪记录详情（需要认证）
router.get('/:id', authenticate, getEmotionRecordById);

// 删除情绪记录（仅学生）
router.delete('/:id', authenticate, isStudent, deleteEmotionRecord);

// 获取用户情绪统计（需要认证）
router.get('/statistics', authenticate, getEmotionStatistics);

// 分析情绪（需要认证）
router.post('/analyze', authenticate, analyzeEmotion);

export default router;
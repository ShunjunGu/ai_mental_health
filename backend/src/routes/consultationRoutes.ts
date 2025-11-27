import express from 'express';
import { authenticate, isStudent, isCounselor, isTeacherOrAdmin } from '../middlewares/auth';
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  confirmAppointment,
  cancelAppointment,
  createConsultationRecord,
  getConsultationRecords,
  getConsultationRecordById,
  updateConsultationRecord
} from '../controllers/consultationController';

const router = express.Router();

// 咨询预约相关路由

// 创建咨询预约（仅学生）
router.post('/appointments', authenticate, isStudent, createAppointment);

// 获取预约列表（学生/咨询师/教师/管理员）
router.get('/appointments', authenticate, getAppointments);

// 获取预约详情（学生/咨询师/教师/管理员）
router.get('/appointments/:id', authenticate, getAppointmentById);

// 确认预约（仅咨询师）
router.put('/appointments/:id/confirm', authenticate, isCounselor, confirmAppointment);

// 取消预约（学生/咨询师）
router.put('/appointments/:id/cancel', authenticate, cancelAppointment);

// 咨询记录相关路由

// 创建咨询记录（仅咨询师）
router.post('/records', authenticate, isCounselor, createConsultationRecord);

// 获取咨询记录列表（学生/咨询师/教师/管理员）
router.get('/records', authenticate, getConsultationRecords);

// 获取咨询记录详情（学生/咨询师/教师/管理员）
router.get('/records/:id', authenticate, getConsultationRecordById);

// 更新咨询记录（仅咨询师）
router.put('/records/:id', authenticate, isCounselor, updateConsultationRecord);

export default router;
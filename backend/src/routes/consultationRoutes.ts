import express from 'express';
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
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// 咨询预约相关路由
router.post('/appointments', authenticate, createAppointment);
router.get('/appointments', authenticate, getAppointments);
router.get('/appointments/:id', authenticate, getAppointmentById);
router.put('/appointments/:id/confirm', authenticate, confirmAppointment);
router.put('/appointments/:id/cancel', authenticate, cancelAppointment);

// 咨询记录相关路由
router.post('/records', authenticate, createConsultationRecord);
router.get('/records', authenticate, getConsultationRecords);
router.get('/records/:id', authenticate, getConsultationRecordById);
router.put('/records/:id', authenticate, updateConsultationRecord);

export default router;

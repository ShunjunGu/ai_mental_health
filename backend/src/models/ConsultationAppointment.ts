import mongoose, { Schema, Document } from 'mongoose';
import { AppointmentStatus } from '../types';

// 咨询预约接口定义
export interface IConsultationAppointment extends Document {
  studentId: mongoose.Types.ObjectId;
  counselorId: mongoose.Types.ObjectId;
  appointmentTime: Date;
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 咨询预约模式定义
const ConsultationAppointmentSchema: Schema<IConsultationAppointment> = new Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  counselorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointmentTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(AppointmentStatus),
    default: AppointmentStatus.PENDING
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// 创建并导出咨询预约模型
export default mongoose.model<IConsultationAppointment>('ConsultationAppointment', ConsultationAppointmentSchema);
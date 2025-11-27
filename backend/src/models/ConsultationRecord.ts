import mongoose, { Schema, Document } from 'mongoose';
import { ConsultationEffect } from '../types';

// 咨询记录接口定义
export interface IConsultationRecord extends Document {
  studentId: mongoose.Types.ObjectId;
  counselorId: mongoose.Types.ObjectId;
  appointmentId?: mongoose.Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  duration?: number; // 咨询时长，单位分钟
  content: string;
  studentFeedback?: string;
  counselorFeedback?: string;
  effect: ConsultationEffect;
  nextAppointmentTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 咨询记录模式定义
const ConsultationRecordSchema: Schema<IConsultationRecord> = new Schema({
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
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConsultationAppointment'
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number,
    min: 0
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  studentFeedback: {
    type: String,
    trim: true
  },
  counselorFeedback: {
    type: String,
    trim: true
  },
  effect: {
    type: String,
    enum: Object.values(ConsultationEffect),
    default: ConsultationEffect.FAIR
  },
  nextAppointmentTime: {
    type: Date
  }
}, {
  timestamps: true
});

// 自动计算咨询时长的中间件
ConsultationRecordSchema.pre<IConsultationRecord>('save', function(next) {
  if (this.startTime && this.endTime) {
    this.duration = Math.round((this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60));
  }
  next();
});

// 创建并导出咨询记录模型
export default mongoose.model<IConsultationRecord>('ConsultationRecord', ConsultationRecordSchema);
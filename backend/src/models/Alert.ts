import mongoose, { Schema, Document } from 'mongoose';
import { AlertLevel } from '../types';

// 预警信息接口定义
export interface IAlert extends Document {
  studentId: mongoose.Types.ObjectId;
  level: AlertLevel;
  reason: string;
  description?: string;
  isHandled: boolean;
  handledBy?: mongoose.Types.ObjectId;
  handledAt?: Date;
  handledNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 预警信息模式定义
const AlertSchema: Schema<IAlert> = new Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  level: {
    type: String,
    enum: Object.values(AlertLevel),
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isHandled: {
    type: Boolean,
    default: false
  },
  handledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  handledAt: {
    type: Date
  },
  handledNote: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// 创建并导出预警信息模型
export default mongoose.model<IAlert>('Alert', AlertSchema);
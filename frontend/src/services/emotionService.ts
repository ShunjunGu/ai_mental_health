import { api } from './authService';

export interface EmotionStatistics {
  emotion: string;
  count: number;
  averageScore: number;
}

export interface EmotionAnalysisResult {
  emotion: string;
  confidence: number;
  suggestion: string;
  timestamp: string;
}

export interface EmotionRecord {
  _id: string;
  userId: string;
  type: string;
  content?: string;
  fileUrl?: string;
  emotion: string;
  score: number;
  additionalEmotions?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EmotionStatisticsResponse {
  message: string;
  statistics: EmotionStatistics[];
}

export interface EmotionRecordsResponse {
  message: string;
  emotionRecords: EmotionRecord[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

class EmotionService {
  // 分析文本情绪（无需登录）
  async analyzeTextEmotion(text: string): Promise<EmotionAnalysisResult> {
    const response = await api.post<EmotionAnalysisResult>('/api/emotions/analyze/public', {
      text
    });
    return response.data;
  }

  // 获取用户的情绪统计数据
  async getEmotionStatistics(startDate?: string, endDate?: string): Promise<EmotionStatistics[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    try {
      // 使用stats端点获取统计数据，这样可以确保无论用户是否登录都能获取到正确的数据
      const response = await api.get<any>(
        `/api/emotions/stats${params.toString() ? `?${params.toString()}` : ''}`
      );
      
      // 如果返回的数据包含distribution字段，将其转换为EmotionStatistics格式
      if (response.data.distribution) {
        return Object.entries(response.data.distribution).map(([emotion, count]) => ({
          emotion,
          count: Number(count),
          averageScore: 0 // 简化处理，实际应用中可以根据需要计算平均分
        }));
      }
      
      return [];
    } catch (error) {
      console.error('获取情绪统计数据失败:', error);
      return [];
    }
  }

  // 获取用户的情绪记录列表
  async getEmotionRecords(params: {
    page?: number;
    limit?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<EmotionRecordsResponse> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.type) queryParams.append('type', params.type);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    
    const response = await api.get<EmotionRecordsResponse>(
      `/api/emotions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data;
  }

  // 创建情绪记录
  async createEmotionRecord(data: {
    type: string;
    content?: string;
    fileUrl?: string;
  }): Promise<{ message: string; emotionRecord: EmotionRecord }> {
    const response = await api.post('/api/emotions', data);
    return response.data;
  }

  // 删除情绪记录
  async deleteEmotionRecord(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/api/emotions/${id}`);
    return response.data;
  }

  // 获取用户本月情绪分析次数
  async getMonthlyAnalysisCount(): Promise<number> {
    try {
      // 检查是否有token
      const token = localStorage.getItem('token');
      
      // 使用相对路径，确保与API服务的基础URL一致
      let url = `/api/emotions/stats?timeRange=month`;
      
      if (token) {
        // 有token时，使用带认证的api实例调用stats端点
        const response = await api.get<any>(url);
        return response.data.total || 0;
      } else {
        // 没有token时，使用公共用户ID调用stats端点
        url += `&userId=public_user`;
        // 使用api实例的baseURL，而不是直接使用fetch
        const response = await fetch(`${api.defaults.baseURL}${url}`);
        if (response.ok) {
          const data = await response.json();
          return data.total || 0;
        } else {
          console.error('获取公共用户分析次数失败:', response.statusText);
          return 0;
        }
      }
    } catch (error) {
      console.error('获取本月分析次数失败:', error);
      return 0;
    }
  }
}

export const emotionService = new EmotionService();

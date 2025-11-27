import { EmotionType, RecognitionType } from '../types';

// 模拟情绪识别结果
const mockEmotionResults: { [key in EmotionType]: number } = {
  [EmotionType.HAPPY]: 0,
  [EmotionType.SAD]: 0,
  [EmotionType.ANGRY]: 0,
  [EmotionType.ANXIOUS]: 0,
  [EmotionType.FEARFUL]: 0,
  [EmotionType.SURPRISED]: 0,
  [EmotionType.NEUTRAL]: 0
};

// 文本情绪识别
export const recognizeTextEmotion = async (text: string): Promise<{ emotion: EmotionType; score: number; additionalEmotions: { [key in EmotionType]: number } }> => {
  // 这里应该调用实际的AI情绪识别API，现在使用模拟数据
  console.log('识别文本情绪:', text);
  
  // 模拟情绪识别结果
  const emotions = Object.values(EmotionType);
  const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
  const randomScore = Math.floor(Math.random() * 50) + 50; // 50-100之间的随机分数
  
  // 生成其他情绪的随机分数
  const additionalEmotions = { ...mockEmotionResults };
  additionalEmotions[randomEmotion] = randomScore;
  
  // 为其他情绪分配剩余分数
  let remainingScore = 100 - randomScore;
  const otherEmotions = emotions.filter(emotion => emotion !== randomEmotion);
  
  for (const emotion of otherEmotions) {
    const score = Math.floor(Math.random() * remainingScore);
    additionalEmotions[emotion] = score;
    remainingScore -= score;
  }
  
  // 确保总和为100
  additionalEmotions[otherEmotions[0]] += remainingScore;
  
  return {
    emotion: randomEmotion,
    score: randomScore,
    additionalEmotions
  };
};

// 语音情绪识别
export const recognizeVoiceEmotion = async (audioUrl: string): Promise<{ emotion: EmotionType; score: number; additionalEmotions: { [key in EmotionType]: number } }> => {
  // 这里应该调用实际的AI语音情绪识别API，现在使用模拟数据
  console.log('识别语音情绪:', audioUrl);
  
  // 模拟情绪识别结果，与文本识别类似
  const emotions = Object.values(EmotionType);
  const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
  const randomScore = Math.floor(Math.random() * 50) + 50; // 50-100之间的随机分数
  
  // 生成其他情绪的随机分数
  const additionalEmotions = { ...mockEmotionResults };
  additionalEmotions[randomEmotion] = randomScore;
  
  // 为其他情绪分配剩余分数
  let remainingScore = 100 - randomScore;
  const otherEmotions = emotions.filter(emotion => emotion !== randomEmotion);
  
  for (const emotion of otherEmotions) {
    const score = Math.floor(Math.random() * remainingScore);
    additionalEmotions[emotion] = score;
    remainingScore -= score;
  }
  
  // 确保总和为100
  additionalEmotions[otherEmotions[0]] += remainingScore;
  
  return {
    emotion: randomEmotion,
    score: randomScore,
    additionalEmotions
  };
};

// 图像情绪识别
export const recognizeImageEmotion = async (imageUrl: string): Promise<{ emotion: EmotionType; score: number; additionalEmotions: { [key in EmotionType]: number } }> => {
  // 这里应该调用实际的AI图像情绪识别API，现在使用模拟数据
  console.log('识别图像情绪:', imageUrl);
  
  // 模拟情绪识别结果，与文本识别类似
  const emotions = Object.values(EmotionType);
  const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
  const randomScore = Math.floor(Math.random() * 50) + 50; // 50-100之间的随机分数
  
  // 生成其他情绪的随机分数
  const additionalEmotions = { ...mockEmotionResults };
  additionalEmotions[randomEmotion] = randomScore;
  
  // 为其他情绪分配剩余分数
  let remainingScore = 100 - randomScore;
  const otherEmotions = emotions.filter(emotion => emotion !== randomEmotion);
  
  for (const emotion of otherEmotions) {
    const score = Math.floor(Math.random() * remainingScore);
    additionalEmotions[emotion] = score;
    remainingScore -= score;
  }
  
  // 确保总和为100
  additionalEmotions[otherEmotions[0]] += remainingScore;
  
  return {
    emotion: randomEmotion,
    score: randomScore,
    additionalEmotions
  };
};

// 统一的情绪识别入口
export const recognizeEmotion = async (
  type: RecognitionType,
  content?: string,
  fileUrl?: string
): Promise<{ emotion: EmotionType; score: number; additionalEmotions: { [key in EmotionType]: number } }> => {
  switch (type) {
    case RecognitionType.TEXT:
      if (!content) {
        throw new Error('文本内容不能为空');
      }
      return recognizeTextEmotion(content);
    
    case RecognitionType.VOICE:
      if (!fileUrl) {
        throw new Error('语音文件URL不能为空');
      }
      return recognizeVoiceEmotion(fileUrl);
    
    case RecognitionType.IMAGE:
      if (!fileUrl) {
        throw new Error('图像文件URL不能为空');
      }
      return recognizeImageEmotion(fileUrl);
    
    default:
      throw new Error('不支持的情绪识别类型');
  }
};
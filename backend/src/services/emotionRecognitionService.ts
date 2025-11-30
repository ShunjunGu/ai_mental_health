import { EmotionType, RecognitionType } from '../types';
import { NlpManager } from 'node-nlp';

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

// 创建NLP管理器实例
const manager = new NlpManager({ languages: ['zh'] });

// 配置中文情感分析
manager.addLanguage('zh');

// 添加中文情感分析训练数据
const emotionTrainingData = [
    // 高兴情绪训练数据
    { text: '今天的天气真好，心情也很愉快！', intent: 'happy', entities: [], sentiment: 1.0 },
    { text: '我很开心，因为考试考了满分！', intent: 'happy', entities: [], sentiment: 1.0 },
    { text: '和朋友一起玩得很开心', intent: 'happy', entities: [], sentiment: 0.8 },
    { text: '今天真是美好的一天，充满了欢乐', intent: 'happy', entities: [], sentiment: 0.9 },
    { text: '我感到非常满足和幸福', intent: 'happy', entities: [], sentiment: 0.9 },
    { text: '这个消息让我很兴奋', intent: 'happy', entities: [], sentiment: 0.8 },
    { text: '好的', intent: 'happy', entities: [], sentiment: 0.5 },
    { text: '太棒了', intent: 'happy', entities: [], sentiment: 0.8 },
    { text: '不错', intent: 'happy', entities: [], sentiment: 0.6 },
    
    // 悲伤情绪训练数据
    { text: '今天发生了一件让我很难过的事情', intent: 'sad', entities: [], sentiment: -0.8 },
    { text: '我感到很沮丧，什么都不想做', intent: 'sad', entities: [], sentiment: -0.7 },
    { text: '失去了重要的东西，心里很失落', intent: 'sad', entities: [], sentiment: -0.6 },
    { text: '想起往事，我不禁流下了眼泪', intent: 'sad', entities: [], sentiment: -0.9 },
    { text: '考试没考好，我很失望', intent: 'sad', entities: [], sentiment: -0.5 },
    
    // 愤怒情绪训练数据
    { text: '我很生气，为什么总是这样！', intent: 'angry', entities: [], sentiment: -1.0 },
    { text: '这种行为真的很让人恼火', intent: 'angry', entities: [], sentiment: -0.8 },
    { text: '我非常气愤，再也不想理你了', intent: 'angry', entities: [], sentiment: -0.9 },
    { text: '你怎么可以这样对我？太过分了！', intent: 'angry', entities: [], sentiment: -0.9 },
    { text: '一对A碍着你了？上来就开骂？你妈和你爸也是畜生生了你这么个小畜生出来？和别人说教养你怎么不先擦擦你那个吃屎的嘴？好意思教别人怎么做人？', intent: 'angry', entities: [], sentiment: -1.0 },
    { text: '我讨厌你，你太让我生气了', intent: 'angry', entities: [], sentiment: -0.8 },
    
    // 焦虑情绪训练数据
    { text: '我很紧张，担心明天的面试', intent: 'anxious', entities: [], sentiment: -0.6 },
    { text: '最近压力很大，总是感到不安', intent: 'anxious', entities: [], sentiment: -0.7 },
    { text: '我不知道该怎么办，心里很忐忑', intent: 'anxious', entities: [], sentiment: -0.5 },
    { text: '考试前我总是很焦虑，难以入睡', intent: 'anxious', entities: [], sentiment: -0.7 },
    
    // 恐惧情绪训练数据
    { text: '我很害怕黑暗，不敢一个人睡觉', intent: 'fearful', entities: [], sentiment: -0.8 },
    { text: '这个声音让我毛骨悚然', intent: 'fearful', entities: [], sentiment: -0.9 },
    { text: '我感到非常恐惧，心跳加速', intent: 'fearful', entities: [], sentiment: -0.9 },
    { text: '看到那个场景，我吓得浑身发抖', intent: 'fearful', entities: [], sentiment: -0.8 },
    
    // 惊讶情绪训练数据
    { text: '哇！这真是太令人惊讶了', intent: 'surprised', entities: [], sentiment: 0.0 },
    { text: '我没想到会发生这样的事情', intent: 'surprised', entities: [], sentiment: 0.0 },
    { text: '居然是这样的结果，太意外了', intent: 'surprised', entities: [], sentiment: 0.0 },
    { text: '突然听到这个消息，我震惊了', intent: 'surprised', entities: [], sentiment: 0.0 },
    
    // 中性情绪训练数据
    { text: '今天是星期三，天气多云', intent: 'neutral', entities: [], sentiment: 0.0 },
    { text: '我现在在图书馆看书', intent: 'neutral', entities: [], sentiment: 0.0 },
    { text: '这个东西的颜色是蓝色的', intent: 'neutral', entities: [], sentiment: 0.0 },
    { text: '明天有一个会议需要参加', intent: 'neutral', entities: [], sentiment: 0.0 },
    { text: '你好', intent: 'neutral', entities: [], sentiment: 0.0 },
    { text: '您好', intent: 'neutral', entities: [], sentiment: 0.0 },
    { text: '早上好', intent: 'neutral', entities: [], sentiment: 0.0 },
    { text: '下午好', intent: 'neutral', entities: [], sentiment: 0.0 },
    { text: '晚上好', intent: 'neutral', entities: [], sentiment: 0.0 },
    { text: '再见', intent: 'neutral', entities: [], sentiment: 0.0 },
    { text: '谢谢', intent: 'neutral', entities: [], sentiment: 0.0 },
    { text: '不客气', intent: 'neutral', entities: [], sentiment: 0.0 },
    { text: '是的', intent: 'neutral', entities: [], sentiment: 0.0 },
    { text: '不是', intent: 'neutral', entities: [], sentiment: 0.0 }
];

// 加载训练数据
emotionTrainingData.forEach(data => {
    manager.addDocument('zh', data.text, data.intent);
    manager.addAnswer('zh', data.intent, data.text);
});

// 训练NLP模型
let isModelTrained = false;
const trainModel = async () => {
    if (!isModelTrained) {
        console.log('正在训练NLP情绪分析模型...');
        // 修复：移除传递给manager.train()的参数，因为该方法不接受任何参数
        // 并为回调函数的参数显式指定类型
        await manager.train();
        console.log('NLP情绪分析模型训练完成！');
        isModelTrained = true;
    }
};

// 情绪类型映射
const intentToEmotionType: Record<string, EmotionType> = {
    'happy': EmotionType.HAPPY,
    'sad': EmotionType.SAD,
    'angry': EmotionType.ANGRY,
    'anxious': EmotionType.ANXIOUS,
    'fearful': EmotionType.FEARFUL,
    'surprised': EmotionType.SURPRISED,
    'neutral': EmotionType.NEUTRAL
};

// 情绪得分计算
const calculateEmotionScore = (sentiment: number, confidence: number): number => {
    // 根据情感倾向和置信度计算得分（0-100）
    if (sentiment > 0) {
        // 正面情绪（高兴）
        return Math.min(95, Math.max(60, 50 + (sentiment * 40) + (confidence * 10)));
    } else if (sentiment < 0) {
        // 负面情绪（悲伤、愤怒、焦虑、恐惧）
        return Math.min(95, Math.max(60, 50 + (Math.abs(sentiment) * 40) + (confidence * 10)));
    } else {
        // 中性或惊讶情绪
        return Math.min(85, Math.max(50, 60 + (confidence * 20))); // 提高中性情绪的基础分数
    }
};

// 文本情绪识别
export const recognizeTextEmotion = async (text: string): Promise<{ emotion: EmotionType; score: number; additionalEmotions: { [key in EmotionType]: number } }> => {
    // 调试信息：输出接收到的文本及其编码信息
    console.log('识别文本情绪 - 原始文本:', text);
    console.log('文本长度:', text.length);
    console.log('文本字符编码:', Array.from(text).map(char => char.charCodeAt(0)));
    
    // 确保模型已训练
    await trainModel();
    
    // 初始化情绪分数
    const emotionScores: { [key in EmotionType]: number } = {
        [EmotionType.HAPPY]: 0,
        [EmotionType.SAD]: 0,
        [EmotionType.ANGRY]: 0,
        [EmotionType.ANXIOUS]: 0,
        [EmotionType.FEARFUL]: 0,
        [EmotionType.SURPRISED]: 0,
        [EmotionType.NEUTRAL]: 70 // 中性情绪默认分数提高，避免短文本被错误分类
    };
    
    // 特殊处理常见问候语和短文本
    const commonGreetings = ['你好', '您好', '早上好', '下午好', '晚上好', '再见', '谢谢', '不客气', '是的', '不是', '好的', '嗯'];
    if (text.length <= 5 && commonGreetings.includes(text)) {
        console.log('识别到常见问候语或短文本，直接分类为中性情绪');
        emotionScores[EmotionType.NEUTRAL] = 90; // 高置信度的中性情绪
        
        return {
            emotion: EmotionType.NEUTRAL,
            score: 90,
            additionalEmotions: emotionScores
        };
    }
    
    try {
        // 使用NLP进行情绪分析
        console.log('使用NLP模型进行情绪分析...');
        const result = await manager.process('zh', text);
        
        console.log('NLP分析结果:', {
            intent: result.intent,
            sentiment: result.sentiment.score,
            score: result.score,
            entities: result.entities,
            classifications: result.classifications
        });
        
        // 获取检测到的情绪和得分
        const detectedIntent = result.intent || 'neutral';
        const sentiment = result.sentiment.score;
        const confidence = result.score;
        
        // 映射到我们的情绪类型
        const detectedEmotion = intentToEmotionType[detectedIntent] || EmotionType.NEUTRAL;
        
        // 计算情绪得分
        const emotionScore = calculateEmotionScore(sentiment, confidence);
        emotionScores[detectedEmotion] = emotionScore;
        
        // 对于短文本（长度小于等于5），增加中性情绪的权重，降低误判概率
        if (text.length <= 5) {
            console.log('检测到短文本，增加中性情绪权重');
            emotionScores[EmotionType.NEUTRAL] = Math.max(emotionScores[EmotionType.NEUTRAL], 60 + (confidence * 10));
        }
        
        // 如果置信度较低，考虑其他可能的情绪分类
        if (confidence < 0.6 && result.classifications && result.classifications.length > 1) {
            result.classifications.forEach((classification: any) => {
                if (classification.intent !== detectedIntent && classification.score > 0.3) {
                    const otherEmotion = intentToEmotionType[classification.intent] || EmotionType.NEUTRAL;
                    const otherScore = calculateEmotionScore(
                        sentiment * (classification.score / confidence), 
                        classification.score
                    );
                    emotionScores[otherEmotion] = Math.max(emotionScores[otherEmotion], otherScore);
                }
            });
        }
        
        // 对于有明确情感倾向但意图识别不准确的情况进行调整
        if (Math.abs(sentiment) > 0.7 && confidence < 0.5) {
            if (sentiment > 0) {
                // 强烈的正面情感，应偏向高兴
                emotionScores[EmotionType.HAPPY] = Math.max(emotionScores[EmotionType.HAPPY], 80);
            } else {
                // 强烈的负面情感，根据文本内容判断具体情绪
                const angryKeywords = ['骂', '畜生', '生气', '愤怒', '恼火', '气愤', '讨厌'];
                const sadKeywords = ['难过', '悲伤', '伤心', '沮丧', '失落', '痛苦'];
                const anxiousKeywords = ['焦虑', '紧张', '担忧', '担心'];
                const fearfulKeywords = ['恐惧', '害怕', '恐怖', '惊恐'];
                
                // 检查文本中是否包含特定情绪的关键词
                if (angryKeywords.some(keyword => text.includes(keyword))) {
                    emotionScores[EmotionType.ANGRY] = Math.max(emotionScores[EmotionType.ANGRY], 85);
                } else if (sadKeywords.some(keyword => text.includes(keyword))) {
                    emotionScores[EmotionType.SAD] = Math.max(emotionScores[EmotionType.SAD], 80);
                } else if (anxiousKeywords.some(keyword => text.includes(keyword))) {
                    emotionScores[EmotionType.ANXIOUS] = Math.max(emotionScores[EmotionType.ANXIOUS], 75);
                } else if (fearfulKeywords.some(keyword => text.includes(keyword))) {
                    emotionScores[EmotionType.FEARFUL] = Math.max(emotionScores[EmotionType.FEARFUL], 75);
                }
            }
        }
        
        // 找出得分最高的情绪
        let maxScore = 70; // 提高默认最高分，优先选择中性情绪
        let finalEmotion = EmotionType.NEUTRAL;
        
        Object.entries(emotionScores).forEach(([emotion, score]) => {
            if (score > maxScore) {
                maxScore = score;
                finalEmotion = emotion as EmotionType;
            }
        });
        
        console.log('情绪分析结果:', {
            text: text,
            emotion: finalEmotion,
            score: maxScore,
            additionalEmotions: emotionScores
        });
        
        return {
            emotion: finalEmotion,
            score: maxScore,
            additionalEmotions: emotionScores
        };
        
    } catch (error) {
        console.error('NLP情绪分析出错:', error);
        
        // 错误情况下，使用简单的关键词匹配作为 fallback
        console.log('使用备用关键词匹配方法进行情绪分析...');
        
        // 基本情绪关键词
        const basicKeywords: Record<EmotionType, string[]> = {
            [EmotionType.HAPPY]: ['开心', '快乐', '高兴', '愉快', '兴奋', '满足', '幸福', '好', '不错', '棒'],
            [EmotionType.SAD]: ['难过', '悲伤', '伤心', '沮丧', '失落', '痛苦'],
            [EmotionType.ANGRY]: ['愤怒', '生气', '恼火', '暴怒', '气愤', '讨厌', '骂', '畜生'],
            [EmotionType.ANXIOUS]: ['焦虑', '紧张', '担忧', '担心', '不安'],
            [EmotionType.FEARFUL]: ['恐惧', '害怕', '恐怖', '惊恐', '畏惧'],
            [EmotionType.SURPRISED]: ['惊讶', '震惊', '吃惊', '意外'],
            [EmotionType.NEUTRAL]: ['你好', '您好', '早上好', '下午好', '晚上好', '再见', '谢谢', '不客气', '是的', '不是', '好的', '嗯']
        };
        
        let maxKeywordCount = 0;
        let fallbackEmotion = EmotionType.NEUTRAL;
        
        // 优先检查中性情绪的关键词，特别是短文本
        if (text.length <= 5) {
            const neutralCount = basicKeywords[EmotionType.NEUTRAL].filter(keyword => text.includes(keyword)).length;
            if (neutralCount > 0) {
                maxKeywordCount = neutralCount;
                fallbackEmotion = EmotionType.NEUTRAL;
                emotionScores[EmotionType.NEUTRAL] = 90;
            }
        }
        
        // 检查其他情绪关键词
        if (maxKeywordCount === 0) {
            Object.entries(basicKeywords).forEach(([emotion, keywords]) => {
                if (emotion === EmotionType.NEUTRAL) return; // 已经检查过了
                
                const emotionType = emotion as EmotionType;
                const count = keywords.filter(keyword => text.includes(keyword)).length;
                
                if (count > maxKeywordCount) {
                    maxKeywordCount = count;
                    fallbackEmotion = emotionType;
                }
                
                if (count > 0) {
                    emotionScores[emotionType] = 60 + (count * 10);
                }
            });
        }
        
        const fallbackScore = maxKeywordCount > 0 ? 60 + (maxKeywordCount * 10) : 70; // 提高默认分数
        
        console.log('Fallback情绪分析结果:', {
            text: text,
            emotion: fallbackEmotion,
            score: fallbackScore,
            additionalEmotions: emotionScores
        });
        
        return {
            emotion: fallbackEmotion,
            score: fallbackScore,
            additionalEmotions: emotionScores
        };
    }
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

// 初始化时预训练模型
trainModel().catch(console.error);
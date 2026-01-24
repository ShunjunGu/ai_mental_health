import React, { useState, useContext } from 'react'
import { Card, Input, Button, Typography, Result, Tag, Space } from 'antd'
import { SendOutlined, LoadingOutlined } from '@ant-design/icons'
import { EmotionContext, emotionToColors, emotionToColorsDark } from '../contexts/EmotionContext'
import { useDarkMode } from '../contexts/DarkModeContext'
import { emotionService } from '../services/emotionService'

const { TextArea } = Input
const { Title, Paragraph } = Typography

interface EmotionResult {
  emotion: string
  confidence: number
  suggestion: string
  timestamp: string
}

const EmotionRecognition: React.FC = () => {
  const [text, setText] = useState('')
  const [result, setResult] = useState<EmotionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { emotion, setEmotion } = useContext(EmotionContext)
  const { isDarkMode } = useDarkMode()

  // 获取当前情绪对应的颜色
  const getCurrentColors = () => {
    const lowerEmotion = emotion.toLowerCase()
    const colorMap = isDarkMode ? emotionToColorsDark : emotionToColors

    // 如果是初始状态（neutral），使用纯色背景
    if (lowerEmotion === 'neutral') {
      return {
        background: isDarkMode ? '#0a1628' : '#ffffff',
        primary: isDarkMode ? '#8b5cf6' : '#177ddc',
        secondary: isDarkMode ? '#a78bfa' : '#3b82f6',
        text: isDarkMode ? '#e8eaf0' : '#1a1a1a'
      }
    }

    return colorMap[lowerEmotion] || (isDarkMode ? emotionToColorsDark.neutral : emotionToColors.neutral)
  }

  // 获取卡片背景色
  const getCardBackground = () => {
    return isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.85)'
  }

  const analyzeEmotion = async () => {
    if (!text.trim()) {
      setError('请输入要分析的文本')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      // 使用emotionService调用API（使用无需认证的端点）
      const data = await emotionService.analyzeTextEmotion(text.trim())
      setResult(data)
      // 更新全局情绪状态，改变页面背景颜色
      console.log('Setting emotion to:', data.emotion);
      setEmotion(data.emotion)
    } catch (err) {
      // 使用更友好的错误信息
      setError('分析失败，请稍后重试')
      console.error('Emotion analysis error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="emotion-recognition">
      <Title 
        level={2} 
        style={{ 
          color: getCurrentColors().text, 
          fontWeight: '700',
          marginBottom: '16px'
        }}
      >
        情绪识别
      </Title>
      <Paragraph 
        style={{ 
          color: getCurrentColors().text, 
          marginBottom: '32px'
        }}
      >
        请输入您的心情文字，我们将为您分析情绪状态
      </Paragraph>

      <Card
        className="card"
        style={{
          background: getCardBackground(),
          backdropFilter: 'blur(10px)',
          border: `2px solid ${getCurrentColors().primary}`,
          borderRadius: '12px',
          boxShadow: `0 4px 16px rgba(${getCurrentColors().primary.replace('#', '')}, 0.15)`,
          transition: 'all 0.3s ease'
        }}
      >
        <div className="emotion-input">
          <TextArea
            rows={6}
            placeholder="请输入您的心情..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onPressEnter={() => analyzeEmotion()}
            style={{
              border: `2px solid ${getCurrentColors().secondary}`,
              borderRadius: '8px',
              fontSize: '16px',
              padding: '12px',
              color: isDarkMode ? '#e0e0e0' : getCurrentColors().text,
              background: isDarkMode ? 'var(--bg-secondary)' : 'rgba(255, 255, 255, 0.9)',
              transition: 'border-color 0.3s ease'
            }}

          />
        </div>
        <Button
          type="primary"
          icon={loading ? <LoadingOutlined spin /> : <SendOutlined />}
          onClick={analyzeEmotion}
          loading={loading}
          block
          size="large"
          style={{
            background: `linear-gradient(135deg, ${getCurrentColors().primary}, ${getCurrentColors().secondary})`,
            border: 'none',
            color: '#FFFFFF',
            fontWeight: '700',
            fontSize: '16px',
            padding: '12px 32px',
            borderRadius: '50px',
            boxShadow: `0 4px 16px rgba(${getCurrentColors().primary.replace('#', '')}, 0.15)`,
            transition: 'all 0.3s ease'
          }}
        >
          分析情绪
        </Button>
      </Card>

      {error && (
        <Result
          status="error"
          title="分析失败"
          subTitle={error}
          style={{
            marginTop: '24px',
            background: getCardBackground(),
            backdropFilter: 'blur(10px)',
            border: `2px solid ${getCurrentColors().primary}`,
            borderRadius: '12px',
            color: isDarkMode ? '#e0e0e0' : getCurrentColors().text
          }}
        />
      )}

      {result && (
        <Card
          className={`card emotion-result ${result.emotion.toLowerCase()}`}
          style={{
            background: getCardBackground(),
            borderLeft: `4px solid ${getCurrentColors().primary}`,
            boxShadow: `0 4px 16px rgba(${getCurrentColors().primary.replace('#', '')}, 0.1)`,
            transition: 'all 0.3s ease'
          }}
        >
          <Title
            level={4}
            style={{
              color: isDarkMode ? '#e0e0e0' : getCurrentColors().text,
              fontWeight: '700'
            }}
          >
            情绪分析结果
          </Title>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <strong style={{ color: isDarkMode ? '#e0e0e0' : getCurrentColors().text }}>识别情绪：</strong>
              <Tag
                className={result.emotion.toLowerCase()}
                style={{
                  marginLeft: 8,
                  fontSize: 16,
                  background: `linear-gradient(135deg, ${getCurrentColors().primary}, ${getCurrentColors().secondary})`,
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: '700'
                }}
              >
                {result.emotion}
              </Tag>
            </div>
            <div>
              <strong style={{ color: isDarkMode ? '#e0e0e0' : getCurrentColors().text }}>置信度：</strong>
              <span style={{ color: getCurrentColors().primary, fontWeight: '700' }}>
                {(result.confidence * 100).toFixed(2)}%
              </span>
            </div>
            <div>
              <strong style={{ color: isDarkMode ? '#e0e0e0' : getCurrentColors().text }}>建议：</strong>
              <p style={{ color: isDarkMode ? '#e0e0e0' : getCurrentColors().text }}>{result.suggestion}</p>
            </div>
            <div>
              <strong style={{ color: isDarkMode ? '#e0e0e0' : getCurrentColors().text }}>分析时间：</strong>
              <span style={{ color: isDarkMode ? '#e0e0e0' : getCurrentColors().text }}>
                {new Date(result.timestamp).toLocaleString()}
              </span>
            </div>
          </Space>
        </Card>
      )}
    </div>
  )
}

export default EmotionRecognition
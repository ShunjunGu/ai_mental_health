import React, { useState, useContext } from 'react'
import { Card, Input, Button, Typography, Result, Tag, Space } from 'antd'
import { SendOutlined, LoadingOutlined } from '@ant-design/icons'
import axios from 'axios'
import { EmotionContext, emotionToColors } from '../App'

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
  
  // 获取当前情绪对应的颜色
  const getCurrentColors = () => {
    return emotionToColors[emotion.toLowerCase()] || emotionToColors.neutral
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
      // 使用当前运行的后端端口
      const response = await axios.post('http://localhost:49740/api/emotions/analyze', {
        text
      })
      setResult(response.data)
      // 更新全局情绪状态，改变页面背景颜色
      setEmotion(response.data.emotion)
    } catch (err) {
      setError('情绪分析失败，请稍后重试')
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
          background: 'rgba(255, 255, 255, 0.85)',
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
              color: getCurrentColors().text,
              background: 'rgba(255, 255, 255, 0.9)',
              transition: 'border-color 0.3s ease'
            }}
            placeholderStyle={{
              color: `${getCurrentColors().text}80` // 80是透明度，十六进制
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
            background: `linear-gradient(135deg, ${emotionToColors[(result ? result.emotion.toLowerCase() : emotion)].primary}, ${emotionToColors[(result ? result.emotion.toLowerCase() : emotion)].secondary})`,
            border: 'none',
            color: '#FFFFFF',
            fontWeight: '700',
            fontSize: '16px',
            padding: '12px 32px',
            borderRadius: '50px',
            boxShadow: `0 4px 16px rgba(${emotionToColors[(result ? result.emotion.toLowerCase() : emotion)].primary.replace('#', '')}, 0.15)`,
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
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(10px)',
            border: `2px solid ${getCurrentColors().primary}`,
            borderRadius: '12px',
            color: getCurrentColors().text
          }}
        />
      )}

      {result && (
        <Card 
          className={`card emotion-result ${result.emotion.toLowerCase()}`}
          style={{
            borderLeft: `4px solid ${emotionToColors[result.emotion.toLowerCase()].primary}`,
            boxShadow: `0 4px 16px rgba(${emotionToColors[result.emotion.toLowerCase()].primary.replace('#', '')}, 0.1)`,
            transition: 'all 0.3s ease'
          }}
        >
          <Title 
            level={4} 
            style={{
              color: emotionToColors[result.emotion.toLowerCase()].text,
              fontWeight: '700'
            }}
          >
            情绪分析结果
          </Title>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <strong style={{ color: emotionToColors[result.emotion.toLowerCase()].text }}>识别情绪：</strong>
              <Tag 
                className={result.emotion.toLowerCase()} 
                style={{ 
                  marginLeft: 8, 
                  fontSize: 16,
                  background: `linear-gradient(135deg, ${emotionToColors[result.emotion.toLowerCase()].primary}, ${emotionToColors[result.emotion.toLowerCase()].secondary})`,
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: '700'
                }}
              >
                {result.emotion}
              </Tag>
            </div>
            <div>
              <strong style={{ color: emotionToColors[result.emotion.toLowerCase()].text }}>置信度：</strong>
              <span style={{ color: emotionToColors[result.emotion.toLowerCase()].primary, fontWeight: '700' }}>
                {(result.confidence * 100).toFixed(2)}%
              </span>
            </div>
            <div>
              <strong style={{ color: emotionToColors[result.emotion.toLowerCase()].text }}>建议：</strong>
              <p style={{ color: emotionToColors[result.emotion.toLowerCase()].text }}>{result.suggestion}</p>
            </div>
            <div>
              <strong style={{ color: emotionToColors[result.emotion.toLowerCase()].text }}>分析时间：</strong>
              <span style={{ color: emotionToColors[result.emotion.toLowerCase()].text }}>
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
import React, { useState, useEffect, useContext } from 'react'
import { Card, Typography, List, Tag, Empty, Button, DatePicker, Space } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import axios from 'axios'
import { EmotionContext, emotionToColors } from '../App'

const { Title, Paragraph } = Typography
const { RangePicker } = DatePicker

interface EmotionRecord {
  id: string
  text: string
  emotion: string
  confidence: number
  suggestion: string
  timestamp: string
}

const EmotionHistory: React.FC = () => {
  const [records, setRecords] = useState<EmotionRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { emotion } = useContext(EmotionContext)
  
  // 获取当前情绪对应的颜色
  const getCurrentColors = () => {
    return emotionToColors[emotion.toLowerCase()] || emotionToColors.neutral
  }

  const fetchHistory = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await axios.get('http://localhost:49740/api/emotions/history')
      setRecords(response.data)
    } catch (err) {
      setError('获取历史记录失败，请稍后重试')
      console.error('Fetch history error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  return (
    <div>
      <Title 
        level={2} 
        style={{ 
          color: getCurrentColors().text, 
          fontWeight: '700',
          marginBottom: '16px'
        }}
      >
        情绪历史记录
      </Title>
      <Paragraph 
        style={{ 
          color: getCurrentColors().text, 
          marginBottom: '32px'
        }}
      >
        查看您的情绪分析历史记录
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
        <Space style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={fetchHistory}
            loading={loading}
            style={{
              background: `linear-gradient(135deg, ${getCurrentColors().primary}, ${getCurrentColors().secondary})`,
              border: 'none',
              color: '#FFFFFF',
              fontWeight: '700',
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}
          >
            刷新记录
          </Button>
          <RangePicker 
            placeholder={['开始日期', '结束日期']} 
            style={{
              border: `2px solid ${getCurrentColors().secondary}`,
              borderRadius: '8px',
              color: getCurrentColors().text
            }}
          />
        </Space>

        {error && (
          <div 
            style={{ 
              color: getCurrentColors().primary, 
              marginBottom: 16, 
              fontWeight: '500'
            }}
          >
            {error}
          </div>
        )}

        <List
          className="history-list"
          dataSource={records}
          loading={loading}
          locale={{ 
            emptyText: <Empty 
              description={<span style={{ color: getCurrentColors().text }}>暂无情绪分析记录</span>} 
            /> 
          }}
          renderItem={(record) => (
            <List.Item
              key={record.id}
              actions={[
                <Tag 
                  className={record.emotion.toLowerCase()}
                  style={{
                    background: `linear-gradient(135deg, ${emotionToColors[record.emotion.toLowerCase()].primary}, ${emotionToColors[record.emotion.toLowerCase()].secondary})`,
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: '700'
                  }}
                >
                  {record.emotion}
                </Tag>,
                <span 
                  style={{ 
                    color: emotionToColors[record.emotion.toLowerCase()].primary, 
                    fontWeight: '700' 
                  }}
                >
                  {(record.confidence * 100).toFixed(0)}%
                </span>
              ]}
              style={{
                borderBottom: `1px solid ${getCurrentColors().secondary}`,
                transition: 'all 0.3s ease'
              }}
            >
              <List.Item.Meta
                title={
                  <div 
                    style={{ 
                      color: getCurrentColors().text, 
                      fontWeight: '600'
                    }}
                  >
                    {record.text.substring(0, 50)}{record.text.length > 50 ? '...' : ''}
                  </div>
                }
                description={
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div 
                      style={{ 
                        color: getCurrentColors().text,
                        opacity: 0.8
                      }}
                    >
                      {record.suggestion}
                    </div>
                    <div 
                      style={{ 
                        color: `${getCurrentColors().text}80`, 
                        fontSize: 12 
                      }}
                    >
                      {new Date(record.timestamp).toLocaleString()}
                    </div>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
}

export default EmotionHistory
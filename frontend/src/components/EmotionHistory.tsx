import React, { useState, useEffect, useContext } from 'react'
import { Card, Typography, List, Tag, Empty, Button, DatePicker, Space, Popconfirm, message } from 'antd'
import { ReloadOutlined, DeleteOutlined } from '@ant-design/icons'
import { EmotionContext, emotionToColors } from '../App'
import { emotionService } from '../services/emotionService'
import { EmotionRecord as EmotionRecordType } from '../services/emotionService'

const { Title, Paragraph } = Typography
const { RangePicker } = DatePicker

const EmotionHistory: React.FC = () => {
  const [records, setRecords] = useState<EmotionRecordType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { emotion } = useContext(EmotionContext)
  
  // 获取当前情绪对应的颜色
  const getCurrentColors = () => {
    return emotionToColors[emotion.toLowerCase()] || emotionToColors.neutral
  }

  const fetchHistory = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await emotionService.getEmotionRecords({
        page: currentPage,
        limit: pageSize
      })
      setRecords(response.emotionRecords)
      message.success('历史记录刷新成功')
    } catch (err) {
      setError('获取历史记录失败，请稍后重试')
      console.error('Fetch history error:', err)
      message.error('获取历史记录失败')
    } finally {
      setLoading(false)
    }
  }

  // 删除记录
  const handleDelete = async (id: string) => {
    try {
      await emotionService.deleteEmotionRecord(id)
      // 从本地状态中移除删除的记录
      setRecords(records.filter(record => record._id !== id))
      message.success('记录删除成功')
    } catch (err) {
      console.error('Delete record error:', err)
      message.error('删除记录失败')
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [currentPage, pageSize])

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
        查看您的情绪分析历史记录，可以删除不想要的记录
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
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            onChange: (page, size) => {
              setCurrentPage(page)
              setPageSize(size)
            },
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20'],
            style: {
              color: getCurrentColors().text,
              marginTop: '16px'
            }
          }}
          renderItem={(record) => (
            <List.Item
              key={record._id}
              actions={[
                <Tag 
                  className={record.emotion.toLowerCase()}
                  style={{
                    background: `linear-gradient(135deg, ${emotionToColors[record.emotion.toLowerCase()].primary}, ${emotionToColors[record.emotion.toLowerCase()].secondary})`,
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: '700',
                    marginRight: '8px'
                  }}
                >
                  {record.emotion}
                </Tag>,
                <span 
                  style={{ 
                    color: emotionToColors[record.emotion.toLowerCase()].primary, 
                    fontWeight: '700',
                    marginRight: '8px'
                  }}
                >
                  {record.score.toFixed(0)}%
                </span>,
                <Popconfirm
                  title="确定要删除这条记录吗？"
                  onConfirm={() => handleDelete(record._id)}
                  okText="确定"
                  cancelText="取消"
                  okButtonProps={{
                    style: {
                      background: `linear-gradient(135deg, ${getCurrentColors().primary}, ${getCurrentColors().secondary})`,
                      border: 'none',
                      color: '#FFFFFF'
                    }
                  }}
                >
                  <Button
                    icon={<DeleteOutlined />}
                    style={{
                      color: '#ff4d4f',
                      borderColor: '#ff4d4f'
                    }}
                  >
                    删除
                  </Button>
                </Popconfirm>
              ]}
              style={{
                borderBottom: `1px solid ${getCurrentColors().secondary}`,
                transition: 'all 0.3s ease',
                padding: '16px 0'
              }}
            >
              <List.Item.Meta
                title={
                  <div 
                    style={{ 
                      color: getCurrentColors().text, 
                      fontWeight: '600',
                      marginBottom: '4px'
                    }}
                  >
                    {record.content?.substring(0, 50)}{record.content?.length && record.content.length > 50 ? '...' : ''}
                  </div>
                }
                description={
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div 
                      style={{ 
                        color: getCurrentColors().text,
                        opacity: 0.8,
                        fontSize: '14px'
                      }}
                    >
                      识别类型: {record.type}
                    </div>
                    <div 
                      style={{ 
                        color: `${getCurrentColors().text}80`, 
                        fontSize: 12 
                      }}
                    >
                      {new Date(record.createdAt).toLocaleString()}
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
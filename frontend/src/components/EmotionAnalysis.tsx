import React, { useState, useEffect, useContext } from 'react'
import { Card, Typography, Row, Col, Statistic, Select } from 'antd'
import { SmileOutlined, FrownOutlined, MehOutlined, ThunderboltOutlined, FrownOutlined as FearOutlined, HeartOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import axios from 'axios'
import { EmotionContext, emotionToColors } from '../App'

const { Title, Paragraph } = Typography
const { Option } = Select

interface EmotionStats {
  total: number
  distribution: Record<string, number>
  trend: Array<{
    date: string
    count: number
    emotions: Record<string, number>
  }>
}

const EmotionAnalysis: React.FC = () => {
  const [stats, setStats] = useState<EmotionStats>({
    total: 0,
    distribution: {},
    trend: []
  })
  const [timeRange, setTimeRange] = useState('week')
  const { emotion } = useContext(EmotionContext)
  
  // 获取当前情绪对应的颜色
  const getCurrentColors = () => {
    return emotionToColors[emotion.toLowerCase()] || emotionToColors.neutral
  }

  const getEmotionIcon = (emotion: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      喜悦: <SmileOutlined style={{ color: '#52c41a' }} />,
      愤怒: <ThunderboltOutlined style={{ color: '#ff4d4f' }} />,
      悲伤: <FrownOutlined style={{ color: '#1890ff' }} />,
      恐惧: <FearOutlined style={{ color: '#722ed1' }} />,
      惊讶: <HeartOutlined style={{ color: '#fa8c16' }} />,
      中性: <MehOutlined style={{ color: '#d9d9d9' }} />
    }
    return iconMap[emotion] || <MehOutlined />
  }

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:49740/api/emotions/stats', {
        params: { timeRange }
      })
      setStats(response.data)
    } catch (err) {
      console.error('Fetch stats error:', err)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [timeRange])

  // 情绪分布饼图配置
  const pieOption = {
    title: {
      text: '情绪分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '情绪类型',
        type: 'pie',
        radius: '50%',
        data: Object.entries(stats.distribution).map(([emotion, count]) => ({
          value: count,
          name: emotion
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  // 情绪趋势折线图配置
  const lineOption = {
    title: {
      text: '情绪变化趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['喜悦', '愤怒', '悲伤', '恐惧', '惊讶', '中性'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: stats.trend.map(item => item.date)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      '喜悦', '愤怒', '悲伤', '恐惧', '惊讶', '中性'
    ].map(emotion => ({
      name: emotion,
      type: 'line',
      stack: 'Total',
      data: stats.trend.map(item => item.emotions[emotion] || 0)
    }))
  }

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
        情绪统计分析
      </Title>
      <Paragraph 
        style={{ 
          color: getCurrentColors().text, 
          marginBottom: '32px'
        }}
      >
        查看您的情绪变化趋势和分布情况
      </Paragraph>

      <Card 
        className="card" 
        style={{
          marginBottom: 24,
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(10px)',
          border: `2px solid ${getCurrentColors().primary}`,
          borderRadius: '12px',
          boxShadow: `0 4px 16px rgba(${getCurrentColors().primary.replace('#', '')}, 0.15)`,
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'flex-end' }}>
          <Select
            value={timeRange}
            onChange={setTimeRange}
            style={{ 
              width: 120,
              border: `2px solid ${getCurrentColors().secondary}`,
              borderRadius: '8px',
              color: getCurrentColors().text,
              transition: 'border-color 0.3s ease'
            }}
          >
            <Option value="week">最近一周</Option>
            <Option value="month">最近一月</Option>
            <Option value="quarter">最近三月</Option>
          </Select>
        </div>

        <Row gutter={[16, 16]}>
          <Col span={12} lg={8}>
            <Card 
              className="card"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                border: `2px solid ${getCurrentColors().secondary}`,
                borderRadius: '12px',
                transition: 'all 0.3s ease'
              }}
            >
              <Statistic
                title={<span style={{ color: getCurrentColors().text }}>总分析次数</span>}
                value={stats.total}
                prefix={<SmileOutlined style={{ color: getCurrentColors().primary }} />}
                valueStyle={{ color: getCurrentColors().primary, fontWeight: '700' }}
              />
            </Card>
          </Col>
          {Object.entries(stats.distribution).map(([emotion, count]) => (
            <Col key={emotion} span={12} lg={8}>
              <Card 
                className={`card ${emotion.toLowerCase()}`}
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: `2px solid ${getCurrentColors().secondary}`,
                  borderRadius: '12px',
                  transition: 'all 0.3s ease'
                }}
              >
                <Statistic
                  title={<span style={{ color: getCurrentColors().text }}>{emotion}</span>}
                  value={count}
                  prefix={getEmotionIcon(emotion)}
                  valueStyle={{ color: getCurrentColors().primary, fontWeight: '700' }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        <Col span={24} lg={12}>
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
            <Title 
              level={4} 
              style={{ 
                color: getCurrentColors().text, 
                fontWeight: '700',
                marginBottom: '16px'
              }}
            >
              情绪分布
            </Title>
            <div className="chart-container">
              <ReactECharts 
                option={{
                  ...pieOption,
                  title: {
                    ...pieOption.title,
                    textStyle: {
                      color: getCurrentColors().text,
                      fontWeight: '700'
                    }
                  },
                  tooltip: {
                    ...pieOption.tooltip,
                    textStyle: {
                      color: getCurrentColors().text
                    }
                  },
                  legend: {
                    ...pieOption.legend,
                    textStyle: {
                      color: getCurrentColors().text
                    }
                  }
                }} 
              />
            </div>
          </Card>
        </Col>
        <Col span={24} lg={12}>
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
            <Title 
              level={4} 
              style={{ 
                color: getCurrentColors().text, 
                fontWeight: '700',
                marginBottom: '16px'
              }}
            >
              情绪变化趋势
            </Title>
            <div className="chart-container">
              <ReactECharts 
                option={{
                  ...lineOption,
                  title: {
                    ...lineOption.title,
                    textStyle: {
                      color: getCurrentColors().text,
                      fontWeight: '700'
                    }
                  },
                  tooltip: {
                    ...lineOption.tooltip,
                    textStyle: {
                      color: getCurrentColors().text
                    }
                  },
                  legend: {
                    ...lineOption.legend,
                    textStyle: {
                      color: getCurrentColors().text
                    }
                  },
                  xAxis: {
                    ...lineOption.xAxis,
                    axisLabel: {
                      color: getCurrentColors().text
                    },
                    axisLine: {
                      lineStyle: {
                        color: getCurrentColors().secondary
                      }
                    }
                  },
                  yAxis: {
                    ...lineOption.yAxis,
                    axisLabel: {
                      color: getCurrentColors().text
                    },
                    axisLine: {
                      lineStyle: {
                        color: getCurrentColors().secondary
                      }
                    },
                    splitLine: {
                      lineStyle: {
                        color: `${getCurrentColors().secondary}80`
                      }
                    }
                  }
                }} 
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default EmotionAnalysis
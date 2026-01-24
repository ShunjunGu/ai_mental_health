import React, { useState, useEffect, useContext } from 'react'
import { Card, Typography, Row, Col, Statistic, Select, message } from 'antd'
import { SmileOutlined, FrownOutlined, MehOutlined, ThunderboltOutlined, FrownOutlined as FearOutlined, HeartOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { EmotionContext, emotionToColors, emotionToColorsDark } from '../contexts/EmotionContext'
import { useDarkMode } from '../contexts/DarkModeContext'
import { emotionService } from '../services/emotionService'

const { Title, Paragraph } = Typography
const { Option } = Select

const EmotionAnalysis: React.FC = () => {
  const [stats, setStats] = useState<any[]>([])
  const [total, setTotal] = useState<number>(0)
  const [timeRange, setTimeRange] = useState('week')
  const { emotion } = useContext(EmotionContext)
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
      // 获取当前日期
      const endDate = new Date().toISOString().split('T')[0]
      let startDate = ''

      // 根据时间范围计算开始日期
      if (timeRange === 'week') {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        startDate = weekAgo.toISOString().split('T')[0]
      } else if (timeRange === 'month') {
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        startDate = monthAgo.toISOString().split('T')[0]
      } else if (timeRange === 'quarter') {
        const quarterAgo = new Date()
        quarterAgo.setMonth(quarterAgo.getMonth() - 3)
        startDate = quarterAgo.toISOString().split('T')[0]
      }

      const response = await emotionService.getEmotionStatistics(startDate, endDate)
      setStats(response)
      // 计算总分析次数
      const totalCount = response.reduce((sum, item) => sum + item.count, 0)
      setTotal(totalCount)
      console.log('情绪统计数据获取成功:', response)
    } catch (err: any) {
      console.error('获取情绪统计数据失败:', err)
      message.error(err.response?.data?.message || '获取情绪统计数据失败，请稍后再试')
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
        data: stats.map(item => ({
          value: item.count,
          name: item.emotion
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

  // 简化的情绪趋势图配置
  const lineOption = {
    title: {
      text: '情绪分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: stats.map(item => item.emotion),
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
      data: ['情绪分布']
    },
    yAxis: {
      type: 'value'
    },
    series: stats.map(item => ({
      name: item.emotion,
      type: 'bar',
      data: [item.count]
    }))
  }

  return (
    <div>
      <Title
        level={2}
        style={{
          color: isDarkMode ? '#e0e0e0' : getCurrentColors().text,
          fontWeight: '700',
          marginBottom: '16px'
        }}
      >
        情绪统计分析
      </Title>
      <Paragraph
        style={{
          color: isDarkMode ? '#e0e0e0' : getCurrentColors().text,
          marginBottom: '32px'
        }}
      >
        查看您的情绪变化趋势和分布情况
      </Paragraph>

      <Card
        className="card"
        style={{
          marginBottom: 24,
          background: getCardBackground(),
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
                background: getCardBackground(),
                border: `2px solid ${getCurrentColors().secondary}`,
                borderRadius: '12px',
                transition: 'all 0.3s ease'
              }}
            >
              <Statistic
                title={<span style={{ color: isDarkMode ? '#b0b0b0' : getCurrentColors().text }}>总分析次数</span>}
                value={total}
                prefix={<SmileOutlined style={{ color: getCurrentColors().primary }} />}
                valueStyle={{ color: getCurrentColors().primary, fontWeight: '700' }}
              />
            </Card>
          </Col>
          {stats.map((item) => (
            <Col key={item.emotion} span={12} lg={8}>
              <Card
                className={`card ${item.emotion.toLowerCase()}`}
                style={{
                  background: getCardBackground(),
                  border: `2px solid ${getCurrentColors().secondary}`,
                  borderRadius: '12px',
                  transition: 'all 0.3s ease'
                }}
              >
                <Statistic
                  title={<span style={{ color: isDarkMode ? '#b0b0b0' : getCurrentColors().text }}>{item.emotion}</span>}
                  value={item.count}
                  prefix={getEmotionIcon(item.emotion)}
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
              background: getCardBackground(),
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
                color: isDarkMode ? '#e0e0e0' : getCurrentColors().text,
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
                      color: isDarkMode ? '#e0e0e0' : getCurrentColors().text,
                      fontWeight: '700'
                    }
                  },
                  tooltip: {
                    ...pieOption.tooltip,
                    textStyle: {
                      color: isDarkMode ? '#e0e0e0' : getCurrentColors().text
                    }
                  },
                  legend: {
                    ...pieOption.legend,
                    textStyle: {
                      color: isDarkMode ? '#e0e0e0' : getCurrentColors().text
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
              background: getCardBackground(),
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
                color: isDarkMode ? '#e0e0e0' : getCurrentColors().text,
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
                      color: isDarkMode ? '#e0e0e0' : getCurrentColors().text,
                      fontWeight: '700'
                    }
                  },
                  tooltip: {
                    ...lineOption.tooltip,
                    textStyle: {
                      color: isDarkMode ? '#e0e0e0' : getCurrentColors().text
                    }
                  },
                  legend: {
                    ...lineOption.legend,
                    textStyle: {
                      color: isDarkMode ? '#e0e0e0' : getCurrentColors().text
                    }
                  },
                  xAxis: {
                    ...lineOption.xAxis,
                    axisLabel: {
                      color: isDarkMode ? '#e0e0e0' : getCurrentColors().text
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
                      color: isDarkMode ? '#e0e0e0' : getCurrentColors().text
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

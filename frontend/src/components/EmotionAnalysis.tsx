import React, { useState, useEffect, useContext } from 'react'
import { Card, Typography, Row, Col, Statistic, Select, message, Spin } from 'antd'
import { SmileOutlined, FrownOutlined, MehOutlined, ThunderboltOutlined, FrownOutlined as FearOutlined, HeartOutlined, RiseOutlined, FallOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { EmotionContext, emotionToColors, emotionToColorsDark } from '../contexts/EmotionContext'
import { useDarkMode } from '../contexts/DarkModeContext'
import { emotionService, EmotionRecord } from '../services/emotionService'

const { Title, Paragraph } = Typography
const { Option } = Select

const EmotionAnalysis: React.FC = () => {
  const [stats, setStats] = useState<any[]>([])
  const [records, setRecords] = useState<EmotionRecord[]>([])
  const [total, setTotal] = useState<number>(0)
  const [timeRange, setTimeRange] = useState('week')
  const [loading, setLoading] = useState(false)
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

  const fetchData = async () => {
    setLoading(true)
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

      // 获取统计数据
      const statsResponse = await emotionService.getEmotionStatistics(startDate, endDate)
      setStats(statsResponse)

      // 计算总分析次数
      const totalCount = statsResponse.reduce((sum, item) => sum + item.count, 0)
      setTotal(totalCount)

      // 获取详细记录用于趋势图
      const recordsResponse = await emotionService.getEmotionRecords({
        startDate,
        endDate,
        limit: 100
      })
      setRecords(recordsResponse.emotionRecords)

      console.log('情绪数据获取成功:', { stats: statsResponse, records: recordsResponse.emotionRecords })
    } catch (err: any) {
      console.error('获取情绪数据失败:', err)
      message.error(err.response?.data?.message || '获取情绪数据失败，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [timeRange])

  // 情绪分布饼图配置
  const getPieOption = () => {
    // 定义情绪颜色映射
    const emotionColors: Record<string, string> = {
      '喜悦': '#52c41a',
      '愤怒': '#ff4d4f',
      '悲伤': '#1890ff',
      '恐惧': '#722ed1',
      '惊讶': '#fa8c16',
      '中性': '#d9d9d9'
    }

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: {
          color: isDarkMode ? '#e0e0e0' : getCurrentColors().text
        }
      },
      series: [
        {
          name: '情绪类型',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: isDarkMode ? '#1a1a1a' : '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}: {d}%',
            color: isDarkMode ? '#e0e0e0' : getCurrentColors().text
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold'
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          data: stats.map(item => ({
            value: item.count,
            name: item.emotion,
            itemStyle: {
              color: emotionColors[item.emotion] || getCurrentColors().primary
            }
          }))
        }
      ]
    }
  }

  // 情绪趋势折线图配置
  const getTrendOption = () => {
    // 按日期分组数据
    const dateMap: Record<string, Record<string, number>> = {}

    records.forEach(record => {
      const date = new Date(record.createdAt).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
      if (!dateMap[date]) {
        dateMap[date] = {}
      }
      if (!dateMap[date][record.emotion]) {
        dateMap[date][record.emotion] = 0
      }
      dateMap[date][record.emotion] += record.score
    })

    const dates = Object.keys(dateMap).sort()
    const emotions = ['喜悦', '悲伤', '愤怒', '恐惧', '惊讶', '中性']

    const emotionColors: Record<string, string> = {
      '喜悦': '#52c41a',
      '愤怒': '#ff4d4f',
      '悲伤': '#1890ff',
      '恐惧': '#722ed1',
      '惊讶': '#fa8c16',
      '中性': '#d9d9d9'
    }

    return {
      tooltip: {
        trigger: 'axis',
        textStyle: {
          color: isDarkMode ? '#e0e0e0' : getCurrentColors().text
        }
      },
      legend: {
        data: emotions,
        bottom: 0,
        textStyle: {
          color: isDarkMode ? '#e0e0e0' : getCurrentColors().text
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates,
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
        type: 'value',
        name: '情绪得分',
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
            color: `${getCurrentColors().secondary}40`
          }
        },
        nameTextStyle: {
          color: isDarkMode ? '#e0e0e0' : getCurrentColors().text
        }
      },
      series: emotions.map(emo => ({
        name: emo,
        type: 'line',
        smooth: true,
        data: dates.map(date => dateMap[date]?.[emo] || 0),
        itemStyle: {
          color: emotionColors[emo]
        },
        areaStyle: {
          opacity: 0.3
        }
      }))
    }
  }

  // 情绪雷达图配置
  const getRadarOption = () => {
    // 计算各情绪的平均得分
    const emotionScores: Record<string, { total: number; count: number }> = {}

    records.forEach(record => {
      if (!emotionScores[record.emotion]) {
        emotionScores[record.emotion] = { total: 0, count: 0 }
      }
      emotionScores[record.emotion].total += record.score
      emotionScores[record.emotion].count += 1
    })

    const emotions = ['喜悦', '悲伤', '愤怒', '恐惧', '惊讶', '中性']
    const values = emotions.map(emo => {
      const scoreData = emotionScores[emo]
      if (!scoreData || scoreData.count === 0) return 0
      return Math.round((scoreData.total / scoreData.count) * 100) / 100
    })

    return {
      tooltip: {
        textStyle: {
          color: isDarkMode ? '#e0e0e0' : getCurrentColors().text
        }
      },
      legend: {
        data: ['情绪得分'],
        textStyle: {
          color: isDarkMode ? '#e0e0e0' : getCurrentColors().text
        }
      },
      radar: {
        indicator: emotions.map(emo => ({
          name: emo,
          max: 100
        })),
        axisName: {
          color: isDarkMode ? '#e0e0e0' : getCurrentColors().text
        },
        splitArea: {
          areaStyle: {
            color: [`${getCurrentColors().primary}10`, `${getCurrentColors().secondary}10`]
          }
        },
        axisLine: {
          lineStyle: {
            color: getCurrentColors().secondary
          }
        },
        splitLine: {
          lineStyle: {
            color: `${getCurrentColors().secondary}60`
          }
        }
      },
      series: [
        {
          name: '情绪得分',
          type: 'radar',
          data: [
            {
              value: values,
              name: '情绪得分',
              itemStyle: {
                color: getCurrentColors().primary
              },
              areaStyle: {
                opacity: 0.3
              }
            }
          ]
        }
      ]
    }
  }

  // 情绪统计柱状图配置
  const getBarOption = () => {
    const emotionColors: Record<string, string> = {
      '喜悦': '#52c41a',
      '愤怒': '#ff4d4f',
      '悲伤': '#1890ff',
      '恐惧': '#722ed1',
      '惊讶': '#fa8c16',
      '中性': '#d9d9d9'
    }

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        textStyle: {
          color: isDarkMode ? '#e0e0e0' : getCurrentColors().text
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: stats.map(item => item.emotion),
        axisLabel: {
          color: isDarkMode ? '#e0e0e0' : getCurrentColors().text,
          interval: 0,
          rotate: 0
        },
        axisLine: {
          lineStyle: {
            color: getCurrentColors().secondary
          }
        }
      },
      yAxis: {
        type: 'value',
        name: '次数',
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
            color: `${getCurrentColors().secondary}40`
          }
        },
        nameTextStyle: {
          color: isDarkMode ? '#e0e0e0' : getCurrentColors().text
        }
      },
      series: [
        {
          name: '情绪出现次数',
          type: 'bar',
          data: stats.map(item => ({
            value: item.count,
            itemStyle: {
              color: emotionColors[item.emotion] || getCurrentColors().primary,
              borderRadius: [5, 5, 0, 0]
            }
          })),
          barWidth: '50%',
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
  }

  return (
    <Spin spinning={loading} tip="加载中...">
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
            boxShadow: `0 4px 16px rgba(0, 0, 0, 0.1)`,
            transition: 'all 0.3s ease'
          }}
        >
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ color: isDarkMode ? '#e0e0e0' : getCurrentColors().text, margin: 0 }}>
              统计概览
            </Title>
            <Select
              value={timeRange}
              onChange={setTimeRange}
              style={{
                width: 120
              }}
            >
              <Option value="week">最近一周</Option>
              <Option value="month">最近一月</Option>
              <Option value="quarter">最近三月</Option>
            </Select>
          </div>

          <Row gutter={[16, 16]}>
            <Col span={12} lg={6}>
              <Card
                className="stat-card"
                style={{
                  background: isDarkMode ? 'rgba(40, 40, 40, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                  border: `2px solid ${getCurrentColors().primary}`,
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
            {stats.slice(0, 3).map((item) => (
              <Col key={item.emotion} span={12} lg={6}>
                <Card
                  className={`card ${item.emotion.toLowerCase()}`}
                  style={{
                    background: isDarkMode ? 'rgba(40, 40, 40, 0.8)' : 'rgba(255, 255, 255, 0.9)',
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

        {/* 第一行图表：情绪分布饼图 + 情绪统计柱状图 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={24} lg={12}>
            <Card
              className="card chart-card"
              style={{
                background: getCardBackground(),
                backdropFilter: 'blur(10px)',
                border: `2px solid ${getCurrentColors().primary}`,
                borderRadius: '12px',
                boxShadow: `0 4px 16px rgba(0, 0, 0, 0.1)`,
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
              <div className="chart-container" style={{ height: '350px' }}>
                <ReactECharts option={getPieOption()} style={{ height: '100%' }} />
              </div>
            </Card>
          </Col>
          <Col span={24} lg={12}>
            <Card
              className="card chart-card"
              style={{
                background: getCardBackground(),
                backdropFilter: 'blur(10px)',
                border: `2px solid ${getCurrentColors().primary}`,
                borderRadius: '12px',
                boxShadow: `0 4px 16px rgba(0, 0, 0, 0.1)`,
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
                情绪统计
              </Title>
              <div className="chart-container" style={{ height: '350px' }}>
                <ReactECharts option={getBarOption()} style={{ height: '100%' }} />
              </div>
            </Card>
          </Col>
        </Row>

        {/* 第二行图表：情绪趋势折线图 + 情绪雷达图 */}
        <Row gutter={[16, 16]}>
          <Col span={24} lg={12}>
            <Card
              className="card chart-card"
              style={{
                background: getCardBackground(),
                backdropFilter: 'blur(10px)',
                border: `2px solid ${getCurrentColors().primary}`,
                borderRadius: '12px',
                boxShadow: `0 4px 16px rgba(0, 0, 0, 0.1)`,
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
              <div className="chart-container" style={{ height: '350px' }}>
                <ReactECharts option={getTrendOption()} style={{ height: '100%' }} />
              </div>
            </Card>
          </Col>
          <Col span={24} lg={12}>
            <Card
              className="card chart-card"
              style={{
                background: getCardBackground(),
                backdropFilter: 'blur(10px)',
                border: `2px solid ${getCurrentColors().primary}`,
                borderRadius: '12px',
                boxShadow: `0 4px 16px rgba(0, 0, 0, 0.1)`,
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
                情绪综合分析
              </Title>
              <div className="chart-container" style={{ height: '350px' }}>
                <ReactECharts option={getRadarOption()} style={{ height: '100%' }} />
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  )
}

export default EmotionAnalysis

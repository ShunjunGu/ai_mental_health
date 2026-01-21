import React, { useEffect, useRef } from 'react'
import './GooeyNav.css'

export interface NavItem {
  label: string
  href: string
  key: string
}

interface GooeyNavProps {
  items: NavItem[]
  activeIndex: number
  onItemClick: (index: number) => void
  particleCount?: number
  particleDistances?: number[]
  particleR?: number
  animationTime?: number
  timeVariance?: number
  colors?: number[]
  primaryColor?: string
  secondaryColor?: string
  isDarkMode?: boolean
}

const GooeyNav: React.FC<GooeyNavProps> = ({
  items,
  activeIndex,
  onItemClick,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 100,
  animationTime = 1000,
  timeVariance = 200,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
  primaryColor = '#1890ff',
  secondaryColor = '#40a9ff',
  isDarkMode = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  // 根据活动索引创建粒子效果
  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const navItems = container.querySelectorAll('nav ul li')
    const effectContainer = container.querySelector('.effect-container')

    if (!effectContainer) return

    // 清空旧的粒子效果
    effectContainer.innerHTML = ''

    // 获取当前活动选项卡的位置和大小
    const activeItem = navItems[activeIndex]
    if (!activeItem) return

    const rect = activeItem.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()

    // 计算精确的尺寸和位置（考虑3px的inset偏移）
    const offset = 3
    const effectLeft = rect.left - containerRect.left + offset
    const effectTop = rect.top - containerRect.top + offset
    const effectWidth = rect.width - offset * 2
    const effectHeight = rect.height - offset * 2

    // 创建粒子效果
    const navEffect = document.createElement('div')
    navEffect.className = 'effect active'
    navEffect.style.position = 'absolute'
    navEffect.style.left = `${effectLeft}px`
    navEffect.style.top = `${effectTop}px`
    navEffect.style.width = `${effectWidth}px`
    navEffect.style.height = `${effectHeight}px`

    const filterEffect = document.createElement('div')
    filterEffect.className = 'effect filter'
    navEffect.appendChild(filterEffect)

    const colorsArray = ['#FFD700', '#FF6B6B', '#4ECDC4', '#FF9FF3']

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div')
      particle.className = 'particle'

      const point = document.createElement('div')
      point.className = 'point'

      const colorIndex = colors[i % colors.length] - 1
      const color = colorsArray[colorIndex]
      point.style.setProperty('--color', color)

      const angle = (i / particleCount) * 360 + (Math.random() - 0.5) * 30
      const distance = particleDistances[0] + Math.random() * (particleDistances[1] || 0)

      const startAngle = angle + (Math.random() - 0.5) * 60
      const startDistance = 10 + Math.random() * 20

      const endX = Math.cos((angle * Math.PI) / 180) * distance
      const endY = Math.sin((angle * Math.PI) / 180) * distance
      const startX = Math.cos((startAngle * Math.PI) / 180) * startDistance
      const startY = Math.sin((startAngle * Math.PI) / 180) * startDistance

      particle.style.setProperty('--start-x', `${startX}px`)
      particle.style.setProperty('--start-y', `${startY}px`)
      particle.style.setProperty('--end-x', `${endX}px`)
      particle.style.setProperty('--end-y', `${endY}px`)
      particle.style.setProperty('--rotate', `${angle}deg`)

      const time = animationTime + (Math.random() - 0.5) * timeVariance
      particle.style.setProperty('--time', `${time}ms`)

      const scale = particleR / 100 + Math.random() * 0.3
      particle.style.setProperty('--scale', scale.toString())

      particle.appendChild(point)
      filterEffect.appendChild(particle)
    }

    effectContainer.appendChild(navEffect)
  }, [activeIndex, items, particleCount, particleDistances, particleR, animationTime, timeVariance, colors])

  const getNavStyle = (): React.CSSProperties => {
    return {
      '--primary-color': primaryColor,
      '--secondary-color': secondaryColor
    } as React.CSSProperties
  }

  return (
    <div
      ref={containerRef}
      className={`gooey-nav-container ${isDarkMode ? 'dark-mode' : ''}`}
      style={getNavStyle()}
    >
      <nav>
        <ul>
          {items.map((item, index) => (
            <li
              key={item.key}
              className={index === activeIndex ? 'active' : ''}
              onClick={() => onItemClick(index)}
            >
              <span className="nav-text">{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>
      <div className="effect-container" style={{ position: 'absolute', left: 0, top: 0 }} />
    </div>
  )
}

export default GooeyNav

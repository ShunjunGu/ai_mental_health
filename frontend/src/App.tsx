import React from 'react'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <div className="app">
        <h1>AI校园心理健康平台</h1>
        <p>欢迎使用基于AI情绪识别的校园心理健康SaaS平台</p>
      </div>
    </ConfigProvider>
  )
}

export default App
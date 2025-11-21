import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// 打印当前环境（可选，用于调试）
console.log('当前环境:', process.env.NODE_ENV);

// 根据环境变量决定是否使用 StrictMode
// 开发环境：使用 StrictMode 帮助检测潜在问题（会导致组件双重渲染）
// 生产环境：不使用 StrictMode，性能更优
root.render(
  process.env.NODE_ENV === 'development' ? (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  ) : (
    <App />
  )
);

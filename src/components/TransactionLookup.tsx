/**
 * 交易查询组件
 * 功能：提供输入框让用户输入交易哈希，触发查询操作
 */
import React, { useState } from 'react';
import './TransactionLookup.css';

// 组件属性接口定义
interface TransactionLookupProps {
  onSearch: (txHash: string) => void; // 查询回调函数，接收交易哈希作为参数
  isLoading: boolean; // 加载状态标识
}

/**
 * 交易查询组件
 * @param onSearch - 当用户提交查询时调用的回调函数
 * @param isLoading - 是否正在加载中
 */
const TransactionLookup: React.FC<TransactionLookupProps> = ({ onSearch, isLoading }) => {
  // 交易哈希输入框的状态
  const [txHash, setTxHash] = useState('');

  /**
   * 处理表单提交事件
   * 验证输入后调用父组件传入的查询函数
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // 阻止表单默认提交行为
    if (txHash.trim()) {
      onSearch(txHash.trim()); // 调用查询函数，去除首尾空格
    }
  };

  return (
    <div className="transaction-lookup">
      <h1>区块链交易查询工具</h1>
      <p className="subtitle">通过 The Graph 查询以太坊主网交易数据</p>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          {/* 交易哈希输入框 */}
          <input
            type="text"
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            placeholder="输入交易哈希 (0x...)"
            className="tx-input"
            disabled={isLoading} // 加载时禁用输入
          />
          {/* 查询按钮 */}
          <button
            type="submit"
            className="search-btn"
            disabled={isLoading || !txHash.trim()} // 加载中或输入为空时禁用
          >
            {isLoading ? '查询中...' : '查询'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionLookup;

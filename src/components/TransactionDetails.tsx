/**
 * 交易详情展示组件
 * 功能：展示交易的完整信息，包括基本信息、Gas信息、Input Data、事件日志等
 */
import React, { useState } from 'react';
import { TransactionResponse, TransactionReceipt } from 'ethers';
import './TransactionDetails.css';

// 组件属性接口定义
interface TransactionDetailsProps {
  transaction: TransactionResponse | null; // 交易响应对象
  receipt: TransactionReceipt | null; // 交易回执对象
  error: string | null; // 错误信息
}

/**
 * 交易详情组件
 * @param transaction - 交易数据对象
 * @param receipt - 交易回执对象（包含执行结果）
 * @param error - 查询错误信息
 */
const TransactionDetails: React.FC<TransactionDetailsProps> = ({ transaction, receipt, error }) => {
  // 当前显示的数据格式：'hex' 表示十六进制，'utf8' 表示UTF-8
  const [displayFormat, setDisplayFormat] = useState<'hex' | 'utf8'>('hex');
  // 显示的数据内容
  const [displayData, setDisplayData] = useState<string>('');

  // 如果有错误，显示错误信息
  if (error) {
    return (
      <div className="transaction-details error">
        <h2>查询失败</h2>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  // 如果没有交易数据，不显示任何内容
  if (!transaction) {
    return null;
  }
  console.log(transaction);
  /**
   * 格式化值为字符串
   * 处理 null、undefined、bigint 等特殊类型
   */
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'bigint') return value.toString();
    return value.toString();
  };

  /**
   * 将十六进制数据转换为 UTF-8 文本
   * @param hexData - 十六进制字符串（以 0x 开头）
   */
  const hexToUTF8 = (hexData: string): string => {
    try {
      // 移除 0x 前缀
      const hex = hexData.startsWith('0x') ? hexData.slice(2) : hexData;

      // 将 hex 转换为字节数组
      const bytes = [];
      for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substring(i, i + 2), 16));
      }

      // 使用 TextDecoder 解码为 UTF-8
      const decoder = new TextDecoder('utf-8');
      return decoder.decode(new Uint8Array(bytes));
    } catch (error) {
      return '解码失败：数据格式不正确';
    }
  };

  /**
   * 将 UTF-8 文本转换为十六进制
   * @param utf8Data - UTF-8 字符串
   */
  const utf8ToHex = (utf8Data: string): string => {
    try {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(utf8Data);
      const hex = Array.from(bytes)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
      return '0x' + hex;
    } catch (error) {
      return '编码失败：数据格式不正确';
    }
  };

  /**
   * 切换数据显示格式
   */
  const toggleFormat = (originalData: string) => {
    if (displayFormat === 'hex') {
      // 从十六进制转换为 UTF-8
      const utf8Data = hexToUTF8(originalData);
      setDisplayData(utf8Data);
      setDisplayFormat('utf8');
    } else {
      // 从 UTF-8 转换为十六进制
      const hexData = utf8ToHex(displayData);
      setDisplayData(hexData);
      setDisplayFormat('hex');
    }
  };

  return (
    <div className="transaction-details">
      <h2>交易详情</h2>

      <div className="detail-section">
        <h3>基本信息</h3>
        <div className="detail-row">
          <span className="label">交易哈希:</span>
          <span className="value">{transaction.hash}</span>
        </div>
        <div className="detail-row">
          <span className="label">区块号:</span>
          <span className="value">{transaction.blockNumber || '待确认'}</span>
        </div>
        <div className="detail-row">
          <span className="label">状态:</span>
          <span className={`value status ${receipt?.status === 1 ? 'success' : receipt?.status === 0 ? 'failed' : 'pending'}`}>
            {receipt?.status === 1 ? '成功' : receipt?.status === 0 ? '失败' : '待确认'}
          </span>
        </div>
        <div className="detail-row">
          <span className="label">发送方:</span>
          <span className="value">{transaction.from}</span>
        </div>
        <div className="detail-row">
          <span className="label">接收方:</span>
          <span className="value">{transaction.to || '合约创建'}</span>
        </div>
        <div className="detail-row">
          <span className="label">金额:</span>
          <span className="value">{formatValue(transaction.value)} Wei</span>
        </div>
      </div>

      <div className="detail-section">
        <h3>Gas 信息</h3>
        <div className="detail-row">
          <span className="label">Gas Limit:</span>
          <span className="value">{formatValue(transaction.gasLimit)}</span>
        </div>
        {transaction.gasPrice && (
          <div className="detail-row">
            <span className="label">Gas Price:</span>
            <span className="value">{formatValue(transaction.gasPrice)} Wei</span>
          </div>
        )}
        {receipt && (
          <div className="detail-row">
            <span className="label">Gas Used:</span>
            <span className="value">{formatValue(receipt.gasUsed)}</span>
          </div>
        )}
        {transaction.maxFeePerGas && (
          <div className="detail-row">
            <span className="label">Max Fee Per Gas:</span>
            <span className="value">{formatValue(transaction.maxFeePerGas)} Wei</span>
          </div>
        )}
        {transaction.maxPriorityFeePerGas && (
          <div className="detail-row">
            <span className="label">Max Priority Fee:</span>
            <span className="value">{formatValue(transaction.maxPriorityFeePerGas)} Wei</span>
          </div>
        )}
      </div>

      <div className="detail-section">
        <h3>其他信息</h3>
        <div className="detail-row">
          <span className="label">Nonce:</span>
          <span className="value">{transaction.nonce}</span>
        </div>
        <div className="detail-row">
          <span className="label">交易类型:</span>
          <span className="value">{transaction.type}</span>
        </div>
        <div className="detail-row">
          <span className="label">Chain ID:</span>
          <span className="value">{formatValue(transaction.chainId)}</span>
        </div>
      </div>

      {/* transaction.data 就是交易的 input 数据 */}
      {transaction.data && transaction.data !== '0x' && (
        <div className="detail-section input-data-section">
          <h3>Input Data 交互数据</h3>

          {/* 可切换格式的数据展示 */}
          <div className="detail-row full-width">
            <span className="label">
              {displayFormat === 'hex' ? '十六进制数据:' : 'UTF-8 文本:'}
            </span>
            <div className="value-with-action inline">
              <span className="value code hex-data">
                {displayFormat === 'hex'
                  ? (displayData || transaction.data)
                  : displayData
                }
              </span>
              <button
                className="toggle-btn"
                onClick={() => toggleFormat(transaction.data)}
              >
                {displayFormat === 'hex' ? '转换为 UTF-8' : '转换为十六进制'}
              </button>
            </div>
          </div>
        </div>
      )}

      {receipt && receipt.logs.length > 0 && (
        <div className="detail-section">
          <h3>事件日志 ({receipt.logs.length})</h3>
          {receipt.logs.map((log, index) => (
            <div key={index} className="log-item">
              <div className="detail-row">
                <span className="label">Log #{index}:</span>
                <span className="value">{log.address}</span>
              </div>
              <div className="detail-row">
                <span className="label">Topics:</span>
                <span className="value code">{log.topics.join(', ')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionDetails;

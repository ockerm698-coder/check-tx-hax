/**
 * 主应用组件
 * 功能：整合交易查询和详情展示，支持 The Graph 和 JSON-RPC 两种查询方式
 */
import { useState } from 'react';
import { ethers, TransactionResponse, TransactionReceipt } from 'ethers';
import TransactionLookup from './components/TransactionLookup';
import TransactionDetails from './components/TransactionDetails';
import './App.css';

// 查询方式枚举
type QueryMethod = 'graph' | 'rpc';

function App() {
  // 交易数据状态
  const [transaction, setTransaction] = useState<TransactionResponse | null>(null);
  const [receipt, setReceipt] = useState<TransactionReceipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 查询方式状态（默认使用 RPC，因为 The Graph 需要配置 Subgraph）
  const [queryMethod, setQueryMethod] = useState<QueryMethod>('rpc');

  /**
   * 使用 JSON-RPC 查询交易
   * 直接连接到以太坊节点获取交易数据
   */
  const queryByRPC = async (txHash: string) => {
    // 连接到以太坊主网（可以修改为其他网络）
    const provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');

    // 获取交易信息
    const tx = await provider.getTransaction(txHash);

    if (!tx) {
      throw new Error('未找到该交易，请检查交易哈希是否正确');
    }

    setTransaction(tx);

    // 尝试获取交易回执
    try {
      const txReceipt = await provider.getTransactionReceipt(txHash);
      if (txReceipt) {
        setReceipt(txReceipt);
      }
    } catch (receiptError) {
      console.warn('无法获取交易回执:', receiptError);
    }
  };

  /**
   * 使用 The Graph 查询交易
   * 通过 GraphQL 查询 Subgraph 获取交易数据
   * 注意：需要先配置好 Subgraph endpoint
   */
  const queryByGraph = async (_txHash: string) => {
    // TODO: 实现 The Graph 查询逻辑
    // 当 Subgraph 配置完成后，使用以下代码：
    //
    // import graphClient from './graphql/client';
    // import { GET_TRANSACTION } from './graphql/queries';
    //
    // const { data } = await graphClient.query({
    //   query: GET_TRANSACTION,
    //   variables: { hash: txHash }
    // });
    //
    // 然后将 data 转换为 TransactionResponse 格式

    throw new Error('The Graph 查询功能正在开发中，请使用 RPC 方式查询');
  };

  /**
   * 处理交易查询
   * 根据选择的查询方式调用不同的查询函数
   */
  const handleSearch = async (txHash: string) => {
    setIsLoading(true);
    setError(null);
    setTransaction(null);
    setReceipt(null);

    try {
      if (queryMethod === 'graph') {
        await queryByGraph(txHash);
      } else {
        await queryByRPC(txHash);
      }
    } catch (err: any) {
      console.error('查询交易时出错:', err);
      setError(err.message || '查询交易时发生错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      {/* 查询方式切换按钮 */}
      <div className="query-method-toggle">
        <button
          className={queryMethod === 'rpc' ? 'active' : ''}
          onClick={() => setQueryMethod('rpc')}
        >
          JSON-RPC 查询
        </button>
        <button
          className={queryMethod === 'graph' ? 'active' : ''}
          onClick={() => setQueryMethod('graph')}
          disabled
          title="The Graph 功能开发中"
        >
          The Graph 查询 (开发中)
        </button>
      </div>

      <TransactionLookup onSearch={handleSearch} isLoading={isLoading} />
      <TransactionDetails transaction={transaction} receipt={receipt} error={error} />
    </div>
  );
}

export default App;

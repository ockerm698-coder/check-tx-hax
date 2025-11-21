# The Graph 配置指南

本项目已经集成了 The Graph 的查询功能，但需要额外配置才能使用。

## 什么是 The Graph？

The Graph 是一个去中心化的区块链数据索引协议，它允许你通过 GraphQL 查询区块链数据，比直接使用 JSON-RPC 更高效、更灵活。

## 配置步骤

### 方式一：使用现有的公开 Subgraph

1. 访问 [The Graph Explorer](https://thegraph.com/explorer)
2. 搜索 "ethereum transactions" 或相关的 Subgraph
3. 找到合适的 Subgraph 后，复制其 Query URL
4. 创建 `.env` 文件：
   ```bash
   REACT_APP_GRAPH_API_URL=https://api.thegraph.com/subgraphs/name/YOUR_SUBGRAPH_NAME
   ```
5. 重启开发服务器

### 方式二：创建自己的 Subgraph

根据你的需求，有两种创建方式：

#### 方式 2A：索引所有交易（通用方案，无需合约地址）

**适用场景**：查询任意交易哈希的数据，不限定特定合约

##### 1. 安装 Graph CLI

```bash
npm install -g @graphprotocol/graph-cli
```

##### 2. 初始化 Subgraph 项目

```bash
# 交互式创建项目
graph init ethereum-transactions
```

**交互式提示选择**：
1. **Protocol**: 选择 `ethereum`
2. **Subgraph slug**: 输入 `ethereum-transactions`
3. **Directory**: 直接回车（使用默认）
4. **Ethereum network**: 选择 `mainnet`
5. **Source**: 选择 `Smart contract`
6. **Contract address**: 输入临时地址（我们稍后会删除）
   ```
   0xdac17f958d2ee523a2206206994597c13d831ec7
   ```
7. **Contract name**: 输入 `TempContract`
8. 后续提示按默认选择

```bash
# 进入项目目录
cd ethereum-transactions
```

**注意**：
- 我们使用了临时合约地址只是为了通过初始化
- 接下来需要完全替换生成的配置文件

##### 3. 手动配置 subgraph.yaml

```yaml
specVersion: 0.0.4
schema:
  file: ./schema.graphql
dataSources:
  - kind: ethereum
    name: EthereumBlocks
    network: mainnet
    source:
      # 不指定合约地址，监听所有区块
      startBlock: 0
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.7
      language: wasm/assemblyscript
      entities:
        - Transaction
        - Block
      blockHandlers:
        - handler: handleBlock
      file: ./src/mapping.ts
```

##### 4. 定义 Schema (schema.graphql)

```graphql
type Block @entity {
  id: ID!
  number: BigInt!
  timestamp: BigInt!
  transactions: [Transaction!]! @derivedFrom(field: "block")
}

type Transaction @entity {
  id: ID!
  hash: String!
  from: String!
  to: String
  value: BigInt!
  gasLimit: BigInt!
  gasPrice: BigInt
  input: Bytes!
  blockNumber: BigInt!
  timestamp: BigInt!
  block: Block!
}

type TransactionReceipt @entity {
  id: ID!
  transactionHash: String!
  status: Int!
  gasUsed: BigInt!
  logs: [Log!]! @derivedFrom(field: "receipt")
}

type Log @entity {
  id: ID!
  address: String!
  topics: [String!]!
  data: Bytes!
  receipt: TransactionReceipt!
}
```

##### 5. 编写映射逻辑 (src/mapping.ts)

```typescript
import { Block, Transaction } from '../generated/schema';
import { ethereum } from '@graphprotocol/graph-ts';

// 处理每个区块
export function handleBlock(block: ethereum.Block): void {
  let blockEntity = new Block(block.hash.toHex());
  blockEntity.number = block.number;
  blockEntity.timestamp = block.timestamp;
  blockEntity.save();

  // 处理区块中的所有交易
  for (let i = 0; i < block.transactions.length; i++) {
    let tx = block.transactions[i];
    let transaction = new Transaction(tx.hash.toHex());
    transaction.hash = tx.hash.toHex();
    transaction.from = tx.from.toHex();
    transaction.to = tx.to ? tx.to!.toHex() : null;
    transaction.value = tx.value;
    transaction.gasLimit = tx.gasLimit;
    transaction.gasPrice = tx.gasPrice;
    transaction.input = tx.input;
    transaction.blockNumber = block.number;
    transaction.timestamp = block.timestamp;
    transaction.block = blockEntity.id;
    transaction.save();
  }
}
```

##### 6. 部署 Subgraph

**获取 Deploy Key**：
1. 访问 https://thegraph.com/studio/
2. 连接钱包
3. 创建新的 Subgraph（名称：`ethereum-transactions`）
4. 在详情页顶部复制 Deploy Key

**部署命令**：
```bash
# 认证（替换 YOUR_DEPLOY_KEY 为实际的 key）
graph auth --node https://api.studio.thegraph.com/deploy/ YOUR_DEPLOY_KEY

# 生成代码
graph codegen

# 构建
graph build

# 部署
graph deploy --node https://api.studio.thegraph.com/deploy/ ethereum-transactions
```

部署成功后，会显示 Query URL，将其配置到项目的 `.env` 文件中。

---

#### 方式 2B：索引特定合约事件（需要合约地址）

**适用场景**：只关心特定智能合约的交互，比如你自己部署的合约

##### 1. 安装 Graph CLI（如果还没安装）

```bash
npm install -g @graphprotocol/graph-cli
```

##### 2. 从合约地址初始化项目

```bash
# 自动从合约生成配置
graph init --from-contract YOUR_CONTRACT_ADDRESS \
  --network mainnet \
  --contract-name MyContract
```

**这个命令会**：
- 连接到区块链读取合约的 ABI
- 自动生成 `schema.graphql`
- 自动生成 `subgraph.yaml`
- 自动生成 `mapping.ts` 模板
- 配置合约的起始区块

##### 3. Schema 和 Mapping 自动生成

Graph CLI 会根据合约的事件自动生成代码，例如：

```graphql
# 自动生成的 schema
type MessageUpdated @entity {
  id: ID!
  oldMessage: String!
  newMessage: String!
  blockNumber: BigInt!
  blockTimestamp: BigInt!
  transactionHash: Bytes!
}
```

```typescript
// 自动生成的 mapping
export function handleMessageUpdated(event: MessageUpdatedEvent): void {
  let entity = new MessageUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.oldMessage = event.params.oldMessage;
  entity.newMessage = event.params.newMessage;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}
```

##### 4. 部署 Subgraph

```bash
# 认证（先在 Studio 创建 Subgraph 并获取 Deploy Key）
graph auth --node https://api.studio.thegraph.com/deploy/ YOUR_DEPLOY_KEY

# 生成代码和构建
graph codegen && graph build

# 部署
graph deploy --node https://api.studio.thegraph.com/deploy/ YOUR_SUBGRAPH_NAME
```

部署成功后，The Graph Studio 会提供一个 Query URL，将其配置到项目中。

---

### 方式 2A vs 方式 2B 对比

| 特性 | 方式 2A（无合约地址） | 方式 2B（有合约地址） |
|------|----------------------|----------------------|
| **适用场景** | 查询任意交易 | 监听特定合约事件 |
| **是否需要合约地址** | ❌ 不需要 | ✅ 需要 |
| **索引范围** | 所有区块和交易 | 特定合约的事件 |
| **配置复杂度** | 较高（需手动配置） | 较低（自动生成） |
| **数据量** | 非常大 | 较小 |
| **查询效率** | 一般 | 很高 |
| **成本** | 高 | 低 |
| **适合本项目** | ✅ 推荐 | ⚠️ 仅用于特定合约 |

**建议**：对于 `check-tx-hax` 项目，推荐使用**方式 2A**，因为你需要查询任意交易哈希的数据。

---

## 更新项目代码

### 1. 更新环境变量

```bash
# .env
REACT_APP_GRAPH_API_URL=YOUR_SUBGRAPH_QUERY_URL
```

### 2. 实现 queryByGraph 函数

在 `src/App.tsx` 中取消注释并实现 `queryByGraph` 函数：

```typescript
import graphClient from './graphql/client';
import { GET_TRANSACTION } from './graphql/queries';

const queryByGraph = async (txHash: string) => {
  const { data } = await graphClient.query({
    query: GET_TRANSACTION,
    variables: { hash: txHash }
  });

  if (!data.transaction) {
    throw new Error('未找到该交易');
  }

  // 将 GraphQL 返回的数据转换为 TransactionResponse 格式
  const tx = data.transaction;
  // 这里需要根据实际的 Subgraph schema 进行转换
  // ...

  setTransaction(tx);
};
```

### 3. 启用 The Graph 按钮

在 `src/App.tsx` 中移除 `disabled` 属性：

```tsx
<button
  className={queryMethod === 'graph' ? 'active' : ''}
  onClick={() => setQueryMethod('graph')}
  // 移除 disabled 属性
>
  The Graph 查询
</button>
```

## 注意事项

1. **索引延迟**：The Graph 的数据可能有几秒到几分钟的延迟
2. **查询限制**：免费的 Subgraph 有查询速率限制
3. **Schema 匹配**：确保 GraphQL 查询与 Subgraph 的 schema 匹配
4. **成本考虑**：自己部署 Subgraph 需要支付 GAS 费用

## 为什么使用 The Graph？

### 优势

- **更快的查询**：数据已经索引，查询速度比 RPC 快得多
- **复杂查询**：支持过滤、排序、分页等复杂操作
- **降低成本**：减少对 RPC 节点的请求
- **实时订阅**：支持 GraphQL subscription

### 劣势

- **配置复杂**：需要创建和维护 Subgraph
- **索引延迟**：数据不是完全实时的
- **额外成本**：部署 Subgraph 需要成本

## 参考资源

- [The Graph 官方文档](https://thegraph.com/docs/)
- [The Graph Explorer](https://thegraph.com/explorer)
- [GraphQL 教程](https://graphql.org/learn/)
- [Subgraph 最佳实践](https://thegraph.com/docs/en/developing/creating-a-subgraph/)

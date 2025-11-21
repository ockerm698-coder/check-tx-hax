# Check-TX-Hax - 区块链交易查询工具

一个基于 React + TypeScript 的区块链交易查询工具，可以通过交易哈希查看链上交互数据。

## 功能特性

- 通过交易哈希查询交易详情
- 显示完整的交易信息（发送方、接收方、金额等）
- 显示 Gas 相关信息
- 显示交易状态和确认信息
- 显示事件日志（Logs）
- 响应式设计，支持移动端
- 支持多个区块链网络

## 技术栈

- React 18
- TypeScript
- Ethers.js v6
- CSS3

## 安装和运行

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm start
```

应用将在 [http://localhost:3000](http://localhost:3000) 打开。

### 构建生产版本

```bash
npm run build
```

## 使用说明

1. 在输入框中输入交易哈希（以 0x 开头的 66 位十六进制字符串）
2. 点击"查询"按钮
3. 查看交易详情信息

### 示例交易哈希

你可以使用以下交易哈希进行测试（以太坊主网）：

```
0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060
```

## 配置网络

默认情况下，应用连接到以太坊主网。你可以在 `src/config.ts` 文件中修改网络配置：

```typescript
export const RPC_CONFIGS = {
  ethereum: {
    name: '以太坊主网',
    rpc: 'https://eth.llamarpc.com',
  },
  localhost: {
    name: '本地测试网络',
    rpc: 'http://localhost:8545',
  },
  // 添加更多网络...
};
```

### 使用本地 Hardhat 网络

如果你想连接到本地 Hardhat 网络，可以修改 `src/App.tsx` 中的 RPC URL：

```typescript
const provider = new ethers.JsonRpcProvider('http://localhost:8545');
```

然后确保你的 Hardhat 节点正在运行：

```bash
cd ../my-hardhat-project
npx hardhat node
```

### 使用环境变量

你也可以通过环境变量配置 RPC URL。创建 `.env` 文件：

```
REACT_APP_RPC_URL=http://localhost:8545
```

## 项目结构

```
check-tx-hax/
├── public/
├── src/
│   ├── components/
│   │   ├── TransactionLookup.tsx      # 交易查询输入组件
│   │   ├── TransactionLookup.css
│   │   ├── TransactionDetails.tsx     # 交易详情显示组件
│   │   └── TransactionDetails.css
│   ├── config.ts                      # 网络配置
│   ├── App.tsx                        # 主应用组件
│   ├── App.css
│   └── index.tsx
├── package.json
└── README.md
```

## 显示的交易信息

- **基本信息**：交易哈希、区块号、状态、发送方、接收方、金额
- **Gas 信息**：Gas Limit、Gas Price、Gas Used、Max Fee Per Gas 等
- **其他信息**：Nonce、交易类型、Chain ID、Input Data
- **事件日志**：合约事件触发的日志信息

## 开发建议

### 添加网络切换功能

你可以添加一个下拉菜单让用户选择不同的网络：

```typescript
const [selectedNetwork, setSelectedNetwork] = useState('ethereum');
const provider = new ethers.JsonRpcProvider(RPC_CONFIGS[selectedNetwork].rpc);
```

### 添加 Web3 钱包连接

可以集成 MetaMask 等钱包，使用用户当前连接的网络：

```typescript
const provider = new ethers.BrowserProvider(window.ethereum);
```

### 添加交易历史记录

使用 localStorage 保存查询历史：

```typescript
const saveToHistory = (txHash: string) => {
  const history = JSON.parse(localStorage.getItem('txHistory') || '[]');
  history.unshift(txHash);
  localStorage.setItem('txHistory', JSON.stringify(history.slice(0, 10)));
};
```

## 常见问题

### Q: 查询时提示"未找到该交易"？

A: 请检查：
1. 交易哈希是否正确
2. 是否连接到正确的网络（主网/测试网）
3. 交易是否已经被打包确认

### Q: 如何查询本地 Hardhat 网络的交易？

A: 修改 `src/App.tsx` 中的 RPC URL 为 `http://localhost:8545`，并确保 Hardhat 节点正在运行。

### Q: Gas 信息显示不完整？

A: 不同类型的交易（Legacy、EIP-1559）显示的 Gas 字段可能不同，这是正常现象。

## 许可证

MIT

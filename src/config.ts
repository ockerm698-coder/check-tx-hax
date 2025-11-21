// 区块链 RPC 配置
export const RPC_CONFIGS = {
  ethereum: {
    name: '以太坊主网',
    rpc: 'https://eth.llamarpc.com',
  },
  sepolia: {
    name: '以太坊 Sepolia 测试网',
    rpc: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
  },
  polygon: {
    name: 'Polygon 主网',
    rpc: 'https://polygon-rpc.com',
  },
  bsc: {
    name: 'BSC 主网',
    rpc: 'https://bsc-dataseed.binance.org',
  },
  localhost: {
    name: '本地测试网络',
    rpc: 'http://localhost:8545',
  },
};

// 默认使用的网络
export const DEFAULT_NETWORK = 'ethereum';

// 可以在这里添加自定义的 RPC URL
export const CUSTOM_RPC_URL = process.env.REACT_APP_RPC_URL || RPC_CONFIGS[DEFAULT_NETWORK].rpc;

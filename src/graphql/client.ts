/**
 * Apollo Client 配置
 * 用于连接 The Graph 的 GraphQL API
 */
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

/**
 * The Graph 的 API endpoint
 * 注意：这是一个示例 endpoint，需要替换为实际的 Subgraph URL
 *
 * 如何获取 Subgraph URL：
 * 1. 访问 https://thegraph.com/explorer
 * 2. 搜索以太坊相关的 Subgraph
 * 3. 复制 Query URL
 *
 * 或者部署自己的 Subgraph：
 * 1. 创建 Subgraph 项目
 * 2. 部署到 The Graph 网络
 * 3. 获取生成的 API endpoint
 */
const GRAPH_API_URL = process.env.REACT_APP_GRAPH_API_URL ||
  'https://api.thegraph.com/subgraphs/name/your-subgraph-name';

/**
 * 创建 Apollo Client 实例
 * 用于与 The Graph 进行 GraphQL 通信
 */
export const graphClient = new ApolloClient({
  link: new HttpLink({
    uri: GRAPH_API_URL,
  }),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only', // 始终从网络获取最新数据
    },
    query: {
      fetchPolicy: 'network-only',
    },
  },
});

export default graphClient;

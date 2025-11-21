/**
 * GraphQL 查询定义
 * 用于从 The Graph 查询以太坊交易数据
 */
import { gql } from '@apollo/client';

/**
 * 查询交易详情的 GraphQL 语句
 * 注意：这是一个示例查询，实际使用时需要根据具体的 Subgraph Schema 调整
 */
export const GET_TRANSACTION = gql`
  query GetTransaction($hash: String!) {
    transaction(id: $hash) {
      id
      hash
      from
      to
      value
      gasLimit
      gasPrice
      input
      blockNumber
      timestamp
    }
  }
`;

/**
 * 查询交易回执的 GraphQL 语句
 */
export const GET_TRANSACTION_RECEIPT = gql`
  query GetTransactionReceipt($hash: String!) {
    transactionReceipt(id: $hash) {
      id
      transactionHash
      status
      gasUsed
      logs {
        id
        address
        topics
        data
      }
    }
  }
`;

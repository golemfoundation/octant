/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
  [_ in K]?: never;
};
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  BigDecimal: { input: any; output: any };
  BigInt: { input: any; output: any };
  Bytes: { input: any; output: any };
  /**
   * 8 bytes signed integer
   *
   */
  Int8: { input: any; output: any };
};

export type BlockChangedFilter = {
  number_gte: Scalars['Int']['input'];
};

export type Block_Height = {
  hash?: InputMaybe<Scalars['Bytes']['input']>;
  number?: InputMaybe<Scalars['Int']['input']>;
  number_gte?: InputMaybe<Scalars['Int']['input']>;
};

export type Epoch = {
  __typename?: 'Epoch';
  decisionWindow: Scalars['BigInt']['output'];
  duration: Scalars['BigInt']['output'];
  epoch: Scalars['Int']['output'];
  fromTs: Scalars['BigInt']['output'];
  id: Scalars['Bytes']['output'];
  toTs: Scalars['BigInt']['output'];
};

export type Epoch_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Epoch_Filter>>>;
  decisionWindow?: InputMaybe<Scalars['BigInt']['input']>;
  decisionWindow_gt?: InputMaybe<Scalars['BigInt']['input']>;
  decisionWindow_gte?: InputMaybe<Scalars['BigInt']['input']>;
  decisionWindow_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  decisionWindow_lt?: InputMaybe<Scalars['BigInt']['input']>;
  decisionWindow_lte?: InputMaybe<Scalars['BigInt']['input']>;
  decisionWindow_not?: InputMaybe<Scalars['BigInt']['input']>;
  decisionWindow_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  duration?: InputMaybe<Scalars['BigInt']['input']>;
  duration_gt?: InputMaybe<Scalars['BigInt']['input']>;
  duration_gte?: InputMaybe<Scalars['BigInt']['input']>;
  duration_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  duration_lt?: InputMaybe<Scalars['BigInt']['input']>;
  duration_lte?: InputMaybe<Scalars['BigInt']['input']>;
  duration_not?: InputMaybe<Scalars['BigInt']['input']>;
  duration_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  epoch?: InputMaybe<Scalars['Int']['input']>;
  epoch_gt?: InputMaybe<Scalars['Int']['input']>;
  epoch_gte?: InputMaybe<Scalars['Int']['input']>;
  epoch_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  epoch_lt?: InputMaybe<Scalars['Int']['input']>;
  epoch_lte?: InputMaybe<Scalars['Int']['input']>;
  epoch_not?: InputMaybe<Scalars['Int']['input']>;
  epoch_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  fromTs?: InputMaybe<Scalars['BigInt']['input']>;
  fromTs_gt?: InputMaybe<Scalars['BigInt']['input']>;
  fromTs_gte?: InputMaybe<Scalars['BigInt']['input']>;
  fromTs_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  fromTs_lt?: InputMaybe<Scalars['BigInt']['input']>;
  fromTs_lte?: InputMaybe<Scalars['BigInt']['input']>;
  fromTs_not?: InputMaybe<Scalars['BigInt']['input']>;
  fromTs_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Epoch_Filter>>>;
  toTs?: InputMaybe<Scalars['BigInt']['input']>;
  toTs_gt?: InputMaybe<Scalars['BigInt']['input']>;
  toTs_gte?: InputMaybe<Scalars['BigInt']['input']>;
  toTs_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  toTs_lt?: InputMaybe<Scalars['BigInt']['input']>;
  toTs_lte?: InputMaybe<Scalars['BigInt']['input']>;
  toTs_not?: InputMaybe<Scalars['BigInt']['input']>;
  toTs_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

export enum Epoch_OrderBy {
  DecisionWindow = 'decisionWindow',
  Duration = 'duration',
  Epoch = 'epoch',
  FromTs = 'fromTs',
  Id = 'id',
  ToTs = 'toTs',
}

export type Locked = {
  __typename?: 'Locked';
  amount: Scalars['BigInt']['output'];
  blockNumber: Scalars['Int']['output'];
  depositBefore: Scalars['BigInt']['output'];
  id: Scalars['Bytes']['output'];
  timestamp: Scalars['Int']['output'];
  transactionHash: Scalars['Bytes']['output'];
  user: Scalars['Bytes']['output'];
};

export type LockedSummaryLatest = {
  __typename?: 'LockedSummaryLatest';
  blockNumber: Scalars['Int']['output'];
  glmSupply: Scalars['BigInt']['output'];
  id: Scalars['String']['output'];
  lockedRatio: Scalars['BigDecimal']['output'];
  lockedTotal: Scalars['BigInt']['output'];
  timestamp: Scalars['Int']['output'];
  transactionHash: Scalars['Bytes']['output'];
};

export type LockedSummaryLatest_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<LockedSummaryLatest_Filter>>>;
  blockNumber?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  blockNumber_lt?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_not?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  glmSupply?: InputMaybe<Scalars['BigInt']['input']>;
  glmSupply_gt?: InputMaybe<Scalars['BigInt']['input']>;
  glmSupply_gte?: InputMaybe<Scalars['BigInt']['input']>;
  glmSupply_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  glmSupply_lt?: InputMaybe<Scalars['BigInt']['input']>;
  glmSupply_lte?: InputMaybe<Scalars['BigInt']['input']>;
  glmSupply_not?: InputMaybe<Scalars['BigInt']['input']>;
  glmSupply_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_ends_with?: InputMaybe<Scalars['String']['input']>;
  id_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  id_gt?: InputMaybe<Scalars['String']['input']>;
  id_gte?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<Scalars['String']['input']>>;
  id_lt?: InputMaybe<Scalars['String']['input']>;
  id_lte?: InputMaybe<Scalars['String']['input']>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  id_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  id_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  id_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  id_starts_with?: InputMaybe<Scalars['String']['input']>;
  id_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  lockedRatio?: InputMaybe<Scalars['BigDecimal']['input']>;
  lockedRatio_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  lockedRatio_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  lockedRatio_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  lockedRatio_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  lockedRatio_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  lockedRatio_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  lockedRatio_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  lockedTotal?: InputMaybe<Scalars['BigInt']['input']>;
  lockedTotal_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lockedTotal_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lockedTotal_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lockedTotal_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lockedTotal_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lockedTotal_not?: InputMaybe<Scalars['BigInt']['input']>;
  lockedTotal_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<LockedSummaryLatest_Filter>>>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum LockedSummaryLatest_OrderBy {
  BlockNumber = 'blockNumber',
  GlmSupply = 'glmSupply',
  Id = 'id',
  LockedRatio = 'lockedRatio',
  LockedTotal = 'lockedTotal',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
}

export type LockedSummarySnapshot = {
  __typename?: 'LockedSummarySnapshot';
  blockNumber: Scalars['Int']['output'];
  glmSupply: Scalars['BigInt']['output'];
  id: Scalars['Bytes']['output'];
  lockedRatio: Scalars['BigDecimal']['output'];
  lockedTotal: Scalars['BigInt']['output'];
  timestamp: Scalars['Int']['output'];
  transactionHash: Scalars['Bytes']['output'];
};

export type LockedSummarySnapshot_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<LockedSummarySnapshot_Filter>>>;
  blockNumber?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  blockNumber_lt?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_not?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  glmSupply?: InputMaybe<Scalars['BigInt']['input']>;
  glmSupply_gt?: InputMaybe<Scalars['BigInt']['input']>;
  glmSupply_gte?: InputMaybe<Scalars['BigInt']['input']>;
  glmSupply_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  glmSupply_lt?: InputMaybe<Scalars['BigInt']['input']>;
  glmSupply_lte?: InputMaybe<Scalars['BigInt']['input']>;
  glmSupply_not?: InputMaybe<Scalars['BigInt']['input']>;
  glmSupply_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  lockedRatio?: InputMaybe<Scalars['BigDecimal']['input']>;
  lockedRatio_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  lockedRatio_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  lockedRatio_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  lockedRatio_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  lockedRatio_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  lockedRatio_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  lockedRatio_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  lockedTotal?: InputMaybe<Scalars['BigInt']['input']>;
  lockedTotal_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lockedTotal_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lockedTotal_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lockedTotal_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lockedTotal_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lockedTotal_not?: InputMaybe<Scalars['BigInt']['input']>;
  lockedTotal_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<LockedSummarySnapshot_Filter>>>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum LockedSummarySnapshot_OrderBy {
  BlockNumber = 'blockNumber',
  GlmSupply = 'glmSupply',
  Id = 'id',
  LockedRatio = 'lockedRatio',
  LockedTotal = 'lockedTotal',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
}

export type Locked_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  and?: InputMaybe<Array<InputMaybe<Locked_Filter>>>;
  blockNumber?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  blockNumber_lt?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_not?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  depositBefore?: InputMaybe<Scalars['BigInt']['input']>;
  depositBefore_gt?: InputMaybe<Scalars['BigInt']['input']>;
  depositBefore_gte?: InputMaybe<Scalars['BigInt']['input']>;
  depositBefore_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  depositBefore_lt?: InputMaybe<Scalars['BigInt']['input']>;
  depositBefore_lte?: InputMaybe<Scalars['BigInt']['input']>;
  depositBefore_not?: InputMaybe<Scalars['BigInt']['input']>;
  depositBefore_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Locked_Filter>>>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  user?: InputMaybe<Scalars['Bytes']['input']>;
  user_contains?: InputMaybe<Scalars['Bytes']['input']>;
  user_gt?: InputMaybe<Scalars['Bytes']['input']>;
  user_gte?: InputMaybe<Scalars['Bytes']['input']>;
  user_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  user_lt?: InputMaybe<Scalars['Bytes']['input']>;
  user_lte?: InputMaybe<Scalars['Bytes']['input']>;
  user_not?: InputMaybe<Scalars['Bytes']['input']>;
  user_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  user_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum Locked_OrderBy {
  Amount = 'amount',
  BlockNumber = 'blockNumber',
  DepositBefore = 'depositBefore',
  Id = 'id',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
  User = 'user',
}

/** Defines the order direction, either ascending or descending */
export enum OrderDirection {
  Asc = 'asc',
  Desc = 'desc',
}

export type ProjectsMetadataAccumulated = {
  __typename?: 'ProjectsMetadataAccumulated';
  id: Scalars['Bytes']['output'];
  projectsAddresses: Array<Scalars['Bytes']['output']>;
};

export type ProjectsMetadataAccumulated_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<ProjectsMetadataAccumulated_Filter>>>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  or?: InputMaybe<Array<InputMaybe<ProjectsMetadataAccumulated_Filter>>>;
  projectsAddresses?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  projectsAddresses_contains?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  projectsAddresses_contains_nocase?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  projectsAddresses_not?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  projectsAddresses_not_contains?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  projectsAddresses_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum ProjectsMetadataAccumulated_OrderBy {
  Id = 'id',
  ProjectsAddresses = 'projectsAddresses',
}

export type ProjectsMetadataPerEpoch = {
  __typename?: 'ProjectsMetadataPerEpoch';
  epoch: Scalars['Int']['output'];
  id: Scalars['Bytes']['output'];
  projectsAddresses: Array<Scalars['Bytes']['output']>;
  proposalsCid: Scalars['String']['output'];
};

export type ProjectsMetadataPerEpoch_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<ProjectsMetadataPerEpoch_Filter>>>;
  epoch?: InputMaybe<Scalars['Int']['input']>;
  epoch_gt?: InputMaybe<Scalars['Int']['input']>;
  epoch_gte?: InputMaybe<Scalars['Int']['input']>;
  epoch_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  epoch_lt?: InputMaybe<Scalars['Int']['input']>;
  epoch_lte?: InputMaybe<Scalars['Int']['input']>;
  epoch_not?: InputMaybe<Scalars['Int']['input']>;
  epoch_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  or?: InputMaybe<Array<InputMaybe<ProjectsMetadataPerEpoch_Filter>>>;
  projectsAddresses?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  projectsAddresses_contains?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  projectsAddresses_contains_nocase?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  projectsAddresses_not?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  projectsAddresses_not_contains?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  projectsAddresses_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  proposalsCid?: InputMaybe<Scalars['String']['input']>;
  proposalsCid_contains?: InputMaybe<Scalars['String']['input']>;
  proposalsCid_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  proposalsCid_ends_with?: InputMaybe<Scalars['String']['input']>;
  proposalsCid_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  proposalsCid_gt?: InputMaybe<Scalars['String']['input']>;
  proposalsCid_gte?: InputMaybe<Scalars['String']['input']>;
  proposalsCid_in?: InputMaybe<Array<Scalars['String']['input']>>;
  proposalsCid_lt?: InputMaybe<Scalars['String']['input']>;
  proposalsCid_lte?: InputMaybe<Scalars['String']['input']>;
  proposalsCid_not?: InputMaybe<Scalars['String']['input']>;
  proposalsCid_not_contains?: InputMaybe<Scalars['String']['input']>;
  proposalsCid_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  proposalsCid_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  proposalsCid_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  proposalsCid_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  proposalsCid_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  proposalsCid_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  proposalsCid_starts_with?: InputMaybe<Scalars['String']['input']>;
  proposalsCid_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum ProjectsMetadataPerEpoch_OrderBy {
  Epoch = 'epoch',
  Id = 'id',
  ProjectsAddresses = 'projectsAddresses',
  ProposalsCid = 'proposalsCid',
}

export type Query = {
  __typename?: 'Query';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  epoch?: Maybe<Epoch>;
  epoches: Array<Epoch>;
  locked?: Maybe<Locked>;
  lockedSummaryLatest?: Maybe<LockedSummaryLatest>;
  lockedSummaryLatests: Array<LockedSummaryLatest>;
  lockedSummarySnapshot?: Maybe<LockedSummarySnapshot>;
  lockedSummarySnapshots: Array<LockedSummarySnapshot>;
  lockeds: Array<Locked>;
  projectsMetadataAccumulated?: Maybe<ProjectsMetadataAccumulated>;
  projectsMetadataAccumulateds: Array<ProjectsMetadataAccumulated>;
  projectsMetadataPerEpoch?: Maybe<ProjectsMetadataPerEpoch>;
  projectsMetadataPerEpoches: Array<ProjectsMetadataPerEpoch>;
  unlocked?: Maybe<Unlocked>;
  unlockeds: Array<Unlocked>;
  vaultMerkleRoot?: Maybe<VaultMerkleRoot>;
  vaultMerkleRoots: Array<VaultMerkleRoot>;
  withdrawal?: Maybe<Withdrawal>;
  withdrawals: Array<Withdrawal>;
};

export type Query_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};

export type QueryEpochArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryEpochesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Epoch_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Epoch_Filter>;
};

export type QueryLockedArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryLockedSummaryLatestArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryLockedSummaryLatestsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<LockedSummaryLatest_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<LockedSummaryLatest_Filter>;
};

export type QueryLockedSummarySnapshotArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryLockedSummarySnapshotsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<LockedSummarySnapshot_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<LockedSummarySnapshot_Filter>;
};

export type QueryLockedsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Locked_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Locked_Filter>;
};

export type QueryProjectsMetadataAccumulatedArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryProjectsMetadataAccumulatedsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ProjectsMetadataAccumulated_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ProjectsMetadataAccumulated_Filter>;
};

export type QueryProjectsMetadataPerEpochArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryProjectsMetadataPerEpochesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ProjectsMetadataPerEpoch_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ProjectsMetadataPerEpoch_Filter>;
};

export type QueryUnlockedArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryUnlockedsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Unlocked_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Unlocked_Filter>;
};

export type QueryVaultMerkleRootArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryVaultMerkleRootsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<VaultMerkleRoot_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<VaultMerkleRoot_Filter>;
};

export type QueryWithdrawalArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryWithdrawalsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Withdrawal_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Withdrawal_Filter>;
};

export type Subscription = {
  __typename?: 'Subscription';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  epoch?: Maybe<Epoch>;
  epoches: Array<Epoch>;
  locked?: Maybe<Locked>;
  lockedSummaryLatest?: Maybe<LockedSummaryLatest>;
  lockedSummaryLatests: Array<LockedSummaryLatest>;
  lockedSummarySnapshot?: Maybe<LockedSummarySnapshot>;
  lockedSummarySnapshots: Array<LockedSummarySnapshot>;
  lockeds: Array<Locked>;
  projectsMetadataAccumulated?: Maybe<ProjectsMetadataAccumulated>;
  projectsMetadataAccumulateds: Array<ProjectsMetadataAccumulated>;
  projectsMetadataPerEpoch?: Maybe<ProjectsMetadataPerEpoch>;
  projectsMetadataPerEpoches: Array<ProjectsMetadataPerEpoch>;
  unlocked?: Maybe<Unlocked>;
  unlockeds: Array<Unlocked>;
  vaultMerkleRoot?: Maybe<VaultMerkleRoot>;
  vaultMerkleRoots: Array<VaultMerkleRoot>;
  withdrawal?: Maybe<Withdrawal>;
  withdrawals: Array<Withdrawal>;
};

export type Subscription_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};

export type SubscriptionEpochArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionEpochesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Epoch_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Epoch_Filter>;
};

export type SubscriptionLockedArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionLockedSummaryLatestArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionLockedSummaryLatestsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<LockedSummaryLatest_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<LockedSummaryLatest_Filter>;
};

export type SubscriptionLockedSummarySnapshotArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionLockedSummarySnapshotsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<LockedSummarySnapshot_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<LockedSummarySnapshot_Filter>;
};

export type SubscriptionLockedsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Locked_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Locked_Filter>;
};

export type SubscriptionProjectsMetadataAccumulatedArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionProjectsMetadataAccumulatedsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ProjectsMetadataAccumulated_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ProjectsMetadataAccumulated_Filter>;
};

export type SubscriptionProjectsMetadataPerEpochArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionProjectsMetadataPerEpochesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ProjectsMetadataPerEpoch_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ProjectsMetadataPerEpoch_Filter>;
};

export type SubscriptionUnlockedArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionUnlockedsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Unlocked_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Unlocked_Filter>;
};

export type SubscriptionVaultMerkleRootArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionVaultMerkleRootsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<VaultMerkleRoot_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<VaultMerkleRoot_Filter>;
};

export type SubscriptionWithdrawalArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionWithdrawalsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Withdrawal_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Withdrawal_Filter>;
};

export type Unlocked = {
  __typename?: 'Unlocked';
  amount: Scalars['BigInt']['output'];
  blockNumber: Scalars['Int']['output'];
  depositBefore: Scalars['BigInt']['output'];
  id: Scalars['Bytes']['output'];
  timestamp: Scalars['Int']['output'];
  transactionHash: Scalars['Bytes']['output'];
  user: Scalars['Bytes']['output'];
};

export type Unlocked_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  and?: InputMaybe<Array<InputMaybe<Unlocked_Filter>>>;
  blockNumber?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  blockNumber_lt?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_not?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  depositBefore?: InputMaybe<Scalars['BigInt']['input']>;
  depositBefore_gt?: InputMaybe<Scalars['BigInt']['input']>;
  depositBefore_gte?: InputMaybe<Scalars['BigInt']['input']>;
  depositBefore_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  depositBefore_lt?: InputMaybe<Scalars['BigInt']['input']>;
  depositBefore_lte?: InputMaybe<Scalars['BigInt']['input']>;
  depositBefore_not?: InputMaybe<Scalars['BigInt']['input']>;
  depositBefore_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Unlocked_Filter>>>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  user?: InputMaybe<Scalars['Bytes']['input']>;
  user_contains?: InputMaybe<Scalars['Bytes']['input']>;
  user_gt?: InputMaybe<Scalars['Bytes']['input']>;
  user_gte?: InputMaybe<Scalars['Bytes']['input']>;
  user_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  user_lt?: InputMaybe<Scalars['Bytes']['input']>;
  user_lte?: InputMaybe<Scalars['Bytes']['input']>;
  user_not?: InputMaybe<Scalars['Bytes']['input']>;
  user_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  user_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum Unlocked_OrderBy {
  Amount = 'amount',
  BlockNumber = 'blockNumber',
  DepositBefore = 'depositBefore',
  Id = 'id',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
  User = 'user',
}

export type VaultMerkleRoot = {
  __typename?: 'VaultMerkleRoot';
  blockNumber: Scalars['Int']['output'];
  epoch: Scalars['Int']['output'];
  id: Scalars['Bytes']['output'];
  root: Scalars['Bytes']['output'];
  timestamp: Scalars['Int']['output'];
  transactionHash: Scalars['Bytes']['output'];
};

export type VaultMerkleRoot_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<VaultMerkleRoot_Filter>>>;
  blockNumber?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  blockNumber_lt?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_not?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  epoch?: InputMaybe<Scalars['Int']['input']>;
  epoch_gt?: InputMaybe<Scalars['Int']['input']>;
  epoch_gte?: InputMaybe<Scalars['Int']['input']>;
  epoch_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  epoch_lt?: InputMaybe<Scalars['Int']['input']>;
  epoch_lte?: InputMaybe<Scalars['Int']['input']>;
  epoch_not?: InputMaybe<Scalars['Int']['input']>;
  epoch_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  or?: InputMaybe<Array<InputMaybe<VaultMerkleRoot_Filter>>>;
  root?: InputMaybe<Scalars['Bytes']['input']>;
  root_contains?: InputMaybe<Scalars['Bytes']['input']>;
  root_gt?: InputMaybe<Scalars['Bytes']['input']>;
  root_gte?: InputMaybe<Scalars['Bytes']['input']>;
  root_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  root_lt?: InputMaybe<Scalars['Bytes']['input']>;
  root_lte?: InputMaybe<Scalars['Bytes']['input']>;
  root_not?: InputMaybe<Scalars['Bytes']['input']>;
  root_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  root_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum VaultMerkleRoot_OrderBy {
  BlockNumber = 'blockNumber',
  Epoch = 'epoch',
  Id = 'id',
  Root = 'root',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
}

export type Withdrawal = {
  __typename?: 'Withdrawal';
  amount: Scalars['BigInt']['output'];
  blockNumber: Scalars['Int']['output'];
  epoch: Scalars['Int']['output'];
  id: Scalars['Bytes']['output'];
  timestamp: Scalars['Int']['output'];
  transactionHash: Scalars['Bytes']['output'];
  user: Scalars['Bytes']['output'];
};

export type Withdrawal_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  and?: InputMaybe<Array<InputMaybe<Withdrawal_Filter>>>;
  blockNumber?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  blockNumber_lt?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_not?: InputMaybe<Scalars['Int']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  epoch?: InputMaybe<Scalars['Int']['input']>;
  epoch_gt?: InputMaybe<Scalars['Int']['input']>;
  epoch_gte?: InputMaybe<Scalars['Int']['input']>;
  epoch_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  epoch_lt?: InputMaybe<Scalars['Int']['input']>;
  epoch_lte?: InputMaybe<Scalars['Int']['input']>;
  epoch_not?: InputMaybe<Scalars['Int']['input']>;
  epoch_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Withdrawal_Filter>>>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  user?: InputMaybe<Scalars['Bytes']['input']>;
  user_contains?: InputMaybe<Scalars['Bytes']['input']>;
  user_gt?: InputMaybe<Scalars['Bytes']['input']>;
  user_gte?: InputMaybe<Scalars['Bytes']['input']>;
  user_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  user_lt?: InputMaybe<Scalars['Bytes']['input']>;
  user_lte?: InputMaybe<Scalars['Bytes']['input']>;
  user_not?: InputMaybe<Scalars['Bytes']['input']>;
  user_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  user_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum Withdrawal_OrderBy {
  Amount = 'amount',
  BlockNumber = 'blockNumber',
  Epoch = 'epoch',
  Id = 'id',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
  User = 'user',
}

export type _Block_ = {
  __typename?: '_Block_';
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']['output']>;
  /** The block number */
  number: Scalars['Int']['output'];
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp?: Maybe<Scalars['Int']['output']>;
};

/** The type for the top-level _meta field */
export type _Meta_ = {
  __typename?: '_Meta_';
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   *
   */
  block: _Block_;
  /** The deployment ID */
  deployment: Scalars['String']['output'];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean']['output'];
};

export enum _SubgraphErrorPolicy_ {
  /** Data will be returned even if the subgraph has indexing errors */
  Allow = 'allow',
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  Deny = 'deny',
}

export type GetProjectsMetadataAccumulatedsQueryVariables = Exact<{ [key: string]: never }>;

export type GetProjectsMetadataAccumulatedsQuery = {
  __typename?: 'Query';
  projectsMetadataAccumulateds: Array<{
    __typename?: 'ProjectsMetadataAccumulated';
    projectsAddresses: Array<any>;
  }>;
};

export type GetBlockNumberQueryVariables = Exact<{ [key: string]: never }>;

export type GetBlockNumberQuery = {
  __typename?: 'Query';
  _meta?: { __typename?: '_Meta_'; block: { __typename?: '_Block_'; number: number } } | null;
};

export type GetEpochTimestampHappenedInQueryVariables = Exact<{
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
}>;

export type GetEpochTimestampHappenedInQuery = {
  __typename?: 'Query';
  epoches: Array<{ __typename?: 'Epoch'; epoch: number }>;
};

export type GetEpochesQueryVariables = Exact<{ [key: string]: never }>;

export type GetEpochesQuery = {
  __typename?: 'Query';
  epoches: Array<{ __typename?: 'Epoch'; epoch: number }>;
};

export type GetEpochsStartEndTimeQueryVariables = Exact<{
  lastEpoch?: InputMaybe<Scalars['Int']['input']>;
}>;

export type GetEpochsStartEndTimeQuery = {
  __typename?: 'Query';
  epoches: Array<{
    __typename?: 'Epoch';
    epoch: number;
    toTs: any;
    fromTs: any;
    decisionWindow: any;
  }>;
};

export type GetLargestLockedAmountQueryVariables = Exact<{ [key: string]: never }>;

export type GetLargestLockedAmountQuery = {
  __typename?: 'Query';
  lockeds: Array<{ __typename?: 'Locked'; amount: any }>;
};

export type GetLockedSummaryLatestQueryVariables = Exact<{ [key: string]: never }>;

export type GetLockedSummaryLatestQuery = {
  __typename?: 'Query';
  lockedSummaryLatest?: {
    __typename?: 'LockedSummaryLatest';
    id: string;
    lockedTotal: any;
    lockedRatio: any;
  } | null;
};

export type GetLockedSummarySnapshotsQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;

export type GetLockedSummarySnapshotsQuery = {
  __typename?: 'Query';
  lockedSummarySnapshots: Array<{
    __typename?: 'LockedSummarySnapshot';
    lockedTotal: any;
    timestamp: number;
  }>;
};

export type GetLockedsDataQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;

export type GetLockedsDataQuery = {
  __typename?: 'Query';
  lockeds: Array<{ __typename?: 'Locked'; user: any; timestamp: number; amount: any }>;
};

export type GetProjectsMetadataPerEpochesQueryVariables = Exact<{ [key: string]: never }>;

export type GetProjectsMetadataPerEpochesQuery = {
  __typename?: 'Query';
  projectsMetadataPerEpoches: Array<{
    __typename?: 'ProjectsMetadataPerEpoch';
    epoch: number;
    proposalsCid: string;
  }>;
};

export type GetUserWithdrawalsQueryVariables = Exact<{
  address?: InputMaybe<Scalars['Bytes']['input']>;
}>;

export type GetUserWithdrawalsQuery = {
  __typename?: 'Query';
  withdrawals: Array<{ __typename?: 'Withdrawal'; amount: any }>;
};

export const GetProjectsMetadataAccumulatedsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetProjectsMetadataAccumulateds' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'projectsMetadataAccumulateds' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'projectsAddresses' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetProjectsMetadataAccumulatedsQuery,
  GetProjectsMetadataAccumulatedsQueryVariables
>;
export const GetBlockNumberDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetBlockNumber' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: '_meta' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'block' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'Field', name: { kind: 'Name', value: 'number' } }],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetBlockNumberQuery, GetBlockNumberQueryVariables>;
export const GetEpochTimestampHappenedInDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetEpochTimestampHappenedIn' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'timestamp' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'BigInt' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'epoches' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'fromTs_lte' },
                      value: { kind: 'Variable', name: { kind: 'Name', value: 'timestamp' } },
                    },
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'toTs_gte' },
                      value: { kind: 'Variable', name: { kind: 'Name', value: 'timestamp' } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'epoch' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetEpochTimestampHappenedInQuery,
  GetEpochTimestampHappenedInQueryVariables
>;
export const GetEpochesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetEpoches' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'epoches' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'epoch' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetEpochesQuery, GetEpochesQueryVariables>;
export const GetEpochsStartEndTimeDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetEpochsStartEndTime' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'lastEpoch' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'epoches' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'first' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'lastEpoch' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'epoch' } },
                { kind: 'Field', name: { kind: 'Name', value: 'toTs' } },
                { kind: 'Field', name: { kind: 'Name', value: 'fromTs' } },
                { kind: 'Field', name: { kind: 'Name', value: 'decisionWindow' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetEpochsStartEndTimeQuery, GetEpochsStartEndTimeQueryVariables>;
export const GetLargestLockedAmountDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetLargestLockedAmount' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'lockeds' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'orderBy' },
                value: { kind: 'EnumValue', value: 'amount' },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'orderDirection' },
                value: { kind: 'EnumValue', value: 'desc' },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'first' },
                value: { kind: 'IntValue', value: '1' },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'amount' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetLargestLockedAmountQuery, GetLargestLockedAmountQueryVariables>;
export const GetLockedSummaryLatestDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetLockedSummaryLatest' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'lockedSummaryLatest' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'StringValue', value: 'latest', block: false },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lockedTotal' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lockedRatio' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetLockedSummaryLatestQuery, GetLockedSummaryLatestQueryVariables>;
export const GetLockedSummarySnapshotsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetLockedSummarySnapshots' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'first' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          defaultValue: { kind: 'IntValue', value: '1000' },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          defaultValue: { kind: 'IntValue', value: '0' },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'lockedSummarySnapshots' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'first' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'first' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'orderBy' },
                value: { kind: 'EnumValue', value: 'timestamp' },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'lockedTotal' } },
                { kind: 'Field', name: { kind: 'Name', value: 'timestamp' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetLockedSummarySnapshotsQuery,
  GetLockedSummarySnapshotsQueryVariables
>;
export const GetLockedsDataDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetLockedsData' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'first' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          defaultValue: { kind: 'IntValue', value: '100' },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          defaultValue: { kind: 'IntValue', value: '0' },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'lockeds' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'first' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'first' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'user' } },
                { kind: 'Field', name: { kind: 'Name', value: 'timestamp' } },
                { kind: 'Field', name: { kind: 'Name', value: 'amount' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetLockedsDataQuery, GetLockedsDataQueryVariables>;
export const GetProjectsMetadataPerEpochesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetProjectsMetadataPerEpoches' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'projectsMetadataPerEpoches' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'orderBy' },
                value: { kind: 'EnumValue', value: 'epoch' },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'orderDirection' },
                value: { kind: 'EnumValue', value: 'asc' },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'epoch' } },
                { kind: 'Field', name: { kind: 'Name', value: 'proposalsCid' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetProjectsMetadataPerEpochesQuery,
  GetProjectsMetadataPerEpochesQueryVariables
>;
export const GetUserWithdrawalsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetUserWithdrawals' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'address' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Bytes' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'withdrawals' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'user' },
                      value: { kind: 'Variable', name: { kind: 'Name', value: 'address' } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'amount' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetUserWithdrawalsQuery, GetUserWithdrawalsQueryVariables>;

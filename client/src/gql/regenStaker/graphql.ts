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
  /** 8 bytes signed integer */
  Int8: { input: any; output: any };
  /** A string representation of microseconds UNIX timestamp (16 digits) */
  Timestamp: { input: any; output: any };
};

/** Access control modes for address set validation */
export enum AccessMode {
  Allowset = 'ALLOWSET',
  Blockset = 'BLOCKSET',
  None = 'NONE',
}

export type Account = {
  __typename?: 'Account';
  /** Address of the account */
  address: Scalars['Bytes']['output'];
  /** Address of the account */
  id: Scalars['Bytes']['output'];
};

export type Account_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  address?: InputMaybe<Scalars['Bytes']['input']>;
  address_contains?: InputMaybe<Scalars['Bytes']['input']>;
  address_gt?: InputMaybe<Scalars['Bytes']['input']>;
  address_gte?: InputMaybe<Scalars['Bytes']['input']>;
  address_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  address_lt?: InputMaybe<Scalars['Bytes']['input']>;
  address_lte?: InputMaybe<Scalars['Bytes']['input']>;
  address_not?: InputMaybe<Scalars['Bytes']['input']>;
  address_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  address_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  and?: InputMaybe<Array<InputMaybe<Account_Filter>>>;
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
  or?: InputMaybe<Array<InputMaybe<Account_Filter>>>;
};

export enum Account_OrderBy {
  Address = 'address',
  Id = 'id',
}

/** Staker addressset */
export type AddressSet = {
  __typename?: 'AddressSet';
  /** Address of the allowset */
  addressSetList?: Maybe<Array<Account>>;
  /** Contract address */
  contractAddress: Scalars['Bytes']['output'];
  id: Scalars['Bytes']['output'];
};

/** Staker addressset */
export type AddressSetAddressSetListArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Account_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Account_Filter>;
};

export type AddressSet_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  addressSetList?: InputMaybe<Array<Scalars['String']['input']>>;
  addressSetList_?: InputMaybe<Account_Filter>;
  addressSetList_contains?: InputMaybe<Array<Scalars['String']['input']>>;
  addressSetList_contains_nocase?: InputMaybe<Array<Scalars['String']['input']>>;
  addressSetList_not?: InputMaybe<Array<Scalars['String']['input']>>;
  addressSetList_not_contains?: InputMaybe<Array<Scalars['String']['input']>>;
  addressSetList_not_contains_nocase?: InputMaybe<Array<Scalars['String']['input']>>;
  and?: InputMaybe<Array<InputMaybe<AddressSet_Filter>>>;
  contractAddress?: InputMaybe<Scalars['Bytes']['input']>;
  contractAddress_contains?: InputMaybe<Scalars['Bytes']['input']>;
  contractAddress_gt?: InputMaybe<Scalars['Bytes']['input']>;
  contractAddress_gte?: InputMaybe<Scalars['Bytes']['input']>;
  contractAddress_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  contractAddress_lt?: InputMaybe<Scalars['Bytes']['input']>;
  contractAddress_lte?: InputMaybe<Scalars['Bytes']['input']>;
  contractAddress_not?: InputMaybe<Scalars['Bytes']['input']>;
  contractAddress_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  contractAddress_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
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
  or?: InputMaybe<Array<InputMaybe<AddressSet_Filter>>>;
};

export enum AddressSet_OrderBy {
  AddressSetList = 'addressSetList',
  ContractAddress = 'contractAddress',
  Id = 'id',
}

export enum Aggregation_Interval {
  Day = 'day',
  Hour = 'hour',
}

export type Asset = {
  __typename?: 'Asset';
  /** Address of the asset */
  address: Scalars['Bytes']['output'];
  /** Decimals of the asset */
  decimals: Scalars['Int']['output'];
  /** Address of the asset */
  id: Scalars['Bytes']['output'];
  /** Name of the asset */
  name: Scalars['String']['output'];
  /** Symbol of the asset */
  symbol: Scalars['String']['output'];
};

export type Asset_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  address?: InputMaybe<Scalars['Bytes']['input']>;
  address_contains?: InputMaybe<Scalars['Bytes']['input']>;
  address_gt?: InputMaybe<Scalars['Bytes']['input']>;
  address_gte?: InputMaybe<Scalars['Bytes']['input']>;
  address_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  address_lt?: InputMaybe<Scalars['Bytes']['input']>;
  address_lte?: InputMaybe<Scalars['Bytes']['input']>;
  address_not?: InputMaybe<Scalars['Bytes']['input']>;
  address_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  address_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  and?: InputMaybe<Array<InputMaybe<Asset_Filter>>>;
  decimals?: InputMaybe<Scalars['Int']['input']>;
  decimals_gt?: InputMaybe<Scalars['Int']['input']>;
  decimals_gte?: InputMaybe<Scalars['Int']['input']>;
  decimals_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  decimals_lt?: InputMaybe<Scalars['Int']['input']>;
  decimals_lte?: InputMaybe<Scalars['Int']['input']>;
  decimals_not?: InputMaybe<Scalars['Int']['input']>;
  decimals_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
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
  name?: InputMaybe<Scalars['String']['input']>;
  name_contains?: InputMaybe<Scalars['String']['input']>;
  name_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_ends_with?: InputMaybe<Scalars['String']['input']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_gt?: InputMaybe<Scalars['String']['input']>;
  name_gte?: InputMaybe<Scalars['String']['input']>;
  name_in?: InputMaybe<Array<Scalars['String']['input']>>;
  name_lt?: InputMaybe<Scalars['String']['input']>;
  name_lte?: InputMaybe<Scalars['String']['input']>;
  name_not?: InputMaybe<Scalars['String']['input']>;
  name_not_contains?: InputMaybe<Scalars['String']['input']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  name_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_starts_with?: InputMaybe<Scalars['String']['input']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<InputMaybe<Asset_Filter>>>;
  symbol?: InputMaybe<Scalars['String']['input']>;
  symbol_contains?: InputMaybe<Scalars['String']['input']>;
  symbol_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_ends_with?: InputMaybe<Scalars['String']['input']>;
  symbol_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_gt?: InputMaybe<Scalars['String']['input']>;
  symbol_gte?: InputMaybe<Scalars['String']['input']>;
  symbol_in?: InputMaybe<Array<Scalars['String']['input']>>;
  symbol_lt?: InputMaybe<Scalars['String']['input']>;
  symbol_lte?: InputMaybe<Scalars['String']['input']>;
  symbol_not?: InputMaybe<Scalars['String']['input']>;
  symbol_not_contains?: InputMaybe<Scalars['String']['input']>;
  symbol_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  symbol_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  symbol_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  symbol_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_starts_with?: InputMaybe<Scalars['String']['input']>;
  symbol_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum Asset_OrderBy {
  Address = 'address',
  Decimals = 'decimals',
  Id = 'id',
  Name = 'name',
  Symbol = 'symbol',
}

export type BlockChangedFilter = {
  number_gte: Scalars['Int']['input'];
};

export type Block_Height = {
  hash?: InputMaybe<Scalars['Bytes']['input']>;
  number?: InputMaybe<Scalars['Int']['input']>;
  number_gte?: InputMaybe<Scalars['Int']['input']>;
};

export type Contribution = {
  __typename?: 'Contribution';
  /** Account */
  account: Account;
  /** Allocation mechanism address */
  allocationMechanism: Scalars['Bytes']['output'];
  /** Amount contributed to the allocation mechanism */
  amount: Scalars['BigInt']['output'];
  /** Transaction block number */
  blockNumber: Scalars['BigInt']['output'];
  /** Transaction block timestamp */
  blockTimestamp: Scalars['BigInt']['output'];
  /** Composite of transaction hash and log index */
  id: Scalars['Bytes']['output'];
  /** Transaction log index */
  logIndex: Scalars['BigInt']['output'];
  /** RegenStaker address */
  regenStaker: RegenStaker;
  /** Transaction hash */
  transactionHash: Scalars['Bytes']['output'];
};

export type Contribution_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  account?: InputMaybe<Scalars['String']['input']>;
  account_?: InputMaybe<Account_Filter>;
  account_contains?: InputMaybe<Scalars['String']['input']>;
  account_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  account_ends_with?: InputMaybe<Scalars['String']['input']>;
  account_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  account_gt?: InputMaybe<Scalars['String']['input']>;
  account_gte?: InputMaybe<Scalars['String']['input']>;
  account_in?: InputMaybe<Array<Scalars['String']['input']>>;
  account_lt?: InputMaybe<Scalars['String']['input']>;
  account_lte?: InputMaybe<Scalars['String']['input']>;
  account_not?: InputMaybe<Scalars['String']['input']>;
  account_not_contains?: InputMaybe<Scalars['String']['input']>;
  account_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  account_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  account_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  account_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  account_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  account_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  account_starts_with?: InputMaybe<Scalars['String']['input']>;
  account_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  allocationMechanism?: InputMaybe<Scalars['Bytes']['input']>;
  allocationMechanism_contains?: InputMaybe<Scalars['Bytes']['input']>;
  allocationMechanism_gt?: InputMaybe<Scalars['Bytes']['input']>;
  allocationMechanism_gte?: InputMaybe<Scalars['Bytes']['input']>;
  allocationMechanism_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  allocationMechanism_lt?: InputMaybe<Scalars['Bytes']['input']>;
  allocationMechanism_lte?: InputMaybe<Scalars['Bytes']['input']>;
  allocationMechanism_not?: InputMaybe<Scalars['Bytes']['input']>;
  allocationMechanism_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  allocationMechanism_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  amount?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  and?: InputMaybe<Array<InputMaybe<Contribution_Filter>>>;
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockTimestamp?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockTimestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
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
  logIndex?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_gt?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_gte?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  logIndex_lt?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_lte?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_not?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Contribution_Filter>>>;
  regenStaker?: InputMaybe<Scalars['String']['input']>;
  regenStaker_?: InputMaybe<RegenStaker_Filter>;
  regenStaker_contains?: InputMaybe<Scalars['String']['input']>;
  regenStaker_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  regenStaker_ends_with?: InputMaybe<Scalars['String']['input']>;
  regenStaker_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  regenStaker_gt?: InputMaybe<Scalars['String']['input']>;
  regenStaker_gte?: InputMaybe<Scalars['String']['input']>;
  regenStaker_in?: InputMaybe<Array<Scalars['String']['input']>>;
  regenStaker_lt?: InputMaybe<Scalars['String']['input']>;
  regenStaker_lte?: InputMaybe<Scalars['String']['input']>;
  regenStaker_not?: InputMaybe<Scalars['String']['input']>;
  regenStaker_not_contains?: InputMaybe<Scalars['String']['input']>;
  regenStaker_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  regenStaker_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  regenStaker_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  regenStaker_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  regenStaker_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  regenStaker_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  regenStaker_starts_with?: InputMaybe<Scalars['String']['input']>;
  regenStaker_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
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

export enum Contribution_OrderBy {
  Account = 'account',
  AccountAddress = 'account__address',
  AccountId = 'account__id',
  AllocationMechanism = 'allocationMechanism',
  Amount = 'amount',
  BlockNumber = 'blockNumber',
  BlockTimestamp = 'blockTimestamp',
  Id = 'id',
  LogIndex = 'logIndex',
  RegenStaker = 'regenStaker',
  RegenStakerAddress = 'regenStaker__address',
  RegenStakerAdmin = 'regenStaker__admin',
  RegenStakerAllocationMechanismAllowset = 'regenStaker__allocationMechanismAllowset',
  RegenStakerCreatedAtBlock = 'regenStaker__createdAtBlock',
  RegenStakerCreatedAtTimestamp = 'regenStaker__createdAtTimestamp',
  RegenStakerDeployer = 'regenStaker__deployer',
  RegenStakerDeploymentSalt = 'regenStaker__deploymentSalt',
  RegenStakerEarningPowerCalculator = 'regenStaker__earningPowerCalculator',
  RegenStakerEip712Name = 'regenStaker__eip712Name',
  RegenStakerFactoryAddress = 'regenStaker__factoryAddress',
  RegenStakerFeeAmountWei = 'regenStaker__feeAmountWei',
  RegenStakerFeeCollectorAddress = 'regenStaker__feeCollectorAddress',
  RegenStakerId = 'regenStaker__id',
  RegenStakerMaxBumpTipWei = 'regenStaker__maxBumpTipWei',
  RegenStakerMaxClaimFeeWei = 'regenStaker__maxClaimFeeWei',
  RegenStakerMinimumStakeAmountWei = 'regenStaker__minimumStakeAmountWei',
  RegenStakerPaused = 'regenStaker__paused',
  RegenStakerRewardDurationSeconds = 'regenStaker__rewardDurationSeconds',
  RegenStakerStakerAccessMode = 'regenStaker__stakerAccessMode',
  RegenStakerTotalStakedWei = 'regenStaker__totalStakedWei',
  RegenStakerVariant = 'regenStaker__variant',
  TransactionHash = 'transactionHash',
}

export type Deposit = {
  __typename?: 'Deposit';
  /** Deposit balance */
  balanceWei: Scalars['BigInt']['output'];
  /** Transaction block number */
  blockNumber: Scalars['BigInt']['output'];
  /** Transaction block timestamp */
  blockTimestamp: Scalars['BigInt']['output'];
  /** Claimer Account */
  claimer: Account;
  /** Delegatee Account */
  delegatee: Account;
  /** Deposit id */
  depositId: Scalars['BigInt']['output'];
  /** Earning power */
  earningPower: Scalars['BigInt']['output'];
  /** Deposit id bytes */
  id: Scalars['Bytes']['output'];
  /** Transaction log index */
  logIndex: Scalars['BigInt']['output'];
  /** Owner Account */
  owner: Account;
  /** RegenStaker address */
  regenStaker: RegenStaker;
  /** Transaction hash */
  transactionHash: Scalars['Bytes']['output'];
};

export type Deposit_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Deposit_Filter>>>;
  balanceWei?: InputMaybe<Scalars['BigInt']['input']>;
  balanceWei_gt?: InputMaybe<Scalars['BigInt']['input']>;
  balanceWei_gte?: InputMaybe<Scalars['BigInt']['input']>;
  balanceWei_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  balanceWei_lt?: InputMaybe<Scalars['BigInt']['input']>;
  balanceWei_lte?: InputMaybe<Scalars['BigInt']['input']>;
  balanceWei_not?: InputMaybe<Scalars['BigInt']['input']>;
  balanceWei_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockTimestamp?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockTimestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  claimer?: InputMaybe<Scalars['String']['input']>;
  claimer_?: InputMaybe<Account_Filter>;
  claimer_contains?: InputMaybe<Scalars['String']['input']>;
  claimer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  claimer_ends_with?: InputMaybe<Scalars['String']['input']>;
  claimer_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  claimer_gt?: InputMaybe<Scalars['String']['input']>;
  claimer_gte?: InputMaybe<Scalars['String']['input']>;
  claimer_in?: InputMaybe<Array<Scalars['String']['input']>>;
  claimer_lt?: InputMaybe<Scalars['String']['input']>;
  claimer_lte?: InputMaybe<Scalars['String']['input']>;
  claimer_not?: InputMaybe<Scalars['String']['input']>;
  claimer_not_contains?: InputMaybe<Scalars['String']['input']>;
  claimer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  claimer_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  claimer_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  claimer_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  claimer_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  claimer_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  claimer_starts_with?: InputMaybe<Scalars['String']['input']>;
  claimer_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  delegatee?: InputMaybe<Scalars['String']['input']>;
  delegatee_?: InputMaybe<Account_Filter>;
  delegatee_contains?: InputMaybe<Scalars['String']['input']>;
  delegatee_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  delegatee_ends_with?: InputMaybe<Scalars['String']['input']>;
  delegatee_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  delegatee_gt?: InputMaybe<Scalars['String']['input']>;
  delegatee_gte?: InputMaybe<Scalars['String']['input']>;
  delegatee_in?: InputMaybe<Array<Scalars['String']['input']>>;
  delegatee_lt?: InputMaybe<Scalars['String']['input']>;
  delegatee_lte?: InputMaybe<Scalars['String']['input']>;
  delegatee_not?: InputMaybe<Scalars['String']['input']>;
  delegatee_not_contains?: InputMaybe<Scalars['String']['input']>;
  delegatee_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  delegatee_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  delegatee_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  delegatee_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  delegatee_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  delegatee_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  delegatee_starts_with?: InputMaybe<Scalars['String']['input']>;
  delegatee_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  depositId?: InputMaybe<Scalars['BigInt']['input']>;
  depositId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  depositId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  depositId_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  depositId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  depositId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  depositId_not?: InputMaybe<Scalars['BigInt']['input']>;
  depositId_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  earningPower?: InputMaybe<Scalars['BigInt']['input']>;
  earningPower_gt?: InputMaybe<Scalars['BigInt']['input']>;
  earningPower_gte?: InputMaybe<Scalars['BigInt']['input']>;
  earningPower_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  earningPower_lt?: InputMaybe<Scalars['BigInt']['input']>;
  earningPower_lte?: InputMaybe<Scalars['BigInt']['input']>;
  earningPower_not?: InputMaybe<Scalars['BigInt']['input']>;
  earningPower_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
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
  logIndex?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_gt?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_gte?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  logIndex_lt?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_lte?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_not?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Deposit_Filter>>>;
  owner?: InputMaybe<Scalars['String']['input']>;
  owner_?: InputMaybe<Account_Filter>;
  owner_contains?: InputMaybe<Scalars['String']['input']>;
  owner_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  owner_ends_with?: InputMaybe<Scalars['String']['input']>;
  owner_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  owner_gt?: InputMaybe<Scalars['String']['input']>;
  owner_gte?: InputMaybe<Scalars['String']['input']>;
  owner_in?: InputMaybe<Array<Scalars['String']['input']>>;
  owner_lt?: InputMaybe<Scalars['String']['input']>;
  owner_lte?: InputMaybe<Scalars['String']['input']>;
  owner_not?: InputMaybe<Scalars['String']['input']>;
  owner_not_contains?: InputMaybe<Scalars['String']['input']>;
  owner_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  owner_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  owner_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  owner_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  owner_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  owner_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  owner_starts_with?: InputMaybe<Scalars['String']['input']>;
  owner_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  regenStaker?: InputMaybe<Scalars['String']['input']>;
  regenStaker_?: InputMaybe<RegenStaker_Filter>;
  regenStaker_contains?: InputMaybe<Scalars['String']['input']>;
  regenStaker_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  regenStaker_ends_with?: InputMaybe<Scalars['String']['input']>;
  regenStaker_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  regenStaker_gt?: InputMaybe<Scalars['String']['input']>;
  regenStaker_gte?: InputMaybe<Scalars['String']['input']>;
  regenStaker_in?: InputMaybe<Array<Scalars['String']['input']>>;
  regenStaker_lt?: InputMaybe<Scalars['String']['input']>;
  regenStaker_lte?: InputMaybe<Scalars['String']['input']>;
  regenStaker_not?: InputMaybe<Scalars['String']['input']>;
  regenStaker_not_contains?: InputMaybe<Scalars['String']['input']>;
  regenStaker_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  regenStaker_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  regenStaker_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  regenStaker_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  regenStaker_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  regenStaker_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  regenStaker_starts_with?: InputMaybe<Scalars['String']['input']>;
  regenStaker_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
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

export enum Deposit_OrderBy {
  BalanceWei = 'balanceWei',
  BlockNumber = 'blockNumber',
  BlockTimestamp = 'blockTimestamp',
  Claimer = 'claimer',
  ClaimerAddress = 'claimer__address',
  ClaimerId = 'claimer__id',
  Delegatee = 'delegatee',
  DelegateeAddress = 'delegatee__address',
  DelegateeId = 'delegatee__id',
  DepositId = 'depositId',
  EarningPower = 'earningPower',
  Id = 'id',
  LogIndex = 'logIndex',
  Owner = 'owner',
  OwnerAddress = 'owner__address',
  OwnerId = 'owner__id',
  RegenStaker = 'regenStaker',
  RegenStakerAddress = 'regenStaker__address',
  RegenStakerAdmin = 'regenStaker__admin',
  RegenStakerAllocationMechanismAllowset = 'regenStaker__allocationMechanismAllowset',
  RegenStakerCreatedAtBlock = 'regenStaker__createdAtBlock',
  RegenStakerCreatedAtTimestamp = 'regenStaker__createdAtTimestamp',
  RegenStakerDeployer = 'regenStaker__deployer',
  RegenStakerDeploymentSalt = 'regenStaker__deploymentSalt',
  RegenStakerEarningPowerCalculator = 'regenStaker__earningPowerCalculator',
  RegenStakerEip712Name = 'regenStaker__eip712Name',
  RegenStakerFactoryAddress = 'regenStaker__factoryAddress',
  RegenStakerFeeAmountWei = 'regenStaker__feeAmountWei',
  RegenStakerFeeCollectorAddress = 'regenStaker__feeCollectorAddress',
  RegenStakerId = 'regenStaker__id',
  RegenStakerMaxBumpTipWei = 'regenStaker__maxBumpTipWei',
  RegenStakerMaxClaimFeeWei = 'regenStaker__maxClaimFeeWei',
  RegenStakerMinimumStakeAmountWei = 'regenStaker__minimumStakeAmountWei',
  RegenStakerPaused = 'regenStaker__paused',
  RegenStakerRewardDurationSeconds = 'regenStaker__rewardDurationSeconds',
  RegenStakerStakerAccessMode = 'regenStaker__stakerAccessMode',
  RegenStakerTotalStakedWei = 'regenStaker__totalStakedWei',
  RegenStakerVariant = 'regenStaker__variant',
  TransactionHash = 'transactionHash',
}

/** Defines the order direction, either ascending or descending */
export enum OrderDirection {
  Asc = 'asc',
  Desc = 'desc',
}

export type Query = {
  __typename?: 'Query';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  account?: Maybe<Account>;
  accounts: Array<Account>;
  addressSet?: Maybe<AddressSet>;
  addressSets: Array<AddressSet>;
  asset?: Maybe<Asset>;
  assets: Array<Asset>;
  contribution?: Maybe<Contribution>;
  contributions: Array<Contribution>;
  deposit?: Maybe<Deposit>;
  deposits: Array<Deposit>;
  regenStaker?: Maybe<RegenStaker>;
  regenStakerStats?: Maybe<RegenStakerStats>;
  regenStakerStats_collection: Array<RegenStakerStats>;
  regenStakers: Array<RegenStaker>;
  transaction?: Maybe<Transaction>;
  transactions: Array<Transaction>;
  withdrawal?: Maybe<Withdrawal>;
  withdrawals: Array<Withdrawal>;
};

export type Query_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};

export type QueryAccountArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryAccountsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Account_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Account_Filter>;
};

export type QueryAddressSetArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryAddressSetsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<AddressSet_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<AddressSet_Filter>;
};

export type QueryAssetArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryAssetsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Asset_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Asset_Filter>;
};

export type QueryContributionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryContributionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Contribution_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Contribution_Filter>;
};

export type QueryDepositArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryDepositsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Deposit_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Deposit_Filter>;
};

export type QueryRegenStakerArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryRegenStakerStatsArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryRegenStakerStats_CollectionArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<RegenStakerStats_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<RegenStakerStats_Filter>;
};

export type QueryRegenStakersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<RegenStaker_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<RegenStaker_Filter>;
};

export type QueryTransactionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryTransactionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Transaction_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Transaction_Filter>;
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

/** RegenStaker entity */
export type RegenStaker = {
  __typename?: 'RegenStaker';
  /** Address of the staker */
  address: Scalars['Bytes']['output'];
  /** Admin of the staker */
  admin: Scalars['Bytes']['output'];
  /** Address of Allocation Mechanism AllowSet */
  allocationMechanismAllowset: Scalars['Bytes']['output'];
  /** Block number when the staker was deployed */
  createdAtBlock: Scalars['BigInt']['output'];
  /** Block timestamp when the staker was deployed */
  createdAtTimestamp: Scalars['BigInt']['output'];
  /** Deployer of the staker */
  deployer: Scalars['Bytes']['output'];
  /** Salt used for deployment */
  deploymentSalt: Scalars['Bytes']['output'];
  /** Address of the earning power calculator */
  earningPowerCalculator: Scalars['Bytes']['output'];
  /** Signing domain name */
  eip712Name: Scalars['String']['output'];
  /** Factory address that deployed this staker */
  factoryAddress: Scalars['Bytes']['output'];
  /** Fee amount in wei deducted from contributions */
  feeAmountWei: Scalars['BigInt']['output'];
  /** Address of the fee collector */
  feeCollectorAddress: Scalars['Bytes']['output'];
  /** RegenStaker id (address of the staker) */
  id: Scalars['Bytes']['output'];
  /** Maximum reward offered for updating a deposit's earning power */
  maxBumpTipWei: Scalars['BigInt']['output'];
  /** Max taxation allowed on rewards in wei */
  maxClaimFeeWei: Scalars['BigInt']['output'];
  /** The minimum amount of stake required to participate in the staking */
  minimumStakeAmountWei: Scalars['BigInt']['output'];
  /** Paused state of the staker */
  paused: Scalars['Boolean']['output'];
  /** The reward duration in seconds */
  rewardDurationSeconds: Scalars['BigInt']['output'];
  /** Asset distributed as rewards */
  rewardsToken: Asset;
  /** Asset staked */
  stakeToken: Asset;
  /** Access mode - NONE, ALLOWSET, BLOCKSET */
  stakerAccessMode: AccessMode;
  /** list of allowset addresses (null if accessMode is not ALLOWSET) */
  stakerAllowset?: Maybe<AddressSet>;
  /** list of blockset addresses (null if accessMode is not BLOCKSET) */
  stakerBlockset?: Maybe<AddressSet>;
  /** Total staked */
  totalStakedWei: Scalars['BigInt']['output'];
  /** Variant of the staker. Can be WITHOUT_DELEGATION or WITH_DELEGATION */
  variant: RegenStakerVariant;
  /** Only available for Staker with delegation ('WITH_DELEGATION') variant */
  votingToken?: Maybe<Asset>;
};

export type RegenStakerStats = {
  __typename?: 'RegenStakerStats';
  /** Singleton id, use `global` */
  id: Scalars['ID']['output'];
  /** Number of stakers indexed by the subgraph */
  stakerCount: Scalars['BigInt']['output'];
};

export type RegenStakerStats_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<RegenStakerStats_Filter>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<RegenStakerStats_Filter>>>;
  stakerCount?: InputMaybe<Scalars['BigInt']['input']>;
  stakerCount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  stakerCount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  stakerCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  stakerCount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  stakerCount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  stakerCount_not?: InputMaybe<Scalars['BigInt']['input']>;
  stakerCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

export enum RegenStakerStats_OrderBy {
  Id = 'id',
  StakerCount = 'stakerCount',
}

/** Represents Solidity enum RegenStakerVariant as readable values */
export enum RegenStakerVariant {
  WithoutDelegation = 'WITHOUT_DELEGATION',
  WithDelegation = 'WITH_DELEGATION',
}

export type RegenStaker_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  address?: InputMaybe<Scalars['Bytes']['input']>;
  address_contains?: InputMaybe<Scalars['Bytes']['input']>;
  address_gt?: InputMaybe<Scalars['Bytes']['input']>;
  address_gte?: InputMaybe<Scalars['Bytes']['input']>;
  address_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  address_lt?: InputMaybe<Scalars['Bytes']['input']>;
  address_lte?: InputMaybe<Scalars['Bytes']['input']>;
  address_not?: InputMaybe<Scalars['Bytes']['input']>;
  address_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  address_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  admin?: InputMaybe<Scalars['Bytes']['input']>;
  admin_contains?: InputMaybe<Scalars['Bytes']['input']>;
  admin_gt?: InputMaybe<Scalars['Bytes']['input']>;
  admin_gte?: InputMaybe<Scalars['Bytes']['input']>;
  admin_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  admin_lt?: InputMaybe<Scalars['Bytes']['input']>;
  admin_lte?: InputMaybe<Scalars['Bytes']['input']>;
  admin_not?: InputMaybe<Scalars['Bytes']['input']>;
  admin_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  admin_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  allocationMechanismAllowset?: InputMaybe<Scalars['Bytes']['input']>;
  allocationMechanismAllowset_contains?: InputMaybe<Scalars['Bytes']['input']>;
  allocationMechanismAllowset_gt?: InputMaybe<Scalars['Bytes']['input']>;
  allocationMechanismAllowset_gte?: InputMaybe<Scalars['Bytes']['input']>;
  allocationMechanismAllowset_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  allocationMechanismAllowset_lt?: InputMaybe<Scalars['Bytes']['input']>;
  allocationMechanismAllowset_lte?: InputMaybe<Scalars['Bytes']['input']>;
  allocationMechanismAllowset_not?: InputMaybe<Scalars['Bytes']['input']>;
  allocationMechanismAllowset_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  allocationMechanismAllowset_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  and?: InputMaybe<Array<InputMaybe<RegenStaker_Filter>>>;
  createdAtBlock?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtBlock_gt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtBlock_gte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtBlock_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAtBlock_lt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtBlock_lte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtBlock_not?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtBlock_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAtTimestamp?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAtTimestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  deployer?: InputMaybe<Scalars['Bytes']['input']>;
  deployer_contains?: InputMaybe<Scalars['Bytes']['input']>;
  deployer_gt?: InputMaybe<Scalars['Bytes']['input']>;
  deployer_gte?: InputMaybe<Scalars['Bytes']['input']>;
  deployer_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  deployer_lt?: InputMaybe<Scalars['Bytes']['input']>;
  deployer_lte?: InputMaybe<Scalars['Bytes']['input']>;
  deployer_not?: InputMaybe<Scalars['Bytes']['input']>;
  deployer_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  deployer_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  deploymentSalt?: InputMaybe<Scalars['Bytes']['input']>;
  deploymentSalt_contains?: InputMaybe<Scalars['Bytes']['input']>;
  deploymentSalt_gt?: InputMaybe<Scalars['Bytes']['input']>;
  deploymentSalt_gte?: InputMaybe<Scalars['Bytes']['input']>;
  deploymentSalt_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  deploymentSalt_lt?: InputMaybe<Scalars['Bytes']['input']>;
  deploymentSalt_lte?: InputMaybe<Scalars['Bytes']['input']>;
  deploymentSalt_not?: InputMaybe<Scalars['Bytes']['input']>;
  deploymentSalt_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  deploymentSalt_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  earningPowerCalculator?: InputMaybe<Scalars['Bytes']['input']>;
  earningPowerCalculator_contains?: InputMaybe<Scalars['Bytes']['input']>;
  earningPowerCalculator_gt?: InputMaybe<Scalars['Bytes']['input']>;
  earningPowerCalculator_gte?: InputMaybe<Scalars['Bytes']['input']>;
  earningPowerCalculator_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  earningPowerCalculator_lt?: InputMaybe<Scalars['Bytes']['input']>;
  earningPowerCalculator_lte?: InputMaybe<Scalars['Bytes']['input']>;
  earningPowerCalculator_not?: InputMaybe<Scalars['Bytes']['input']>;
  earningPowerCalculator_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  earningPowerCalculator_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  eip712Name?: InputMaybe<Scalars['String']['input']>;
  eip712Name_contains?: InputMaybe<Scalars['String']['input']>;
  eip712Name_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  eip712Name_ends_with?: InputMaybe<Scalars['String']['input']>;
  eip712Name_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  eip712Name_gt?: InputMaybe<Scalars['String']['input']>;
  eip712Name_gte?: InputMaybe<Scalars['String']['input']>;
  eip712Name_in?: InputMaybe<Array<Scalars['String']['input']>>;
  eip712Name_lt?: InputMaybe<Scalars['String']['input']>;
  eip712Name_lte?: InputMaybe<Scalars['String']['input']>;
  eip712Name_not?: InputMaybe<Scalars['String']['input']>;
  eip712Name_not_contains?: InputMaybe<Scalars['String']['input']>;
  eip712Name_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  eip712Name_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  eip712Name_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  eip712Name_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  eip712Name_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  eip712Name_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  eip712Name_starts_with?: InputMaybe<Scalars['String']['input']>;
  eip712Name_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  factoryAddress?: InputMaybe<Scalars['Bytes']['input']>;
  factoryAddress_contains?: InputMaybe<Scalars['Bytes']['input']>;
  factoryAddress_gt?: InputMaybe<Scalars['Bytes']['input']>;
  factoryAddress_gte?: InputMaybe<Scalars['Bytes']['input']>;
  factoryAddress_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  factoryAddress_lt?: InputMaybe<Scalars['Bytes']['input']>;
  factoryAddress_lte?: InputMaybe<Scalars['Bytes']['input']>;
  factoryAddress_not?: InputMaybe<Scalars['Bytes']['input']>;
  factoryAddress_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  factoryAddress_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  feeAmountWei?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmountWei_gt?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmountWei_gte?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmountWei_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feeAmountWei_lt?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmountWei_lte?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmountWei_not?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmountWei_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feeCollectorAddress?: InputMaybe<Scalars['Bytes']['input']>;
  feeCollectorAddress_contains?: InputMaybe<Scalars['Bytes']['input']>;
  feeCollectorAddress_gt?: InputMaybe<Scalars['Bytes']['input']>;
  feeCollectorAddress_gte?: InputMaybe<Scalars['Bytes']['input']>;
  feeCollectorAddress_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  feeCollectorAddress_lt?: InputMaybe<Scalars['Bytes']['input']>;
  feeCollectorAddress_lte?: InputMaybe<Scalars['Bytes']['input']>;
  feeCollectorAddress_not?: InputMaybe<Scalars['Bytes']['input']>;
  feeCollectorAddress_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  feeCollectorAddress_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
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
  maxBumpTipWei?: InputMaybe<Scalars['BigInt']['input']>;
  maxBumpTipWei_gt?: InputMaybe<Scalars['BigInt']['input']>;
  maxBumpTipWei_gte?: InputMaybe<Scalars['BigInt']['input']>;
  maxBumpTipWei_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  maxBumpTipWei_lt?: InputMaybe<Scalars['BigInt']['input']>;
  maxBumpTipWei_lte?: InputMaybe<Scalars['BigInt']['input']>;
  maxBumpTipWei_not?: InputMaybe<Scalars['BigInt']['input']>;
  maxBumpTipWei_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  maxClaimFeeWei?: InputMaybe<Scalars['BigInt']['input']>;
  maxClaimFeeWei_gt?: InputMaybe<Scalars['BigInt']['input']>;
  maxClaimFeeWei_gte?: InputMaybe<Scalars['BigInt']['input']>;
  maxClaimFeeWei_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  maxClaimFeeWei_lt?: InputMaybe<Scalars['BigInt']['input']>;
  maxClaimFeeWei_lte?: InputMaybe<Scalars['BigInt']['input']>;
  maxClaimFeeWei_not?: InputMaybe<Scalars['BigInt']['input']>;
  maxClaimFeeWei_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  minimumStakeAmountWei?: InputMaybe<Scalars['BigInt']['input']>;
  minimumStakeAmountWei_gt?: InputMaybe<Scalars['BigInt']['input']>;
  minimumStakeAmountWei_gte?: InputMaybe<Scalars['BigInt']['input']>;
  minimumStakeAmountWei_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  minimumStakeAmountWei_lt?: InputMaybe<Scalars['BigInt']['input']>;
  minimumStakeAmountWei_lte?: InputMaybe<Scalars['BigInt']['input']>;
  minimumStakeAmountWei_not?: InputMaybe<Scalars['BigInt']['input']>;
  minimumStakeAmountWei_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<RegenStaker_Filter>>>;
  paused?: InputMaybe<Scalars['Boolean']['input']>;
  paused_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  paused_not?: InputMaybe<Scalars['Boolean']['input']>;
  paused_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  rewardDurationSeconds?: InputMaybe<Scalars['BigInt']['input']>;
  rewardDurationSeconds_gt?: InputMaybe<Scalars['BigInt']['input']>;
  rewardDurationSeconds_gte?: InputMaybe<Scalars['BigInt']['input']>;
  rewardDurationSeconds_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  rewardDurationSeconds_lt?: InputMaybe<Scalars['BigInt']['input']>;
  rewardDurationSeconds_lte?: InputMaybe<Scalars['BigInt']['input']>;
  rewardDurationSeconds_not?: InputMaybe<Scalars['BigInt']['input']>;
  rewardDurationSeconds_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  rewardsToken?: InputMaybe<Scalars['String']['input']>;
  rewardsToken_?: InputMaybe<Asset_Filter>;
  rewardsToken_contains?: InputMaybe<Scalars['String']['input']>;
  rewardsToken_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  rewardsToken_ends_with?: InputMaybe<Scalars['String']['input']>;
  rewardsToken_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  rewardsToken_gt?: InputMaybe<Scalars['String']['input']>;
  rewardsToken_gte?: InputMaybe<Scalars['String']['input']>;
  rewardsToken_in?: InputMaybe<Array<Scalars['String']['input']>>;
  rewardsToken_lt?: InputMaybe<Scalars['String']['input']>;
  rewardsToken_lte?: InputMaybe<Scalars['String']['input']>;
  rewardsToken_not?: InputMaybe<Scalars['String']['input']>;
  rewardsToken_not_contains?: InputMaybe<Scalars['String']['input']>;
  rewardsToken_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  rewardsToken_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  rewardsToken_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  rewardsToken_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  rewardsToken_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  rewardsToken_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  rewardsToken_starts_with?: InputMaybe<Scalars['String']['input']>;
  rewardsToken_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  stakeToken?: InputMaybe<Scalars['String']['input']>;
  stakeToken_?: InputMaybe<Asset_Filter>;
  stakeToken_contains?: InputMaybe<Scalars['String']['input']>;
  stakeToken_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  stakeToken_ends_with?: InputMaybe<Scalars['String']['input']>;
  stakeToken_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  stakeToken_gt?: InputMaybe<Scalars['String']['input']>;
  stakeToken_gte?: InputMaybe<Scalars['String']['input']>;
  stakeToken_in?: InputMaybe<Array<Scalars['String']['input']>>;
  stakeToken_lt?: InputMaybe<Scalars['String']['input']>;
  stakeToken_lte?: InputMaybe<Scalars['String']['input']>;
  stakeToken_not?: InputMaybe<Scalars['String']['input']>;
  stakeToken_not_contains?: InputMaybe<Scalars['String']['input']>;
  stakeToken_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  stakeToken_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  stakeToken_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  stakeToken_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  stakeToken_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  stakeToken_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  stakeToken_starts_with?: InputMaybe<Scalars['String']['input']>;
  stakeToken_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  stakerAccessMode?: InputMaybe<AccessMode>;
  stakerAccessMode_in?: InputMaybe<Array<AccessMode>>;
  stakerAccessMode_not?: InputMaybe<AccessMode>;
  stakerAccessMode_not_in?: InputMaybe<Array<AccessMode>>;
  stakerAllowset?: InputMaybe<Scalars['String']['input']>;
  stakerAllowset_?: InputMaybe<AddressSet_Filter>;
  stakerAllowset_contains?: InputMaybe<Scalars['String']['input']>;
  stakerAllowset_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  stakerAllowset_ends_with?: InputMaybe<Scalars['String']['input']>;
  stakerAllowset_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  stakerAllowset_gt?: InputMaybe<Scalars['String']['input']>;
  stakerAllowset_gte?: InputMaybe<Scalars['String']['input']>;
  stakerAllowset_in?: InputMaybe<Array<Scalars['String']['input']>>;
  stakerAllowset_lt?: InputMaybe<Scalars['String']['input']>;
  stakerAllowset_lte?: InputMaybe<Scalars['String']['input']>;
  stakerAllowset_not?: InputMaybe<Scalars['String']['input']>;
  stakerAllowset_not_contains?: InputMaybe<Scalars['String']['input']>;
  stakerAllowset_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  stakerAllowset_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  stakerAllowset_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  stakerAllowset_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  stakerAllowset_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  stakerAllowset_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  stakerAllowset_starts_with?: InputMaybe<Scalars['String']['input']>;
  stakerAllowset_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  stakerBlockset?: InputMaybe<Scalars['String']['input']>;
  stakerBlockset_?: InputMaybe<AddressSet_Filter>;
  stakerBlockset_contains?: InputMaybe<Scalars['String']['input']>;
  stakerBlockset_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  stakerBlockset_ends_with?: InputMaybe<Scalars['String']['input']>;
  stakerBlockset_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  stakerBlockset_gt?: InputMaybe<Scalars['String']['input']>;
  stakerBlockset_gte?: InputMaybe<Scalars['String']['input']>;
  stakerBlockset_in?: InputMaybe<Array<Scalars['String']['input']>>;
  stakerBlockset_lt?: InputMaybe<Scalars['String']['input']>;
  stakerBlockset_lte?: InputMaybe<Scalars['String']['input']>;
  stakerBlockset_not?: InputMaybe<Scalars['String']['input']>;
  stakerBlockset_not_contains?: InputMaybe<Scalars['String']['input']>;
  stakerBlockset_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  stakerBlockset_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  stakerBlockset_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  stakerBlockset_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  stakerBlockset_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  stakerBlockset_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  stakerBlockset_starts_with?: InputMaybe<Scalars['String']['input']>;
  stakerBlockset_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  totalStakedWei?: InputMaybe<Scalars['BigInt']['input']>;
  totalStakedWei_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalStakedWei_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalStakedWei_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalStakedWei_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalStakedWei_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalStakedWei_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalStakedWei_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  variant?: InputMaybe<RegenStakerVariant>;
  variant_in?: InputMaybe<Array<RegenStakerVariant>>;
  variant_not?: InputMaybe<RegenStakerVariant>;
  variant_not_in?: InputMaybe<Array<RegenStakerVariant>>;
  votingToken?: InputMaybe<Scalars['String']['input']>;
  votingToken_?: InputMaybe<Asset_Filter>;
  votingToken_contains?: InputMaybe<Scalars['String']['input']>;
  votingToken_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  votingToken_ends_with?: InputMaybe<Scalars['String']['input']>;
  votingToken_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  votingToken_gt?: InputMaybe<Scalars['String']['input']>;
  votingToken_gte?: InputMaybe<Scalars['String']['input']>;
  votingToken_in?: InputMaybe<Array<Scalars['String']['input']>>;
  votingToken_lt?: InputMaybe<Scalars['String']['input']>;
  votingToken_lte?: InputMaybe<Scalars['String']['input']>;
  votingToken_not?: InputMaybe<Scalars['String']['input']>;
  votingToken_not_contains?: InputMaybe<Scalars['String']['input']>;
  votingToken_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  votingToken_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  votingToken_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  votingToken_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  votingToken_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  votingToken_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  votingToken_starts_with?: InputMaybe<Scalars['String']['input']>;
  votingToken_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum RegenStaker_OrderBy {
  Address = 'address',
  Admin = 'admin',
  AllocationMechanismAllowset = 'allocationMechanismAllowset',
  CreatedAtBlock = 'createdAtBlock',
  CreatedAtTimestamp = 'createdAtTimestamp',
  Deployer = 'deployer',
  DeploymentSalt = 'deploymentSalt',
  EarningPowerCalculator = 'earningPowerCalculator',
  Eip712Name = 'eip712Name',
  FactoryAddress = 'factoryAddress',
  FeeAmountWei = 'feeAmountWei',
  FeeCollectorAddress = 'feeCollectorAddress',
  Id = 'id',
  MaxBumpTipWei = 'maxBumpTipWei',
  MaxClaimFeeWei = 'maxClaimFeeWei',
  MinimumStakeAmountWei = 'minimumStakeAmountWei',
  Paused = 'paused',
  RewardDurationSeconds = 'rewardDurationSeconds',
  RewardsToken = 'rewardsToken',
  RewardsTokenAddress = 'rewardsToken__address',
  RewardsTokenDecimals = 'rewardsToken__decimals',
  RewardsTokenId = 'rewardsToken__id',
  RewardsTokenName = 'rewardsToken__name',
  RewardsTokenSymbol = 'rewardsToken__symbol',
  StakeToken = 'stakeToken',
  StakeTokenAddress = 'stakeToken__address',
  StakeTokenDecimals = 'stakeToken__decimals',
  StakeTokenId = 'stakeToken__id',
  StakeTokenName = 'stakeToken__name',
  StakeTokenSymbol = 'stakeToken__symbol',
  StakerAccessMode = 'stakerAccessMode',
  StakerAllowset = 'stakerAllowset',
  StakerAllowsetContractAddress = 'stakerAllowset__contractAddress',
  StakerAllowsetId = 'stakerAllowset__id',
  StakerBlockset = 'stakerBlockset',
  StakerBlocksetContractAddress = 'stakerBlockset__contractAddress',
  StakerBlocksetId = 'stakerBlockset__id',
  TotalStakedWei = 'totalStakedWei',
  Variant = 'variant',
  VotingToken = 'votingToken',
  VotingTokenAddress = 'votingToken__address',
  VotingTokenDecimals = 'votingToken__decimals',
  VotingTokenId = 'votingToken__id',
  VotingTokenName = 'votingToken__name',
  VotingTokenSymbol = 'votingToken__symbol',
}

export type Transaction = {
  __typename?: 'Transaction';
  /** Amount of the asset being transacted */
  amount: Scalars['BigInt']['output'];
  /** Asset being transacted */
  asset: Asset;
  /** Transaction block number */
  blockNumber: Scalars['BigInt']['output'];
  /** Transaction block timestamp */
  blockTimestamp: Scalars['BigInt']['output'];
  /** Caller of the action */
  caller: Scalars['Bytes']['output'];
  /** Composite of transaction hash and log index */
  id: Scalars['Bytes']['output'];
  /** Transaction receiver */
  receiver: Scalars['Bytes']['output'];
  /** Transaction hash */
  transactionHash: Scalars['Bytes']['output'];
  /** Transaction type enum of DEPOSIT, WITHDRAW */
  type: TransactionType;
};

export enum TransactionType {
  ClaimReward = 'CLAIM_REWARD',
  Stake = 'STAKE',
  StakeMore = 'STAKE_MORE',
  Withdraw = 'WITHDRAW',
}

export type Transaction_Filter = {
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
  and?: InputMaybe<Array<InputMaybe<Transaction_Filter>>>;
  asset?: InputMaybe<Scalars['String']['input']>;
  asset_?: InputMaybe<Asset_Filter>;
  asset_contains?: InputMaybe<Scalars['String']['input']>;
  asset_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  asset_ends_with?: InputMaybe<Scalars['String']['input']>;
  asset_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  asset_gt?: InputMaybe<Scalars['String']['input']>;
  asset_gte?: InputMaybe<Scalars['String']['input']>;
  asset_in?: InputMaybe<Array<Scalars['String']['input']>>;
  asset_lt?: InputMaybe<Scalars['String']['input']>;
  asset_lte?: InputMaybe<Scalars['String']['input']>;
  asset_not?: InputMaybe<Scalars['String']['input']>;
  asset_not_contains?: InputMaybe<Scalars['String']['input']>;
  asset_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  asset_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  asset_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  asset_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  asset_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  asset_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  asset_starts_with?: InputMaybe<Scalars['String']['input']>;
  asset_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockTimestamp?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockTimestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  caller?: InputMaybe<Scalars['Bytes']['input']>;
  caller_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_gte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  caller_lt?: InputMaybe<Scalars['Bytes']['input']>;
  caller_lte?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  caller_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
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
  or?: InputMaybe<Array<InputMaybe<Transaction_Filter>>>;
  receiver?: InputMaybe<Scalars['Bytes']['input']>;
  receiver_contains?: InputMaybe<Scalars['Bytes']['input']>;
  receiver_gt?: InputMaybe<Scalars['Bytes']['input']>;
  receiver_gte?: InputMaybe<Scalars['Bytes']['input']>;
  receiver_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  receiver_lt?: InputMaybe<Scalars['Bytes']['input']>;
  receiver_lte?: InputMaybe<Scalars['Bytes']['input']>;
  receiver_not?: InputMaybe<Scalars['Bytes']['input']>;
  receiver_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  receiver_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
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
  type?: InputMaybe<TransactionType>;
  type_in?: InputMaybe<Array<TransactionType>>;
  type_not?: InputMaybe<TransactionType>;
  type_not_in?: InputMaybe<Array<TransactionType>>;
};

export enum Transaction_OrderBy {
  Amount = 'amount',
  Asset = 'asset',
  AssetAddress = 'asset__address',
  AssetDecimals = 'asset__decimals',
  AssetId = 'asset__id',
  AssetName = 'asset__name',
  AssetSymbol = 'asset__symbol',
  BlockNumber = 'blockNumber',
  BlockTimestamp = 'blockTimestamp',
  Caller = 'caller',
  Id = 'id',
  Receiver = 'receiver',
  TransactionHash = 'transactionHash',
  Type = 'type',
}

/** Withdrawals from a RegenStaker */
export type Withdrawal = {
  __typename?: 'Withdrawal';
  /** Amount withdrawn */
  amount: Scalars['BigInt']['output'];
  /** Transaction block number */
  blockNumber: Scalars['BigInt']['output'];
  /** Transaction block timestamp */
  blockTimestamp: Scalars['BigInt']['output'];
  /** Deposit id */
  deposit: Deposit;
  /** Composite of transaction hash and log index */
  id: Scalars['Bytes']['output'];
  /** Transaction log index */
  logIndex: Scalars['BigInt']['output'];
  /** Transaction hash */
  transactionHash: Scalars['Bytes']['output'];
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
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockTimestamp?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockTimestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  deposit?: InputMaybe<Scalars['String']['input']>;
  deposit_?: InputMaybe<Deposit_Filter>;
  deposit_contains?: InputMaybe<Scalars['String']['input']>;
  deposit_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  deposit_ends_with?: InputMaybe<Scalars['String']['input']>;
  deposit_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  deposit_gt?: InputMaybe<Scalars['String']['input']>;
  deposit_gte?: InputMaybe<Scalars['String']['input']>;
  deposit_in?: InputMaybe<Array<Scalars['String']['input']>>;
  deposit_lt?: InputMaybe<Scalars['String']['input']>;
  deposit_lte?: InputMaybe<Scalars['String']['input']>;
  deposit_not?: InputMaybe<Scalars['String']['input']>;
  deposit_not_contains?: InputMaybe<Scalars['String']['input']>;
  deposit_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  deposit_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  deposit_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  deposit_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  deposit_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  deposit_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  deposit_starts_with?: InputMaybe<Scalars['String']['input']>;
  deposit_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
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
  logIndex?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_gt?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_gte?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  logIndex_lt?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_lte?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_not?: InputMaybe<Scalars['BigInt']['input']>;
  logIndex_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Withdrawal_Filter>>>;
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

export enum Withdrawal_OrderBy {
  Amount = 'amount',
  BlockNumber = 'blockNumber',
  BlockTimestamp = 'blockTimestamp',
  Deposit = 'deposit',
  DepositBalanceWei = 'deposit__balanceWei',
  DepositBlockNumber = 'deposit__blockNumber',
  DepositBlockTimestamp = 'deposit__blockTimestamp',
  DepositDepositId = 'deposit__depositId',
  DepositEarningPower = 'deposit__earningPower',
  DepositId = 'deposit__id',
  DepositLogIndex = 'deposit__logIndex',
  DepositTransactionHash = 'deposit__transactionHash',
  Id = 'id',
  LogIndex = 'logIndex',
  TransactionHash = 'transactionHash',
}

export type _Block_ = {
  __typename?: '_Block_';
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']['output']>;
  /** The block number */
  number: Scalars['Int']['output'];
  /** The hash of the parent block */
  parentHash?: Maybe<Scalars['Bytes']['output']>;
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

export type DepositsQueryVariables = Exact<{
  owner: Scalars['String']['input'];
  regenStaker: Scalars['String']['input'];
}>;

export type DepositsQuery = {
  __typename?: 'Query';
  deposits: Array<{ __typename?: 'Deposit'; id: any; depositId: any; balanceWei: any }>;
};

export const DepositsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Deposits' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'owner' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'regenStaker' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deposits' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'owner' },
                      value: { kind: 'Variable', name: { kind: 'Name', value: 'owner' } },
                    },
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'regenStaker' },
                      value: { kind: 'Variable', name: { kind: 'Name', value: 'regenStaker' } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'depositId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'balanceWei' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DepositsQuery, DepositsQueryVariables>;

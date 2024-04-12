/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
  '\n  query GetProjectsMetadataAccumulateds {\n    projectsMetadataAccumulateds {\n      projectsAddresses\n    }\n  }\n':
    types.GetProjectsMetadataAccumulatedsDocument,
  '\n  query GetBlockNumber {\n    _meta {\n      block {\n        number\n      }\n    }\n  }\n':
    types.GetBlockNumberDocument,
  '\n  query GetEpochTimestampHappenedIn($timestamp: BigInt) {\n    epoches(where: { fromTs_lte: $timestamp, toTs_gte: $timestamp }) {\n      epoch\n    }\n  }\n':
    types.GetEpochTimestampHappenedInDocument,
  '\n  query GetEpoches {\n    epoches {\n      epoch\n    }\n  }\n': types.GetEpochesDocument,
  '\n  query GetEpochsStartEndTime($lastEpoch: Int) {\n    epoches(first: $lastEpoch) {\n      epoch\n      toTs\n      fromTs\n      decisionWindow\n    }\n  }\n':
    types.GetEpochsStartEndTimeDocument,
  '\n  query GetLargestLockedAmount {\n    lockeds(orderBy: amount, orderDirection: desc, first: 1) {\n      amount\n    }\n  }\n':
    types.GetLargestLockedAmountDocument,
  '\n  query GetLockedSummaryLatest {\n    lockedSummaryLatest(id: "latest") {\n      id\n      lockedTotal\n      lockedRatio\n    }\n  }\n':
    types.GetLockedSummaryLatestDocument,
  '\n  query GetLockedSummarySnapshots($first: Int = 1000, $skip: Int = 0) {\n    lockedSummarySnapshots(first: $first, skip: $skip, orderBy: timestamp) {\n      lockedTotal\n      timestamp\n    }\n  }\n':
    types.GetLockedSummarySnapshotsDocument,
  '\n  query GetLockedsData($first: Int = 100, $skip: Int = 0) {\n    lockeds(first: $first, skip: $skip) {\n      user\n      timestamp\n      amount\n    }\n  }\n':
    types.GetLockedsDataDocument,
  '\n  query GetProjectsMetadataPerEpoches {\n    projectsMetadataPerEpoches(orderBy: epoch, orderDirection: asc) {\n      epoch\n      proposalsCid\n    }\n  }\n':
    types.GetProjectsMetadataPerEpochesDocument,
  '\n  query GetUserWithdrawals($address: Bytes) {\n    withdrawals(where: { user: $address }) {\n      amount\n    }\n  }\n':
    types.GetUserWithdrawalsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetProjectsMetadataAccumulateds {\n    projectsMetadataAccumulateds {\n      projectsAddresses\n    }\n  }\n',
): (typeof documents)['\n  query GetProjectsMetadataAccumulateds {\n    projectsMetadataAccumulateds {\n      projectsAddresses\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetBlockNumber {\n    _meta {\n      block {\n        number\n      }\n    }\n  }\n',
): (typeof documents)['\n  query GetBlockNumber {\n    _meta {\n      block {\n        number\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetEpochTimestampHappenedIn($timestamp: BigInt) {\n    epoches(where: { fromTs_lte: $timestamp, toTs_gte: $timestamp }) {\n      epoch\n    }\n  }\n',
): (typeof documents)['\n  query GetEpochTimestampHappenedIn($timestamp: BigInt) {\n    epoches(where: { fromTs_lte: $timestamp, toTs_gte: $timestamp }) {\n      epoch\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetEpoches {\n    epoches {\n      epoch\n    }\n  }\n',
): (typeof documents)['\n  query GetEpoches {\n    epoches {\n      epoch\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetEpochsStartEndTime($lastEpoch: Int) {\n    epoches(first: $lastEpoch) {\n      epoch\n      toTs\n      fromTs\n      decisionWindow\n    }\n  }\n',
): (typeof documents)['\n  query GetEpochsStartEndTime($lastEpoch: Int) {\n    epoches(first: $lastEpoch) {\n      epoch\n      toTs\n      fromTs\n      decisionWindow\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetLargestLockedAmount {\n    lockeds(orderBy: amount, orderDirection: desc, first: 1) {\n      amount\n    }\n  }\n',
): (typeof documents)['\n  query GetLargestLockedAmount {\n    lockeds(orderBy: amount, orderDirection: desc, first: 1) {\n      amount\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetLockedSummaryLatest {\n    lockedSummaryLatest(id: "latest") {\n      id\n      lockedTotal\n      lockedRatio\n    }\n  }\n',
): (typeof documents)['\n  query GetLockedSummaryLatest {\n    lockedSummaryLatest(id: "latest") {\n      id\n      lockedTotal\n      lockedRatio\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetLockedSummarySnapshots($first: Int = 1000, $skip: Int = 0) {\n    lockedSummarySnapshots(first: $first, skip: $skip, orderBy: timestamp) {\n      lockedTotal\n      timestamp\n    }\n  }\n',
): (typeof documents)['\n  query GetLockedSummarySnapshots($first: Int = 1000, $skip: Int = 0) {\n    lockedSummarySnapshots(first: $first, skip: $skip, orderBy: timestamp) {\n      lockedTotal\n      timestamp\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetLockedsData($first: Int = 100, $skip: Int = 0) {\n    lockeds(first: $first, skip: $skip) {\n      user\n      timestamp\n      amount\n    }\n  }\n',
): (typeof documents)['\n  query GetLockedsData($first: Int = 100, $skip: Int = 0) {\n    lockeds(first: $first, skip: $skip) {\n      user\n      timestamp\n      amount\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetProjectsMetadataPerEpoches {\n    projectsMetadataPerEpoches(orderBy: epoch, orderDirection: asc) {\n      epoch\n      proposalsCid\n    }\n  }\n',
): (typeof documents)['\n  query GetProjectsMetadataPerEpoches {\n    projectsMetadataPerEpoches(orderBy: epoch, orderDirection: asc) {\n      epoch\n      proposalsCid\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetUserWithdrawals($address: Bytes) {\n    withdrawals(where: { user: $address }) {\n      amount\n    }\n  }\n',
): (typeof documents)['\n  query GetUserWithdrawals($address: Bytes) {\n    withdrawals(where: { user: $address }) {\n      amount\n    }\n  }\n'];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;

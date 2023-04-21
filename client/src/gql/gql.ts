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
  '\n  fragment AllocatedFields on Allocated {\n    allocation\n    blockTimestamp\n    proposal\n    user\n  }\n':
    types.AllocatedFieldsFragmentDoc,
  '\n  query GetProposalAllocations($blockTimestamp: Int = 0, $proposalAddress: Bytes!) {\n    allocateds(\n      orderBy: blockTimestamp\n      where: { proposal: $proposalAddress, blockTimestamp_gte: $blockTimestamp }\n    ) {\n      ...AllocatedFields\n    }\n  }\n':
    types.GetProposalAllocationsDocument,
  '\n  query GetUserAllocations($userAddress: Bytes!) {\n    allocateds(orderBy: blockTimestamp, where: { user: $userAddress }) {\n      ...AllocatedFields\n    }\n  }\n':
    types.GetUserAllocationsDocument,
  '\n  query GetLocks($userAddress: Bytes!) {\n    lockeds(orderBy: blockTimestamp, where: { user: $userAddress }) {\n      amount\n      blockTimestamp\n    }\n  }\n':
    types.GetLocksDocument,
  '\n  query GetUnlocks($userAddress: Bytes!) {\n    unlockeds(orderBy: blockTimestamp, where: { user: $userAddress }) {\n      amount\n      blockTimestamp\n    }\n  }\n':
    types.GetUnlocksDocument,
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
  source: '\n  fragment AllocatedFields on Allocated {\n    allocation\n    blockTimestamp\n    proposal\n    user\n  }\n',
): (typeof documents)['\n  fragment AllocatedFields on Allocated {\n    allocation\n    blockTimestamp\n    proposal\n    user\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetProposalAllocations($blockTimestamp: Int = 0, $proposalAddress: Bytes!) {\n    allocateds(\n      orderBy: blockTimestamp\n      where: { proposal: $proposalAddress, blockTimestamp_gte: $blockTimestamp }\n    ) {\n      ...AllocatedFields\n    }\n  }\n',
): (typeof documents)['\n  query GetProposalAllocations($blockTimestamp: Int = 0, $proposalAddress: Bytes!) {\n    allocateds(\n      orderBy: blockTimestamp\n      where: { proposal: $proposalAddress, blockTimestamp_gte: $blockTimestamp }\n    ) {\n      ...AllocatedFields\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetUserAllocations($userAddress: Bytes!) {\n    allocateds(orderBy: blockTimestamp, where: { user: $userAddress }) {\n      ...AllocatedFields\n    }\n  }\n',
): (typeof documents)['\n  query GetUserAllocations($userAddress: Bytes!) {\n    allocateds(orderBy: blockTimestamp, where: { user: $userAddress }) {\n      ...AllocatedFields\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetLocks($userAddress: Bytes!) {\n    lockeds(orderBy: blockTimestamp, where: { user: $userAddress }) {\n      amount\n      blockTimestamp\n    }\n  }\n',
): (typeof documents)['\n  query GetLocks($userAddress: Bytes!) {\n    lockeds(orderBy: blockTimestamp, where: { user: $userAddress }) {\n      amount\n      blockTimestamp\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetUnlocks($userAddress: Bytes!) {\n    unlockeds(orderBy: blockTimestamp, where: { user: $userAddress }) {\n      amount\n      blockTimestamp\n    }\n  }\n',
): (typeof documents)['\n  query GetUnlocks($userAddress: Bytes!) {\n    unlockeds(orderBy: blockTimestamp, where: { user: $userAddress }) {\n      amount\n      blockTimestamp\n    }\n  }\n'];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;

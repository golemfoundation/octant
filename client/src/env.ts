import { Env, EnvViteKeys } from 'types/env';

export const envsAllowedToBeEmpty = ['VITE_JSON_RPC_ENDPOINT'];

export const envViteKeys: EnvViteKeys = {
  alchemyId: 'VITE_ALCHEMY_ID',
  areCurrentEpochsProjectsVisible: 'VITE_ARE_CURRENT_EPOCHS_PROJECTS_VISIBLE',
  contractDepositsAddress: 'VITE_DEPOSITS_ADDRESS',
  contractEpochsAddress: 'VITE_EPOCHS_ADDRESS',
  contractGlmAddress: 'VITE_GLM_ADDRESS',
  contractProposalsAddress: 'VITE_PROPOSALS_ADDRESS',
  contractVaultAddress: 'VITE_VAULT_ADDRESS',
  cryptoValuesEndpoint: 'VITE_CRYPTO_VALUES_ENDPOINT',
  ipfsGateway: 'VITE_IPFS_GATEWAY',
  jsonRpcEndpoint: 'VITE_JSON_RPC_ENDPOINT',
  network: 'VITE_NETWORK',
  serverEndpoint: 'VITE_SERVER_ENDPOINT',
  subgraphAddress: 'VITE_SUBGRAPH_ADDRESS',
  walletConnectProjectId: 'VITE_WALLET_CONNECT_PROJECT_ID',
  websocketEndpoint: 'VITE_WEBSOCKET_ENDPOINT',
};

const env: Env = {
  
  // @ts-expect-error TS does not understand the way vite imports envs.
alchemyId: import.meta.env[envViteKeys.alchemyId],
  
  // @ts-expect-error TS does not understand the way vite imports envs.
areCurrentEpochsProjectsVisible: import.meta.env[envViteKeys.areCurrentEpochsProjectsVisible],
  // @ts-expect-error TS does not understand the way vite imports envs.
  contractDepositsAddress: import.meta.env[envViteKeys.contractDepositsAddress],
  // @ts-expect-error TS does not understand the way vite imports envs.
  contractEpochsAddress: import.meta.env[envViteKeys.contractEpochsAddress],
  // @ts-expect-error TS does not understand the way vite imports envs.
  contractGlmAddress: import.meta.env[envViteKeys.contractGlmAddress],
  // @ts-expect-error TS does not understand the way vite imports envs.
  contractProposalsAddress: import.meta.env[envViteKeys.contractProposalsAddress],
  // @ts-expect-error TS does not understand the way vite imports envs.
  contractVaultAddress: import.meta.env[envViteKeys.contractVaultAddress],
  // @ts-expect-error TS does not understand the way vite imports envs.
  cryptoValuesEndpoint: import.meta.env[envViteKeys.cryptoValuesEndpoint],
  // @ts-expect-error TS does not understand the way vite imports envs.
  ipfsGateway: import.meta.env[envViteKeys.ipfsGateway],
  // @ts-expect-error TS does not understand the way vite imports envs.
  jsonRpcEndpoint: import.meta.env[envViteKeys.jsonRpcEndpoint],
  // @ts-expect-error TS does not understand the way vite imports envs.
  network: import.meta.env[envViteKeys.network],
  // @ts-expect-error TS does not understand the way vite imports envs.
  serverEndpoint: import.meta.env[envViteKeys.serverEndpoint],
  // @ts-expect-error TS does not understand the way vite imports envs.
  subgraphAddress: import.meta.env[envViteKeys.subgraphAddress],
  // @ts-expect-error TS does not understand the way vite imports envs.
  walletConnectProjectId: import.meta.env[envViteKeys.walletConnectProjectId],
  // @ts-expect-error TS does not understand the way vite imports envs.
  websocketEndpoint: import.meta.env[envViteKeys.websocketEndpoint],
};

export default env;

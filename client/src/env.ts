import { Env, EnvViteKeys } from 'types/env';

export const envsAllowedToBeEmpty = ['VITE_JSON_RPC_ENDPOINT', 'VITE_SENTRY_AUTH_TOKEN'];

export const envViteKeys: EnvViteKeys = {
  alchemyId: 'VITE_ALCHEMY_ID',
  areCurrentEpochsProjectsHiddenOutsideAllocationWindow:
    'VITE_ARE_CURRENT_EPOCHS_PROJECTS_HIDDEN_OUTSIDE_ALLOCATION_WINDOW',
  clientEndpoint: 'VITE_CLIENT_ENDPOINT',
  contractDepositsAddress: 'VITE_DEPOSITS_ADDRESS',
  contractEpochsAddress: 'VITE_EPOCHS_ADDRESS',
  contractGlmAddress: 'VITE_GLM_ADDRESS',
  contractProposalsAddress: 'VITE_PROPOSALS_ADDRESS',
  contractRegenStakerAddress: 'VITE_REGEN_STAKER_ADDRESS',
  contractVaultAddress: 'VITE_VAULT_ADDRESS',
  cryptoValuesEndpoint: 'VITE_CRYPTO_VALUES_ENDPOINT',
  ipfsGateways: 'VITE_IPFS_GATEWAYS',
  jsonRpcEndpoint: 'VITE_JSON_RPC_ENDPOINT',
  network: 'VITE_NETWORK',
  regenStakerUrl: 'VITE_REGEN_STAKER_URL',
  safeEndpoint: 'VITE_SAFE_ENDPOINT',
  sentryAuthToken: 'VITE_SENTRY_AUTH_TOKEN',
  serverEndpoint: 'VITE_SERVER_ENDPOINT',
  subgraphAddress: 'VITE_SUBGRAPH_ADDRESS',
  subgraphRegenStakerAddress: 'VITE_SUBGRAPH_REGEN_STAKER_ADDRESS',
  walletConnectProjectId: 'VITE_WALLET_CONNECT_PROJECT_ID',
  websocketEndpoint: 'VITE_WEBSOCKET_ENDPOINT',
};

const env: Env = {
  alchemyId: import.meta.env[envViteKeys.alchemyId],
  areCurrentEpochsProjectsHiddenOutsideAllocationWindow: import.meta.env[
    envViteKeys.areCurrentEpochsProjectsHiddenOutsideAllocationWindow
  ],
  clientEndpoint: import.meta.env[envViteKeys.clientEndpoint],
  contractDepositsAddress: import.meta.env[envViteKeys.contractDepositsAddress],
  contractEpochsAddress: import.meta.env[envViteKeys.contractEpochsAddress],
  contractGlmAddress: import.meta.env[envViteKeys.contractGlmAddress],
  contractProposalsAddress: import.meta.env[envViteKeys.contractProposalsAddress],
  contractRegenStakerAddress: import.meta.env[envViteKeys.contractRegenStakerAddress],
  contractVaultAddress: import.meta.env[envViteKeys.contractVaultAddress],
  cryptoValuesEndpoint: import.meta.env[envViteKeys.cryptoValuesEndpoint],
  ipfsGateways: import.meta.env[envViteKeys.ipfsGateways],
  jsonRpcEndpoint: import.meta.env[envViteKeys.jsonRpcEndpoint],
  network: import.meta.env[envViteKeys.network],
  regenStakerUrl: import.meta.env[envViteKeys.regenStakerUrl],
  safeEndpoint: import.meta.env[envViteKeys.safeEndpoint],
  sentryAuthToken: import.meta.env[envViteKeys.sentryAuthToken],
  serverEndpoint: import.meta.env[envViteKeys.serverEndpoint],
  subgraphAddress: import.meta.env[envViteKeys.subgraphAddress],
  subgraphRegenStakerAddress: import.meta.env[envViteKeys.subgraphRegenStakerAddress],
  walletConnectProjectId: import.meta.env[envViteKeys.walletConnectProjectId],
  websocketEndpoint: import.meta.env[envViteKeys.websocketEndpoint],
};

export default env;

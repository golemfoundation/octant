export type EnvViteKeys = {
  alchemyId: 'VITE_ALCHEMY_ID';
  areCurrentEpochsProjectsHiddenOutsideAllocationWindow: 'VITE_ARE_CURRENT_EPOCHS_PROJECTS_HIDDEN_OUTSIDE_ALLOCATION_WINDOW';
  contractDepositsAddress: 'VITE_DEPOSITS_ADDRESS';
  contractEpochsAddress: 'VITE_EPOCHS_ADDRESS';
  contractGlmAddress: 'VITE_GLM_ADDRESS';
  contractProposalsAddress: 'VITE_PROPOSALS_ADDRESS';
  contractVaultAddress: 'VITE_VAULT_ADDRESS';
  cryptoValuesEndpoint: 'VITE_CRYPTO_VALUES_ENDPOINT';
  ipfsGateways: 'VITE_IPFS_GATEWAYS';
  jsonRpcEndpoint: 'VITE_JSON_RPC_ENDPOINT';
  network: 'VITE_NETWORK';
  sentryAuthToken: 'VITE_SENTRY_AUTH_TOKEN';
  serverEndpoint: 'VITE_SERVER_ENDPOINT';
  subgraphAddress: 'VITE_SUBGRAPH_ADDRESS';
  walletConnectProjectId: 'VITE_WALLET_CONNECT_PROJECT_ID';
  websocketEndpoint: 'VITE_WEBSOCKET_ENDPOINT';
};

export type Env = {
  alchemyId: string;
  areCurrentEpochsProjectsHiddenOutsideAllocationWindow: string;
  contractDepositsAddress: string;
  contractEpochsAddress: string;
  contractGlmAddress: string;
  contractProposalsAddress: string;
  contractVaultAddress: string;
  cryptoValuesEndpoint: string;
  ipfsGateways: string;
  jsonRpcEndpoint?: string;
  network: 'Local' | 'Mainnet' | 'Sepolia';
  serverEndpoint: string;
  subgraphAddress: string;
  walletConnectProjectId: string;
  websocketEndpoint: string;
};

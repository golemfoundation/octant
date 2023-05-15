export type Env = {
  contracts: {
    allocationsAddress: string;
    allocationsStorageAddress: string;
    depositsAddress: string;
    epochsAddress: string;
    glmAddress: string;
    payoutsAddress: string;
    payoutsManagerAddress: string;
    proposalsAddress: string;
    rewardsAddress: string;
    trackerAddress: string;
  };
  cryptoValuesEndpoint: string;
  ipfsGateway: string;
  isTestnet: string;
  isUsingLocalContracts: string;
  network: string;
  subgraphAddress: string;
  walletConnectProjectId: string;
};

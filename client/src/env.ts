import { Env } from 'types/env';

// All default values here are example addresses used during development.
const env: Env = {
  contracts: {
    allocationsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_ALLOCATIONS_ADDRESS || '0xB4b3a771196a68BfaC5C629EF76Aa7B11a2376Cc',
    allocationsStorageAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_ALLOCATIONS_STORAGE_ADDRESS ||
      '0xc7fc74942E4C319627429E6f17a3d285a6c85edA',
    depositsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_DEPOSITS_ADDRESS || '0xa571e25cE27A0513219c975E6fd2B1095c1B6583',
    epochsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_EPOCHS_ADDRESS || '0xdD10d42E75467B96bA1d16Da53E0Fa8B23E51856',
    glmAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_GLM_ADDRESS || '0x71432DD1ae7DB41706ee6a22148446087BdD0906',
    payoutsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_PAYOUTS_ADDRESS || '0x5E41644C119CD10FB72E55184A0984d92a136311',
    payoutsManagerAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_PAYOUTS_MANAGER_ADDRESS || '0x501A87Ea3B1648430670d8824E18368b5cB2b844',
    proposalsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_PROPOSALS_ADDRESS || '0x17Cf4f99d3E967391f9DaDA7dbD69F9A41900B86',
    rewardsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_REWARDS_ADDRESS || '0x6ac463a7ecE1C4b6F487a93B6DA4bC9c6eA93e5B',
    trackerAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_TRACKER_ADDRESS || '0x6Bb39cC44F949338261770e9d95eB50C8aeEcC49',
  },
  cryptoValuesEndpoint:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_CRYPTO_VALUES_ENDPOINT || 'https://crypto-server.octant.world/',
  ipfsGateway:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_IPFS_GATEWAY || 'https://octant.infura-ipfs.io/ipfs/',
  isTestnet:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_IS_TESTNET || 'true',
  isUsingLocalContracts:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_IS_USING_LOCAL_CONTRACTS || 'false',
  // @ts-expect-error TS does not understand the way vite imports envs.
  network: import.meta.env.VITE_NETWORK || 'Sepolia',
  subgraphAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_SUBGRAPH_ADDRESS || 'https://octant.world/subgraphs/name/octant',
  walletConnectProjectId:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || '588213fd06714cc7e36ecbc5f2fdfd21',
};

export default env;

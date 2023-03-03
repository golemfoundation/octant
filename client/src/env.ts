// All default values here are example addresses used during development.
const env = {
  contracts: {
    allocationsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_ALLOCATIONS_ADDRESS || '0x169753AA07fd0C6154E0E6aad634b1a33Ef54DB9',
    allocationsStorageAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_ALLOCATIONS_STORAGE_ADDRESS ||
      '0x42506F955A4336eb884D105DD38d59d20e51a24a',
    beaconChainOracle:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_BEACON_CHAIN_ORACLE_ADDRESS ||
      '0x05f185a47013090f30049f0009b76be2ABe995a6',
    depositsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_DEPOSITS_ADDRESS || '0xe9d9d97cc8b3ABF18ec40e35282B621885326E91',
    epochsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_EPOCHS_ADDRESS || '0x40ce09B34016186e35829A7E74CbF7e1bB70742E',
    glmAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_GLM_ADDRESS || '0x4914bdFfFA96a3936304705eE41C2F5CbcAD7774',
    proposalsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_PROPOSALS_ADDRESS || '0x140C3b862D4343BB3352bc6841b39b1CFEecfc22',
    rewardsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_REWARDS_ADDRESS || '0xC370c7A2F86aA35E9fC2ECe7F44D95578068AB13',
    trackerAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_TRACKER_ADDRESS || '0xaaE07Bb9198257d381a52Eae7901B42edD253dE3',
  },
  ipfsGateway:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.IPFS_GATEWAY || 'https://octant.infura-ipfs.io/ipfs/',
  isTestnet:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_IS_TESTNET || 'true',
  subgraphAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_SUBGRAPH_ADDRESS || 'https://octant.world/subgraphs/name/octant',
};

export default env;

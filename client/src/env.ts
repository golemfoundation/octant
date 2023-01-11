// All default values here are example addresses used during development.
const env = {
  contracts: {
    allocationsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_ALLOCATIONS_ADDRESS || '0xe05D2c2fB0780B35eaf2C90d577E32653e68C8b7',
    allocationsStorageAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_ALLOCATIONS_STORAGE_ADDRESS ||
      '0x1A45088916Cc4F1423A96B7659a3a4F1b0ED35f5',
    beaconChainOracle:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_BEACON_CHAIN_ORACLE_ADDRESS ||
      '0x274215bfB3F4b7d42c569F18743c132904a25024',
    depositsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_DEPOSITS_ADDRESS || '0x8C229988B001a4428EB2Dd4F9DD6c8194E5A8aaB',
    epochsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_EPOCHS_ADDRESS || '0xDFaa3891E1CE072F58cdDB5893F9b905b06549C5',
    glmAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_GLM_ADDRESS || '0x4914bdFfFA96a3936304705eE41C2F5CbcAD7774',
    proposalsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_PROPOSALS_ADDRESS || '0x980Af0bd3FF962186C838E08cE67D98CED345839',
    rewardsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_REWARDS_ADDRESS || '0x5c3fE70579600Fb5060398137AB83D3901eC335a',
    testRewardsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_TEST_REWARDS_ADDRESS || '0x7FEd9C9562d7D8aB6F561765A5d15FfEC2177088',
    trackerAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_TRACKER_ADDRESS || '0xd3C9777a8cafE46583B5425C10196503c4428ddC',
  },
  ipfsGateway:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.IPFS_GATEWAY || 'https://hexagon.infura-ipfs.io/ipfs/',
  isTestnet:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_IS_TESTNET || 'true',
};

export default env;

// All default values here are example addresses used during development.
const env = {
  contracts: {
    allocationsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_ALLOCATIONS_ADDRESS || '0xFe6cf4844765f7BE2d9dC010f1f27871f6a1aDd4',
    allocationsStorageAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_ALLOCATIONS_STORAGE_ADDRESS ||
      '0x3000C98a3DcC148f209C1fAE3F40DD5311aC2557',
    beaconChainOracle:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_BEACON_CHAIN_ORACLE_ADDRESS ||
      '0xD327D00d22B8b889050497BC80e05427C11D65aF',
    depositsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_DEPOSITS_ADDRESS || '0x0B4B65758C01dBb2E01B73f7E984d6360Da9b910',
    epochsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_EPOCHS_ADDRESS || '0x39dCE579B8460BbF0F9B532E1ff4B0bEc24517C5',
    glmAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_GLM_ADDRESS || '0x4914bdFfFA96a3936304705eE41C2F5CbcAD7774',
    proposalsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_PROPOSALS_ADDRESS || '0x149489c47378070056dEdF2C2cDbD26774Ff0CDb',
    rewardsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_REWARDS_ADDRESS || '0x51b9EB20B0aFBc794151889910061909554461D1',
    testRewardsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_TEST_REWARDS_ADDRESS || '0xa303aCd85b13433092bf2eb8BE66dd41B5B2e68A',
    trackerAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_TRACKER_ADDRESS || '0xe276edaa6909749Ca939551D3740A306431f9D32',
  },
  ipfsGateway:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.IPFS_GATEWAY || 'https://hexagon.infura-ipfs.io/ipfs/',
  isTestnet:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_IS_TESTNET || 'true',
};

export default env;

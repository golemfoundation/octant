// All default values here are example addresses used during development.
const env = {
  contracts: {
    allocationsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_ALLOCATIONS_ADDRESS || '0xed1421A920240206DaBeb561d67123388770E1F8',
    allocationsStorageAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_ALLOCATIONS_STORAGE_ADDRESS ||
      '0x7d5BFB3303A34452eb1DB3b9CF75895CBe469D1C',
    beaconChainOracle:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_BEACON_CHAIN_ORACLE_ADDRESS ||
      '0x05f185a47013090f30049f0009b76be2ABe995a6',
    depositsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_DEPOSITS_ADDRESS || '0xc08E5Bb3B61D7Cb250E3a36De08359c9f9665b9D',
    epochsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_EPOCHS_ADDRESS || '0x440a9F2Eb1dFC940fD4132d6BaAB2859EC85088a',
    glmAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_GLM_ADDRESS || '0x4914bdFfFA96a3936304705eE41C2F5CbcAD7774',
    proposalsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_PROPOSALS_ADDRESS || '0x041f5A7A3D9c78Fa9cc852247E3F8eF91bEE7A26',
    rewardsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_REWARDS_ADDRESS || '0xb471Bf8b7c12b33C756f00F277f34F4Cb13B9cf4',
    trackerAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_TRACKER_ADDRESS || '0xA5A80975BdfB6b2d6492350B37F5B85367fD88F8',
  },
  ipfsGateway:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.IPFS_GATEWAY || 'https://octant.infura-ipfs.io/ipfs/',
  isTestnet:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_IS_TESTNET || 'true',
  subgraphAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_SUBGRAPH_ADDRESS ||
    'https://hexagon-subgraph.online/subgraphs/name/hexagon',
};

export default env;

// All default values here are example addresses used during development.
const env = {
  contracts: {
    allocationsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_ALLOCATIONS_ADDRESS || '0xEEB512421D1Cb95F7C85019772bb94921468dE58',
    allocationsStorageAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_ALLOCATIONS_STORAGE_ADDRESS ||
      '0x523cb5bfa4E203ed39Bc77387Ae276B08C3A6B55',
    depositsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_DEPOSITS_ADDRESS || '0x7BE31CD84E5F27Ee26b5452a98A2f0350bf41ff2',
    epochsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_EPOCHS_ADDRESS || '0x1a37f32103EfD20a54F6E413C954374c58c739a1',
    glmAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_GLM_ADDRESS || '0x4914bdFfFA96a3936304705eE41C2F5CbcAD7774',
    payoutsManager:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_PAYOUTS_MANAGER_ADDRESS || '0xCaF1b467FF0855bcA527F0B3B7f4719034AB781b',
    proposalsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_PROPOSALS_ADDRESS || '0x7e7B1eeC989Ec12156aE0BFae527A7D228Cb5922',
    rewardsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_REWARDS_ADDRESS || '0x9C7e87F3c32197AE5287be5764AfC547EE5EDa68',
    trackerAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_TRACKER_ADDRESS || '0xB259Ed41403844AbD3f5667796ff0331194168e3',
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

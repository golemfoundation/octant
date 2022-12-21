// All default values here are example addresses used during development.
const env = {
  allocationsAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_ALLOCATIONS_ADDRESS || '0xB68546e70b36CC123d62a72280363f24EDd6B69B',
  allocationsStorageAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_ALLOCATIONS_STORAGE_ADDRESS ||
    '0x02dad19f52b567440c5be7b03d6Dd74772704EEC',
  depositsAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_DEPOSITS_ADDRESS || '0xf1C2554C779Bc6C9A93106A280E986E33e7F4637',
  epochsAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_EPOCHS_ADDRESS || '0x30b26116C6b2B0Cf8f382525Bb15771572975B67',
  glmAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_GLM_ADDRESS || '0x4914bdFfFA96a3936304705eE41C2F5CbcAD7774',
  ipfsGateway:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.IPFS_GATEWAY || 'https://hexagon.infura-ipfs.io',
  proposalsAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_PROPOSALS_ADDRESS || '0x7C2e14004836CDAaD223727cD37df282E8467aF1',
  rewardsAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_REWARDS_ADDRESS || '0x69e4cAEca72fA1ce881faac35D849B18c46d9345',
};

export default env;

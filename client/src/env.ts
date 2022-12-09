// All default values here are example addresses used during development.
const env = {
  allocationsAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_ALLOCATIONS_ADDRESS || '0x813B40572654B26B2d779829261D5219e5943723',
  allocationsStorageAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_ALLOCATIONS_STORAGE_ADDRESS ||
    '0x05c08404435b5DF86FbbD14B5d3BAAb91cE95588',
  depositsAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_DEPOSITS_ADDRESS || '0x3c6ab3E060F8c9c07A9dAd0a0c2e02298e4a939f',
  epochsAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_EPOCHS_ADDRESS || '0x3318e56BC1cF548420818732ce6C8e3C5BF3E304',
  glmAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_GLM_ADDRESS || '0x4914bdFfFA96a3936304705eE41C2F5CbcAD7774',
  ipfsGateway:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.IPFS_GATEWAY || 'https://hexagon.infura-ipfs.io',
  proposalsAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_PROPOSALS_ADDRESS || '0x52716631EAd76efA264039101Fb022bB063b1411',
  rewardsAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_REWARDS_ADDRESS || '0xB4756950a43f20F73Cda820eB79607FA0CD701d7',
};

export default env;

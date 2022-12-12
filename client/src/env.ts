// All default values here are example addresses used during development.
const env = {
  allocationsAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_ALLOCATIONS_ADDRESS || '0x18618fcE142B8d0278f4655D30551ADf71f8A05b',
  allocationsStorageAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_ALLOCATIONS_STORAGE_ADDRESS ||
    '0xa981f993300FE6D14D6Cf94EB8888445f918Ef77',
  depositsAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_DEPOSITS_ADDRESS || '0xec89E93141EAa4C8102EAC27b133b86a3d5940b0',
  epochsAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_EPOCHS_ADDRESS || '0x1a77Ac64E7bb8f91B85e2FA50Ab448bA4c3AB249',
  glmAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_GLM_ADDRESS || '0x4914bdFfFA96a3936304705eE41C2F5CbcAD7774',
  ipfsGateway:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.IPFS_GATEWAY || 'https://hexagon.infura-ipfs.io',
  proposalsAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_PROPOSALS_ADDRESS || '0xbA0c5F28ea1a313ccD6AbcE837B7acaa4691e329',
  rewardsAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_REWARDS_ADDRESS || '0x25B4B25a0C959127fc82b56f051b2EB43813F24F',
};

export default env;

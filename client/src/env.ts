// All default values here are example addresses used during development.
const env = {
  allocationsAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_ALLOCATIONS_ADDRESS || '0x4267080A271a581F58E260D30c2bF3Ac7B67D1a8',
  allocationsStorageAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_ALLOCATIONS_STORAGE_ADDRESS ||
    '0x62ED8a84f08465ab3FE02490B2Ad75248acb3386',
  depositsAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_DEPOSITS_ADDRESS || '0xE209338fA633B1d75430C053aaA2174eC3018d86',
  epochsAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_EPOCHS_ADDRESS || '0xd5F0C8b48A3C6577F6120c0D2e347d05b2bB868f',
  glmAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_GLM_ADDRESS || '0x4914bdFfFA96a3936304705eE41C2F5CbcAD7774',
  ipfsGateway:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.IPFS_GATEWAY || 'https://hexagon.infura-ipfs.io',
  proposalsAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_PROPOSALS_ADDRESS || '0xd6DFA539A11aB5a31fb150Bb79ce9309A7614557',
  rewardsAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_REWARDS_ADDRESS || '0x2401C99A46567a60d8DC9B5Fe5425d616aA558Be',
};

export default env;

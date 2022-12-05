// All default values here are example addresses used during development.
const env = {
  allocationsAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_ALLOCATIONS_ADDRESS || '0x855Ff93d6E777054cFC0601625471B3C5F1031fC',
  depositsAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_DEPOSITS_ADDRESS || '0x553e549D31B17596cE2A1Db4BBADff2eC320E30E',
  epochsAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_EPOCHS_ADDRESS || '0xFE5DFBfa9Ad35282027859EE258Aee4A72E25381',
  glmAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_GLM_ADDRESS || '0x0393EfF8fD1C5B5CaBac9b2d437798B6792fe013',
  ipfsGateway:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.IPFS_GATEWAY || 'https://hexagon.infura-ipfs.io',
  proposalsAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_PROPOSALS_ADDRESS || '0xAb763fDBc103Fc2Fa06548A06Fc690ACdE2F1f4F',
};

export default env;

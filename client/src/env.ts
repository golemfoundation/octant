// All default values here are example addresses used during development.
const env = {
  allocationsAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_ALLOCATIONS_ADDRESS || '0x43D5831b9086315Dd646Ae66b93107B9791652a8',
  depositsAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_DEPOSITS_ADDRESS || '0x8519aE87F338dd5f4CB1cF809339B6B6e5d40F59',
  epochsAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_EPOCHS_ADDRESS || '0xd26c71Bf3ea8845364d650F8bED921C8130EfE9A',
  glmAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_GLM_ADDRESS || '0x4914bdFfFA96a3936304705eE41C2F5CbcAD7774',
  ipfsGateway:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.IPFS_GATEWAY || 'https://hexagon.infura-ipfs.io',
  proposalsAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_PROPOSALS_ADDRESS || '0x39F67554bA2284925b80A66fA1f95b6B9EeC8486',
};

export default env;

// All default values here are example addresses used during development.
const env = {
  contracts: {
    allocationsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_ALLOCATIONS_ADDRESS || '0x9a1e5fecED685995cC51A6D13Bda19A184079B99',
    allocationsStorageAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_ALLOCATIONS_STORAGE_ADDRESS ||
      '0x97623a89DC2d3268D9221c73e03b8b0808E80CC1',
    depositsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_DEPOSITS_ADDRESS || '0xFFf04168c4DD28eCb076224bbba621Af4347E767',
    epochsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_EPOCHS_ADDRESS || '0xFf2cc5C9fD16dBFef0020b13CDDB59BA4D89BBBC',
    glmAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_GLM_ADDRESS || '0x4914bdFfFA96a3936304705eE41C2F5CbcAD7774',
    payoutsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_PAYOUTS_ADDRESS || '0xF068e8D19846D2db7b7A2bDFE04F9A332766cAd4',
    payoutsManagerAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_PAYOUTS_MANAGER_ADDRESS || '0xE574B8188DD1b3c4d2f33d5193f4D0fc39591c2b',
    proposalsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_PROPOSALS_ADDRESS || '0x17c09dA7c6Ba1Dd24AdbEB514CF8f07c9aEfd655',
    rewardsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_REWARDS_ADDRESS || '0x93f61768890D5D6D99b44a01bE0d73Dd900725Fc',
    trackerAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_TRACKER_ADDRESS || '0x29D23DE66F737bF5e9a7c0D5cBE283e409c857d1',
  },
  cryptoValuesEndpoint:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_CRYPTO_VALUES_ENDPOINT || 'https://crypto-server.octant.world/',
  ipfsGateway:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.IPFS_GATEWAY || 'https://octant.infura-ipfs.io/ipfs/',
  isTestnet:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_IS_TESTNET || 'true',
  isUsingLocalContracts:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_IS_USING_LOCAL_CONTRACTS || 'false',
  subgraphAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_SUBGRAPH_ADDRESS || 'https://octant.world/subgraphs/name/octant',
};

export default env;

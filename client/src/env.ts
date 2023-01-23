// All default values here are example addresses used during development.
const env = {
  contracts: {
    allocationsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_ALLOCATIONS_ADDRESS || '0xeA03F5677e9d9Fc0F54bF15c4B32D494C3C9EadF',
    allocationsStorageAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_ALLOCATIONS_STORAGE_ADDRESS ||
      '0xd466eD18C3A7fe074092206D75293F49df15A068',
    beaconChainOracle:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_BEACON_CHAIN_ORACLE_ADDRESS ||
      '0x3A139a71E2e671662850A3e31D0f7Ec6eF5d3BCA',
    depositsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_DEPOSITS_ADDRESS || '0xb68ba6af071a4d844b2b72f34A462071C2879C7c',
    epochsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_EPOCHS_ADDRESS || '0x755d88CdD2a4923bfBC647EE36eE05B25bFdc22f',
    glmAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_GLM_ADDRESS || '0x4914bdFfFA96a3936304705eE41C2F5CbcAD7774',
    proposalsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_PROPOSALS_ADDRESS || '0x90172c4b3A87E5be8AD7dA75FC9518257e9673f3',
    rewardsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_REWARDS_ADDRESS || '0x446684182448E2261aFAa1b34eE7845ECb3DC9d9',
    testRewardsAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_TEST_REWARDS_ADDRESS || '0x41Ed1c67cEe8a522CFD608369B8A41381a0A2df3',
    trackerAddress:
      // @ts-expect-error TS does not understand the way vite imports envs.
      import.meta.env.VITE_TRACKER_ADDRESS || '0x91094ef085aEc14d9c12062D06a604a86e51f62e',
  },
  ipfsGateway:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.IPFS_GATEWAY || 'https://hexagon.infura-ipfs.io/ipfs/',
  isTestnet:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_IS_TESTNET || 'true',
};

export default env;

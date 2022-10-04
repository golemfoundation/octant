const env = {
  allocationsAddress:
    // @ts-ignore
    import.meta.env.VITE_ALLOCATIONS_ADDRESS || '0x855Ff93d6E777054cFC0601625471B3C5F1031fC', // example address
  proposalsAddress:
    // @ts-ignore
    import.meta.env.VITE_PROPOSALS_ADDRESS || '0xAbf25FFC8E535d8C0c704dD3c78E8B6b4f461C8d', // example address
};

export default env;

const env = {
  allocationsAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_ALLOCATIONS_ADDRESS || '0x855Ff93d6E777054cFC0601625471B3C5F1031fC', // example address
  proposalsAddress:
    // @ts-expect-error TS does not understand the way vite imports envs.
    import.meta.env.VITE_PROPOSALS_ADDRESS || '0x35221f93Ca41894FD421C166D63F0b17f2266743', // example address
};

export default env;

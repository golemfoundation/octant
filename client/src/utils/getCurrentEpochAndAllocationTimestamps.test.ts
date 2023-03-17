import getCurrentEpochAndAllocationTimestamps from './getCurrentEpochAndAllocationTimestamps';

describe('getCurrentEpochAndAllocationTimestamps', () => {
  const currentEpochEnd = 1665069473000; // 2022-10-06T15:17:53.000Z in milliseconds.
  const defaultArgs = {
    currentEpochEnd,
    currentEpochProps: {
      decisionWindow: 1800,
      duration: 3600,
    },
  };
  const alternateArgs1 = {
    ...defaultArgs,
    currentEpochProps: {
      decisionWindow: 60,
      duration: 90,
    },
  };

  it('correctly returns timestamps of the beginning and end of epoch and allocation', () => {
    expect(getCurrentEpochAndAllocationTimestamps(defaultArgs)).toMatchObject({
      timeCurrentAllocationEnd: 1665069471200,
      timeCurrentAllocationStart: 1665069469400,
      timeCurrentEpochEnd: 1665069473000,
      timeCurrentEpochStart: 1665069469400,
    });
  });

  it('correctly returns timestamps of the beginning and end of epoch and allocation', () => {
    expect(getCurrentEpochAndAllocationTimestamps(alternateArgs1)).toMatchObject({
      timeCurrentAllocationEnd: 1665069472970,
      timeCurrentAllocationStart: 1665069472910,
      timeCurrentEpochEnd: 1665069473000,
      timeCurrentEpochStart: 1665069472910,
    });
  });

  it('correctly returns all undefined when currentEpochProps is not defined', () => {
    expect(
      getCurrentEpochAndAllocationTimestamps({
        ...defaultArgs,
        currentEpochProps: undefined,
      }),
    ).toMatchObject({});
  });

  it('correctly returns all undefined when currentEpochEnd is not defined', () => {
    expect(
      getCurrentEpochAndAllocationTimestamps({
        ...defaultArgs,
        currentEpochEnd: undefined,
      }),
    ).toMatchObject({});
  });
});

import getCurrentEpochAndAllocationTimestamps from './getCurrentEpochAndAllocationTimestamps';

describe('getCurrentEpochAndAllocationTimestamps', () => {
  const startTimestamp = 1665069473000; // 2022-10-06T15:17:53.000Z in milliseconds.
  const defaultArgs = {
    currentEpoch: 1,
    decisionWindowDuration: 600,
    epochDuration: 600,
    epochProps: [],
    startTimestamp,
  };
  const defaultArgsWithEpochProps = {
    ...defaultArgs,
    epochProps: [
      { decisionWindow: 3600000, duration: 3600000, from: 1, to: 3 },
      { decisionWindow: 3600000, duration: 5800000, from: 3, to: 33 },
    ],
  };
  const defaultArgsWithEpochProps2 = {
    ...defaultArgsWithEpochProps,
    epochProps: [
      { decisionWindow: 3600000, duration: 3600000, from: 1, to: 3 },
      { decisionWindow: 3600000, duration: 5800000, from: 3, to: 33 },
      { decisionWindow: 60, duration: 120, from: 33, to: 190 },
    ],
  };

  it('correctly returns timestamps of the beginning and end of epoch and allocation', () => {
    expect(getCurrentEpochAndAllocationTimestamps(defaultArgs)).toMatchObject({
      timeCurrentAllocationEnd: 1665069473600,
      timeCurrentAllocationStart: 1665069473000,
      timeCurrentEpochEnd: 1665069473600,
      timeCurrentEpochStart: 1665069473000,
    });
  });

  it('correctly returns timestamps of the beginning and end of epoch and allocation', () => {
    expect(getCurrentEpochAndAllocationTimestamps(defaultArgsWithEpochProps)).toMatchObject({
      timeCurrentAllocationEnd: 1665250655000,
      timeCurrentAllocationStart: 1665250654400,
      timeCurrentEpochEnd: 1665250655000,
      timeCurrentEpochStart: 1665250654400,
    });
  });

  it('correctly returns timestamps of the beginning and end of epoch and allocation', () => {
    expect(getCurrentEpochAndAllocationTimestamps(defaultArgsWithEpochProps2)).toMatchObject({
      timeCurrentAllocationEnd: 1665250579640,
      timeCurrentAllocationStart: 1665250579040,
      timeCurrentEpochEnd: 1665250579640,
      timeCurrentEpochStart: 1665250579040,
    });
  });

  it('correctly returns all undefined when currentEpoch is not defined', () => {
    expect(
      getCurrentEpochAndAllocationTimestamps({
        ...defaultArgs,
        currentEpoch: undefined,
      }),
    ).toMatchObject({});
  });

  it('correctly returns all undefined when startTimestamp is not defined', () => {
    expect(
      getCurrentEpochAndAllocationTimestamps({
        ...defaultArgs,
        startTimestamp: undefined,
      }),
    ).toMatchObject({});
  });

  it('correctly returns all undefined when epochDuration is not defined', () => {
    expect(
      getCurrentEpochAndAllocationTimestamps({
        ...defaultArgs,
        epochDuration: undefined,
      }),
    ).toMatchObject({});
  });

  it('correctly returns all undefined when decisionWindowDuration is not defined', () => {
    expect(
      getCurrentEpochAndAllocationTimestamps({
        ...defaultArgs,
        decisionWindowDuration: undefined,
      }),
    ).toMatchObject({});
  });
});

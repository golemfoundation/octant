import getEpochAndAllocationTimestamps from './utils';

describe('getEpochAndAllocationTimestamps', () => {
  const startTimestamp = 1665069473000; // 2022-10-06T15:17:53.000Z in milliseconds.
  const defaultArgs = {
    currentEpoch: 1,
    decisionWindowDuration: 600,
    epochDuration: 600,
    startTimestamp,
  };

  it('correctly returns timestamps of the beginning and end of epoch and allocation', () => {
    expect(getEpochAndAllocationTimestamps(defaultArgs)).toMatchObject({
      timeCurrentAllocationEnd: 1665069473600,
      timeCurrentAllocationStart: 1665069473000,
      timeCurrentEpochEnd: 1665069473600,
      timeCurrentEpochStart: 1665069473000,
    });
  });

  it('correctly returns all undefined when currentEpoch is not defined', () => {
    expect(
      getEpochAndAllocationTimestamps({
        ...defaultArgs,
        currentEpoch: undefined,
      }),
    ).toMatchObject({});
  });

  it('correctly returns all undefined when startTimestamp is not defined', () => {
    expect(
      getEpochAndAllocationTimestamps({
        ...defaultArgs,
        startTimestamp: undefined,
      }),
    ).toMatchObject({});
  });

  it('correctly returns all undefined when epochDuration is not defined', () => {
    expect(
      getEpochAndAllocationTimestamps({
        ...defaultArgs,
        epochDuration: undefined,
      }),
    ).toMatchObject({});
  });

  it('correctly returns all undefined when decisionWindowDuration is not defined', () => {
    expect(
      getEpochAndAllocationTimestamps({
        ...defaultArgs,
        decisionWindowDuration: undefined,
      }),
    ).toMatchObject({});
  });
});

import getEpochTimestamps from './getEpochTimestamps';

describe('getEpochTimestamps', () => {
  const startTimestamp = 1665069473000; // 2022-10-06T15:17:53.000Z in milliseconds.
  const defaultArgs = {
    decisionWindowDuration: 600,
    epoch: 1,
    epochDuration: 600,
    startTimestamp,
  };

  it('correctly returns timestamps of the beginning and end of epoch', () => {
    expect(getEpochTimestamps(defaultArgs)).toMatchObject({
      timeEpochEnd: 1665069473600,
      timeEpochStart: 1665069473000,
    });
  });

  it('correctly returns all undefined when currentEpoch is not defined', () => {
    expect(
      getEpochTimestamps({
        ...defaultArgs,
        epoch: undefined,
      }),
    ).toMatchObject({});
  });

  it('correctly returns all undefined when startTimestamp is not defined', () => {
    expect(
      getEpochTimestamps({
        ...defaultArgs,
        startTimestamp: undefined,
      }),
    ).toMatchObject({});
  });

  it('correctly returns all undefined when epochDuration is not defined', () => {
    expect(
      getEpochTimestamps({
        ...defaultArgs,
        epochDuration: undefined,
      }),
    ).toMatchObject({});
  });

  it('correctly returns all undefined when decisionWindowDuration is not defined', () => {
    expect(
      getEpochTimestamps({
        ...defaultArgs,
        decisionWindowDuration: undefined,
      }),
    ).toMatchObject({});
  });
});

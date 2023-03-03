import getEpochTimestamps from './getEpochTimestamps';

describe('getEpochTimestamps', () => {
  const startTimestamp = 1665069473000; // 2022-10-06T15:17:53.000Z in milliseconds.
  const defaultArgs = {
    decisionWindowDuration: 600,
    epoch: 1,
    epochDuration: 600,
    epochProps: [
      { decisionWindow: 3600000, duration: 3600000, from: 1, to: 3 },
      { decisionWindow: 3600000, duration: 5800000, from: 3, to: 33 },
    ],
    startTimestamp,
  };
  const defaultArgsDifferentProps = {
    ...defaultArgs,
    epochProps: [
      { decisionWindow: 3600000, duration: 3600000, from: 1, to: 3 },
      { decisionWindow: 3600000, duration: 5800000, from: 3, to: 33 },
      { decisionWindow: 60, duration: 120, from: 33, to: 190 },
    ],
  };

  it('correctly returns timestamps of the beginning and end of epoch', () => {
    expect(getEpochTimestamps(defaultArgs)).toMatchObject({
      timeEpochEnd: 1665250654400,
      timeEpochStart: 1665250653800,
    });
  });

  it('correctly returns timestamps of the beginning and end of epoch', () => {
    expect(getEpochTimestamps(defaultArgsDifferentProps)).toMatchObject({
      timeEpochEnd: 1665250579040,
      timeEpochStart: 1665250578440,
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

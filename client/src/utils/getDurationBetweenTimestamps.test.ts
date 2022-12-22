import getDurationBetweenTimestamps from './getDurationBetweenTimestamps';

describe('getDurationBetweenDates', () => {
  const startTimestamp = 1665069473000; // 2022-10-06T15:17:53.000Z in milliseconds.

  it('correctly returns duration between startTimestamp and endTimestamp', () => {
    const endDate = new Date(2022, 9, 13, 8, 10, 11);
    const endTimestamp = endDate.getTime();

    expect(getDurationBetweenTimestamps(startTimestamp, endTimestamp)).toMatchObject({
      days: 6,
      hours: 16,
      minutes: 52,
      months: 0,
      seconds: 18,
      years: 0,
    });
  });

  it('correctly returns duration between startTimestamp and faked current date', () => {
    // Setting faked new Date.
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2030, 2, 3, 4, 5, 6));

    expect(getDurationBetweenTimestamps(startTimestamp)).toMatchObject({
      days: 24,
      hours: 12,
      minutes: 47,
      months: 4,
      seconds: 13,
      years: 7,
    });
  });

  afterAll(() => {
    // Resetting new Date.
    jest.useRealTimers();
  });
});

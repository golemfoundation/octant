import { differenceInDays, intervalToDuration } from 'date-fns';

export type DurationWithoutMonthsAndYears = {
  days: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
};

export default function getDurationBetweenTimestamps(
  startTimestamp: number,
  endTimestamp = Date.now(),
): DurationWithoutMonthsAndYears {
  const differenceInDaysValue = Math.abs(differenceInDays(endTimestamp, startTimestamp));
  // Which date is 'start', which is 'end' -- doesn't matter.
  const interval = intervalToDuration({
    end: new Date(endTimestamp),
    start: new Date(startTimestamp),
  });
  return {
    days: differenceInDaysValue,
    hours: Math.abs(interval.hours ?? 0),
    minutes: Math.abs(interval.minutes ?? 0),
    seconds: Math.abs(interval.seconds ?? 0),
  };
}

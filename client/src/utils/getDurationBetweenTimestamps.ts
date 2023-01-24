import differenceInDays from 'date-fns/differenceInDays';
import intervalToDuration from 'date-fns/intervalToDuration';

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
  const differenceInDaysValue = differenceInDays(endTimestamp, startTimestamp);
  // Which date is 'start', which is 'end' -- doesn't matter.
  const interval = intervalToDuration({
    end: new Date(endTimestamp),
    start: new Date(startTimestamp),
  });
  return {
    days: differenceInDaysValue,
    hours: interval.hours,
    minutes: interval.minutes,
    seconds: interval.seconds,
  };
}

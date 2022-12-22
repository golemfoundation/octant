import { Duration } from 'date-fns';
import intervalToDuration from 'date-fns/intervalToDuration';

export default function getDurationBetweenTimestamps(
  startTimestamp: number,
  endTimestamp = Date.now(),
): Duration {
  // Which date is 'start', which is 'end' -- doesn't matter.
  return intervalToDuration({
    end: new Date(endTimestamp),
    start: new Date(startTimestamp),
  });
}

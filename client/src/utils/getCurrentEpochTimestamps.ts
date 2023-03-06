import { EpochProps } from 'hooks/queries/useEpochProps';

type GetDurations = {
  currentEpoch?: number;
  decisionWindowDuration?: number;
  epochDuration?: number;
  epochProps: EpochProps[];
  startTimestamp?: number;
};

export type Response = {
  timeEpochEnd?: number;
  timeEpochStart?: number;
};

export default function getCurrentEpochTimestamps({
  epochProps,
  currentEpoch,
  startTimestamp,
  epochDuration,
  decisionWindowDuration,
}: GetDurations): Response {
  if (!currentEpoch || !startTimestamp || !epochDuration || !decisionWindowDuration) {
    return {};
  }

  const timeEndOfLastEpochBeforeCurrentDuration = epochProps.reduce(
    (acc, { duration, from, to }) => {
      // from inclusive, to exclusive.
      const numberOfEpochs = to - from;
      return acc + numberOfEpochs * duration;
    },
    startTimestamp,
  );

  const numberOfLastEpochBeforeCurrentDuration =
    epochProps.length > 0 ? epochProps[epochProps.length - 1].to - 1 : 1;

  const timeEpochStart =
    timeEndOfLastEpochBeforeCurrentDuration +
    (currentEpoch - numberOfLastEpochBeforeCurrentDuration) * epochDuration;
  const timeEpochEnd = timeEpochStart + epochDuration;

  return {
    timeEpochEnd,
    timeEpochStart,
  };
}

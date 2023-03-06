import { EpochProps } from 'hooks/queries/useEpochProps';

import getCurrentEpochTimestamps from './getCurrentEpochTimestamps';

type Parameters = {
  currentEpoch?: number;
  decisionWindowDuration?: number;
  epochDuration?: number;
  epochProps: EpochProps[];
  startTimestamp?: number;
};

export type Response = {
  timeCurrentAllocationEnd?: number;
  timeCurrentAllocationStart?: number;
  timeCurrentEpochEnd?: number;
  timeCurrentEpochStart?: number;
};

export default function getCurrentEpochAndAllocationTimestamps({
  currentEpoch,
  startTimestamp,
  epochDuration,
  epochProps,
  decisionWindowDuration,
}: Parameters): Response {
  if (!currentEpoch || !startTimestamp || !epochDuration || !decisionWindowDuration) {
    return {};
  }

  const { timeEpochStart: timeCurrentEpochStart, timeEpochEnd: timeCurrentEpochEnd } =
    getCurrentEpochTimestamps({
      currentEpoch,
      decisionWindowDuration,
      epochDuration,
      epochProps,
      startTimestamp,
    });

  const timeCurrentAllocationStart = timeCurrentEpochStart!;
  const timeCurrentAllocationEnd = timeCurrentEpochStart! + decisionWindowDuration;

  return {
    timeCurrentAllocationEnd,
    timeCurrentAllocationStart,
    timeCurrentEpochEnd,
    timeCurrentEpochStart,
  };
}

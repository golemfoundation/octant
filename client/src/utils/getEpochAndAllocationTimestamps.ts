import getEpochTimestamps from './getEpochTimestamps';

type Parameters = {
  currentEpoch?: number;
  decisionWindowDuration?: number;
  epochDuration?: number;
  startTimestamp?: number;
};

export type Response = {
  timeCurrentAllocationEnd?: number;
  timeCurrentAllocationStart?: number;
  timeCurrentEpochEnd?: number;
  timeCurrentEpochStart?: number;
};

export default function getEpochAndAllocationTimestamps({
  currentEpoch,
  startTimestamp,
  epochDuration,
  decisionWindowDuration,
}: Parameters): Response {
  if (!currentEpoch || !startTimestamp || !epochDuration || !decisionWindowDuration) {
    return {};
  }

  const { timeEpochStart: timeCurrentEpochStart, timeEpochEnd: timeCurrentEpochEnd } =
    getEpochTimestamps({
      decisionWindowDuration,
      epoch: currentEpoch,
      epochDuration,
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

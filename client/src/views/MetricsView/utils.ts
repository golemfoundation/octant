type GetDurations = {
  currentEpoch?: number;
  decisionWindowDuration?: number;
  epochDuration?: number;
  startTimestamp?: number;
};

export default function getEpochAndAllocationTimestamps({
  currentEpoch,
  startTimestamp,
  epochDuration,
  decisionWindowDuration,
}: GetDurations): {
  timeCurrentAllocationEnd?: number;
  timeCurrentAllocationStart?: number;
  timeCurrentEpochEnd?: number;
  timeCurrentEpochStart?: number;
} {
  if (!currentEpoch || !startTimestamp || !epochDuration || !decisionWindowDuration) {
    return {};
  }

  const timeCurrentEpochStart = startTimestamp + (currentEpoch - 1) * epochDuration;
  const timeCurrentEpochEnd = timeCurrentEpochStart + epochDuration;
  const timeCurrentAllocationStart = timeCurrentEpochStart;
  const timeCurrentAllocationEnd = timeCurrentEpochStart + decisionWindowDuration;

  return {
    timeCurrentAllocationEnd,
    timeCurrentAllocationStart,
    timeCurrentEpochEnd,
    timeCurrentEpochStart,
  };
}

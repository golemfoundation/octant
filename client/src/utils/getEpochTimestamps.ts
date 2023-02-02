type GetDurations = {
  decisionWindowDuration?: number;
  epoch?: number;
  epochDuration?: number;
  startTimestamp?: number;
};

export type Response = {
  timeEpochEnd?: number;
  timeEpochStart?: number;
};

export default function getEpochTimestamps({
  epoch,
  startTimestamp,
  epochDuration,
  decisionWindowDuration,
}: GetDurations): Response {
  if (!epoch || !startTimestamp || !epochDuration || !decisionWindowDuration) {
    return {};
  }

  const timeEpochStart = startTimestamp + (epoch - 1) * epochDuration;
  const timeEpochEnd = timeEpochStart + epochDuration;

  return {
    timeEpochEnd,
    timeEpochStart,
  };
}

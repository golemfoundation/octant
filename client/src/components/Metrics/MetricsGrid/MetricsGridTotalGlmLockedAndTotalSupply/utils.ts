export function roundLockedRatio(lockedRatio: string | undefined): number {
  return lockedRatio ? parseFloat((parseFloat(lockedRatio) * 100).toFixed(2)) : 0;
}

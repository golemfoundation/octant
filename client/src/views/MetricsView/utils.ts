export function roundLockedRatio(lockedRatio: string | undefined): number {
  return lockedRatio ? Math.round(parseFloat(lockedRatio) * 100) : 0;
}

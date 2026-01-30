import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';

export default function useIsMigrationMode(): boolean {
  const { data: currentEpoch } = useCurrentEpoch();

  const isMigrationModeBypassed = localStorage.getItem('DEBUG_MIGRATION_MODE_OFF') === 'true';

  if (isMigrationModeBypassed) {
    return false;
  }

  return currentEpoch! >= 12;
}

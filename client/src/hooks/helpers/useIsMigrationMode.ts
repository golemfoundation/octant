import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';

export default function useIsMigrationMode(): boolean {
  const { data: currentEpoch } = useCurrentEpoch();

  const migrationModeBypass = localStorage.getItem('DEBUG_MIGRATION_MODE');

  if (migrationModeBypass === 'off') {
    return false;
  }

  if (migrationModeBypass === 'on') {
    return true;
  }

  return currentEpoch! >= 12;
}

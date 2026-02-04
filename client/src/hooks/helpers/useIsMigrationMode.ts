import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';

export default function useIsMigrationMode(): boolean {
  const { data: currentEpoch } = useCurrentEpoch();

  const migrationModeBypass = JSON.parse(localStorage.getItem('DEBUG_MIGRATION_MODE') || 'null');

  if (migrationModeBypass === 'off') {
    return false;
  }

  if (migrationModeBypass === 'on') {
    return true;
  }

  return currentEpoch! >= 12;
}

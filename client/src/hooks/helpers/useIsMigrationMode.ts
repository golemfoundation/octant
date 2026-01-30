import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';

export default function useIsMigrationMode(): boolean {
  const { data: currentEpoch } = useCurrentEpoch();

  const isMigrationModeBypassedOff = localStorage.getItem('DEBUG_MIGRATION_MODE_OFF') === 'true';
  const isMigrationModeBypassedOn = localStorage.getItem('DEBUG_MIGRATION_MODE_ON') === 'true';

  if (isMigrationModeBypassedOff) {
    return false;
  }

  if (isMigrationModeBypassedOn) {
    return true;
  }

  return currentEpoch! >= 12;
}

// import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';

export default function useIsMigrationMode(): boolean {
  // const { data: currentEpoch } = useCurrentEpoch();

  return localStorage.getItem('DEBUG_MIGRATION_MODE_OFF') !== 'true';
  // return !!currentEpoch && currentEpoch > 10;
}

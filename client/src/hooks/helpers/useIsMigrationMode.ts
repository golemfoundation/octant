import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';

export default function useIsMigrationMode(): boolean {
  const { data: currentEpoch } = useCurrentEpoch();

  return !!currentEpoch && currentEpoch > 10;
}

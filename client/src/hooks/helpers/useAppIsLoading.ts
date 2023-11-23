import useAllProposals from 'hooks/queries/useAllProposals';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';
import useUserTOS from 'hooks/queries/useUserTOS';
import useAllocationsStore from 'store/allocations/store';
import useOnboardingStore from 'store/onboarding/store';
import useSettingsStore from 'store/settings/store';
import useTipsStore from 'store/tips/store';
import getIsPreLaunch from 'utils/getIsPreLaunch';

export default function useAppIsLoading(isFlushRequired: boolean): boolean {
  const { isFetching: isFetchingAllProposals } = useAllProposals();
  const { isFetching: isFetchingPatronModeStatus } = useIsPatronMode();
  const { isFetching: isFetchingUserTOS } = useUserTOS();
  const { data: currentEpoch, isFetching: isFetchingCurrentEpoch } = useCurrentEpoch();
  const isPreLaunch = getIsPreLaunch(currentEpoch);

  const { isInitialized: isOnboardingInitialized } = useOnboardingStore(state => ({
    isInitialized: state.meta.isInitialized,
  }));
  const { isInitialized: isSettingsInitialized } = useSettingsStore(state => ({
    isInitialized: state.meta.isInitialized,
  }));
  const { isInitialized: isTipsStoreInitialized } = useTipsStore(state => ({
    isInitialized: state.meta.isInitialized,
  }));
  const { isInitialized: isAllocationsInitialized } = useAllocationsStore(state => ({
    isInitialized: state.meta.isInitialized,
  }));

  return (
    currentEpoch === undefined ||
    isFetchingCurrentEpoch ||
    (!isPreLaunch && !isAllocationsInitialized) ||
    !isOnboardingInitialized ||
    !isSettingsInitialized ||
    isFlushRequired ||
    !isTipsStoreInitialized ||
    isFetchingUserTOS ||
    isFetchingAllProposals ||
    isFetchingPatronModeStatus
  );
}

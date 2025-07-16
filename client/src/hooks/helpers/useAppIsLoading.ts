import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsGnosisSafeMultisig from 'hooks/queries/useIsGnosisSafeMultisig';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';
import useUserTOS from 'hooks/queries/useUserTOS';
import useAllProjects from 'hooks/subgraph/useAllProjects';
import useEpochsStartEndTime from 'hooks/subgraph/useEpochsStartEndTime';
import useAllocationsStore from 'store/allocations/store';
import useDelegationStore from 'store/delegation/store';
import useOnboardingStore from 'store/onboarding/store';
import useSettingsStore from 'store/settings/store';
import getIsPreLaunch from 'utils/getIsPreLaunch';

export default function useAppIsLoading(isFlushRequired: boolean): boolean {
  const { isFetching: isFetchingAllProjects } = useAllProjects();
  const { isFetching: isFetchingPatronModeStatus } = useIsPatronMode();
  const { isFetching: isFetchingUserTOS, isRefetching: isRefetchingUserTOS } = useUserTOS();
  const { data: currentEpoch, isLoading: isLoadingCurrentEpoch } = useCurrentEpoch();
  const isPreLaunch = getIsPreLaunch(currentEpoch);
  const { isFetching: isFetchingEpochsStartEndTime } = useEpochsStartEndTime();

  const { isInitialized: isOnboardingInitialized } = useOnboardingStore(state => ({
    isInitialized: state.meta.isInitialized,
  }));
  const { isInitialized: isSettingsInitialized } = useSettingsStore(state => ({
    isInitialized: state.meta.isInitialized,
  }));
  const { isInitialized: isDelegationInitialized, isDelegationInProgress } = useDelegationStore(
    state => ({
      isDelegationInProgress: state.data.isDelegationInProgress,
      isInitialized: state.meta.isInitialized,
    }),
  );
  const { isInitialized: isAllocationsInitialized } = useAllocationsStore(state => ({
    isInitialized: state.meta.isInitialized,
  }));
  const { isFetching: isFetchingIsContract } = useIsGnosisSafeMultisig();

  if (isDelegationInProgress) {
    return false;
  }

  return (
    isLoadingCurrentEpoch ||
    (!isPreLaunch && !isAllocationsInitialized) ||
    !isOnboardingInitialized ||
    !isSettingsInitialized ||
    !isDelegationInitialized ||
    isFlushRequired ||
    (isFetchingUserTOS && !isRefetchingUserTOS) ||
    isFetchingAllProjects ||
    isFetchingPatronModeStatus ||
    isFetchingIsContract ||
    isFetchingEpochsStartEndTime
  );
}

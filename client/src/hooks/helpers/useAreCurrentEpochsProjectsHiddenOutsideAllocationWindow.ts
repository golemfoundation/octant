import env from 'env';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';

export default function useAreCurrentEpochsProjectsHiddenOutsideAllocationWindow(): {
  data: boolean | undefined;
  isLoading: boolean;
} {
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();

  return {
    data:
      isDecisionWindowOpen === undefined
        ? undefined
        : env.areCurrentEpochsProjectsHiddenOutsideAllocationWindow === 'true' &&
          !isDecisionWindowOpen,
    isLoading: isDecisionWindowOpen === undefined,
  };
}

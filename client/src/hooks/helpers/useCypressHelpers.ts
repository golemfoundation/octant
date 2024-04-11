import { useEffect, useState } from 'react';

import env from 'env';
import useCypressMakeSnapshot from 'hooks/mutations/useCypressMakeSnapshot';
import useCypressMoveToDecisionWindowClosed from 'hooks/mutations/useCypressMoveToDecisionWindowClosed';
import useCypressMoveToDecisionWindowOpen from 'hooks/mutations/useCypressMoveToDecisionWindowOpen';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useEpochsIndexedBySubgraph from 'hooks/subgraph/useEpochsIndexedBySubgraph';

export default function useCypressHelpers(): { isFetching: boolean } {
  const [isRefetchingEpochs, setIsRefetchingEpochs] = useState<boolean>(false);

  const isHookEnabled = !!window.Cypress || env.network === 'Local';

  const {
    mutateAsync: mutateAsyncMoveToDecisionWindowOpen,
    isPending: isPendingMoveToDecisionWindowOpen,
  } = useCypressMoveToDecisionWindowOpen();
  const {
    mutateAsync: mutateAsyncMoveToDecisionWindowClosed,
    isPending: isPendingMoveToDecisionWindowClosed,
  } = useCypressMoveToDecisionWindowClosed();
  const { mutateAsync: mutateAsyncMakeSnapshot, isPending: isPendingMakeSnapshot } =
    useCypressMakeSnapshot();
  useIsDecisionWindowOpen({ refetchInterval: isHookEnabled ? 1000 : false });
  const { data: currentEpoch } = useCurrentEpoch({ refetchInterval: isHookEnabled ? 1000 : false });
  const { data: epochs } = useEpochsIndexedBySubgraph(isHookEnabled && isRefetchingEpochs);

  const isEpochAlreadyIndexedBySubgraph =
    epochs !== undefined && currentEpoch !== undefined && epochs.includes(currentEpoch);

  useEffect(() => {
    setIsRefetchingEpochs(!isEpochAlreadyIndexedBySubgraph);
  }, [isEpochAlreadyIndexedBySubgraph]);

  useEffect(() => {
    /**
     * In Cypress E2E tests some exclusive interactions with contracts are required.
     * Currently, it's moving the epoch to the next one via JSON RPC API.
     *
     * These need to be exposed from within the application instead of being called from Cypress itself.
     * Numerous attempts were made to call contracts via wagmiConfig.publicClient from Cypress,
     * all of which were unsuccessful (1).
     *
     * The only working solution for the moment is exposing these calls from within the applicaiton.
     *
     * (1) History of commits here: https://github.com/golemfoundation/octant/pull/13.
     */
    if (isHookEnabled) {
      window.mutateAsyncMoveToDecisionWindowOpen = mutateAsyncMoveToDecisionWindowOpen;
      window.mutateAsyncMoveToDecisionWindowClosed = mutateAsyncMoveToDecisionWindowClosed;
      window.mutateAsyncMakeSnapshot = mutateAsyncMakeSnapshot;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isFetching:
      isHookEnabled &&
      (!isEpochAlreadyIndexedBySubgraph ||
        isPendingMoveToDecisionWindowOpen ||
        isPendingMoveToDecisionWindowClosed ||
        isPendingMakeSnapshot),
  };
}

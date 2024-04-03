import { useEffect } from 'react';

import env from 'env';
import useCypressMoveToDecisionWindowClosed from 'hooks/mutations/useCypressMoveToDecisionWindowClosed';
import useCypressMoveToDecisionWindowOpen from 'hooks/mutations/useCypressMoveToDecisionWindowOpen';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useEpochs from 'hooks/subgraph/useEpochs';

export default function useCypressHelpers(): { isFetching: boolean } {
  const isHookEnabled = !!window.Cypress || env.network === 'Local';

  const { mutateAsync: mutateAsyncMoveToDecisionWindowOpen } = useCypressMoveToDecisionWindowOpen();
  const { mutateAsync: mutateAsyncMoveToDecisionWindowClosed } =
    useCypressMoveToDecisionWindowClosed();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: epochs } = useEpochs(isHookEnabled);

  const isEpochAlreadyIndexedBySubgraph =
    epochs !== undefined && currentEpoch !== undefined && epochs.includes(currentEpoch);

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
      // @ts-expect-error Left for debug purposes.
      window.mutateAsyncMoveToDecisionWindowOpen = mutateAsyncMoveToDecisionWindowOpen;
      // @ts-expect-error Left for debug purposes.
      window.mutateAsyncMoveToDecisionWindowClosed = mutateAsyncMoveToDecisionWindowClosed;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isFetching: isHookEnabled && isEpochAlreadyIndexedBySubgraph };
}

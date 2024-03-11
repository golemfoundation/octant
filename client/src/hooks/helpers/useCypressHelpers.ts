import { useEffect } from 'react';

import useCypressMoveEpoch from 'hooks/mutations/useCypressMoveEpoch';

export default function useCypressHelpers(): void {
  const { mutateAsync: mutateAsyncMoveEpoch } = useCypressMoveEpoch();

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
    if (window.Cypress) {
      // @ts-expect-error Left for debug purposes.
      window.mutateAsyncMoveEpoch = mutateAsyncMoveEpoch;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

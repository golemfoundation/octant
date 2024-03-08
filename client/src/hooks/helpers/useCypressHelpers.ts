import { useEffect } from 'react';

import useCypressMoveEpoch from 'hooks/mutations/useCypressMoveEpoch';

export default function useCypressHelpers(): void {
  const { mutateAsync: mutateAsyncMoveEpoch } = useCypressMoveEpoch();

  useEffect(() => {
    /**
     * Expose method for moving time for Cypress.
     * TODO OCT-1119: add explanation why it's here.
     */
    if (window.Cypress) {
      // @ts-expect-error Left for debug purposes.
      window.mutateAsyncMoveEpoch = mutateAsyncMoveEpoch;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

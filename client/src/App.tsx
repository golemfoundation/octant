import React, { ReactElement, useState, Fragment, useEffect } from 'react';

import 'react-toastify/dist/ReactToastify.css';

import AppLoader from 'components/shared/AppLoader';
import ModalOnboarding from 'components/shared/ModalOnboarding/ModalOnboarding';
import useAppConnectManager from 'hooks/helpers/useAppConnectManager';
import useAppIsLoading from 'hooks/helpers/useAppIsLoading';
import useAppPopulateState from 'hooks/helpers/useAppPopulateState';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useManageTransactionsPending from 'hooks/helpers/useManageTransactionsPending';
import useMoveEpoch from 'hooks/mutations/useMoveEpoch';
import RootRoutes from 'routes/RootRoutes/RootRoutes';

import 'styles/index.scss';
import 'i18n';

const App = (): ReactElement => {
  useManageTransactionsPending();
  useAppPopulateState();

  const [isFlushRequired, setIsFlushRequired] = useState(false);
  const { isSyncingInProgress } = useAppConnectManager(isFlushRequired, setIsFlushRequired);
  const isLoading = useAppIsLoading(isFlushRequired);
  const isProjectAdminMode = useIsProjectAdminMode();
  const { mutateAsync: mutateAsyncMoveEpoch } = useMoveEpoch();

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

  if (isLoading) {
    return <AppLoader />;
  }

  return (
    <Fragment>
      <RootRoutes isSyncingInProgress={isSyncingInProgress} />
      {!isSyncingInProgress && !isProjectAdminMode && <ModalOnboarding />}
    </Fragment>
  );
};

export default App;

import React, { ReactElement, useState, Fragment } from 'react';

import AppLoader from 'components/shared/AppLoader';
import ModalOnboarding from 'components/shared/ModalOnboarding/ModalOnboarding';
import useAppConnectManager from 'hooks/helpers/useAppConnectManager';
import useAppIsLoading from 'hooks/helpers/useAppIsLoading';
import useAppPopulateState from 'hooks/helpers/useAppPopulateState';
import useCypressHelpers from 'hooks/helpers/useCypressHelpers';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useManageTransactionsPending from 'hooks/helpers/useManageTransactionsPending';
import RootRoutes from 'routes/RootRoutes/RootRoutes';
import 'react-toastify/dist/ReactToastify.css';

import useEpochs from './hooks/subgraph/useEpochs';
import useCurrentEpoch from './hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from './hooks/queries/useIsDecisionWindowOpen';

import 'styles/index.scss';
import 'i18n';

const App = (): ReactElement => {
  useManageTransactionsPending();
  useAppPopulateState();

  const [isFlushRequired, setIsFlushRequired] = useState(false);
  const { isSyncingInProgress } = useAppConnectManager(isFlushRequired, setIsFlushRequired);
  const isLoading = useAppIsLoading(isFlushRequired);
  const isProjectAdminMode = useIsProjectAdminMode();

  // useCypressHelpers needs to be called after all the initial sets done above.
  const { isFetching: isFetchingCypressHelpers } = useCypressHelpers();
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: epochs } = useEpochs();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: currentEpoch } = useCurrentEpoch();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();

  if (isLoading && !isSyncingInProgress) {
    return <AppLoader />;
  }

  return (
    <Fragment>
      <RootRoutes isSyncingInProgress={isSyncingInProgress || isFetchingCypressHelpers} />
      {!isSyncingInProgress && !isProjectAdminMode && <ModalOnboarding />}
    </Fragment>
  );
};

export default App;

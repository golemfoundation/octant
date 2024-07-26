import { AnimatePresence } from 'framer-motion';
import React, { ReactElement, useState, Fragment } from 'react';
import { useAccount } from 'wagmi';

import AppLoader from 'components/shared/AppLoader';
import ModalOnboarding from 'components/shared/ModalOnboarding/ModalOnboarding';
import OnboardingStepper from 'components/shared/OnboardingStepper';
import useAppConnectManager from 'hooks/helpers/useAppConnectManager';
import useAppIsLoading from 'hooks/helpers/useAppIsLoading';
import useAppPopulateState from 'hooks/helpers/useAppPopulateState';
import useCypressHelpers from 'hooks/helpers/useCypressHelpers';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useManageTransactionsPending from 'hooks/helpers/useManageTransactionsPending';
import RootRoutes from 'routes/RootRoutes/RootRoutes';
import useOnboardingStore from 'store/onboarding/store';

import 'react-toastify/dist/ReactToastify.css';
import 'styles/index.scss';
import 'i18n';

const App = (): ReactElement => {
  useManageTransactionsPending();
  useAppPopulateState();

  const [isFlushRequired, setIsFlushRequired] = useState(false);
  const { isSyncingInProgress, isLocalStorageInitialized } = useAppConnectManager(
    isFlushRequired,
    setIsFlushRequired,
  );
  const isLoading = useAppIsLoading(isFlushRequired);
  const isProjectAdminMode = useIsProjectAdminMode();
  const { isConnected } = useAccount();
  const { isOnboardingDone, isOnboardingModalOpen } = useOnboardingStore(state => ({
    isOnboardingDone: state.data.isOnboardingDone,
    isOnboardingModalOpen: state.data.isOnboardingModalOpen,
  }));

  // useCypressHelpers needs to be called after all the initial sets done above.
  const { isFetching: isFetchingCypressHelpers } = useCypressHelpers();

  if ((isLoading || !isLocalStorageInitialized) && !isSyncingInProgress) {
    return <AppLoader />;
  }

  return (
    <Fragment>
      <RootRoutes isSyncingInProgress={isSyncingInProgress || isFetchingCypressHelpers} />
      {!isSyncingInProgress && !isProjectAdminMode && <ModalOnboarding />}
      <AnimatePresence>
        {isConnected && !isOnboardingDone && !isOnboardingModalOpen && <OnboardingStepper />}
      </AnimatePresence>
    </Fragment>
  );
};

export default App;

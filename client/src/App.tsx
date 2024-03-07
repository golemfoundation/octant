import React, { ReactElement, useState, Fragment, useEffect } from 'react';
// import { useConfig } from 'wagmi'
// import { useQueryClient } from '@tanstack/react-query';

import 'react-toastify/dist/ReactToastify.css';

import AppLoader from 'components/shared/AppLoader';
import ModalOnboarding from 'components/shared/ModalOnboarding/ModalOnboarding';
import useAppConnectManager from 'hooks/helpers/useAppConnectManager';
import useAppIsLoading from 'hooks/helpers/useAppIsLoading';
import useAppPopulateState from 'hooks/helpers/useAppPopulateState';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useManageTransactionsPending from 'hooks/helpers/useManageTransactionsPending';
import RootRoutes from 'routes/RootRoutes/RootRoutes';

import 'styles/index.scss';
import 'i18n';
// import { readContractEpochs } from './hooks/contracts/readContracts.ts';
// import { QUERY_KEYS } from './api/queryKeys';

const App = (): ReactElement => {
  useManageTransactionsPending();
  useAppPopulateState();

  const [isFlushRequired, setIsFlushRequired] = useState(false);
  const { isSyncingInProgress } = useAppConnectManager(isFlushRequired, setIsFlushRequired);
  const isLoading = useAppIsLoading(isFlushRequired);
  const isProjectAdminMode = useIsProjectAdminMode();
  // const config = useConfig();
  // const queryClient = useQueryClient();

  useEffect(() => {
    if (window.Cypress) {
      // @ts-expect-error Left for debug purposes.
      window.isAppReady = true;
    }
  }, []);

  // useEffect(() => {
  //   if (window.Cypress) {
  //     // @ts-expect-error Left for debug purposes.
  //     window.wagmiConfig = config;
  //
  //     // @ts-expect-error Left for debug purposes.
  //     window.getCurrentEpoch = queryClient.fetchQuery({
  //       queryFn: () =>
  //         readContractEpochs({
  //           functionName: 'getCurrentEpoch',
  //           publicClient: config.publicClient,
  //         }),
  //       queryKey: QUERY_KEYS.currentEpoch,
  //     });
  //
  //     window.getBlock = config.publicClient.getBlock();
  //
  //     // @ts-expect-error Left for debug purposes.
  //     window.getCurrentEpochEnd = queryClient.fetchQuery({
  //       queryFn: () =>
  //         readContractEpochs({
  //           functionName: 'getCurrentEpochEnd',
  //           publicClient: config.publicClient,
  //         }),
  //       queryKey: QUERY_KEYS.currentEpochEnd,
  //     });
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

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

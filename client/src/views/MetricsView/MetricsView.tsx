import React, { ReactElement, useLayoutEffect } from 'react';

import MetricsEpoch from 'components/Metrics/MetricsEpoch';
import MetricsGeneral from 'components/Metrics/MetricsGeneral/MetricsGeneral';
import MetricsNavigation from 'components/Metrics/MetricsNavigation';
import MetricsPersonal from 'components/Metrics/MetricsPersonal';
import Layout from 'components/shared/Layout';
import { MetricsEpochProvider } from 'hooks/helpers/useMetrcisEpoch';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';

import styles from './MetricsView.module.scss';

const MetricsView = (): ReactElement => {
  const { data: currentEpoch } = useCurrentEpoch();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  });

  return (
    <Layout classNameBody={styles.layout} dataTest="MetricsView" isAbsoluteHeaderPosition>
      {/* Workaround for epoch 0 allocation window (no epoch 0 metrics) */}
      {/* useMetricsEpoch.tsx:19 -> const lastEpoch = currentEpoch! - 1; */}
      {currentEpoch === 1 ? (
        "It's epoch 0."
      ) : (
        <>
          <MetricsNavigation />
          <MetricsEpochProvider>
            <MetricsEpoch />
          </MetricsEpochProvider>
          <MetricsGeneral />
          <MetricsPersonal />
        </>
      )}
    </Layout>
  );
};

export default MetricsView;

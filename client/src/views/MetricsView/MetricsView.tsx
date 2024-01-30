import React, { ReactElement, useLayoutEffect } from 'react';

import MetricsEpoch from 'components/Metrics/MetricsEpoch';
import MetricsGeneral from 'components/Metrics/MetricsGeneral/MetricsGeneral';
import MetricsNavigation from 'components/Metrics/MetricsNavigation';
import MetricsPersonal from 'components/Metrics/MetricsPersonal';
import MetricsTipTile from 'components/Metrics/MetricsTipTile';
import Layout from 'components/shared/Layout';
import { MetricsEpochProvider } from 'hooks/helpers/useMetrcisEpoch';

import styles from './MetricsView.module.scss';

const MetricsView = (): ReactElement => {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  });

  return (
    <Layout classNameBody={styles.layout} dataTest="MetricsView" isAbsoluteHeaderPosition>
      <MetricsTipTile />
      <MetricsNavigation />
      <MetricsEpochProvider>
        <MetricsEpoch />
      </MetricsEpochProvider>
      <MetricsGeneral />
      <MetricsPersonal />
    </Layout>
  );
};

export default MetricsView;

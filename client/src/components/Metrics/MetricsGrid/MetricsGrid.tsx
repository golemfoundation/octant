import React, { ReactElement } from 'react';

import MetricsLargestGlmLock from 'components/Metrics/MetricsGrid/MetricsLargestGlmLock/MetricsLargestGlmLock';
import MetricsTimeCounter from 'components/Metrics/MetricsGrid/MetricsTimeCounter/MetricsTimeCounter';
import MetricsTotalAddresses from 'components/Metrics/MetricsGrid/MetricsTotalAddresses/MetricsTotalAddresses';
import MetricsTotalEthStaked from 'components/Metrics/MetricsGrid/MetricsTotalEthStaked/MetricsTotalEthStaked';
import MetricsTotalGlmLockedAndTotalSupply from 'components/Metrics/MetricsGrid/MetricsTotalGlmLockedAndTotalSupply/MetricsTotalGlmLockedAndTotalSupply';
import MetricsTotalProjects from 'components/Metrics/MetricsGrid/MetricsTotalProjects/MetricsTotalProjects';

import styles from './MetricsGrid.module.scss';

const MetricsGrid = (): ReactElement => (
  <div className={styles.metricsGrid}>
    <MetricsTimeCounter />
    <MetricsTotalProjects />
    <MetricsTotalEthStaked />
    <MetricsTotalGlmLockedAndTotalSupply />
    <MetricsTotalAddresses />
    <MetricsLargestGlmLock />
  </div>
);

export default MetricsGrid;

import React, { ReactElement } from 'react';

import MetricsGrid from 'components/Metrics/MetricsGrid/MetricsGrid';
import MetricsTipTile from 'components/Metrics/MetricsTipTile/MetricsTipTile';
import MainLayout from 'layouts/MainLayout/MainLayout';

const MetricsView = (): ReactElement => (
  <MainLayout dataTest="MetricsView">
    <MetricsTipTile />
    <MetricsGrid />
  </MainLayout>
);

export default MetricsView;

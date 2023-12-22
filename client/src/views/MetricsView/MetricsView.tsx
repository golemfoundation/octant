import React, { ReactElement } from 'react';

import MetricsGrid from 'components/Metrics/MetricsGrid';
import MetricsTipTile from 'components/Metrics/MetricsTipTile';
import Layout from 'components/shared/Layout';

const MetricsView = (): ReactElement => (
  <Layout dataTest="MetricsView">
    <MetricsTipTile />
    <MetricsGrid />
  </Layout>
);

export default MetricsView;

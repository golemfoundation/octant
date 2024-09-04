import React, { ReactElement, useLayoutEffect } from 'react';

import MetricsEpoch from 'components/Metrics/MetricsEpoch';
import MetricsGeneral from 'components/Metrics/MetricsGeneral/MetricsGeneral';
import MetricsNavigation from 'components/Metrics/MetricsNavigation';
import MetricsPersonal from 'components/Metrics/MetricsPersonal';
import { MetricsEpochProvider } from 'hooks/helpers/useMetrcisEpoch';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';

const MetricsView = (): ReactElement => {
  const { data: currentEpoch } = useCurrentEpoch();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {/* Workaround for epoch 0 allocation window (no epoch 0 metrics) */}
      {/* useMetricsEpoch.tsx:19 -> const lastEpoch = currentEpoch! - 1; */}
      {currentEpoch === 1 ? (
        "It's Epoch 1, so there are no metrics for the past. It's just a placeholder, please come back in Epoch 2."
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
    </>
  );
};

export default MetricsView;

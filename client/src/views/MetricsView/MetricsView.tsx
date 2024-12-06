import React, { ReactElement, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsEpoch from 'components/Metrics/MetricsEpoch';
import MetricsGeneral from 'components/Metrics/MetricsGeneral/MetricsGeneral';
import ViewTitle from 'components/shared/ViewTitle/ViewTitle';
import { MetricsEpochProvider } from 'hooks/helpers/useMetrcisEpoch';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';

import styles from './MetricsView.module.scss';

const MetricsView = (): ReactElement => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });
  const { data: currentEpoch } = useCurrentEpoch();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={styles.root} data-test="MetricsView">
      {/* Workaround for epoch 0 allocation window (no epoch 0 metrics) */}
      {/* useMetricsEpoch.tsx:19 -> const lastEpoch = currentEpoch! - 1; */}
      {currentEpoch === 1 ? (
        t('epoch1Info')
      ) : (
        <>
          <ViewTitle dataTest="MetricsView__title">{t('exploreTheData')}</ViewTitle>
          <MetricsEpochProvider>
            <MetricsEpoch />
          </MetricsEpochProvider>
          <MetricsGeneral />
        </>
      )}
    </div>
  );
};

export default MetricsView;

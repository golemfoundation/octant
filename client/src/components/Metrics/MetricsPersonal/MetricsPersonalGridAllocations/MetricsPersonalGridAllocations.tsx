import React, { FC, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import MetricsProjectsList from 'components/Metrics/MetricsProjectsList';
import Img from 'components/ui/Img';
import useMetricsEpoch from 'hooks/helpers/useMetrcisEpoch';
import useUserAllocations from 'hooks/queries/useUserAllocations';

import styles from './MetricsPersonalGridAllocations.module.scss';
import MetricsPersonalGridAllocationsProps from './types';

const MetricsPersonalGridAllocations: FC<MetricsPersonalGridAllocationsProps> = ({ isLoading }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });
  const { lastEpoch } = useMetricsEpoch();
  const { data: userAllocations } = useUserAllocations();
  const projects = userAllocations?.elements || [];

  const areAllocationsEmpty = !isLoading && userAllocations?.elements.length === 0;

  const children = useMemo(() => {
    if (areAllocationsEmpty) {
      return (
        <div className={styles.noAllocationsYet}>
          <Img className={styles.noAllocationsYetImage} src="/images/headphones_girl.webp" />
          <div className={styles.noAllocationsYetLabel}>{t('noAllocationsYet')}</div>
        </div>
      );
    }

    return (
      <MetricsProjectsList
        epoch={lastEpoch}
        isLoading={isLoading}
        numberOfSkeletons={4}
        projects={projects}
      />
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, areAllocationsEmpty, projects.length, t]);

  return (
    <MetricsGridTile
      groups={[
        {
          children,
          title: t('allocationsInEth'),
          titleSuffix: <div className={styles.numberOfAllocationsSuffix}>{projects.length}</div>,
        },
      ]}
      size="L"
    />
  );
};

export default memo(MetricsPersonalGridAllocations);

import React, { FC, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import MetricsProjectsList from 'components/Metrics/MetricsProjectsList';
import Img from 'components/ui/Img';
import useUserAllocationsAllEpochs from 'hooks/helpers/useUserAllocationsAllEpochs';

import styles from './MetricsPersonalGridAllocations.module.scss';
import MetricsPersonalGridAllocationsProps from './types';
import { getReducedUserAllocationsAllEpochs } from './utils';

const MetricsPersonalGridAllocations: FC<MetricsPersonalGridAllocationsProps> = ({ isLoading }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });
  const { data: userAllocationsAllEpochs } = useUserAllocationsAllEpochs();
  const reducedUserAllocationsAllEpochs =
    getReducedUserAllocationsAllEpochs(userAllocationsAllEpochs);

  const areAllocationsEmpty = !isLoading && reducedUserAllocationsAllEpochs?.length === 0;

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
        isLoading={isLoading}
        numberOfSkeletons={4}
        projects={reducedUserAllocationsAllEpochs}
      />
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, areAllocationsEmpty, reducedUserAllocationsAllEpochs?.length, t]);

  return (
    <MetricsGridTile
      groups={[
        {
          children,
          title: t('allocationsInEth'),
          titleSuffix: (
            <div className={styles.numberOfAllocationsSuffix}>
              {reducedUserAllocationsAllEpochs.length}
            </div>
          ),
        },
      ]}
      size="L"
    />
  );
};

export default memo(MetricsPersonalGridAllocations);

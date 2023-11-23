import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import TimeCounter from 'components/dedicated/TimeCounter/TimeCounter';
import MetricsGridTile from 'components/Metrics/MetricsGrid/common/MetricsGridTile/MetricsGridTile';
import useEpochAndAllocationTimestamps from 'hooks/helpers/useEpochAndAllocationTimestamps';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useCurrentEpochProps from 'hooks/queries/useCurrentEpochProps';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';

import styles from './MetricsTimeCounter.module.scss';
import MetricsTimeCounterProps from './types';

const MetricsTimeCounter: FC<MetricsTimeCounterProps> = ({ isLoading = false }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });

  const { data: currentEpoch } = useCurrentEpoch({
    refetchOnWindowFocus: true,
  });
  const { data: currentEpochProps } = useCurrentEpochProps();
  const { timeCurrentAllocationEnd, timeCurrentEpochEnd } = useEpochAndAllocationTimestamps();

  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();

  const counterProps = isDecisionWindowOpen
    ? {
        duration: currentEpochProps?.decisionWindow,
        timestamp: timeCurrentAllocationEnd,
      }
    : {
        duration: currentEpochProps?.duration,
        timestamp: timeCurrentEpochEnd,
      };

  return (
    <MetricsGridTile
      dataTest="MetricsTimeCounter"
      groups={[
        {
          children: (
            <TimeCounter
              className={styles.timeCounter}
              isLoading={isLoading}
              variant="metrics"
              {...counterProps}
            />
          ),
          hasTitileBottomPadding: false,
          // AW is part of the epoch it proceeds, so Epoch 1 AW is during Epoch 2.
          title: isDecisionWindowOpen
            ? t('epochAllocationEndsIn', { epoch: currentEpoch! - 1 })
            : t('epochAllocationStartsIn', { epoch: currentEpoch }),
        },
      ]}
      size="M"
    />
  );
};

export default MetricsTimeCounter;

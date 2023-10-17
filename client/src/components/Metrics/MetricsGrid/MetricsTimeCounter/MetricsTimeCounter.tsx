import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import TimeCounter from 'components/dedicated/TimeCounter/TimeCounter';
import MetricsGridTile from 'components/Metrics/MetricsGrid/common/MetricsGridTile/MetricsGridTile';
import useEpochAndAllocationTimestamps from 'hooks/helpers/useEpochAndAllocationTimestamps';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useCurrentEpochProps from 'hooks/queries/useCurrentEpochProps';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useProposalsContract from 'hooks/queries/useProposalsContract';
import useLockedSummaryLatest from 'hooks/subgraph/useLockedSummaryLatest';

import styles from './MetricsTimeCounter.module.scss';
import MetricsTimeCounterProps from './types';

const MetricsTimeCounter: FC<MetricsTimeCounterProps> = ({ isLoading = false }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });

  const { data: currentEpoch, refetch: refetchCurrentEpoch } = useCurrentEpoch({
    refetchOnWindowFocus: true,
  });
  const { data: currentEpochProps, refetch: refetchCurrentEpochProps } = useCurrentEpochProps();
  const { timeCurrentAllocationEnd, timeCurrentEpochEnd } = useEpochAndAllocationTimestamps();

  const { refetch: refetchLockedSummaryLatest } = useLockedSummaryLatest();
  const { refetch: refetchProposals } = useProposalsContract();
  const { data: isDecisionWindowOpen, refetch: refetchIsDecisionWindowOpen } =
    useIsDecisionWindowOpen();

  const onCountingFinish = () => {
    refetchCurrentEpoch();
    refetchLockedSummaryLatest();
    refetchIsDecisionWindowOpen();
    refetchProposals();
    refetchCurrentEpochProps();
  };

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
      groups={[
        {
          children: (
            <TimeCounter
              className={styles.timeCounter}
              isLoading={isLoading}
              onCountingFinish={onCountingFinish}
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

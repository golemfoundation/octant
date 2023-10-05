import React, { ReactElement } from 'react';
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

const MetricsTimeCounter = (): ReactElement => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });

  const { data: currentEpoch } = useCurrentEpoch();
  const { data: currentEpochProps } = useCurrentEpochProps();
  const { timeCurrentAllocationEnd, timeCurrentEpochEnd } = useEpochAndAllocationTimestamps();

  const { refetch: refetchCurrentEpochProps } = useCurrentEpochProps();
  const { refetch: refetchLockedSummaryLatest } = useLockedSummaryLatest();
  const { refetch: refetchCurrentEpoch } = useCurrentEpoch({
    refetchOnWindowFocus: true,
  });
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
              onCountingFinish={onCountingFinish}
              variant="metrics"
              {...counterProps}
            />
          ),
          title: t(isDecisionWindowOpen ? 'epochAllocationEndsIn' : 'epochAllocationStartsIn', {
            currentEpoch,
          }),
        },
      ]}
      size="M"
    />
  );
};

export default MetricsTimeCounter;

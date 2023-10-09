import React, { ReactElement } from 'react';

import MetricsLargestGlmLock from 'components/Metrics/MetricsGrid/MetricsLargestGlmLock/MetricsLargestGlmLock';
import MetricsTimeCounter from 'components/Metrics/MetricsGrid/MetricsTimeCounter/MetricsTimeCounter';
import MetricsTotalAddresses from 'components/Metrics/MetricsGrid/MetricsTotalAddresses/MetricsTotalAddresses';
import MetricsTotalEthStaked from 'components/Metrics/MetricsGrid/MetricsTotalEthStaked/MetricsTotalEthStaked';
import MetricsTotalGlmLockedAndTotalSupply from 'components/Metrics/MetricsGrid/MetricsTotalGlmLockedAndTotalSupply/MetricsTotalGlmLockedAndTotalSupply';
import MetricsTotalProjects from 'components/Metrics/MetricsGrid/MetricsTotalProjects/MetricsTotalProjects';
import useAllProposals from 'hooks/queries/useAllProposals';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useCurrentEpochProps from 'hooks/queries/useCurrentEpochProps';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useProposalsContract from 'hooks/queries/useProposalsContract';
import useLargestLockedAmount from 'hooks/subgraph/useLargestLockedAmount';
import useLockedSummaryLatest from 'hooks/subgraph/useLockedSummaryLatest';
import useTotalAddresses from 'hooks/subgraph/useTotalAddresses';
import useSettingsStore from 'store/settings/store';

import styles from './MetricsGrid.module.scss';

const MetricsGrid = (): ReactElement => {
  const {
    data: { displayCurrency },
  } = useSettingsStore(({ data }) => ({
    data: {
      displayCurrency: data.displayCurrency,
      isCryptoMainValueDisplay: data.isCryptoMainValueDisplay,
    },
  }));

  const { isFetching: isFetchingLargestLockedAmount } = useLargestLockedAmount();
  const { isFetching: isFetchingCurrentEpoch } = useCurrentEpoch();
  const { isFetching: isFetchingCurrentEpochProps } = useCurrentEpochProps();
  const { isFetching: isFetchingDecisionWindow } = useIsDecisionWindowOpen();
  const { isFetching: isFetchingTotalAddresses } = useTotalAddresses();
  const { isFetching: isFetchingLockedSummaryLatest } = useLockedSummaryLatest();
  const { isFetching: isFetchingCryptoValues } = useCryptoValues(displayCurrency);
  const { isFetching: isFetchingAllProposals } = useAllProposals();
  const { isFetching: isFetchingProposalsContract } = useProposalsContract();

  // All metrics should be visible in the same moment (design). Skeletons are visible to the end of fetching all needed data.
  const isLoading =
    isFetchingLargestLockedAmount ||
    isFetchingCurrentEpoch ||
    isFetchingCurrentEpochProps ||
    isFetchingDecisionWindow ||
    isFetchingTotalAddresses ||
    isFetchingLockedSummaryLatest ||
    isFetchingCryptoValues ||
    isFetchingAllProposals ||
    isFetchingProposalsContract;

  return (
    <div className={styles.metricsGrid}>
      <MetricsTimeCounter isLoading={isLoading} />
      <MetricsTotalProjects isLoading={isLoading} />
      <MetricsTotalEthStaked isLoading={isLoading} />
      <MetricsTotalGlmLockedAndTotalSupply isLoading={isLoading} />
      <MetricsTotalAddresses isLoading={isLoading} />
      <MetricsLargestGlmLock isLoading={isLoading} />
    </div>
  );
};

export default MetricsGrid;

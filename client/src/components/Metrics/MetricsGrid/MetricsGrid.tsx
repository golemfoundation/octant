import React, { ReactElement } from 'react';

import MetricsGridCumulativeGlmLocked from 'components/Metrics/MetricsGrid/MetricsGridCumulativeGlmLocked';
import MetricsGridLargestGlmLock from 'components/Metrics/MetricsGrid/MetricsGridLargestGlmLock';
import MetricsGridTimeCounter from 'components/Metrics/MetricsGrid/MetricsGridTimeCounter';
import MetricsGridTotalAddresses from 'components/Metrics/MetricsGrid/MetricsGridTotalAddresses';
import MetricsGridTotalEthStaked from 'components/Metrics/MetricsGrid/MetricsGridTotalEthStaked';
import MetricsGridTotalGlmLockedAndTotalSupply from 'components/Metrics/MetricsGrid/MetricsGridTotalGlmLockedAndTotalSupply';
import MetricsGridTotalProjects from 'components/Metrics/MetricsGrid/MetricsGridTotalProjects';
import MetricsGridWalletsWithGlmLocked from 'components/Metrics/MetricsGrid/MetricsGridWalletsWithGlmLocked';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useCurrentEpochProps from 'hooks/queries/useCurrentEpochProps';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useProposalsContract from 'hooks/queries/useProposalsContract';
import useAllProposals from 'hooks/subgraph/useAllProposals';
import useLargestLockedAmount from 'hooks/subgraph/useLargestLockedAmount';
import useLockedsData from 'hooks/subgraph/useLockedsData';
import useLockedSummaryLatest from 'hooks/subgraph/useLockedSummaryLatest';
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
  const { isFetching: isFetchingLockedsData } = useLockedsData();
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
    isFetchingLockedsData ||
    isFetchingLockedSummaryLatest ||
    isFetchingCryptoValues ||
    isFetchingAllProposals ||
    isFetchingProposalsContract;

  return (
    <div className={styles.metricsGrid} data-test="MetricsGrid">
      <MetricsGridTimeCounter isLoading={isLoading} />
      <MetricsGridTotalProjects isLoading={isLoading} />
      <MetricsGridTotalEthStaked isLoading={isLoading} />
      <MetricsGridTotalGlmLockedAndTotalSupply isLoading={isLoading} />
      <MetricsGridWalletsWithGlmLocked />
      <MetricsGridCumulativeGlmLocked />
      <MetricsGridTotalAddresses isLoading={isLoading} />
      <MetricsGridLargestGlmLock isLoading={isLoading} />
    </div>
  );
};

export default MetricsGrid;

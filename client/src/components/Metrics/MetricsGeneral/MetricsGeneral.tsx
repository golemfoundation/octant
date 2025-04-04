import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGeneralGridCumulativeGlmLocked from 'components/Metrics/MetricsGeneral/MetricsGeneralGridCumulativeGlmLocked';
import MetricsGeneralGridTotalEthStaked from 'components/Metrics/MetricsGeneral/MetricsGeneralGridTotalEthStaked';
import MetricsGeneralGridTotalGlmLockedAndTotalSupply from 'components/Metrics/MetricsGeneral/MetricsGeneralGridTotalGlmLockedAndTotalSupply';
import MetricsGeneralGridTotalProjects from 'components/Metrics/MetricsGeneral/MetricsGeneralGridTotalProjects';
import MetricsGeneralGridWalletsWithGlmLocked from 'components/Metrics/MetricsGeneral/MetricsGeneralGridWalletsWithGlmLocked';
import MetricsGrid from 'components/Metrics/MetricsGrid';
import MetricsSectionHeader from 'components/Metrics/MetricsSectionHeader';
import { METRICS_GENERAL_ID } from 'constants/domElementsIds';
import useAllSablierStreamsSum from 'hooks/queries/useAllSablierStreams';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import useProjectsEpoch from 'hooks/queries/useProjectsEpoch';
import useAllProjects from 'hooks/subgraph/useAllProjects';
import useLockedsData from 'hooks/subgraph/useLockedsData';
import useLockedSummaryLatest from 'hooks/subgraph/useLockedSummaryLatest';
import useSettingsStore from 'store/settings/store';

import styles from './MetricsGeneral.module.scss';

const MetricsGeneral = (): ReactElement => {
  const dataTestRoot = 'MetricsGeneral';
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });
  const {
    data: { displayCurrency },
  } = useSettingsStore(({ data }) => ({
    data: {
      displayCurrency: data.displayCurrency,
      isCryptoMainValueDisplay: data.isCryptoMainValueDisplay,
    },
  }));
  const { isFetching: isFetchingLockedSummaryLatest } = useLockedSummaryLatest();
  const { isFetching: isFetchingCryptoValues } = useCryptoValues(displayCurrency);
  const { isFetching: isFetchingAllProjects } = useAllProjects();
  const { isFetching: isFetchingProjectsEpoch } = useProjectsEpoch();
  const { isFetching: isFetchingLockedsData } = useLockedsData();
  const { isFetching: isFetchingAllSablierStreamsSum } = useAllSablierStreamsSum();

  // All metrics should be visible in the same moment (design). Skeletons are visible to the end of fetching all needed data.
  const isLoading =
    isFetchingLockedsData ||
    isFetchingLockedSummaryLatest ||
    isFetchingCryptoValues ||
    isFetchingAllProjects ||
    isFetchingProjectsEpoch ||
    isFetchingAllSablierStreamsSum;

  return (
    <div className={styles.root} data-test={dataTestRoot} id={METRICS_GENERAL_ID}>
      <MetricsSectionHeader dataTest={`${dataTestRoot}__header`} title={t('generalMetrics')} />
      <MetricsGrid className={styles.grid} dataTest={`${dataTestRoot}__MetricsGrid`}>
        <MetricsGeneralGridCumulativeGlmLocked />
        <MetricsGeneralGridWalletsWithGlmLocked />
        <MetricsGeneralGridTotalGlmLockedAndTotalSupply isLoading={isLoading} />
        <MetricsGeneralGridTotalProjects isLoading={isLoading} />
        <MetricsGeneralGridTotalEthStaked isLoading={isLoading} />
      </MetricsGrid>
    </div>
  );
};

export default MetricsGeneral;

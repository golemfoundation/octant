import React, { FC } from 'react';

import MetricsProjectsListItem from 'components/Metrics/MetricsProjectsListItem';
import MetricsProjectsListSkeletonItem from 'components/Metrics/MetricsProjectsListSkeletonItem';
import useGetValuesToDisplay from 'hooks/helpers/useGetValuesToDisplay';

import styles from './MetricsProjectsList.module.scss';
import MetricsProjectsListProps from './types';

const MetricsProjectsList: FC<MetricsProjectsListProps> = ({
  projects,
  isLoading,
  numberOfSkeletons,
  dataTest = 'MetricsProjectsList',
}) => {
  const getValuesToDisplay = useGetValuesToDisplay();

  return (
    <div className={styles.root} data-test={dataTest}>
      <div className={styles.projectsList}>
        {isLoading
          ? Array.from(Array(numberOfSkeletons)).map((_, idx) => (
              // eslint-disable-next-line react/no-array-index-key
              <MetricsProjectsListSkeletonItem key={`skeleton-${idx}`} />
            ))
          : projects.map(project => (
              <MetricsProjectsListItem
                key={project.address}
                address={project.address}
                dataTest={`${dataTest}__item`}
                donations={
                  getValuesToDisplay({
                    cryptoCurrency: 'ethereum',
                    getFormattedEthValueProps: {
                      shouldIgnoreGwei: true,
                      shouldIgnoreWei: true,
                    },
                    showCryptoSuffix: true,
                    showFiatPrefix: true,
                    valueCrypto: project.donations,
                  }).primary
                }
                epoch={project.epoch}
                matchFunding={
                  getValuesToDisplay({
                    cryptoCurrency: 'ethereum',
                    getFormattedEthValueProps: {
                      shouldIgnoreGwei: true,
                      shouldIgnoreWei: true,
                    },
                    showCryptoSuffix: true,
                    valueCrypto: project.matchedRewards,
                  }).primary
                }
                numberOfDonors={project.numberOfDonors}
                total={
                  getValuesToDisplay({
                    cryptoCurrency: 'ethereum',
                    getFormattedEthValueProps: {
                      shouldIgnoreGwei: true,
                      shouldIgnoreWei: true,
                    },
                    showCryptoSuffix: true,
                    valueCrypto: project.totalValueOfAllocations,
                  }).primary
                }
              />
            ))}
      </div>
    </div>
  );
};

export default MetricsProjectsList;

import cx from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import PieChart from 'components/ui/PieChart';
import useMetricsEpoch from 'hooks/helpers/useMetrcisEpoch';
import useEpochInfo from 'hooks/queries/useEpochInfo';
import { formatUnitsBigInt } from 'utils/formatUnitsBigInt';
import getFormattedEthValue from 'utils/getFormattedEthValue';

import styles from './MetricsEpochGridFundsUsage.module.scss';
import MetricsEpochGridFundsUsageProps from './types';

const MetricsEpochGridFundsUsage: FC<MetricsEpochGridFundsUsageProps> = ({
  isLoading,
  className,
  totalUserDonationsWithPatronRewards,
  unusedRewards,
  ethBelowThreshold,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });
  const { epoch } = useMetricsEpoch();
  const { data: epochInfo } = useEpochInfo(epoch);

  const getNumberValue = (value: bigint) =>
    Number(Number(formatUnitsBigInt(value, 'wei')).toFixed(3));

  const leftover = epochInfo ? epochInfo.leftover : BigInt(0);

  const projectCosts = epochInfo ? epochInfo.operationalCost : BigInt(0);
  const staking = epochInfo ? epochInfo.staking : BigInt(0);
  const ppf = epochInfo ? epochInfo.ppf : BigInt(0);
  const communityFund = epochInfo ? epochInfo.communityFund : BigInt(0);

  const donatedToProjects = epochInfo
    ? epochInfo.matchedRewards +
      (totalUserDonationsWithPatronRewards - epochInfo.patronsRewards) -
      ethBelowThreshold
    : BigInt(0);

  /**
   * PPF includes epochInfo.individualRewards.
   * Half of PPF goes to the users to manage.
   * Half of PPR goes to "PPF" section.
   */
  const claimedByUsers = epochInfo
    ? epochInfo.ppf / 2n - totalUserDonationsWithPatronRewards - unusedRewards
    : BigInt(0);

  const total =
    claimedByUsers + donatedToProjects + projectCosts + staking + ppf + communityFund + leftover;

  const data = [
    {
      label: t('donatedToProjects'),
      value: getNumberValue(donatedToProjects),
      valueLabel: getFormattedEthValue(donatedToProjects, true, false, false, 2).fullString,
    },
    {
      label: t('leftover', { epochNumber: epoch + 1 }),
      value: getNumberValue(leftover),
      valueLabel: getFormattedEthValue(leftover, true, false, false, 2).fullString,
    },
    {
      label: t('projectCosts'),
      value: getNumberValue(projectCosts),
      valueLabel: getFormattedEthValue(projectCosts, true, false, false, 2).fullString,
    },
    {
      label: t('claimedByUsers'),
      value: getNumberValue(claimedByUsers),
      valueLabel: getFormattedEthValue(claimedByUsers, true, false, false, 2).fullString,
    },
    {
      label: t('staking'),
      value: getNumberValue(staking),
      valueLabel: getFormattedEthValue(staking, true, false, false, 2).fullString,
    },
    {
      label: t('communityFund'),
      value: getNumberValue(communityFund),
      valueLabel: getFormattedEthValue(communityFund, true, false, false, 2).fullString,
    },
    {
      label: t('ppf'),
      value: getNumberValue(ppf / 2n),
      valueLabel: getFormattedEthValue(ppf, true, false, false, 2).fullString,
    },
  ];

  return (
    <MetricsGridTile
      className={cx(styles.root, className)}
      dataTest="MetricsEpochGridFundsUsage"
      groups={[
        {
          children: (
            <>
              <div className={styles.pieChartWrapper}>
                <PieChart data={data} isLoading={isLoading} />
              </div>
              <div className={styles.epochTotal}>
                <div className={cx(styles.label, isLoading && styles.isLoading)}>
                  {!isLoading && t('epochTotal', { epoch })}
                </div>
                <div className={cx(styles.value, isLoading && styles.isLoading)}>
                  {!isLoading && getFormattedEthValue(total).fullString}
                </div>
              </div>
            </>
          ),
          title: t('fundsUsage', { epoch }),
        },
      ]}
      size="L"
    />
  );
};

export default MetricsEpochGridFundsUsage;

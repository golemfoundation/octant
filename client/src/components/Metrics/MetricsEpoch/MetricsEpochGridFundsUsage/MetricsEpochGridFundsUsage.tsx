import cx from 'classnames';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import PieChart from 'components/ui/PieChart';
import networkConfig from 'constants/networkConfig';
import useGetValuesToDisplay from 'hooks/helpers/useGetValuesToDisplay';
import useMetricsEpoch from 'hooks/helpers/useMetrcisEpoch';
import useEpochInfo from 'hooks/queries/useEpochInfo';
import { formatUnitsBigInt } from 'utils/formatUnitsBigInt';

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
  const getValuesToDisplay = useGetValuesToDisplay();
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

  const claimedByUsers = useMemo(() => {
    if (!epochInfo) {
      return BigInt(0);
    }
    /**
     * epochInfo.ppf includes epochInfo.individualRewards.
     * Half of PPF goes to the users to manage.
     * Half of PPR goes to "PPF" section.
     */
    if (epoch >= 3) {
      return (
        ppf / 2n +
        epochInfo.vanillaIndividualRewards -
        totalUserDonationsWithPatronRewards -
        unusedRewards
      );
    }

    return epochInfo.vanillaIndividualRewards - totalUserDonationsWithPatronRewards - unusedRewards;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    epoch,
    epochInfo?.ppf,
    epochInfo?.vanillaIndividualRewards,
    totalUserDonationsWithPatronRewards,
    unusedRewards,
    ppf,
  ]);

  const total =
    claimedByUsers +
    donatedToProjects +
    projectCosts +
    staking +
    ppf / 2n +
    communityFund +
    leftover;

  // Testnet has much lower staking proceeds. Number of places needs to be bigger to see more than 0.
  const numberOfDecimalPlacesToUse = networkConfig.isTestnet ? 10 : 2;

  const getFormattedEthValueProps = {
    isUsingHairSpace: true,
    numberOfDecimalPlaces: numberOfDecimalPlacesToUse,
    shouldIgnoreGwei: false,
    shouldIgnoreWei: false,
  };

  const data = [
    {
      label: t('donatedToProjects'),
      value: getNumberValue(donatedToProjects),
      valueLabel: getValuesToDisplay({
        cryptoCurrency: 'ethereum',
        getFormattedEthValueProps,
        showCryptoSuffix: true,
        valueCrypto: donatedToProjects,
      }).primary,
    },
    {
      label: t('leftover', { epochNumber: epoch + 1 }),
      value: getNumberValue(leftover),
      valueLabel: getValuesToDisplay({
        cryptoCurrency: 'ethereum',
        getFormattedEthValueProps,
        showCryptoSuffix: true,
        valueCrypto: leftover,
      }).primary,
    },
    {
      label: t('projectCosts'),
      value: getNumberValue(projectCosts),
      valueLabel: getValuesToDisplay({
        cryptoCurrency: 'ethereum',
        getFormattedEthValueProps,
        showCryptoSuffix: true,
        valueCrypto: projectCosts,
      }).primary,
    },
    {
      label: t('claimedByUsers'),
      value: getNumberValue(claimedByUsers),
      valueLabel: getValuesToDisplay({
        cryptoCurrency: 'ethereum',
        getFormattedEthValueProps,
        showCryptoSuffix: true,
        valueCrypto: claimedByUsers,
      }).primary,
    },
    {
      label: t('staking'),
      value: getNumberValue(staking),
      valueLabel: getValuesToDisplay({
        cryptoCurrency: 'ethereum',
        getFormattedEthValueProps,
        showCryptoSuffix: true,
        valueCrypto: staking,
      }).primary,
    },
    {
      label: t('communityFund'),
      value: getNumberValue(communityFund),
      valueLabel: getValuesToDisplay({
        cryptoCurrency: 'ethereum',
        getFormattedEthValueProps,
        showCryptoSuffix: true,
        valueCrypto: communityFund,
      }).primary,
    },
    {
      label: t('ppf'),
      value: getNumberValue(ppf / 2n),
      valueLabel: getValuesToDisplay({
        cryptoCurrency: 'ethereum',
        getFormattedEthValueProps,
        showCryptoSuffix: true,
        valueCrypto: ppf / 2n,
      }).primary,
    },
  ].filter(({ value }) => value > 0);

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
                <div
                  className={cx(styles.value, isLoading && styles.isLoading)}
                  data-test="MetricsEpochGridFundsUsage__total"
                >
                  {!isLoading &&
                    getValuesToDisplay({
                      cryptoCurrency: 'ethereum',
                      showCryptoSuffix: true,
                      valueCrypto: total,
                    }).primary}
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

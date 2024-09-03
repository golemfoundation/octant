import cx from 'classnames';
import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import useEpochPatronsAllEpochs from 'hooks/helpers/useEpochPatronsAllEpochs';
import useGetValuesToDisplay from 'hooks/helpers/useGetValuesToDisplay';
import useIndividualRewardAllEpochs from 'hooks/helpers/useIndividualRewardAllEpochs';
import useUserAllocationsAllEpochs from 'hooks/helpers/useUserAllocationsAllEpochs';
import useIndividualReward from 'hooks/queries/useIndividualReward';

import styles from './HomeRewards.module.scss';

const HomeRewards = (): ReactNode => {
  const { t } = useTranslation('translation', { keyPrefix: 'components.home.homeRewards' });
  const { address, isConnected } = useAccount();
  const { data: individualReward, isFetching: isFetchingIndividualReward } = useIndividualReward();
  const { data: individualRewardAllEpochs, isFetching: isFetchingIndividualRewardAllEpochs } =
    useIndividualRewardAllEpochs();
  const { data: userAllocationsAllEpochs, isFetching: isFetchingUserAllAllocations } =
    useUserAllocationsAllEpochs();
  const { data: epochPatronsAllEpochs, isFetching: isFetchingEpochPatronsAllEpochs } =
    useEpochPatronsAllEpochs();
  const getValuesToDisplay = useGetValuesToDisplay();

  // We count only rewards from epochs user did an action -- allocation or was a patron.
  const totalRewards = individualRewardAllEpochs.reduce((acc, curr, currentIndex) => {
    const hasUserAlreadyDoneAllocationInGivenEpoch =
      userAllocationsAllEpochs[currentIndex]?.hasUserAlreadyDoneAllocation || false;
    const wasPatronInGivenEpoch =
      epochPatronsAllEpochs[currentIndex]?.includes(address as string) || false;
    const wasBudgetEffective = hasUserAlreadyDoneAllocationInGivenEpoch || wasPatronInGivenEpoch;

    return wasBudgetEffective ? acc + curr : acc;
  }, BigInt(0));

  const currentRewardsToDisplay = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    showCryptoSuffix: true,
    valueCrypto: individualReward,
  }).primary;

  const totalRewardsToDisplay = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    showCryptoSuffix: true,
    valueCrypto: totalRewards,
  }).primary;

  const tiles = [
    {
      isLoadingValue: isFetchingIndividualReward,
      key: 'currentRewards',
      label: t('currentRewards'),
      value: currentRewardsToDisplay,
    },
    {
      isLoadingValue: isConnected
        ? isFetchingIndividualRewardAllEpochs ||
          isFetchingUserAllAllocations ||
          isFetchingEpochPatronsAllEpochs
        : false,
      key: 'totalRewards',
      label: t('totalRewards'),
      value: totalRewardsToDisplay,
    },
    {
      key: 'rewardsRate',
      label: t('rewardsRate'),
      // TODO: https://linear.app/golemfoundation/issue/OCT-1870/home-rewards-rate
      value: null,
    },
  ];

  return (
    <div className={styles.root}>
      {tiles.map(({ label, value, key, isLoadingValue }) => (
        <div key={key} className={styles.tile}>
          <div className={styles.label}>{label}</div>
          <div className={cx(styles.value, isLoadingValue && styles.isLoadingValue)}>
            {isLoadingValue ? null : value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HomeRewards;

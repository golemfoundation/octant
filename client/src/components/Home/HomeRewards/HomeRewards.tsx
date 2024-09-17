import cx from 'classnames';
import React, { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import useEpochPatronsAllEpochs from 'hooks/helpers/useEpochPatronsAllEpochs';
import useGetValuesToDisplay from 'hooks/helpers/useGetValuesToDisplay';
import useIndividualRewardAllEpochs from 'hooks/helpers/useIndividualRewardAllEpochs';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useUserAllocationsAllEpochs from 'hooks/helpers/useUserAllocationsAllEpochs';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';
import useMatchedProjectRewards from 'hooks/queries/useMatchedProjectRewards';

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
  const isProjectAdminMode = useIsProjectAdminMode();
  const { data: isPatronMode } = useIsPatronMode();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { isMobile } = useMediaQuery();

  const { data: matchedProjectRewards, isFetching: isFetchingMatchedProjectRewards } =
    useMatchedProjectRewards(isDecisionWindowOpen ? undefined : currentEpoch! - 1, {
      enabled: isProjectAdminMode || isPatronMode,
    });

  const projectMatchedProjectRewards = isProjectAdminMode
    ? matchedProjectRewards?.find(
        ({ address: matchedProjectRewardsAddress }) => address === matchedProjectRewardsAddress,
      )
    : undefined;

  const totalMatechProjectsRewards =
    isProjectAdminMode || isPatronMode
      ? matchedProjectRewards?.reduce((acc, { matched }) => acc + matched, 0n)
      : undefined;

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

  const currentDonationsToDisplay = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    showCryptoSuffix: true,
    valueCrypto: projectMatchedProjectRewards?.allocated,
  }).primary;

  const currentMatchFundingToDisplay = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    showCryptoSuffix: true,
    valueCrypto: projectMatchedProjectRewards?.matched,
  }).primary;

  const epochTotalMatchFundingToDisplay = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    showCryptoSuffix: true,
    valueCrypto: totalMatechProjectsRewards,
  }).primary;

  const currentRewardsLabel = useMemo(() => {
    if (isProjectAdminMode) {
      if (isMobile) {
        return t('donations');
      }
      return t('currentDonations');
    }
    return t('currentRewards');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProjectAdminMode, isMobile]);

  const totalRewardsLabel = useMemo(() => {
    if (isProjectAdminMode) {
      if (isMobile) {
        return t('matchFunding');
      }
      return t('currentMatchFunding');
    }
    return t('totalRewards');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProjectAdminMode, isMobile]);

  const rewardsRateLabel = useMemo(() => {
    if (isProjectAdminMode || isPatronMode) {
      if (isMobile) {
        return t('epochMF');
      }
      return t('epochTotalMatchFunding');
    }
    return t('rewardsRate');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProjectAdminMode, isMobile, isPatronMode]);

  const tiles = [
    {
      isLoadingValue: isProjectAdminMode
        ? isFetchingMatchedProjectRewards
        : isFetchingIndividualReward,
      key: 'currentRewards',
      label: currentRewardsLabel,
      value: isProjectAdminMode ? currentDonationsToDisplay : currentRewardsToDisplay,
    },
    {
      isLoadingValue:
        isConnected &&
        (isProjectAdminMode
          ? isFetchingMatchedProjectRewards
          : isFetchingIndividualRewardAllEpochs ||
            isFetchingUserAllAllocations ||
            isFetchingEpochPatronsAllEpochs),
      key: 'totalRewards',
      label: totalRewardsLabel,
      value: isProjectAdminMode ? currentMatchFundingToDisplay : totalRewardsToDisplay,
    },
    {
      // TODO: https://linear.app/golemfoundation/issue/OCT-1870/home-rewards-rate
      isLoadingValue: isProjectAdminMode || isPatronMode ? isFetchingMatchedProjectRewards : false,

      key: 'rewardsRate',
      label: rewardsRateLabel,
      // TODO: https://linear.app/golemfoundation/issue/OCT-1870/home-rewards-rate
      value: isProjectAdminMode || isPatronMode ? epochTotalMatchFundingToDisplay : null,
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

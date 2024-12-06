import cx from 'classnames';
import React, { ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import Svg from 'components/ui/Svg';
import Tooltip from 'components/ui/Tooltip';
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
import useRewardsRate from 'hooks/queries/useRewardsRate';
import { questionMark } from 'svg/misc';

import styles from './HomeRewards.module.scss';

const HomeRewards = (): ReactElement => {
  const { i18n, t } = useTranslation('translation', { keyPrefix: 'components.home.homeRewards' });
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
  const { data: rewardsRate, isFetching: isFetchingRewardsRate } = useRewardsRate(currentEpoch!);

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
        return i18n.t('common.donations');
      }
      return t('currentDonations');
    }
    return t('currentRewards');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProjectAdminMode, isMobile, i18n.language]);

  const totalRewardsLabel = useMemo(() => {
    if (isProjectAdminMode) {
      if (isMobile) {
        return i18n.t('common.matchFunding');
      }
      return t('currentMatchFunding');
    }
    return t('totalRewards');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProjectAdminMode, isMobile, i18n.language]);

  const rewardsRateLabel = useMemo(() => {
    if (isProjectAdminMode || isPatronMode) {
      if (isMobile) {
        return t('epochMF');
      }
      return t('epochTotalMatchFunding');
    }
    return t('rewardsRate');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProjectAdminMode, isMobile, isPatronMode, i18n.language]);

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
      isLoadingValue:
        isProjectAdminMode || isPatronMode
          ? isFetchingMatchedProjectRewards
          : isFetchingRewardsRate,
      key: 'rewardsRate',
      label: rewardsRateLabel,
      tooltipText: t('rewardsRateTooltip'),
      value:
        isProjectAdminMode || isPatronMode ? epochTotalMatchFundingToDisplay : `${rewardsRate} %`,
    },
  ];

  return (
    <div className={styles.root}>
      {tiles.map(({ label, value, key, isLoadingValue, tooltipText }) => (
        <div key={key} className={styles.tile}>
          <div className={styles.label}>
            {label}
            {!isProjectAdminMode && !isPatronMode && tooltipText && (
              <Tooltip
                className={styles.tooltipBox}
                position="custom"
                text={tooltipText}
                tooltipClassName={styles.tooltip}
                tooltipWrapperClassName={styles.tooltipWrapper}
              >
                <Svg
                  classNameWrapper={styles.svgWrapper}
                  displayMode="wrapperDefault"
                  img={questionMark}
                  size={isMobile ? 1.2 : 1.6}
                />
              </Tooltip>
            )}
          </div>
          <div className={cx(styles.value, isLoadingValue && styles.isLoadingValue)}>
            {isLoadingValue ? null : value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HomeRewards;

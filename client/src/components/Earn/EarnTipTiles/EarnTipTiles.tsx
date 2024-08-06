import { differenceInCalendarDays } from 'date-fns';
import React, { Fragment, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import TipTile from 'components/shared/TipTile';
import useEpochAndAllocationTimestamps from 'hooks/helpers/useEpochAndAllocationTimestamps';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useDepositValue from 'hooks/queries/useDepositValue';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import useWithdrawals from 'hooks/queries/useWithdrawals';
import useTipsStore from 'store/tips/store';
import getIsPreLaunch from 'utils/getIsPreLaunch';

import styles from './EarnTipTiles.module.scss';

const EarnTipTiles = (): ReactElement => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'views.earn.tips',
  });
  const { isConnected } = useAccount();
  const { isDesktop } = useMediaQuery();
  const { data: withdrawals } = useWithdrawals();
  const { data: currentEpoch } = useCurrentEpoch();
  const isPreLaunch = getIsPreLaunch(currentEpoch);
  const { data: depositsValue, isFetching: isFetchingDepositsValue } = useDepositValue();
  const { data: individualReward } = useIndividualReward();
  const { data: userAllocations } = useUserAllocations();
  const { timeCurrentAllocationEnd } = useEpochAndAllocationTimestamps();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();

  const {
    wasWithdrawAlreadyClosed,
    setWasWithdrawAlreadyClosed,
    wasConnectWalletAlreadyClosed,
    setWasConnectWalletAlreadyClosed,
    wasLockGLMAlreadyClosed,
    setWasLockGLMAlreadyClosed,
    wasAllocateRewardsAlreadyClosed,
    setWasAllocateRewardsAlreadyClosed,
  } = useTipsStore(state => ({
    setWasAllocateRewardsAlreadyClosed: state.setWasAllocateRewardsAlreadyClosed,
    setWasConnectWalletAlreadyClosed: state.setWasConnectWalletAlreadyClosed,
    setWasLockGLMAlreadyClosed: state.setWasLockGLMAlreadyClosed,
    setWasWithdrawAlreadyClosed: state.setWasWithdrawAlreadyClosed,
    wasAllocateRewardsAlreadyClosed: state.data.wasAllocateRewardsAlreadyClosed,
    wasConnectWalletAlreadyClosed: state.data.wasConnectWalletAlreadyClosed,
    wasLockGLMAlreadyClosed: state.data.wasLockGLMAlreadyClosed,
    wasWithdrawAlreadyClosed: state.data.wasWithdrawAlreadyClosed,
  }));

  const isLockGlmTipVisible =
    !isFetchingDepositsValue &&
    (!depositsValue || (!!depositsValue && depositsValue === 0n)) &&
    isConnected &&
    !wasLockGLMAlreadyClosed;
  const isConnectWalletTipVisible = !isPreLaunch && !isConnected && !wasConnectWalletAlreadyClosed;
  const isWithdrawTipVisible =
    !!currentEpoch &&
    currentEpoch > 1 &&
    !!withdrawals &&
    withdrawals.sums.available !== 0n &&
    !wasWithdrawAlreadyClosed;

  const isAllocateRewardsTipVisible =
    (!wasAllocateRewardsAlreadyClosed &&
      isDecisionWindowOpen &&
      !!(individualReward && individualReward !== 0n) &&
      !userAllocations?.hasUserAlreadyDoneAllocation &&
      differenceInCalendarDays(new Date(), timeCurrentAllocationEnd!) <= 2) ??
    false;

  return (
    <Fragment>
      <TipTile
        image={isDesktop ? 'images/lock-glm-desktop.webp' : 'images/lock-glm-mobile.webp'}
        imageClassName={styles.lockGlmImage}
        isOpen={isLockGlmTipVisible}
        onClose={() => setWasLockGLMAlreadyClosed(true)}
        text={t('lockGlm.text')}
        title={t('lockGlm.title')}
      />
      <TipTile
        dataTest="EarnView__TipTile--connectWallet"
        image="images/tip-connect-wallet.webp"
        imageClassName={styles.connectWalletImage}
        isOpen={isConnectWalletTipVisible}
        onClose={() => setWasConnectWalletAlreadyClosed(true)}
        text={t('connectWallet.text')}
        title={t(isDesktop ? 'connectWallet.title.desktop' : 'connectWallet.title.mobile')}
      />
      <TipTile
        image="images/tip-withdraw.webp"
        imageClassName={styles.withdrawImage}
        isOpen={isWithdrawTipVisible}
        onClose={() => setWasWithdrawAlreadyClosed(true)}
        text={t('withdrawEth.text')}
        title={t('withdrawEth.title')}
      />
      <TipTile
        image="images/funds_swept.webp"
        imageClassName={styles.allocateYourRewardsImage}
        isOpen={isAllocateRewardsTipVisible}
        onClose={() => setWasAllocateRewardsAlreadyClosed(true)}
        text={
          isDesktop ? t('allocateYourRewards.textDesktop') : t('allocateYourRewards.textMobile')
        }
        title={t('allocateYourRewards.title')}
      />
    </Fragment>
  );
};

export default EarnTipTiles;

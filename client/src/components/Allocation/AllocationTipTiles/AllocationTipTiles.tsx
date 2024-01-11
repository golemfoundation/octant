import React, { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import TipTile from 'components/shared/TipTile';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useDepositValue from 'hooks/queries/useDepositValue';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import useTipsStore from 'store/tips/store';

import AllocationTipTilesProps from './types';

const AllocationTipTiles: FC<AllocationTipTilesProps> = ({ className }) => {
  const { t, i18n } = useTranslation('translation', { keyPrefix: 'views.allocation.tip' });
  const { isDesktop } = useMediaQuery();
  const { isConnected } = useAccount();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: depositsValue, isFetching: isFetchingDepositsValue } = useDepositValue();
  const { data: individualReward, isFetching: isFetchingIndividualReward } = useIndividualReward();
  const { data: userAllocations, isFetching: isFetchingUserAllocation } = useUserAllocations();
  const {
    wasLockGLMAlreadyClosed,
    wasRewardsAlreadyClosed,
    setWasLockGLMAlreadyClosed,
    setWasRewardsAlreadyClosed,
  } = useTipsStore(state => ({
    setWasConnectWalletAlreadyClosed: state.setWasConnectWalletAlreadyClosed,
    setWasLockGLMAlreadyClosed: state.setWasLockGLMAlreadyClosed,
    setWasRewardsAlreadyClosed: state.setWasRewardsAlreadyClosed,
    wasConnectWalletAlreadyClosed: state.data.wasConnectWalletAlreadyClosed,
    wasLockGLMAlreadyClosed: state.data.wasLockGLMAlreadyClosed,
    wasRewardsAlreadyClosed: state.data.wasRewardsAlreadyClosed,
  }));

  const isEpoch1 = currentEpoch === 1;

  const isLockGlmTipVisible =
    !isFetchingDepositsValue &&
    (!depositsValue || (!!depositsValue && depositsValue.isZero())) &&
    isConnected &&
    !wasLockGLMAlreadyClosed;

  const isRewardsTipVisible =
    !isEpoch1 &&
    isConnected &&
    !isFetchingIndividualReward &&
    !!individualReward &&
    !individualReward.isZero() &&
    !isFetchingUserAllocation &&
    !userAllocations?.hasUserAlreadyDoneAllocation &&
    !!isDecisionWindowOpen &&
    !wasRewardsAlreadyClosed;

  return (
    <Fragment>
      <TipTile
        className={className}
        image="images/lock-glm.webp"
        infoLabel={i18n.t('common.gettingStarted')}
        isOpen={isLockGlmTipVisible}
        onClose={() => setWasLockGLMAlreadyClosed(true)}
        text={t('lockGlm.text')}
        title={t('lockGlm.title')}
      />
      <TipTile
        className={className}
        image="images/rewards.webp"
        infoLabel={i18n.t('common.octantTips')}
        isOpen={isRewardsTipVisible}
        onClose={() => setWasRewardsAlreadyClosed(true)}
        text={isDesktop ? t('rewards.text.desktop') : t('rewards.text.mobile')}
        title={t('rewards.title')}
      />
    </Fragment>
  );
};

export default AllocationTipTiles;

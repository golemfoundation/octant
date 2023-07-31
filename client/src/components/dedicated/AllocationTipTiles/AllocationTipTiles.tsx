import cx from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import TipTile from 'components/dedicated/TipTile/TipTile';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useDepositValue from 'hooks/queries/useDepositValue';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import useTipsStore from 'store/tips/store';

import styles from './AllocationTipTiles.module.scss';
import AllocationTipTilesProps from './types';

const AllocationTipTiles: FC<AllocationTipTilesProps> = ({ className }) => {
  const { t, i18n } = useTranslation('translation', { keyPrefix: 'views.allocation.tip' });
  const { isConnected } = useAccount();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: depositsValue } = useDepositValue();
  const { data: individualReward, isLoading: isLoadingIndividualReward } = useIndividualReward();
  const { data: userAllocations, isFetching: isFetchingUserAllocation } = useUserAllocations();
  const {
    wasConnectWalletAlreadyClosed,
    wasLockGLMAlreadyClosed,
    wasRewardsAlreadyClosed,
    wasChangedYourMindAlreadyClosed,
    setWasConnectWalletAlreadyClosed,
    setWasLockGLMAlreadyClosed,
    setWasRewardsAlreadyClosed,
    setWasChangedYourMindAlreadyClosed,
  } = useTipsStore(state => ({
    setWasChangedYourMindAlreadyClosed: state.setWasChangedYourMindAlreadyClosed,
    setWasConnectWalletAlreadyClosed: state.setWasConnectWalletAlreadyClosed,
    setWasLockGLMAlreadyClosed: state.setWasLockGLMAlreadyClosed,
    setWasRewardsAlreadyClosed: state.setWasRewardsAlreadyClosed,
    wasChangedYourMindAlreadyClosed: state.data.wasChangedYourMindAlreadyClosed,
    wasConnectWalletAlreadyClosed: state.data.wasConnectWalletAlreadyClosed,
    wasLockGLMAlreadyClosed: state.data.wasLockGLMAlreadyClosed,
    wasRewardsAlreadyClosed: state.data.wasRewardsAlreadyClosed,
  }));

  const isEpoch1 = currentEpoch === 1;

  const isConnectWalletTipVisible = !isConnected && !wasConnectWalletAlreadyClosed;

  const isLockGlmTipVisible =
    (!depositsValue || (!!depositsValue && depositsValue.isZero())) &&
    isConnected &&
    !wasLockGLMAlreadyClosed;

  const isRewardsTipVisible =
    !isEpoch1 &&
    isConnected &&
    !isLoadingIndividualReward &&
    !!individualReward &&
    !individualReward.isZero() &&
    !wasRewardsAlreadyClosed;

  const isChangedYourMindTipVisible =
    !isEpoch1 &&
    !isFetchingUserAllocation &&
    !!userAllocations?.hasUserAlreadyDoneAllocation &&
    !wasChangedYourMindAlreadyClosed;

  const isAnyTipTileVisible =
    isConnectWalletTipVisible ||
    isLockGlmTipVisible ||
    isRewardsTipVisible ||
    isChangedYourMindTipVisible;

  return (
    <div className={cx(styles.root, isAnyTipTileVisible && styles.isAnyTipTileVisible, className)}>
      <TipTile
        dataTest="AllocationTipTiles--connectWallet"
        image="images/tip-connect-wallet.webp"
        infoLabel={i18n.t('common.gettingStarted')}
        isOpen={isConnectWalletTipVisible}
        onClose={() => setWasConnectWalletAlreadyClosed(true)}
        text={t('connectWallet.text')}
        title={t('connectWallet.title')}
      />
      <TipTile
        image="images/lock-glm.webp"
        infoLabel={i18n.t('common.gettingStarted')}
        isOpen={isLockGlmTipVisible}
        onClose={() => setWasLockGLMAlreadyClosed(true)}
        text={t(isEpoch1 ? 'lockGlm.text.epoch1' : 'lockGlm.text.standard')}
        title={t('lockGlm.title')}
      />
      <TipTile
        image="images/rewards.webp"
        infoLabel={i18n.t('common.octantTips')}
        isOpen={isRewardsTipVisible}
        onClose={() => setWasRewardsAlreadyClosed(true)}
        text={t('rewards.text')}
        title={t('rewards.title')}
      />
      <TipTile
        key="TipTile--changedYourMind"
        image="images/tip-changed-your-mind.webp"
        infoLabel={i18n.t('common.octantTips')}
        isOpen={isChangedYourMindTipVisible}
        onClose={() => setWasChangedYourMindAlreadyClosed(true)}
        text={t('changedYourMind.text')}
        title={t('changedYourMind.title')}
      />
    </div>
  );
};

export default AllocationTipTiles;

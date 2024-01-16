import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import TipTile from 'components/shared/TipTile';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
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
  const { data: individualReward, isFetching: isFetchingIndividualReward } = useIndividualReward();
  const { data: userAllocations, isFetching: isFetchingUserAllocation } = useUserAllocations();
  const { wasRewardsAlreadyClosed, setWasRewardsAlreadyClosed } = useTipsStore(state => ({
    setWasConnectWalletAlreadyClosed: state.setWasConnectWalletAlreadyClosed,
    setWasRewardsAlreadyClosed: state.setWasRewardsAlreadyClosed,
    wasConnectWalletAlreadyClosed: state.data.wasConnectWalletAlreadyClosed,
    wasRewardsAlreadyClosed: state.data.wasRewardsAlreadyClosed,
  }));

  const isEpoch1 = currentEpoch === 1;

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
    <TipTile
      className={className}
      image="images/rewards.webp"
      infoLabel={i18n.t('common.octantTips')}
      isOpen={isRewardsTipVisible}
      onClose={() => setWasRewardsAlreadyClosed(true)}
      text={isDesktop ? t('rewards.text.desktop') : t('rewards.text.mobile')}
      title={t('rewards.title')}
    />
  );
};

export default AllocationTipTiles;

import React, { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import TipTile from 'components/shared/TipTile';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useUqScore from 'hooks/queries/useUqScore';
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
  const { data: uqScore } = useUqScore(currentEpoch! - 1);
  const {
    wasRewardsAlreadyClosed,
    setWasRewardsAlreadyClosed,
    wasUqTooLowAlreadyClosed,
    setWasUqTooLowAlreadyClosed,
  } = useTipsStore(state => ({
    setWasConnectWalletAlreadyClosed: state.setWasConnectWalletAlreadyClosed,
    setWasRewardsAlreadyClosed: state.setWasRewardsAlreadyClosed,
    setWasUqTooLowAlreadyClosed: state.setWasUqTooLowAlreadyClosed,
    wasConnectWalletAlreadyClosed: state.data.wasConnectWalletAlreadyClosed,
    wasRewardsAlreadyClosed: state.data.wasRewardsAlreadyClosed,
    wasUqTooLowAlreadyClosed: state.data.wasUqTooLowAlreadyClosed,
  }));

  const isEpoch1 = currentEpoch === 1;

  const isUqTooLowTipVisible =
    !!isDecisionWindowOpen && uqScore === 20n && !wasUqTooLowAlreadyClosed;

  const isRewardsTipVisible =
    !isEpoch1 &&
    isConnected &&
    !isFetchingIndividualReward &&
    !!individualReward &&
    individualReward !== 0n &&
    !isFetchingUserAllocation &&
    !userAllocations?.hasUserAlreadyDoneAllocation &&
    !!isDecisionWindowOpen &&
    !wasRewardsAlreadyClosed;

  return (
    <Fragment>
      <TipTile
        className={className}
        image="images/uqTooLow.webp"
        infoLabel={i18n.t('common.octantTips')}
        isOpen={isUqTooLowTipVisible}
        onClose={() => setWasUqTooLowAlreadyClosed(true)}
        text={isDesktop ? t('uqTooLow.text.desktop') : t('uqTooLow.text.mobile')}
        title={isDesktop ? t('uqTooLow.title.desktop') : t('uqTooLow.title.mobile')}
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

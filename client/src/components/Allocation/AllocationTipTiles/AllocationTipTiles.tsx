import React, { FC, Fragment } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';

import TipTile from 'components/shared/TipTile';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useUqScore from 'hooks/queries/useUqScore';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import { ROOT_ROUTES } from 'routes/RootRoutes/routes';
import useTipsStore from 'store/tips/store';

import styles from './AllocationTipTiles.module.scss';
import AllocationTipTilesProps from './types';

const AllocationTipTiles: FC<AllocationTipTilesProps> = ({ className }) => {
  const { t, i18n } = useTranslation('translation', { keyPrefix: 'views.allocation.tip' });
  const navigate = useNavigate();
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
        onClick={() => navigate(ROOT_ROUTES.settings.absolute)}
        onClose={() => setWasUqTooLowAlreadyClosed(true)}
        text={
          <Trans
            components={[<span className={styles.bold} />]}
            i18nKey={
              isDesktop
                ? 'views.allocation.tip.uqTooLow.text.desktop'
                : 'views.allocation.tip.uqTooLow.text.mobile'
            }
          />
        }
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

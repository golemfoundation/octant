import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import ProposalItem from 'components/dedicated/ProposalItem/ProposalItem';
import ProposalItemSkeleton from 'components/dedicated/ProposalItemSkeleton/ProposalItemSkeleton';
import TipTile from 'components/dedicated/TipTile/TipTile';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useMatchedProposalRewards from 'hooks/queries/useMatchedProposalRewards';
import useProposalsContract from 'hooks/queries/useProposalsContract';
import useProposalsIpfsWithRewards from 'hooks/queries/useProposalsIpfsWithRewards';
import MainLayout from 'layouts/MainLayout/MainLayout';
import useTipsStore from 'store/tips/store';

import styles from './ProposalsView.module.scss';

const ProposalsView = (): ReactElement => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'views.proposals',
  });
  const { data: proposalsAddresses } = useProposalsContract();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: matchedProposalRewards } = useMatchedProposalRewards();
  const { data: proposalsWithRewards } = useProposalsIpfsWithRewards();
  const { wasAddFavouritesAlreadyClosed, setWasAddFavouritesAlreadyClosed } = useTipsStore(
    state => ({
      setWasAddFavouritesAlreadyClosed: state.setWasAddFavouritesAlreadyClosed,
      wasAddFavouritesAlreadyClosed: state.data.wasAddFavouritesAlreadyClosed,
    }),
  );

  const isEpoch1 = currentEpoch === 1;

  const areMatchedProposalsReady =
    !!currentEpoch && ((currentEpoch > 1 && matchedProposalRewards) || isEpoch1);

  const isAddToFavouritesTipVisible = !wasAddFavouritesAlreadyClosed && !isEpoch1;

  return (
    <MainLayout
      dataTest="ProposalsView"
      isLoading={
        !proposalsAddresses || proposalsAddresses.length === 0 || !areMatchedProposalsReady
      }
    >
      <TipTile
        className={styles.tip}
        dataTest="ProposalsView__TipTile"
        image="images/favourites.webp"
        infoLabel={i18n.t('common.gettingStarted')}
        isOpen={isAddToFavouritesTipVisible}
        onClose={() => setWasAddFavouritesAlreadyClosed(true)}
        text={t('tip.text')}
        title={t('tip.title')}
      />
      <div className={styles.list} data-test="ProposalsView__List">
        {proposalsWithRewards.length > 0
          ? proposalsWithRewards.map((proposalWithRewards, index) => (
              <ProposalItem
                key={proposalWithRewards.address}
                className={styles.element}
                dataTest={`ProposalsView__ProposalItem--${index}`}
                {...proposalWithRewards}
              />
            ))
          : (proposalsAddresses || []).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <ProposalItemSkeleton key={index} className={styles.element} />
            ))}
      </div>
    </MainLayout>
  );
};

export default ProposalsView;

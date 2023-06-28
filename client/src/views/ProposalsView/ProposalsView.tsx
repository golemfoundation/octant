import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import ProposalItem from 'components/dedicated/ProposalItem/ProposalItem';
import TipTile from 'components/dedicated/TipTile/TipTile';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useMatchedProposalRewards from 'hooks/queries/useMatchedProposalRewards';
import useProposalsContract from 'hooks/queries/useProposalsContract';
import useProposalsWithRewards from 'hooks/queries/useProposalsWithRewards';
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
  const { wasAddFavouritesAlreadyClosed, setWasAddFavouritesAlreadyClosed } = useTipsStore(
    state => ({
      setWasAddFavouritesAlreadyClosed: state.setWasAddFavouritesAlreadyClosed,
      wasAddFavouritesAlreadyClosed: state.data.wasAddFavouritesAlreadyClosed,
    }),
  );
  const proposalsWithRewards = useProposalsWithRewards();

  const isEpoch1 = currentEpoch === 1;

  const areMatchedProposalsReady =
    !!currentEpoch && ((currentEpoch > 1 && matchedProposalRewards) || isEpoch1);

  return (
    <MainLayout
      dataTest="ProposalsView"
      isLoading={
        !proposalsAddresses || proposalsAddresses.length === 0 || !areMatchedProposalsReady
      }
    >
      {!wasAddFavouritesAlreadyClosed && !isEpoch1 && (
        <TipTile
          className={styles.tip}
          dataTest="ProposalsView__TipTile"
          image="images/favourites.webp"
          infoLabel={i18n.t('common.gettingStarted')}
          onClose={() => setWasAddFavouritesAlreadyClosed(true)}
          text={t('tip.text')}
          title={t('tip.title')}
        />
      )}
      <div className={styles.list} data-test="ProposalsView__List">
        {proposalsWithRewards.map((proposal, index) => (
          <ProposalItem
            key={proposal.address}
            className={styles.element}
            dataTest={`ProposalsView__ProposalItem--${index}`}
            {...proposal}
          />
        ))}
      </div>
    </MainLayout>
  );
};

export default ProposalsView;

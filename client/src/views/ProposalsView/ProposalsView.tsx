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
  const {
    data: { wasAddFavouritesAlreadyClosed },
    setWasAddFavouritesAlreadyClosed,
  } = useTipsStore();
  const proposalsWithRewards = useProposalsWithRewards();

  const areMatchedProposalsReady =
    !!currentEpoch && ((currentEpoch > 1 && matchedProposalRewards) || currentEpoch === 1);

  return (
    <MainLayout
      dataTest="ProposalsView"
      isLoading={
        !proposalsAddresses || proposalsAddresses.length === 0 || !areMatchedProposalsReady
      }
    >
      {!wasAddFavouritesAlreadyClosed && (
        <TipTile
          className={styles.tip}
          image="images/tip-favourites.png"
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

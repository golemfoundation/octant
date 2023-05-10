import React, { ReactElement } from 'react';

import ProposalItem from 'components/dedicated/ProposalItem/ProposalItem';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useMatchedProposalRewards from 'hooks/queries/useMatchedProposalRewards';
import useProposalsContract from 'hooks/queries/useProposalsContract';
import useProposalsWithRewards from 'hooks/queries/useProposalsWithRewards';
import MainLayout from 'layouts/MainLayout/MainLayout';

import styles from './ProposalsView.module.scss';

const ProposalsView = (): ReactElement => {
  const { data: proposalsAddresses } = useProposalsContract();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: matchedProposalRewards } = useMatchedProposalRewards();
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
      <div className={styles.list} data-test="ProposalsView__List">
        {proposalsWithRewards.map(proposal => (
          <ProposalItem key={proposal.address} className={styles.element} {...proposal} />
        ))}
      </div>
    </MainLayout>
  );
};

export default ProposalsView;

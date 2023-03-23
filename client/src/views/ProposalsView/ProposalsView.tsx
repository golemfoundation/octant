import React, { FC } from 'react';

import ProposalItem from 'components/dedicated/ProposalItem/ProposalItem';
import useIdsInAllocation from 'hooks/helpers/useIdsInAllocation';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useMatchedProposalRewards from 'hooks/queries/useMatchedProposalRewards';
import useProposals from 'hooks/queries/useProposals';
import MainLayoutContainer from 'layouts/MainLayout/MainLayoutContainer';
import getSortedElementsByTotalValueOfAllocations from 'utils/getSortedElementsByTotalValueOfAllocations';

import styles from './ProposalsView.module.scss';
import ProposalsViewProps from './types';

const ProposalsView: FC<ProposalsViewProps> = ({ allocations }) => {
  const { data: proposals } = useProposals();
  const { data: currentEpoch } = useCurrentEpoch();
  const { onAddRemoveFromAllocate } = useIdsInAllocation({ allocations, proposals });
  const { data: matchedProposalRewards } = useMatchedProposalRewards();

  const areMatchedProposalsReady =
    !!currentEpoch && ((currentEpoch > 1 && matchedProposalRewards) || currentEpoch === 1);

  let proposalsWithRewards = proposals.map(proposal => {
    const proposalMatchedProposalRewards = matchedProposalRewards?.find(
      ({ address }) => address === proposal.address,
    );
    return {
      ...proposal,
      percentage: proposalMatchedProposalRewards?.percentage,
      totalValueOfAllocations: proposalMatchedProposalRewards?.sum,
    };
  });

  proposalsWithRewards =
    !!currentEpoch && currentEpoch > 1 && matchedProposalRewards
      ? getSortedElementsByTotalValueOfAllocations(proposalsWithRewards)
      : proposalsWithRewards;

  return (
    <MainLayoutContainer isLoading={proposals.length === 0 || !areMatchedProposalsReady}>
      <div className={styles.list}>
        {proposalsWithRewards.map((proposal, index) => (
          <ProposalItem
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className={styles.element}
            isAlreadyAdded={allocations.includes(proposal.address)}
            onAddRemoveFromAllocate={() => onAddRemoveFromAllocate(proposal.address)}
            {...proposal}
          />
        ))}
      </div>
    </MainLayoutContainer>
  );
};

export default ProposalsView;

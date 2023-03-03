import React, { FC } from 'react';

import ProposalItem from 'components/dedicated/ProposalItem/ProposalItem';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIdsInAllocation from 'hooks/queries/useIdsInAllocation';
import useMatchedProposalRewards from 'hooks/queries/useMatchedProposalRewards';
import useProposals from 'hooks/queries/useProposals';
import MainLayoutContainer from 'layouts/MainLayout/MainLayoutContainer';

import styles from './ProposalsView.module.scss';
import ProposalsViewProps from './types';

const ProposalsView: FC<ProposalsViewProps> = ({ allocations }) => {
  const { data: proposals } = useProposals();
  const { data: currentEpoch } = useCurrentEpoch();
  const { onAddRemoveFromAllocate } = useIdsInAllocation({ allocations, proposals });
  const { data: matchedProposalRewards } = useMatchedProposalRewards();

  const shouldMatchedProposalRewardsBeAvailable =
    !!currentEpoch && ((currentEpoch > 1 && matchedProposalRewards) || currentEpoch === 1);

  return (
    <MainLayoutContainer
      isLoading={proposals.length === 0 || !shouldMatchedProposalRewardsBeAvailable}
    >
      <div className={styles.list}>
        {proposals &&
          shouldMatchedProposalRewardsBeAvailable &&
          proposals.map((proposal, index) => {
            const proposalMatchedProposalRewards = matchedProposalRewards?.find(
              ({ address }) => address === proposal.address,
            );
            return (
              <ProposalItem
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                isAlreadyAdded={allocations.includes(proposal.address)}
                onAddRemoveFromAllocate={() => onAddRemoveFromAllocate(proposal.address)}
                percentage={proposalMatchedProposalRewards?.percentage}
                totalValueOfAllocations={proposalMatchedProposalRewards?.sum}
                {...proposal}
              />
            );
          })}
      </div>
    </MainLayoutContainer>
  );
};

export default ProposalsView;

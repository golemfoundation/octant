import React, { FC } from 'react';

import MainLayout from 'layouts/main-layout/main.layout.container';
import ProposalItem from 'components/dedicated/proposal-item/proposal-item.component';
import useIdsInAllocation from 'hooks/useIdsInAllocation';
import useMatchedProposalRewards from 'hooks/useMatchedProposalRewards';
import useProposals from 'hooks/useProposals';

import ProposalsViewProps from './types';
import styles from './style.module.scss';

const ProposalsView: FC<ProposalsViewProps> = ({ allocations }) => {
  const { proposals } = useProposals();
  const { onAddRemoveFromAllocate } = useIdsInAllocation({ allocations, proposals });
  const { data: matchedProposalRewards } = useMatchedProposalRewards();

  return (
    <MainLayout isLoading={proposals.length === 0 || !matchedProposalRewards}>
      <div className={styles.list}>
        {proposals &&
          matchedProposalRewards &&
          proposals.map((proposal, index) => {
            const proposalMatchedProposalRewards = matchedProposalRewards?.find(
              ({ id }) => id === proposal.id.toNumber(),
            );
            return (
              <ProposalItem
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                isAlreadyAdded={allocations.includes(proposal.id.toNumber())}
                onAddRemoveFromAllocate={() => onAddRemoveFromAllocate(proposal.id.toNumber())}
                percentage={proposalMatchedProposalRewards!.percentage}
                totalValueOfAllocations={proposalMatchedProposalRewards!.sum}
                {...proposal}
              />
            );
          })}
      </div>
    </MainLayout>
  );
};

export default ProposalsView;

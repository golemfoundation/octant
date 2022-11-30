import React, { ReactElement } from 'react';

import { useIdsInAllocation } from 'hooks/useIdsInAllocation';
import { useProposals } from 'hooks/useProposals';
import MainLayout from 'layouts/main-layout/main.layout';
import ProposalItem from 'components/dedicated/proposal-item/proposal-item.component';

import styles from './style.module.scss';

const ProposalsView = (): ReactElement => {
  const [proposals] = useProposals();
  const [idsInAllocation, onAddRemoveFromAllocate] = useIdsInAllocation(proposals);

  return (
    <MainLayout>
      <div className={styles.list}>
        {proposals.length === 0
          ? 'Loading...'
          : proposals.map((proposal, index) => (
              <ProposalItem
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                isAlreadyAdded={idsInAllocation.includes(proposal.id)}
                onAddRemoveFromAllocate={() => onAddRemoveFromAllocate(proposal.id)}
                {...proposal}
              />
            ))}
      </div>
    </MainLayout>
  );
};

export default ProposalsView;

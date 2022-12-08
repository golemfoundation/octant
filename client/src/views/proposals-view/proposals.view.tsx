import React, { ReactElement } from 'react';

import MainLayout from 'layouts/main-layout/main.layout';
import ProposalItem from 'components/dedicated/proposal-item/proposal-item.component';
import useIdsInAllocation from 'hooks/useIdsInAllocation';
import useProposals from 'hooks/useProposals';

import styles from './style.module.scss';

const ProposalsView = (): ReactElement => {
  const [proposals] = useProposals();
  const [idsInAllocation, onAddRemoveFromAllocate] = useIdsInAllocation(proposals);

  return (
    <MainLayout isLoading={proposals.length === 0}>
      <div className={styles.list}>
        {proposals.map((proposal, index) => (
          <ProposalItem
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            isAlreadyAdded={idsInAllocation.includes(proposal.id.toNumber())}
            onAddRemoveFromAllocate={() => onAddRemoveFromAllocate(proposal.id.toNumber())}
            {...proposal}
          />
        ))}
      </div>
    </MainLayout>
  );
};

export default ProposalsView;

import { useMetamask } from 'use-metamask';
import React, { ReactElement, useEffect, useState } from 'react';

import { apiGetProposal } from 'api/proposals';
import { useAllocationsContract, useProposalsContract } from 'hooks/useContract';
import ProposalItem from 'components/dedicated/proposal-item/proposal-item.component';
import env from 'env';

import { ExtendedProposal } from './types';
import styles from './style.module.scss';

const ProposalsView = (): ReactElement => {
  const [loadedProposals, setLoadedProposals] = useState<ExtendedProposal[]>([]);
  const {
    metaState: { web3 },
  } = useMetamask();
  const { proposalsAddress, allocationsAddress } = env;
  const signer = web3?.getSigner();
  const contractProposals = useProposalsContract(proposalsAddress);
  const contractAllocations = useAllocationsContract(allocationsAddress, signer);

  useEffect(() => {
    if (contractProposals) {
      (async () => {
        const proposals = await contractProposals.getProposals();
        await Promise.all(proposals.map(({ uri }) => apiGetProposal(uri).catch(error => error)))
          .then(arrayOfValuesOrErrors => {
            const parsedProposals = arrayOfValuesOrErrors.map<ExtendedProposal>(
              (proposal, index) => ({
                ...proposal,
                id: proposals[index].id,
                isLoadingError: !!proposal.response?.status,
              }),
            );
            setLoadedProposals(parsedProposals);
          })
          .catch(error => {
            // eslint-disable-next-line no-console
            console.log({ error });
          });
      })();
    }
  }, [contractProposals]);

  return (
    <div>
      Currently used proposals address is: {proposalsAddress}
      <div className={styles.list}>
        {loadedProposals.length === 0
          ? 'Loading...'
          : loadedProposals.map((proposal, index) => (
              <ProposalItem
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                {...proposal}
                contractAllocations={contractAllocations}
              />
            ))}
      </div>
    </div>
  );
};

export default ProposalsView;

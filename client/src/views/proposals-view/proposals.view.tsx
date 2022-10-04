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
  const signer = web3 ? web3.getSigner() : null;
  const contractProposals = useProposalsContract(proposalsAddress);
  const contractAllocations = useAllocationsContract(allocationsAddress, signer);

  useEffect(() => {
    if (contractAllocations) {
      (async () => {
        // eslint-disable-next-line no-console
        console.log({ contractAllocations });
        const votes = await contractAllocations.getVotesCount(1, 1);
        // eslint-disable-next-line no-console
        console.log({ votes });
      })();
    }
  }, [contractAllocations]);

  useEffect(() => {
    if (contractProposals) {
      (async () => {
        const proposals = await contractProposals.getProposals();
        await Promise.all(proposals.map(({ uri }) => apiGetProposal(uri).catch(error => error)))
          .then(arrayOfValuesOrErrors => {
            const parsedProposals = arrayOfValuesOrErrors.map<ExtendedProposal>(proposal => ({
              ...proposal,
              isLoadingError: !!proposal.response?.status,
            }));
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
          ? 'loading'
          : loadedProposals.map((proposal, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <ProposalItem key={index} {...proposal} />
            ))}
      </div>
    </div>
  );
};

export default ProposalsView;

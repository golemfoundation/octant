import React, { ReactElement, useEffect, useState } from 'react';

import { apiGetProposal } from 'api/proposals';
import { useProposalsContract } from 'hooks/useContract';
import ProposalItem from 'components/dedicated/proposal-item/proposal-item.component';
import env from 'env';

import { ExtendedProposal } from './types';
import styles from './style.module.scss';

const ProposalsView = (): ReactElement => {
  const [loadedProposals, setLoadedProposals] = useState<ExtendedProposal[]>([]);
  const { proposalsAddress } = env;
  const contract = useProposalsContract(proposalsAddress);

  useEffect(() => {
    if (contract) {
      (async () => {
        const proposals = await contract.getProposals();
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
  }, [contract]);

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

import React, { Fragment, ReactElement, useEffect, useState } from 'react';

import { apiGetProposal } from 'api/proposals';
import { useProposalsContract } from 'hooks/useContract';
import Button from 'components/core/button/button.component';
import env from 'env';

import { ExtendedProposal } from './types';
import styles from './styles.module.scss';

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
            const parsedProposals = arrayOfValuesOrErrors.map<ExtendedProposal>(proposal => {
              const isLoadingError = !!proposal.response?.status;
              return { ...proposal, isLoadingError };
            });
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
              <div key={index} className={styles.proposal}>
                {proposal.isLoadingError ? (
                  'Loading of proposal encountered an error.'
                ) : (
                  <Fragment>
                    <div>{proposal.name}</div>
                    <div>{proposal.description}</div>
                    <div>
                      <Button href={proposal.website} label="Website" target="_blank" />
                    </div>
                    <div className={styles.buttons}>
                      {proposal.socialLinks.map(link => (
                        <Button href={link} label="Social link" target="_blank" />
                      ))}
                    </div>
                  </Fragment>
                )}
              </div>
            ))}
      </div>
    </div>
  );
};

export default ProposalsView;

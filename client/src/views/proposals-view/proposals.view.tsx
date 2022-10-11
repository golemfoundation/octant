import { useMetamask } from 'use-metamask';
import { useQueries, useQuery } from 'react-query';
import React, { ReactElement } from 'react';

import { apiGetProposal } from 'api/proposals';
import { useAllocationsContract, useEpochsContract, useProposalsContract } from 'hooks/useContract';
import ProposalItem from 'components/dedicated/proposal-item/proposal-item.component';
import env from 'env';

import { ExtendedProposal } from './types';
import styles from './style.module.scss';

const ProposalsView = (): ReactElement => {
  const {
    metaState: { web3 },
  } = useMetamask();
  const { proposalsAddress, allocationsAddress, epochsAddress } = env;
  const signer = web3?.getSigner();
  const contractProposals = useProposalsContract(proposalsAddress);
  const contractEpochs = useEpochsContract(epochsAddress);
  const contractAllocations = useAllocationsContract(allocationsAddress, signer);

  const { data: currentEpoch } = useQuery(
    ['currentEpoch'],
    () => contractEpochs?.getCurrentEpoch(),
    { enabled: !!contractEpochs },
  );

  const { data: proposalsContract } = useQuery(
    ['proposals'],
    () => contractProposals?.getProposals(),
    { enabled: !!contractProposals },
  );
  const proposalsIpfsResults = useQueries(
    (proposalsContract || []).map(({ id, uri }) => {
      return {
        queryFn: () => apiGetProposal(uri),
        queryKey: ['test', id],
      };
    }),
  );
  const isProposalsIpfsResultsLoading = proposalsIpfsResults.some(({ isLoading }) => isLoading);
  const parsedProposals = isProposalsIpfsResultsLoading
    ? []
    : proposalsIpfsResults.map<ExtendedProposal>(({ data: proposal }, index) => ({
        ...proposal,
        id: proposalsContract![index].id,
        isLoadingError: !!proposal.response?.status,
      }));

  return (
    <div>
      Currently used proposals address is: {proposalsAddress}
      <div className={styles.list}>
        {parsedProposals.length === 0
          ? 'Loading...'
          : parsedProposals.map((proposal, index) => (
              <ProposalItem
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                currentEpoch={currentEpoch}
                getVotesCount={contractAllocations?.getVotesCount}
                vote={contractAllocations?.vote}
                {...proposal}
              />
            ))}
      </div>
    </div>
  );
};

export default ProposalsView;

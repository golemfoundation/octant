import cx from 'classnames';
import React, { FC } from 'react';
import { useParams } from 'react-router-dom';

import ProposalDonorsListItem from 'components/Proposal/ProposalDonorsListItem';
import ProposalDonorsListSkeletonItem from 'components/Proposal/ProposalDonorsListSkeletonItem';
import ProposalDonorsListTotalDonated from 'components/Proposal/ProposalDonorsListTotalDonated';
import { DONORS_SHORT_LIST_LENGTH } from 'constants/donors';
import useProposalDonors from 'hooks/queries/donors/useProposalDonors';

import styles from './ProposalDonorsList.module.scss';
import ProposalDonorsListProps from './types';

const ProposalDonorsList: FC<ProposalDonorsListProps> = ({
  className,
  dataTest = 'DonorsList',
  proposalAddress,
  showFullList = false,
}) => {
  const { epoch } = useParams();
  const { data: proposalDonors, isFetching } = useProposalDonors(
    proposalAddress,
    parseInt(epoch!, 10),
  );

  return (
    <div className={cx(styles.root, className)} data-test={dataTest}>
      {isFetching ? (
        [...Array(DONORS_SHORT_LIST_LENGTH)].map((_, idx) => (
          <ProposalDonorsListSkeletonItem
            // eslint-disable-next-line react/no-array-index-key
            key={idx}
            dataTest={`${dataTest}__DonorsItemSkeleton`}
          />
        ))
      ) : (
        <>
          <div className={cx(styles.list, showFullList && styles.fullList)}>
            {proposalDonors
              ?.slice(0, showFullList ? proposalDonors.length : DONORS_SHORT_LIST_LENGTH)
              ?.map(({ amount, address }) => (
                <ProposalDonorsListItem key={address} amount={amount} donorAddress={address} />
              ))}
          </div>
          <ProposalDonorsListTotalDonated
            className={cx(styles.totalDonated, showFullList && styles.fullList)}
            proposalDonors={proposalDonors}
          />
        </>
      )}
    </div>
  );
};

export default ProposalDonorsList;

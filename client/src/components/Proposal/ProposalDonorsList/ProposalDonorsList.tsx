import cx from 'classnames';
import React, { FC } from 'react';
import { useParams } from 'react-router-dom';

import ProposalDonorsListItem from 'components/Proposal/ProposalDonorsListItem';
import ProposalDonorsListSkeletonItem from 'components/Proposal/ProposalDonorsListSkeletonItem';
import ProposalDonorsListTotalDonated from 'components/Proposal/ProposalDonorsListTotalDonated';
import { DONORS_SHORT_LIST_LENGTH } from 'constants/donors';
import useProjectDonors from 'hooks/queries/donors/useProjectDonors';

import styles from './ProposalDonorsList.module.scss';
import ProposalDonorsListProps from './types';

const ProposalDonorsList: FC<ProposalDonorsListProps> = ({
  className,
  dataTest = 'DonorsList',
  proposalAddress,
  showFullList = false,
}) => {
  const { epoch } = useParams();
  const { data: projectDonors, isFetching } = useProjectDonors(
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
            {projectDonors
              ?.slice(0, showFullList ? projectDonors.length : DONORS_SHORT_LIST_LENGTH)
              ?.map(({ amount, address }) => (
                <ProposalDonorsListItem key={address} amount={amount} donorAddress={address} />
              ))}
          </div>
          <ProposalDonorsListTotalDonated
            className={cx(styles.totalDonated, showFullList && styles.fullList)}
            projectDonors={projectDonors}
          />
        </>
      )}
    </div>
  );
};

export default ProposalDonorsList;

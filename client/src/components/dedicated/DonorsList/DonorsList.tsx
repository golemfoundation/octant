import cx from 'classnames';
import React, { FC } from 'react';
import { useParams } from 'react-router-dom';

import DonorsItem from 'components/dedicated/DonorsItem/DonorsItem';
import DonorsItemSkeleton from 'components/dedicated/DonorsItem/DonorsItemSkeleton/DonorsItemSkeleton';
import { DONORS_SHORT_LIST_LENGTH } from 'constants/donors';
import useProposalDonors from 'hooks/queries/useProposalDonors';

import styles from './DonorsList.module.scss';
import DonorsListProps from './types';

const DonorsList: FC<DonorsListProps> = ({
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
      {isFetching
        ? [...Array(DONORS_SHORT_LIST_LENGTH)].map((_, idx) => (
            // eslint-disable-next-line react/no-array-index-key
            <DonorsItemSkeleton key={idx} dataTest={`${dataTest}__DonorsItemSkeleton`} />
          ))
        : proposalDonors
            ?.slice(0, showFullList ? proposalDonors.length : DONORS_SHORT_LIST_LENGTH)
            ?.map(({ amount, address }) => (
              <DonorsItem
                key={address}
                amount={amount}
                className={styles.donorsItem}
                donorAddress={address}
              />
            ))}
    </div>
  );
};

export default DonorsList;

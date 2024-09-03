import React, { FC } from 'react';

import DonationsListItem from 'components/Home/HomeGridDonations/DonationsListItem';
import DonationsListSkeletonItem from 'components/Home/HomeGridDonations/DonationsListSkeletonItem';
import useGetValuesToDisplay from 'hooks/helpers/useGetValuesToDisplay';

import styles from './DonationsList.module.scss';
import DonationsListProps from './types';

const DonationsList: FC<DonationsListProps> = ({
  donations,
  isLoading,
  numberOfSkeletons,
  dataTest = 'DonationsList',
}) => {
  const getValuesToDisplay = useGetValuesToDisplay();

  return (
    <div className={styles.root} data-test={dataTest}>
      <div className={styles.donationsList}>
        {isLoading
          ? Array.from(Array(numberOfSkeletons)).map((_, idx) => (
              // eslint-disable-next-line react/no-array-index-key
              <DonationsListSkeletonItem key={`skeleton-${idx}`} />
            ))
          : donations.map(donation => (
              <DonationsListItem
                key={donation.address}
                address={donation.address}
                dataTest={`${dataTest}__item`}
                epoch={donation.epoch}
                value={
                  getValuesToDisplay({
                    cryptoCurrency: 'ethereum',
                    getFormattedEthValueProps: {
                      shouldIgnoreGwei: true,
                      shouldIgnoreWei: true,
                    },
                    showCryptoSuffix: true,
                    valueCrypto: donation.value,
                  }).primary
                }
              />
            ))}
      </div>
    </div>
  );
};

export default DonationsList;

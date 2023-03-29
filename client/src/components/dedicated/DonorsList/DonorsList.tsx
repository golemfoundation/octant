import React, { FC, useEffect, useState } from 'react';
import Identicon from 'react-identicons';

import Button from 'components/core/Button/Button';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import useProposalAllocations from 'hooks/subgraph/allocations/useProposalAllocations';
import useSettingsStore from 'store/settings/store';
import getValueCryptoToDisplay from 'utils/getValueCryptoToDisplay';
import getValueFiatToDisplay from 'utils/getValueFiatToDisplay';
import truncateEthAddress from 'utils/truncateEthAddress';

import styles from './DonorsList.module.scss';
import DonorsListProps from './types';

const SHORT_LIST_LENGTH = 4;

const DonorsList: FC<DonorsListProps> = ({ proposalAddress }) => {
  const {
    data: { displayCurrency, isCryptoMainValueDisplay },
  } = useSettingsStore(({ data }) => ({
    data: {
      displayCurrency: data.displayCurrency,
      isCryptoMainValueDisplay: data.isCryptoMainValueDisplay,
    },
  }));
  const { data: cryptoValues, error } = useCryptoValues(displayCurrency);
  const [isDonorsListExpanded, setIsDonorsListExpanded] = useState<boolean>(false);
  const { data: proposalAllocations, refetch: refetchProposalAllocations } = useProposalAllocations(
    { proposalAddress },
  );

  useEffect(() => {
    refetchProposalAllocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span>Donors</span>{' '}
        {proposalAllocations && <div className={styles.count}>{proposalAllocations.length}</div>}
      </div>
      {proposalAllocations
        ?.slice(0, isDonorsListExpanded ? proposalAllocations.length : SHORT_LIST_LENGTH)
        ?.map(({ amount, user }, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index} className={styles.donor}>
            <div className={styles.identicon}>
              <Identicon size={14} string={user} />
            </div>
            <div className={styles.address}>{truncateEthAddress(user)}</div>
            <div>
              {isCryptoMainValueDisplay
                ? getValueCryptoToDisplay({
                    cryptoCurrency: 'ethereum',
                    valueCrypto: amount,
                  })
                : getValueFiatToDisplay({
                    cryptoCurrency: 'ethereum',
                    cryptoValues,
                    displayCurrency: displayCurrency!,
                    error,
                    valueCrypto: amount,
                  })}
            </div>
          </div>
        ))}
      {proposalAllocations && proposalAllocations.length > SHORT_LIST_LENGTH && (
        <Button
          className={styles.buttonDonors}
          label={isDonorsListExpanded ? 'See less' : 'See all'}
          onClick={() => setIsDonorsListExpanded(!isDonorsListExpanded)}
          variant="link4"
        />
      )}
    </div>
  );
};

export default DonorsList;

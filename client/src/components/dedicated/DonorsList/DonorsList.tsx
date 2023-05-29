import cx from 'classnames';
import React, { FC, useEffect, useState, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import Button from 'components/core/Button/Button';
import Identicon from 'components/core/Identicon/Identicon';
import Loader from 'components/core/Loader/Loader';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import useProposalAllocations from 'hooks/subgraph/allocations/useProposalAllocations';
import useSettingsStore from 'store/settings/store';
import getValueCryptoToDisplay from 'utils/getValueCryptoToDisplay';
import getValueFiatToDisplay from 'utils/getValueFiatToDisplay';
import truncateEthAddress from 'utils/truncateEthAddress';

import styles from './DonorsList.module.scss';
import DonorsListProps from './types';

const SHORT_LIST_LENGTH = 4;

const DonorsList: FC<DonorsListProps> = ({
  className,
  dataTest = 'DonorsList',
  proposalAddress,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'components.dedicated.donorsList' });
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
  const {
    data: proposalAllocations,
    refetch: refetchProposalAllocations,
    isLoading,
  } = useProposalAllocations({ proposalAddress });

  useEffect(() => {
    if (proposalAllocations && proposalAllocations?.length > 0) {
      refetchProposalAllocations();
    }
  }, [proposalAllocations, refetchProposalAllocations]);

  return (
    <div className={cx(styles.root, className)} data-test={dataTest}>
      {isLoading ? (
        <Loader className={styles.loader} dataTest={`${dataTest}__Loader`} />
      ) : (
        <Fragment>
          <div className={styles.header}>
            <span>{t('donors')}</span>{' '}
            {proposalAllocations && (
              <div className={styles.count} data-test={`${dataTest}__count`}>
                {proposalAllocations.length}
              </div>
            )}
          </div>
          {proposalAllocations
            ?.slice(0, isDonorsListExpanded ? proposalAllocations.length : SHORT_LIST_LENGTH)
            ?.map(({ amount, user }) => (
              <div key={`${proposalAddress}-${user}`} className={styles.donor}>
                <Identicon className={styles.identicon} username={user} />
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
              label={isDonorsListExpanded ? `- ${t('seeLess')}` : `+ ${t('seeAll')}`}
              onClick={() => setIsDonorsListExpanded(!isDonorsListExpanded)}
              variant="secondary2"
            />
          )}
        </Fragment>
      )}
    </div>
  );
};

export default DonorsList;

import cx from 'classnames';
import React, { FC, useState, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import Button from 'components/core/Button/Button';
import Identicon from 'components/core/Identicon/Identicon';
import Loader from 'components/core/Loader/Loader';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useProposalDonors from 'hooks/queries/useProposalDonors';
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
  const { data: proposalDonors, isFetching } = useProposalDonors(proposalAddress);
  const { data: currentEpoch } = useCurrentEpoch();

  const isEpoch1 = currentEpoch === 1;

  return (
    <div className={cx(styles.root, className)} data-test={dataTest}>
      {isEpoch1 && (
        <div className={styles.donationsNotEnabled} data-test={`${dataTest}__donationsNotEnabled`}>
          {t('donationsNotEnabled')}
        </div>
      )}
      {!isEpoch1 && isFetching && (
        <Loader className={styles.loader} dataTest={`${dataTest}__Loader`} />
      )}
      {!isEpoch1 && !isFetching && (
        <Fragment>
          <div className={styles.header}>
            <span>{t('donors')}</span>{' '}
            {proposalDonors && (
              <div className={styles.count} data-test={`${dataTest}__count`}>
                {isEpoch1 ? '--' : proposalDonors.length}
              </div>
            )}
          </div>
          {proposalDonors
            ?.slice(0, isDonorsListExpanded ? proposalDonors.length : SHORT_LIST_LENGTH)
            ?.map(({ amount, address }) => (
              <div key={`${proposalAddress}-${address}`} className={styles.donor}>
                <Identicon className={styles.identicon} username={address} />
                <div className={styles.address}>{truncateEthAddress(address)}</div>
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
          {proposalDonors && proposalDonors.length > SHORT_LIST_LENGTH && (
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

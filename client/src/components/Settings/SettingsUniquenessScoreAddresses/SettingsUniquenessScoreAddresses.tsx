import React, { ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import Identicon from 'components/ui/Identicon';
import truncateEthAddress from 'utils/truncateEthAddress';

import styles from './SettingsUniquenessScoreAddresses.module.scss';

// TODO: use real score
const score = 100;

const SettingsUniquenessScoreAddresses = (): ReactNode => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.settings' });

  const { address: accountAddress } = useAccount();
  const addresses = [accountAddress!];

  const showMoreThanOneAddress = addresses.length > 1;

  return (
    <div className={styles.root}>
      <div className={styles.avatarsGroup}>
        {addresses.map(address => (
          <div key={address} className={styles.addressAvatar}>
            <Identicon className={styles.avatar} username={address} />
          </div>
        ))}
      </div>
      <div className={styles.addresses}>
        <div className={styles.addressesGroup}>
          {showMoreThanOneAddress
            ? addresses.map(address => address.slice(0, 5)).join(', ')
            : truncateEthAddress(addresses.at(0) || '')}
        </div>
        <div className={styles.numberOfAddresses}>
          {showMoreThanOneAddress ? `${addresses?.length} ${t('addresses')}` : t('primary')}
        </div>
      </div>
      <div className={styles.score}>{score}</div>
    </div>
  );
};

export default memo(SettingsUniquenessScoreAddresses);

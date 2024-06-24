import React, { ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';

import Identicon from 'components/ui/Identicon';

import styles from './SettingsUniquenessScoreAddresses.module.scss';

const addresses = [
  '0xe5e11cc5fb894eF5A9D7Da768cFb17066b9d35D7',
  '0xDA4069005073E91301DcC38797d7159B301a3590',
  '0x2043c7262A19493cD293d865c56482AF122f8882',
];
const score = 100;

const SettingsUniquenessScoreAddresses = (): ReactNode => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.settings' });

  const amountOfAvatarsToShow = 2;

  return (
    <div className={styles.root}>
      <div className={styles.avatarsGroup}>
        {addresses.slice(0, amountOfAvatarsToShow).map(address => (
          <div key={address} className={styles.addressAvatar}>
            <Identicon className={styles.avatar} username={address} />
          </div>
        ))}
        {addresses.length > amountOfAvatarsToShow && (
          <div className={styles.addressAvatar}> +{addresses.length - amountOfAvatarsToShow} </div>
        )}
      </div>
      <div className={styles.addresses}>
        <div className={styles.addressesGroup}>
          {addresses.map(address => address.slice(0, 5)).join(', ')}
        </div>
        <div className={styles.numberOfAddresses}>
          {addresses?.length} {t('addresses')}
        </div>
      </div>
      <div className={styles.score}>{score}</div>
    </div>
  );
};

export default memo(SettingsUniquenessScoreAddresses);

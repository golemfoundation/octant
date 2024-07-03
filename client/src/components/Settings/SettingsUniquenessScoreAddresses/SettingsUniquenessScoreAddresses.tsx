import cx from 'classnames';
import React, { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import Identicon from 'components/ui/Identicon';
import useSettingsStore from 'store/settings/store';
import truncateEthAddress from 'utils/truncateEthAddress';

import styles from './SettingsUniquenessScoreAddresses.module.scss';
import SettingsUniquenessScoreAddressesProps from './types';

const SettingsUniquenessScoreAddresses: FC<SettingsUniquenessScoreAddressesProps> = ({
  showScoreLoader,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.settings' });

  const { address: accountAddress } = useAccount();

  const {
    isDelegationCompleted,
    delegationPrimaryAddress,
    delegationSecondaryAddress,
    primaryAddressScore,
    secondaryAddressScore,
  } = useSettingsStore(state => ({
    delegationPrimaryAddress: state.data.delegationPrimaryAddress,
    delegationSecondaryAddress: state.data.delegationSecondaryAddress,
    isDelegationCompleted: state.data.isDelegationCompleted,
    primaryAddressScore: state.data.primaryAddressScore,
    secondaryAddressScore: state.data.secondaryAddressScore,
  }));

  const addresses =
    isDelegationCompleted && delegationPrimaryAddress && delegationSecondaryAddress
      ? [delegationPrimaryAddress, delegationSecondaryAddress]
      : [accountAddress];

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
      <div className={cx(styles.score, showScoreLoader && styles.showScoreLoader)}>
        {!showScoreLoader && (
          <span> {isDelegationCompleted ? secondaryAddressScore : primaryAddressScore}</span>
        )}
      </div>
    </div>
  );
};

export default memo(SettingsUniquenessScoreAddresses);

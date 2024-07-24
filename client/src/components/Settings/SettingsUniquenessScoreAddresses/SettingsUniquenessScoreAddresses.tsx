import cx from 'classnames';
import { animate } from 'framer-motion';
import React, { FC, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import Identicon from 'components/ui/Identicon';
import Svg from 'components/ui/Svg';
import useSettingsStore from 'store/settings/store';
import { octant } from 'svg/logo';
import truncateEthAddress from 'utils/truncateEthAddress';

import styles from './SettingsUniquenessScoreAddresses.module.scss';
import SettingsUniquenessScoreAddressesProps from './types';

const SettingsUniquenessScoreAddresses: FC<SettingsUniquenessScoreAddressesProps> = ({
  isFetchingScore,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.settings' });
  const ref = useRef<HTMLDivElement>(null);

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

  const addresses = useMemo(() => {
    if (
      (isDelegationCompleted && delegationPrimaryAddress && delegationSecondaryAddress) ||
      (delegationPrimaryAddress && delegationSecondaryAddress === '0x???')
    ) {
      return [delegationPrimaryAddress, delegationSecondaryAddress];
    }

    return [accountAddress];
  }, [delegationPrimaryAddress, delegationSecondaryAddress, isDelegationCompleted, accountAddress]);

  const showMoreThanOneAddress = addresses.length > 1;

  const addressesToShow = useMemo(() => {
    if (showMoreThanOneAddress) {
      return addresses.map(address => address.slice(0, 5)).join(', ');
    }
    return truncateEthAddress(addresses.at(0) || '');
  }, [showMoreThanOneAddress, addresses]);

  useEffect(() => {
    if (isFetchingScore || !ref?.current) {
      return;
    }
    const controls = animate(
      0,
      isDelegationCompleted ? secondaryAddressScore! : primaryAddressScore!,
      {
        duration: 1,
        onUpdate(value) {
          if (!ref.current) {
            return;
          }
          ref.current.textContent = value.toFixed(0);
        },
      },
    );

    return () => controls.complete();
  }, [isFetchingScore, isDelegationCompleted, secondaryAddressScore, primaryAddressScore]);

  return (
    <div className={styles.root}>
      <div className={styles.avatarsGroup}>
        {addresses.map(address => (
          <div key={address} className={styles.addressAvatar}>
            {address === '0x???' ? (
              <Svg img={octant} size={1.4} />
            ) : (
              <Identicon className={styles.avatar} username={address} />
            )}
          </div>
        ))}
      </div>
      <div className={styles.addresses}>
        <div className={styles.addressesGroup}>{addressesToShow}</div>
        <div className={styles.numberOfAddresses}>
          {showMoreThanOneAddress ? `${addresses?.length} ${t('addresses')}` : t('primary')}
        </div>
      </div>
      <div ref={ref} className={cx(styles.score, isFetchingScore && styles.isFetchingScore)}>
        0
      </div>
    </div>
  );
};

export default SettingsUniquenessScoreAddresses;

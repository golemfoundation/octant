import cx from 'classnames';
import { BigNumber } from 'ethers';
import React, { FC, Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useDisconnect } from 'wagmi';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Sections from 'components/core/BoxRounded/Sections/Sections';
import { SectionProps } from 'components/core/BoxRounded/Sections/types';
import Button from 'components/core/Button/Button';
import RewardsBox from 'components/dedicated/RewardsBox/RewardsBox';
import useAvailableFundsEth from 'hooks/helpers/useAvailableFundsEth';
import useAvailableFundsGlm from 'hooks/helpers/useAvailableFundsGlm';
import { golem, ethereum } from 'svg/logo';
import truncateEthAddress from 'utils/truncateEthAddress';

import WalletProps from './types';
import styles from './Wallet.module.scss';

const Wallet: FC<WalletProps> = ({ onDisconnect }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.walletModal',
  });
  const { address } = useAccount();

  const { data: availableFundsEth } = useAvailableFundsEth();
  const { data: availableFundsGlm } = useAvailableFundsGlm();

  const { disconnect } = useDisconnect();

  /**
   * Setting values in local state prevents flickering
   * when account is disconnected and balances returned are undefined.
   */
  const availableFundsEthLocal = useMemo(() => {
    return !availableFundsEth?.value ? BigNumber.from(0) : BigNumber.from(availableFundsEth?.value);
  }, [availableFundsEth]);

  const availableFundsGlmLocal = useMemo(() => {
    return !availableFundsGlm?.value ? BigNumber.from(0) : BigNumber.from(availableFundsGlm?.value);
  }, [availableFundsGlm]);

  const _disconnect = () => {
    onDisconnect();
    disconnect();
  };

  const sections: SectionProps[] = [
    {
      doubleValueProps: {
        cryptoCurrency: 'ethereum',
        valueCrypto: availableFundsEthLocal,
      },
      icon: ethereum,
    },
    {
      doubleValueProps: {
        coinPricesServerDowntimeText: '...',
        cryptoCurrency: 'golem',
        valueCrypto: availableFundsGlmLocal,
      },
      icon: golem,
    },
  ];

  return (
    <Fragment>
      <RewardsBox className={cx(styles.element, styles.box)} isGrey />
      <BoxRounded
        alignment="left"
        className={cx(styles.element, styles.box)}
        hasSections
        isGrey
        isVertical
        title={t('wallet')}
        titleSuffix={address ? truncateEthAddress(address) : undefined}
      >
        <Sections sections={sections} />
      </BoxRounded>
      <Button className={styles.button} label={t('disconnectWallet')} onClick={_disconnect} />
    </Fragment>
  );
};

export default Wallet;

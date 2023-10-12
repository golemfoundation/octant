import cx from 'classnames';
import { BigNumber } from 'ethers';
import React, { FC, Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useDisconnect } from 'wagmi';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Sections from 'components/core/BoxRounded/Sections/Sections';
import { SectionProps } from 'components/core/BoxRounded/Sections/types';
import Button from 'components/core/Button/Button';
import WalletPersonalAllocation from 'components/dedicated/WalletPersonalAllocation/WalletPersonalAllocation';
import useAvailableFundsEth from 'hooks/helpers/useAvailableFundsEth';
import useAvailableFundsGlm from 'hooks/helpers/useAvailableFundsGlm';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import { golem, ethereum } from 'svg/logo';
import { CryptoCurrency } from 'types/cryptoCurrency';
import truncateEthAddress from 'utils/truncateEthAddress';

import WalletProps from './types';
import styles from './Wallet.module.scss';

const Wallet: FC<WalletProps> = ({ onDisconnect }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.walletModal',
  });
  const { address } = useAccount();

  const { data: availableFundsEth, isFetching: isFetchingAvailableFundsEth } =
    useAvailableFundsEth();
  const { data: availableFundsGlm, isFetching: isFetchingAvailableFundsGlm } =
    useAvailableFundsGlm();

  const { disconnect } = useDisconnect();

  const isProjectAdminMode = useIsProjectAdminMode();

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
        isFetching: isFetchingAvailableFundsEth,
        valueCrypto: availableFundsEthLocal,
      },
      icon: ethereum,
    },
    ...(!isProjectAdminMode
      ? [
          {
            doubleValueProps: {
              coinPricesServerDowntimeText: '...' as const,
              cryptoCurrency: 'golem' as CryptoCurrency,
              isFetching: isFetchingAvailableFundsGlm,
              valueCrypto: availableFundsGlmLocal,
            },
            icon: golem,
          },
        ]
      : []),
  ];

  return (
    <Fragment>
      <WalletPersonalAllocation className={cx(styles.element, styles.box)} isGrey />
      <BoxRounded
        alignment="left"
        className={cx(styles.element, styles.box)}
        hasSections
        isGrey
        isVertical
        title={t('wallet')}
        titleSuffix={
          address ? (
            <div className={styles.titleSuffix}>{truncateEthAddress(address)}</div>
          ) : undefined
        }
      >
        <Sections sections={sections} />
      </BoxRounded>
      <Button className={styles.button} label={t('disconnectWallet')} onClick={_disconnect} />
    </Fragment>
  );
};

export default Wallet;

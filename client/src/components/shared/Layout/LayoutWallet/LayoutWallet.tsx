import cx from 'classnames';
import React, { FC, Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useDisconnect } from 'wagmi';

import LayoutWalletPersonalAllocation from 'components/shared/Layout/LayoutWalletPersonalAllocation';
import BoxRounded from 'components/ui/BoxRounded';
import Sections from 'components/ui/BoxRounded/Sections/Sections';
import { SectionProps } from 'components/ui/BoxRounded/Sections/types';
import Button from 'components/ui/Button';
import networkConfig from 'constants/networkConfig';
import useAvailableFundsEth from 'hooks/helpers/useAvailableFundsEth';
import useAvailableFundsGlm from 'hooks/helpers/useAvailableFundsGlm';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import { golem, ethereum } from 'svg/logo';
import { CryptoCurrency } from 'types/cryptoCurrency';
import truncateEthAddress from 'utils/truncateEthAddress';

import styles from './LayoutWallet.module.scss';
import LayoutWalletProps from './types';

const LayoutWallet: FC<LayoutWalletProps> = ({ onDisconnect }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.walletModal',
  });
  const { address } = useAccount();

  const { data: availableFundsEth, isFetched: isFetchedAvailableFundsEth } = useAvailableFundsEth();
  const { data: availableFundsGlm, isFetched: isFetchedAvailableFundsGlm } = useAvailableFundsGlm();

  const { disconnect } = useDisconnect();

  const isProjectAdminMode = useIsProjectAdminMode();

  /**
   * Setting values in local state prevents flickering
   * when account is disconnected and balances returned are undefined.
   */
  const availableFundsEthLocal = useMemo(() => {
    return !availableFundsEth?.value ? BigInt(0) : BigInt(availableFundsEth?.value);
  }, [availableFundsEth]);

  const availableFundsGlmLocal = useMemo(() => {
    return !availableFundsGlm?.value ? BigInt(0) : BigInt(availableFundsGlm?.value);
  }, [availableFundsGlm]);

  const _disconnect = () => {
    onDisconnect();
    disconnect();
  };

  const truncatedEthAddress = useMemo(() => address && truncateEthAddress(address), [address]);

  const sections: SectionProps[] = [
    {
      doubleValueProps: {
        cryptoCurrency: 'ethereum',
        isFetching: !isFetchedAvailableFundsEth,
        showCryptoSuffix: true,
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
              isFetching: !isFetchedAvailableFundsGlm,
              showCryptoSuffix: true,
              valueCrypto: availableFundsGlmLocal,
            },
            icon: golem,
          },
        ]
      : []),
  ];

  return (
    <Fragment>
      <LayoutWalletPersonalAllocation className={cx(styles.element, styles.box)} isGrey />
      <BoxRounded
        alignment="left"
        className={cx(styles.element, styles.box)}
        hasSections
        isGrey
        isVertical
        title={t('wallet')}
        titleSuffix={
          address ? (
            <Button
              className={styles.address}
              dataTest="LayoutWallet__Button--address"
              href={`${networkConfig.etherscanAddress}/address/${address}`}
              variant="link"
            >
              {truncatedEthAddress}
            </Button>
          ) : undefined
        }
      >
        <Sections sections={sections} />
      </BoxRounded>
      <Button className={styles.button} label={t('disconnectWallet')} onClick={_disconnect} />
    </Fragment>
  );
};

export default LayoutWallet;

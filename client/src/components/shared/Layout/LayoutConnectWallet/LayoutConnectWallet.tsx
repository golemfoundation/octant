import { useWeb3Modal } from '@web3modal/react';
import cx from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useConnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

import BoxRounded from 'components/ui/BoxRounded';
import Loader from 'components/ui/Loader';
import Svg from 'components/ui/Svg';
import networkConfig from 'constants/networkConfig';
import { browserWallet, walletConnect, ledgerConnect } from 'svg/wallet';

import styles from './LayoutConnectWallet.module.scss';

const LayoutConnectWallet: FC = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.connectWallet',
  });
  const { isConnected, connector } = useAccount();
  const { connectors, connect, pendingConnector, isLoading } = useConnect();
  const { open, isOpen } = useWeb3Modal();

  const browserWalletConnector = connectors.find(
    // eslint-disable-next-line @typescript-eslint/naming-convention
    ({ id, ready }) => id === 'injected' && ready,
  ) as InjectedConnector;

  // ledgerWalletConnector goes crazy when time shifts: https://github.com/golemfoundation/octant/actions/runs/8567962186/job/23481032309
  const ledgerWalletConnector = !networkConfig.isTestnet ? connectors.find(
    // eslint-disable-next-line @typescript-eslint/naming-convention
    ({ id, ready }) => id === 'ledger' && ready,
  ) as InjectedConnector : undefined;

  const isBrowserWalletConnecting = isLoading && pendingConnector?.id === connector?.id;

  const connectBrowserWallet = (): void => connect({ connector: browserWalletConnector });

  const openWalletConnectModal = async (): Promise<void> => {
    if (isConnected) {
      return;
    }
    await open();
  };

  const openLedgerWallet = (): void => connect({ connector: ledgerWalletConnector });

  return (
    <>
      {browserWalletConnector && (
        <BoxRounded
          className={styles.walletTile}
          dataTest="ConnectWallet__BoxRounded--browserWallet"
          isGrey
          justifyContent="start"
          onClick={isBrowserWalletConnecting ? undefined : connectBrowserWallet}
        >
          {isBrowserWalletConnecting ? (
            <>
              <div className={styles.icon}>
                <Loader />
              </div>
              <div className={styles.label}>{t('connecting')}</div>
            </>
          ) : (
            <>
              <Svg
                classNameWrapper={styles.icon}
                displayMode="wrapperCustom"
                img={browserWallet}
                size={3.2}
              />
              <div className={styles.label}>{t('browserWallet')}</div>
            </>
          )}
        </BoxRounded>
      )}
      <BoxRounded
        className={styles.walletTile}
        dataTest="ConnectWallet__BoxRounded--walletConnect"
        isGrey
        justifyContent="start"
        onClick={!isOpen && isBrowserWalletConnecting ? undefined : openWalletConnectModal}
      >
        <Svg
          classNameSvg={cx(!isOpen && isBrowserWalletConnecting && styles.iconGrey)}
          classNameWrapper={styles.icon}
          displayMode="wrapperCustom"
          img={walletConnect}
          size={2.4}
        />
        <div className={cx(styles.label, !isOpen && isBrowserWalletConnecting && styles.labelGrey)}>
          {t('walletConnect')}
        </div>
      </BoxRounded>
      {!networkConfig.isTestnet && (
        <BoxRounded
          className={styles.walletTile}
          dataTest="ConnectWallet__BoxRounded--ledgerConnect"
          isGrey
          justifyContent="start"
          onClick={!isOpen && isBrowserWalletConnecting ? undefined : openLedgerWallet}
        >
          <Svg
            classNameSvg={cx(!isOpen && isBrowserWalletConnecting && styles.iconGrey)}
            classNameWrapper={styles.icon}
            displayMode="wrapperCustom"
            img={ledgerConnect}
            size={2.4}
          />
          <div
            className={cx(styles.label, !isOpen && isBrowserWalletConnecting && styles.labelGrey)}
          >
            {t('ledgerConnect')}
          </div>
        </BoxRounded>
      )}
    </>
  );
};

export default LayoutConnectWallet;

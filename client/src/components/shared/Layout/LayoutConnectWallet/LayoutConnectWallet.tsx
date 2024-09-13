import { useConnectModal, WalletButton } from '@rainbow-me/rainbowkit';
import cx from 'classnames';
import React, { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { useConnect } from 'wagmi';

import BoxRounded from 'components/ui/BoxRounded';
import Loader from 'components/ui/Loader';
import Svg from 'components/ui/Svg';
import networkConfig from 'constants/networkConfig';
import useDelegationStore from 'store/delegation/store';
import { browserWallet, walletConnect, ledgerConnect } from 'svg/wallet';

import styles from './LayoutConnectWallet.module.scss';

const LayoutConnectWallet: FC = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.connectWallet',
  });

  const { isDelegationInProgress, setIsDelegationConnectModalOpen } = useDelegationStore(state => ({
    isDelegationInProgress: state.data.isDelegationInProgress,
    setIsDelegationConnectModalOpen: state.setIsDelegationConnectModalOpen,
  }));
  const { connectors, status, connect: onConnectAnyConnector } = useConnect();
  const { connectModalOpen: isOpen } = useConnectModal();

  const browserWalletConnector = connectors.find(
    // eslint-disable-next-line @typescript-eslint/naming-convention
    ({ id }) => id === 'injected',
  );

  const isBrowserWalletConnecting = status === 'pending';

  const connectBrowserWallet = (): void => {
    if (!browserWalletConnector) {
      return;
    }

    if (isDelegationInProgress) {
      browserWalletConnector.connect();
      setIsDelegationConnectModalOpen(false);
      return;
    }

    onConnectAnyConnector({ connector: browserWalletConnector });
  };

  return (
    <Fragment>
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
      <WalletButton.Custom wallet="walletConnect">
        {({ ready: isReady, connect: onConnect, connector }) => (
          <BoxRounded
            className={styles.walletTile}
            dataTest="ConnectWallet__BoxRounded--walletConnect"
            isGrey
            justifyContent="start"
            // In Cypress isReady is sometimes always false. To bypass that, we open modal regardless.
            onClick={() => {
              if (isDelegationInProgress) {
                return connector.showWalletConnectModal!();
              }

              if (
                window.Cypress === undefined &&
                (!isReady || isOpen || isBrowserWalletConnecting)
              ) {
                return undefined;
              }

              return onConnect();
            }}
          >
            <Svg
              classNameSvg={cx(!isOpen && isBrowserWalletConnecting && styles.iconGrey)}
              classNameWrapper={styles.icon}
              displayMode="wrapperCustom"
              img={walletConnect}
              size={2.4}
            />
            <div
              className={cx(styles.label, !isOpen && isBrowserWalletConnecting && styles.labelGrey)}
            >
              {t('walletConnect')}
            </div>
          </BoxRounded>
        )}
      </WalletButton.Custom>
      {!networkConfig.isTestnet && (
        <WalletButton.Custom wallet="ledger">
          {({ ready: isReady, connect: onConnect }) => (
            <BoxRounded
              className={styles.walletTile}
              dataTest="ConnectWallet__BoxRounded--ledgerConnect"
              isGrey
              justifyContent="start"
              onClick={!isReady || isOpen || isBrowserWalletConnecting ? undefined : onConnect}
            >
              <Svg
                classNameSvg={cx(!isOpen && isBrowserWalletConnecting && styles.iconGrey)}
                classNameWrapper={styles.icon}
                displayMode="wrapperCustom"
                img={ledgerConnect}
                size={2.4}
              />
              <div
                className={cx(
                  styles.label,
                  !isOpen && isBrowserWalletConnecting && styles.labelGrey,
                )}
              >
                {t('ledgerConnect')}
              </div>
            </BoxRounded>
          )}
        </WalletButton.Custom>
      )}
    </Fragment>
  );
};

export default LayoutConnectWallet;

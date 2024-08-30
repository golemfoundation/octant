import { useConnectModal, WalletButton } from '@rainbow-me/rainbowkit';
import cx from 'classnames';
import React, { FC, Fragment, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConnect } from 'wagmi';

import BoxRounded from 'components/ui/BoxRounded';
import Loader from 'components/ui/Loader';
import Svg from 'components/ui/Svg';
import networkConfig from 'constants/networkConfig';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useSettingsStore from 'store/settings/store';
import { browserWallet, walletConnect, ledgerConnect } from 'svg/wallet';

import styles from './LayoutConnectWallet.module.scss';
import { setCustomStylesForRainbowKitModal } from './utils';

import './LayoutConnectWallet.scss';

/**
 * Determines when RainbwKit modal is in "list of wallets" mode.
 * Mutations on RainbowKit modal DOM fire when:
 * 1. User chooses any of the wallets (opens wallet-specific loading state).
 * 2. User cancels the signature and goes back to the list.
 * 3. Custom styles (setCustomStylesForRainbowKitModal) are applied.
 *
 * Custom styles can not be applied when wallet-specific loading state is visible, because:
 * 1. It is not designed.
 * 2. Some of the DOM elements are not available then.
 *
 * Hence, the logic triggers setCustomStylesForRainbowKitModal when modal is being opened
 * and then when user goes back to the list of wallets.
 *
 * Observer checks for childList-type changes and whether user is in list mode,
 * then applies custom styles.
 */
let isInListMode = false;

const LayoutConnectWallet: FC = () => {
  const { isDesktop } = useMediaQuery();
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.connectWallet',
  });

  const { isDelegationInProgress, setIsDelegationConnectModalOpen } = useSettingsStore(state => ({
    isDelegationInProgress: state.data.isDelegationInProgress,
    setIsDelegationConnectModalOpen: state.setIsDelegationConnectModalOpen,
  }));
  const { connectors, status, connect: onConnectAnyConnector } = useConnect();
  const { openConnectModal, connectModalOpen: isConnectModalOpen } = useConnectModal();

  useEffect(() => {
    if (!isConnectModalOpen) {
      return;
    }

    setCustomStylesForRainbowKitModal(t);
    isInListMode = true;

    const target = document.querySelector('.iekbcc0.ju367va.ju367v14');

    const observer = new MutationObserver(mutations => {
      if (mutations.every(({ type }) => type === 'childList') && !isInListMode) {
        setCustomStylesForRainbowKitModal(t);
      }
      isInListMode = !isInListMode;
    });

    observer.observe(target as Element, { attributes: true, characterData: true, childList: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnectModalOpen]);

  const browserWalletConnector = connectors.find(
    // eslint-disable-next-line @typescript-eslint/naming-convention
    ({ id }) => id === 'injected',
    // Actually, probably type should be used combined with .filter, user select and ... [0].
    // ({ type }) => type === 'injected',
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

  const onBrowserWalletClick = useMemo(() => {
    if (isBrowserWalletConnecting) {
      return undefined;
    }
    return isDesktop ? openConnectModal : connectBrowserWallet;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBrowserWalletConnecting, isDesktop]);

  return (
    <Fragment>
      {browserWalletConnector && (
        <BoxRounded
          className={styles.walletTile}
          dataTest="ConnectWallet__BoxRounded--browserWallet"
          isGrey
          justifyContent="start"
          onClick={onBrowserWalletClick}
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
                (!isReady || isConnectModalOpen || isBrowserWalletConnecting)
              ) {
                return undefined;
              }

              return onConnect();
            }}
          >
            <Svg
              classNameSvg={cx(!isConnectModalOpen && isBrowserWalletConnecting && styles.iconGrey)}
              classNameWrapper={styles.icon}
              displayMode="wrapperCustom"
              img={walletConnect}
              size={2.4}
            />
            <div
              className={cx(
                styles.label,
                !isConnectModalOpen && isBrowserWalletConnecting && styles.labelGrey,
              )}
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
              onClick={
                !isReady || isConnectModalOpen || isBrowserWalletConnecting ? undefined : onConnect
              }
            >
              <Svg
                classNameSvg={cx(
                  !isConnectModalOpen && isBrowserWalletConnecting && styles.iconGrey,
                )}
                classNameWrapper={styles.icon}
                displayMode="wrapperCustom"
                img={ledgerConnect}
                size={2.4}
              />
              <div
                className={cx(
                  styles.label,
                  !isConnectModalOpen && isBrowserWalletConnecting && styles.labelGrey,
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

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
import './LayoutConnectWallet.scss';

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
    const timeout = setTimeout(() => {
      // RaibowKit connect modal.
      const rainbowkitConnectModal = document.querySelectorAll('body > div')[4];
      const allChildren = rainbowkitConnectModal.querySelectorAll('*');
      // font-family is set for all children, as !important doesn't work here.
      allChildren.forEach(element => {
        // eslint-disable-next-line no-param-reassign
        element.classList.add('rainbowKitCustomFontFamily');
      });

      const rainbowkitConnectModalHeader = document.querySelector('.iekbcc0.ju367va.ju367v2r');
      rainbowkitConnectModalHeader?.classList.add('rainbowkitConnectModalHeader');

      const rainbowkitConnectModalHeaderText =
        rainbowkitConnectModalHeader?.querySelector('div:nth-child(2) > h1');
      rainbowkitConnectModalHeaderText?.classList.add('rainbowkitConnectModalHeaderText');

      const walletOptionsButtons = document.querySelectorAll(
        '.iekbcc0.iekbcc9.ju367v89.ju367v6i.ju367v73.ju367v7o.ju367vo.ju367vt.ju367vv.ju367v8u.ju367v9f.ju367vb1.g5kl0l0._12cbo8i3.ju367v8r._12cbo8i6',
      );

      walletOptionsButtons.forEach(element => {
        element.classList.add('walletOptionsButton');
      });

      const walletOptionsText = document.querySelectorAll('.iekbcc0.ju367v5p');

      walletOptionsText.forEach(element => {
        element.classList.add('walletOptionsText');
      });

      const buttonClose = document.querySelectorAll(
        '.iekbcc0.iekbcc9.ju367v4.ju367va0.ju367vc6.ju367vs.ju367vt.ju367vv.ju367vff.ju367va.ju367v2b.ju367v2q.ju367v8u.ju367v94._12cbo8i3.ju367v8r._12cbo8i5._12cbo8i7',
      )[0];

      buttonClose.classList.add('buttonClose');
    }, 100);

    return () => clearTimeout(timeout);
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

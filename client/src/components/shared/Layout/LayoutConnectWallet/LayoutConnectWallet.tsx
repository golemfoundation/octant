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

      const rainbowKitConnectModalWidth = document.querySelector(
        '.iekbcc0._1ckjpok4._1ckjpok1.ju367vb6.ju367vdr.ju367vp.ju367vt.ju367vv.ju367vel.ju367va.ju367v15.ju367v6c.ju367v8r',
      );
      rainbowKitConnectModalWidth?.classList.add('rainbowKitConnectModalWidth');

      const rainbowKitConnectModalDiv = document.querySelector(
        '.iekbcc0.ju367va.ju367v15.ju367v4y._1vwt0cg4',
      );
      rainbowKitConnectModalDiv?.classList.add('rainbowKitConnectModalDiv');

      const rainbowkitConnectModalHeader = document.querySelector('.iekbcc0.ju367va.ju367v2r');
      rainbowkitConnectModalHeader?.classList.add('rainbowkitConnectModalHeader');

      const rainbowkitConnectDummyDiv = document.querySelector('.iekbcc0.ju367v3s.ju367v94');
      rainbowkitConnectDummyDiv?.classList.add('rainbowkitConnectDummyDiv');

      const rainbowKitConnectHeaderTextWrapper = document.querySelector(
        '.iekbcc0.ju367v7a.ju367v7v.ju367v3h.ju367v6k.ju367v86',
      );
      rainbowKitConnectHeaderTextWrapper?.classList.add('rainbowKitConnectHeaderTextWrapper');

      const rainbowkitConnectModalHeaderText =
        rainbowkitConnectModalHeader?.querySelector('div:nth-child(2) > h1');
      rainbowkitConnectModalHeaderText?.classList.add('rainbowkitConnectModalHeaderText');

      if (rainbowkitConnectModalHeaderText) {
        rainbowkitConnectModalHeaderText.textContent = 'Choose a browser wallet';
      }

      const optionsWrapper = document.querySelector(
        '.iekbcc0.ju367v6p._1vwt0cg2.ju367v7a.ju367v7v',
      );
      optionsWrapper?.classList.add('optionsWrapper');

      const walletOptionsButtonsWrappers = document.querySelectorAll(
        '.iekbcc0.ju367va.ju367v15.ju367v1n',
      );
      walletOptionsButtonsWrappers.forEach(element => {
        element?.classList.add('walletOptionsButtonsWrapper');
      });

      const walletOptionsButtons = document.querySelectorAll(
        '.iekbcc0.iekbcc9.ju367v89.ju367v6i.ju367v73.ju367v7o.ju367vo.ju367vt.ju367vv.ju367v8u.ju367v9f.ju367vb1.g5kl0l0._12cbo8i3.ju367v8r._12cbo8i6',
      );
      walletOptionsButtons.forEach(element => {
        element.classList.add('walletOptionsButton');
      });

      const walletOptionsContents = document.querySelectorAll(
        '.iekbcc0.ju367v4.ju367va.ju367v14.ju367v1s',
      );
      walletOptionsContents.forEach(element => {
        element?.classList.add('walletOptionsContent');
      });

      const walletOptionsText = document.querySelectorAll('.iekbcc0.ju367v5p');
      walletOptionsText.forEach(element => {
        element.classList.add('walletOptionsText');
      });

      const buttonClose = document.querySelectorAll(
        '.iekbcc0.iekbcc9.ju367v4.ju367va0.ju367vc6.ju367vs.ju367vt.ju367vv.ju367vff.ju367va.ju367v2b.ju367v2q.ju367v8u.ju367v94._12cbo8i3.ju367v8r._12cbo8i5._12cbo8i7',
      )[0];

      buttonClose.classList.add('buttonClose');

      const walletOptionsIcons = document.querySelectorAll('.iekbcc0.ju367v2m.ju367v8p.ju367v9f');
      walletOptionsIcons.forEach(element => {
        element.classList.add('walletOptionsIcons');
      });

      // Installed, recommented
      const sectionHeaders = document.querySelectorAll(
        '.iekbcc0.ju367v3n.ju367v48.ju367v33.ju367v4y',
      );
      sectionHeaders.forEach(element => {
        element.classList.add('sectionHeaders');
      });

      const walletSections = document.querySelectorAll('.iekbcc0.ju367va.ju367v15.ju367v1n');
      if (walletSections) {
        walletSections[1].classList.add('walletSections');
      }

      const linkBoxTopDividerLine = document.querySelector('.iekbcc0.ju367vau.ju367v24.ju367v57');
      linkBoxTopDividerLine?.classList.add('linkBoxTopDividerLine');

      // Div with "new to ethereum" text + link.
      const linkBox = document.querySelector(
        '.iekbcc0.ju367v7c.ju367v7x.ju367v8f.ju367v6o.ju367v4.ju367va.ju367v2r',
      );
      linkBox?.classList.add('linkBox');
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

import { useWeb3Modal } from '@web3modal/react';
import cx from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useConnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Loader from 'components/core/Loader/Loader';
import Modal from 'components/core/Modal/Modal';
import Svg from 'components/core/Svg/Svg';
import { browserWallet, walletConnect } from 'svg/wallet';

import styles from './ModalConnectWallet.module.scss';
import ModalConnectWalletProps from './types';

const ModalConnectWallet: FC<ModalConnectWalletProps> = ({ modalProps }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.modalConnectWallet',
  });
  const { isConnected, connector } = useAccount();
  const { connectors, connect, pendingConnector, isLoading } = useConnect();
  const { open, isOpen } = useWeb3Modal();

  const connectBrowserWallet = (): void => {
    const browserWalletConnector = connectors.find(
      ({ id }) => id === 'injected',
    ) as InjectedConnector;
    connect({ connector: browserWalletConnector });
  };

  const openWalletConnectModal = async (): Promise<void> => {
    if (isConnected) {
      return;
    }
    await open();
  };

  const isBrowserWalletConnecting = isLoading && pendingConnector?.id === connector?.id;

  return (
    <Modal
      bodyClassName={styles.modal}
      header={t('connectVia')}
      isOpen={modalProps.isOpen && !isConnected}
      onClosePanel={modalProps.onClosePanel}
    >
      <BoxRounded
        className={styles.browserWalletTile}
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
      <BoxRounded
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
    </Modal>
  );
};

export default ModalConnectWallet;

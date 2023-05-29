import loadable from '@loadable/component';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import Modal from 'components/core/Modal/Modal';

import styles from './ModalConnectWallet.module.scss';
import ModalConnectWalletProps from './types';

const ConnectWallet = loadable(() => import('components/dedicated/ConnectWallet/ConnectWallet'));

const ModalConnectWallet: FC<ModalConnectWalletProps> = ({ modalProps }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.modalConnectWallet',
  });
  const { isConnected } = useAccount();

  return (
    <Modal
      bodyClassName={styles.modal}
      dataTest="ModalConnectWallet"
      header={t('connectVia')}
      isOpen={modalProps.isOpen && !isConnected}
      onClosePanel={modalProps.onClosePanel}
    >
      <ConnectWallet />
    </Modal>
  );
};

export default ModalConnectWallet;

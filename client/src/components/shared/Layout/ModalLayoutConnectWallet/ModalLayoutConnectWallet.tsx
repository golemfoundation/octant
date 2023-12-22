import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import LayoutConnectWallet from 'components/shared/Layout/LayoutConnectWallet';
import Modal from 'components/ui/Modal';

import ModalLayoutConnectWalletProps from './types';

const ModalLayoutConnectWallet: FC<ModalLayoutConnectWalletProps> = ({ modalProps }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.modalConnectWallet',
  });
  const { isConnected } = useAccount();

  return (
    <Modal
      dataTest="ModalConnectWallet"
      header={t('connectVia')}
      isOpen={modalProps.isOpen && !isConnected}
      onClosePanel={modalProps.onClosePanel}
    >
      <LayoutConnectWallet />
    </Modal>
  );
};

export default ModalLayoutConnectWallet;

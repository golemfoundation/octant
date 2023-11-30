import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import Wallet from 'components/dedicated/Wallet/Wallet';
import Modal from 'components/ui/Modal';

import WalletModalProps from './types';

const WalletModal: FC<WalletModalProps> = ({ modalProps }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.walletModal',
  });

  return (
    <Modal header={t('balances')} {...modalProps}>
      <Wallet onDisconnect={() => modalProps.onClosePanel()} />
    </Modal>
  );
};

export default WalletModal;

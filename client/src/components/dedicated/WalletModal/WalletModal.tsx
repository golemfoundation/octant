import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import Modal from 'components/core/Modal/Modal';
import Wallet from 'components/dedicated/Wallet/Wallet';

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

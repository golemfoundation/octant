import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import LayoutWallet from 'components/shared/Layout/LayoutWallet';
import Modal from 'components/ui/Modal';

import ModalLayoutWalletProps from './types';

const ModalLayoutWallet: FC<ModalLayoutWalletProps> = ({ modalProps }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.walletModal',
  });

  return (
    <Modal header={t('balances')} {...modalProps}>
      <LayoutWallet onDisconnect={() => modalProps.onClosePanel()} />
    </Modal>
  );
};

export default ModalLayoutWallet;

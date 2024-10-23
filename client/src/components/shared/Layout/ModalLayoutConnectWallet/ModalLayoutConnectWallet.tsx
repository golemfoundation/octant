import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import LayoutConnectWallet from 'components/shared/Layout/LayoutConnectWallet';
import Modal from 'components/ui/Modal';
import useDelegationStore from 'store/delegation/store';

import ModalLayoutConnectWalletProps from './types';

const ModalLayoutConnectWallet: FC<ModalLayoutConnectWalletProps> = ({ modalProps }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.modalConnectWallet',
  });
  const { isDelegationConnectModalOpen, setIsDelegationConnectModalOpen } = useDelegationStore(
    state => ({
      isDelegationConnectModalOpen: state.data.isDelegationConnectModalOpen,
      setIsDelegationConnectModalOpen: state.setIsDelegationConnectModalOpen,
    }),
  );
  const { isConnected } = useAccount();

  return (
    <Modal
      dataTest="ModalLayoutConnectWallet"
      header={t('connectVia')}
      isConnectWalletModal
      isOpen={(modalProps.isOpen && !isConnected) || isDelegationConnectModalOpen}
      onClosePanel={() => {
        modalProps.onClosePanel();
        setIsDelegationConnectModalOpen(false);
      }}
    >
      <LayoutConnectWallet />
    </Modal>
  );
};

export default ModalLayoutConnectWallet;

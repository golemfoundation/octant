import ModalProps from 'components/core/Modal/types';

export default interface ModalConnectWalletProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
}

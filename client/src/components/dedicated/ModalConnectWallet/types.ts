import ModalProps from 'components/ui/Modal/types';

export default interface ModalConnectWalletProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
}

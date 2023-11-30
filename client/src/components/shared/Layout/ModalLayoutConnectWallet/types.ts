import ModalProps from 'components/ui/Modal/types';

export default interface ModalLayoutConnectWalletProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
}

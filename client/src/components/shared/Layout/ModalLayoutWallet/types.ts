import ModalProps from 'components/ui/Modal/types';

export default interface ModalLayoutWalletProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
}

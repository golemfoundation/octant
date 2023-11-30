import ModalProps from 'components/ui/Modal/types';

export default interface WalletModalProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
}

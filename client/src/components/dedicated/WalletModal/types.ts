import ModalProps from 'components/core/Modal/types';

export default interface WalletModalProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
}

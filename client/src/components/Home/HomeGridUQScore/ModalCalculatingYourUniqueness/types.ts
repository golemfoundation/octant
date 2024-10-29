import ModalProps from 'components/ui/Modal/types';

export default interface ModalCalculatingYourUniquenessProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
}

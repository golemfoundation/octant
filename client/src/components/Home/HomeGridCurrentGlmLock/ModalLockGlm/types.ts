import ModalProps from 'components/ui/Modal/types';

export default interface ModalLockGlmProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
}

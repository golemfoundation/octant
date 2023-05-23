import ModalProps from 'components/core/Modal/types';

export default interface ModalGlmLockProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
}

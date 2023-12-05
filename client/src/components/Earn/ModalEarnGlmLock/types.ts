import ModalProps from 'components/ui/Modal/types';

export default interface ModalEarnGlmLockProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
}

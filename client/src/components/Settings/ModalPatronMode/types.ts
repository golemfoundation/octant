import ModalProps from 'components/core/Modal/types';

export default interface ModalPatronModeProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
}

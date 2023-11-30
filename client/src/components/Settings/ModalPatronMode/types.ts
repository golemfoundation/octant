import ModalProps from 'components/ui/Modal/types';

export default interface ModalPatronModeProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
}

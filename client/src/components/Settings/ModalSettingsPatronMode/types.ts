import ModalProps from 'components/ui/Modal/types';

export default interface ModalSettingsPatronModeProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
}

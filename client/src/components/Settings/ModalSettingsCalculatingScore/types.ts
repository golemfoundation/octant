import ModalProps from 'components/ui/Modal/types';

export default interface ModalSettingsCalculatingScoreProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
}

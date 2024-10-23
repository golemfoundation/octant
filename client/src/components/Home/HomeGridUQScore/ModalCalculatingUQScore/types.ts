import ModalProps from 'components/ui/Modal/types';

export default interface ModalSettingsCalculatingUQScoreProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
}

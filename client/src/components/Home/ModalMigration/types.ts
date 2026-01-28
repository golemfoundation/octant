import ModalProps from 'components/ui/Modal/types';

export default interface ModalMigrationProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
}

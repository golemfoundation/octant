import ModalProps from 'components/ui/Modal/types';

export default interface ModalDonorsFullListProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
  proposalAddress: string;
}

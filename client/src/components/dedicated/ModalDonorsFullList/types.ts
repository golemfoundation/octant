import ModalProps from 'components/core/Modal/types';

export default interface ModalDonorsFullListProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
  proposalAddress: string;
}

import ModalProps from 'components/core/Modal/types';
import { HistoryItemProps } from 'hooks/queries/useHistory';

export default interface HistoryItemDetailsModalProps extends HistoryItemProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
}

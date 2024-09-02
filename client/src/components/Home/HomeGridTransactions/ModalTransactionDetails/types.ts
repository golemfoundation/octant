import TransactionsListItemProps from 'components/Home/HomeGridTransactions/TransactionsListItem/types';
import ModalProps from 'components/ui/Modal/types';

export default interface ModalTransactionDetailsProps extends TransactionsListItemProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
}

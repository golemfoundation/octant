import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import TransactionDetails from 'components/Home/HomeGridTransactions/ModalTransactionDetails/TransactionDetails';
import Modal from 'components/ui/Modal';
import useEpochTimestampHappenedIn from 'hooks/subgraph/useEpochTimestampHappenedIn';

import ModalTransactionDetailsProps from './types';

const ModalTransactionDetails: FC<ModalTransactionDetailsProps> = ({
  modalProps,
  type,
  timestamp,
  isWaitingForTransactionInitialized,
  ...rest
}) => {
  const { i18n, t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridTransactions.modalTransactionDetails',
  });
  const { data: epochTimestampHappenedIn } = useEpochTimestampHappenedIn(timestamp);

  const header = useMemo(() => {
    switch (type) {
      case 'patron_mode_donation':
        return i18n.t(
          'components.home.historyItem.homeGridTransactions.transactionsListItem.epochDonation',
          {
            epoch: epochTimestampHappenedIn,
          },
        );
      case 'lock':
        return t('header.lock');
      case 'unlock':
        return t('header.unlock');
      case 'allocation':
        return t('header.allocation', {
          epoch: epochTimestampHappenedIn ? epochTimestampHappenedIn - 1 : '?',
        });
      case 'withdrawal':
        return t('header.withdrawal');
      default:
        return '';
    }
  }, [t, type, epochTimestampHappenedIn, i18n]);

  return (
    <Modal header={header} {...modalProps} dataTest="EarnHistoryItemDetailsModal">
      <TransactionDetails timestamp={timestamp} type={type} {...rest} />
    </Modal>
  );
};

export default ModalTransactionDetails;

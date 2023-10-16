import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Modal from 'components/core/Modal/Modal';
import HistoryItemDetails from 'components/dedicated/History/HistoryItemDetails/HistoryItemDetails';
import useEpochTimestampHappenedIn from 'hooks/subgraph/useEpochTimestampHappenedIn';

import HistoryItemDetailsModalProps from './types';

const HistoryItemDetailsModal: FC<HistoryItemDetailsModalProps> = ({
  modalProps,
  type,
  timestamp,
  isWaitingForTransactionInitialized,
  ...rest
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.historyItemModal',
  });
  const { data: epochTimestampHappenedIn } = useEpochTimestampHappenedIn(timestamp);

  const header = useMemo(() => {
    switch (type) {
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
  }, [t, type, epochTimestampHappenedIn]);

  return (
    <Modal header={header} {...modalProps}>
      <HistoryItemDetails timestamp={timestamp} type={type} {...rest} />
    </Modal>
  );
};

export default HistoryItemDetailsModal;

import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import EarnHistoryItemDetails from 'components/Earn/EarnHistory/EarnHistoryItemDetails';
import Modal from 'components/ui/Modal';
import useEpochTimestampHappenedIn from 'hooks/subgraph/useEpochTimestampHappenedIn';

import EarnHistoryItemDetailsModalProps from './types';

const EarnHistoryItemDetailsModal: FC<EarnHistoryItemDetailsModalProps> = ({
  modalProps,
  type,
  timestamp,
  isWaitingForTransactionInitialized,
  ...rest
}) => {
  const { i18n, t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.historyItemModal',
  });
  const { data: epochTimestampHappenedIn } = useEpochTimestampHappenedIn(timestamp);

  const header = useMemo(() => {
    switch (type) {
      case 'patron_mode_donation':
        return i18n.t('components.dedicated.historyItem.epochDonation', {
          epoch: epochTimestampHappenedIn,
        });
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
      <EarnHistoryItemDetails timestamp={timestamp} type={type} {...rest} />
    </Modal>
  );
};

export default EarnHistoryItemDetailsModal;

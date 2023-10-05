import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Modal from 'components/core/Modal/Modal';
import HistoryItemDetails from 'components/dedicated/History/HistoryItemDetails/HistoryItemDetails';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';

import HistoryItemDetailsModalProps from './types';

const HistoryItemDetailsModal: FC<HistoryItemDetailsModalProps> = ({
  modalProps,
  type,
  ...rest
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.historyItemModal',
  });
  const { data: currentEpoch } = useCurrentEpoch();

  const header = useMemo(() => {
    switch (type) {
      case 'lock':
        return t('header.lock');
      case 'unlock':
        return t('header.unlock');
      case 'allocation':
        // TODO: OCT-813 adjust epoch here to the actual epoch given allocation history entry happened in.
        return t('header.allocation', { epoch: currentEpoch });
      case 'withdrawal':
        return t('header.withdrawal');
      default:
        return '';
    }
  }, [t, type, currentEpoch]);

  return (
    <Modal header={header} {...modalProps}>
      <HistoryItemDetails type={type} {...rest} />
    </Modal>
  );
};

export default HistoryItemDetailsModal;

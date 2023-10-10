import React, { FC } from 'react';

import HistoryItemDetailsAllocation from './HistoryItemDetailsAllocation/HistoryItemDetailsAllocation';
import HistoryItemDetailsRest from './HistoryItemDetailsRest/HistoryItemDetailsRest';
import HistoryItemDetailsModalProps from './types';

const HistoryItemDetails: FC<HistoryItemDetailsModalProps> = props =>
  props.type === 'allocation' ? (
    <HistoryItemDetailsAllocation {...props} />
  ) : (
    <HistoryItemDetailsRest {...props} />
  );

export default HistoryItemDetails;

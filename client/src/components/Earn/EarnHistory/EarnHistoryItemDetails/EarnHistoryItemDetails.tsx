import React, { FC } from 'react';

import EarnHistoryItemDetailsAllocation from './EarnHistoryItemDetailsAllocation';
import EarnHistoryItemDetailsRest from './EarnHistoryItemDetailsRest';
import EarnHistoryItemDetailsModalProps from './types';

const EarnHistoryItemDetails: FC<EarnHistoryItemDetailsModalProps> = props =>
  props.type === 'allocation' ? (
    <EarnHistoryItemDetailsAllocation {...props} />
  ) : (
    <EarnHistoryItemDetailsRest {...props} />
  );

export default EarnHistoryItemDetails;

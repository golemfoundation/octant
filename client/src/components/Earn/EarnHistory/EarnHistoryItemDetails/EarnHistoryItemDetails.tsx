import React, { FC } from 'react';

import EarnHistoryItemDetailsAllocation from './EarnHistoryItemDetailsAllocation';
import EarnHistoryItemDetailsAllocationProps from './EarnHistoryItemDetailsAllocation/types';
import EarnHistoryItemDetailsRest from './EarnHistoryItemDetailsRest';
import EarnHistoryItemDetailsModalProps from './types';

const EarnHistoryItemDetails: FC<EarnHistoryItemDetailsModalProps> = props =>
  props.type === 'allocation' ? (
    <EarnHistoryItemDetailsAllocation {...(props as EarnHistoryItemDetailsAllocationProps)} />
  ) : (
    <EarnHistoryItemDetailsRest {...props} />
  );

export default EarnHistoryItemDetails;

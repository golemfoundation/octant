import React, { FC } from 'react';

import TransactionDetailsAllocation from 'components/Home/HomeGridTransactions/ModalTransactionDetails/TransactionDetails/TransactionDetailsAllocation';
import TransactionDetailsAllocationProps from 'components/Home/HomeGridTransactions/ModalTransactionDetails/TransactionDetails/TransactionDetailsAllocation/types';
import TransactionDetailsRest from 'components/Home/HomeGridTransactions/ModalTransactionDetails/TransactionDetails/TransactionDetailsRest';

import TransactionDetailsProps from './types';

const TransactionDetails: FC<TransactionDetailsProps> = props =>
  props.type === 'allocation' ? (
    <TransactionDetailsAllocation {...(props as TransactionDetailsAllocationProps)} />
  ) : (
    <TransactionDetailsRest {...props} />
  );

export default TransactionDetails;

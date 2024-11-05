import React, { FC } from 'react';

import AvailableFundsGlmProps from './types';

const AvailableFundsGlm: FC<AvailableFundsGlmProps> = ({
  classNameSkeleton,
  classNameBudgetValue,
  isLoading,
  value,
}) =>
  isLoading ? (
    <div className={classNameSkeleton} />
  ) : (
    <div className={classNameBudgetValue} data-test="LockGlmBudgetBox__walletBalance__value">
      {value}
    </div>
  );

export default AvailableFundsGlm;

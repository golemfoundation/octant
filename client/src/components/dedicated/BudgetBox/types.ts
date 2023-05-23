import { BigNumber } from 'ethers';

import { CurrentStepIndex } from 'components/dedicated/GlmLock/types';

export default interface BudgetBoxProps {
  className: string;
  currentStepIndex: CurrentStepIndex;
  depositsValue?: BigNumber;
  isError: boolean;
  transactionHash: string;
}

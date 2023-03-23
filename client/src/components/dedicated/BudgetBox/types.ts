import { BigNumber } from 'ethers';

import { CurrentStepIndex } from 'components/dedicated/ModalGlmLock/types';

export default interface BudgetBoxProps {
  className: string;
  currentStepIndex: CurrentStepIndex;
  depositsValue?: BigNumber;
  transactionHash: string;
}

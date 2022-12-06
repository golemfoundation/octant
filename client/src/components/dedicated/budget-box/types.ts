import { BigNumberish } from 'ethers';

import { CurrentStepIndex } from 'components/dedicated/glm-staking-flow/types';

export default interface BudgetBoxProps {
  className: string;
  currentStepIndex: CurrentStepIndex;
  depositsValue?: BigNumberish;
  transactionHash: string;
}

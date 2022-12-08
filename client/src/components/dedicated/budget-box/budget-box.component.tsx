import { formatUnits } from 'ethers/lib/utils';
import React, { FC } from 'react';

import { GOERLI_ETHERSCAN_PREFIX } from 'constants/transactions';
import BoxRounded from 'components/core/box-rounded/box-rounded.component';
import Button from 'components/core/button/button.component';
import DoubleValue from 'components/core/double-value/double-value.component';

import BudgetBoxProps from './types';
import styles from './styles.module.scss';

const getProps = (currentStepIndex: BudgetBoxProps['currentStepIndex']): object | undefined => {
  if (currentStepIndex === 0) {
    return {
      alignment: 'left',
      title: 'Current Stake',
    };
  }
  return {
    alignment: 'center',
  };
};

const getChildren = (
  currentStepIndex: BudgetBoxProps['currentStepIndex'],
  depositsValue: BudgetBoxProps['depositsValue'],
  transactionHash: BudgetBoxProps['transactionHash'],
) => {
  if (currentStepIndex === 0) {
    return (
      <DoubleValue mainValue={depositsValue ? `${formatUnits(depositsValue)} GLM` : 'Loading...'} />
    );
  }
  if (currentStepIndex === 1) {
    return 'Please approve 2 transactions in your wallet. The first (required only once and for staking) allows ERC-20 tokens, and the second stakes / unstakes GLM.';
  }
  return (
    <div>
      Your operation is confirmed.
      <div className={styles.transactionHash}>
        {transactionHash ? (
          <Button
            className={styles.button}
            href={`${GOERLI_ETHERSCAN_PREFIX}/${transactionHash}`}
            label="View on Etherscan"
            variant="link"
          />
        ) : (
          'Waiting for transaction hash from Etherscan...'
        )}
      </div>
    </div>
  );
};

const BudgetBox: FC<BudgetBoxProps> = ({
  className,
  currentStepIndex,
  depositsValue,
  transactionHash,
}) => (
  <BoxRounded
    alignment="center"
    className={className}
    isGrey
    isVertical
    {...getProps(currentStepIndex)}
  >
    {getChildren(currentStepIndex, depositsValue, transactionHash)}
  </BoxRounded>
);

export default BudgetBox;

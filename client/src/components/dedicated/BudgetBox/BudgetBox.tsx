import { formatUnits } from 'ethers/lib/utils';
import React, { FC } from 'react';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Button from 'components/core/Button/Button';
import DoubleValue from 'components/core/DoubleValue/DoubleValue';
import { GOERLI_ETHERSCAN_PREFIX } from 'constants/transactions';

import styles from './BudgetBox.module.scss';
import BudgetBoxProps from './types';

const getProps = (currentStepIndex: BudgetBoxProps['currentStepIndex']): object | undefined => {
  if (currentStepIndex === 0) {
    return {
      alignment: 'left',
      title: 'Currently Locked',
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
    return 'Please approve 2 transactions in your wallet. The first (required only once and for staking) allows ERC-20 tokens, and the second locks / unlocks GLM.';
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

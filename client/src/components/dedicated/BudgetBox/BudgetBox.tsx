import cx from 'classnames';
import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import React, { FC, Fragment } from 'react';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Button from 'components/core/Button/Button';
import DoubleValue from 'components/core/DoubleValue/DoubleValue';
import { GOERLI_ETHERSCAN_PREFIX } from 'constants/transactions';
import useAvailableFundsGlm from 'hooks/queries/useAvailableFundsGlm';

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
  isError: BudgetBoxProps['isError'],
  dataAvailableFunds?: BigNumber,
) => {
  if (currentStepIndex === 0) {
    return (
      <Fragment>
        <DoubleValue cryptoCurrency="golem" valueCrypto={depositsValue} />
        <div className={styles.availableFunds}>
          <span className={cx(styles.value, isError && styles.isError)}>
            {dataAvailableFunds ? formatUnits(dataAvailableFunds) : '0.0'}&nbsp;GLM
          </span>
          &nbsp;wallet balance available
        </div>
      </Fragment>
    );
  }
  if (currentStepIndex === 1) {
    return 'Please approve 2 transactions in your wallet. The first (required only once and for locking) allows ERC-20 tokens, and the second locks / unlocks GLM.';
  }
  return (
    <div>
      Your stake will update when the transaction is confirmed
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
  isError,
}) => {
  const { data: dataAvailableFunds } = useAvailableFundsGlm();
  return (
    <BoxRounded
      alignment="center"
      className={className}
      isGrey
      isVertical
      {...getProps(currentStepIndex)}
    >
      {getChildren(currentStepIndex, depositsValue, transactionHash, isError, dataAvailableFunds)}
    </BoxRounded>
  );
};

export default BudgetBox;

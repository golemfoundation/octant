import cx from 'classnames';
import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import React, { Fragment, forwardRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Button from 'components/core/Button/Button';
import DoubleValue from 'components/core/DoubleValue/DoubleValue';
import networkConfig from 'constants/networkConfig';
import useAvailableFundsGlm from 'hooks/queries/useAvailableFundsGlm';

import styles from './BudgetBox.module.scss';
import BudgetBoxProps from './types';

const getProps = (currentStepIndex: BudgetBoxProps['currentStepIndex']): object | undefined => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.budgetBox',
  });

  if (currentStepIndex === 0) {
    return {
      alignment: 'left',
      title: t('currentlyLocked'),
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
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.budgetBox',
  });

  if (currentStepIndex === 0) {
    return (
      <Fragment>
        <DoubleValue cryptoCurrency="golem" valueCrypto={depositsValue} />
        <div className={styles.availableFunds}>
          <Trans
            components={[<span className={cx(styles.value, isError && styles.isError)} />]}
            i18nKey="components.dedicated.budgetBox.walletBalanceAvailable"
            values={{
              availableFunds: dataAvailableFunds ? formatUnits(dataAvailableFunds) : '0.0',
            }}
          />
        </div>
      </Fragment>
    );
  }
  if (currentStepIndex === 1) {
    return t('approve2Transactions');
  }
  return (
    <div>
      {t('stakeWillUpdate')}
      <div className={styles.transactionHash}>
        {transactionHash ? (
          <Button
            className={styles.button}
            href={`${networkConfig.etherscanAddress}/tx/${transactionHash}`}
            label={t('viewOnEtherscan')}
            variant="link"
          />
        ) : (
          t('waitingForTransactionHash')
        )}
      </div>
    </div>
  );
};

const BudgetBox = forwardRef<HTMLDivElement, BudgetBoxProps>(
  ({ className, currentStepIndex, depositsValue, transactionHash, isError }, ref) => {
    const { data: dataAvailableFunds } = useAvailableFundsGlm();
    return (
      <BoxRounded
        alignment="center"
        className={className}
        isGrey
        isVertical
        {...getProps(currentStepIndex)}
        ref={ref}
      >
        {getChildren(currentStepIndex, depositsValue, transactionHash, isError, dataAvailableFunds)}
      </BoxRounded>
    );
  },
);

export default BudgetBox;

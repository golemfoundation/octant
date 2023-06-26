import cx from 'classnames';
import { formatUnits } from 'ethers/lib/utils';
import React, { Fragment, forwardRef, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Button from 'components/core/Button/Button';
import DoubleValue from 'components/core/DoubleValue/DoubleValue';
import networkConfig from 'constants/networkConfig';
import useAvailableFundsGlm from 'hooks/helpers/useAvailableFundsGlm';

import styles from './BudgetBox.module.scss';
import BudgetBoxProps from './types';

const BudgetBox = forwardRef<HTMLDivElement, BudgetBoxProps>(
  ({ className, currentStepIndex, depositsValue, transactionHash, isError }, ref) => {
    const { data: dataAvailableFunds } = useAvailableFundsGlm();
    const { t } = useTranslation('translation', {
      keyPrefix: 'components.dedicated.budgetBox',
    });

    const children = useMemo(() => {
      if (currentStepIndex === 0) {
        return (
          <Fragment>
            <DoubleValue cryptoCurrency="golem" valueCrypto={depositsValue} />
            <div className={styles.availableFunds}>
              <Trans
                components={[<span className={cx(styles.value, isError && styles.isError)} />]}
                i18nKey="components.dedicated.budgetBox.walletBalanceAvailable"
                values={{
                  availableFunds: dataAvailableFunds
                    ? formatUnits(dataAvailableFunds?.value)
                    : '0.0',
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
    }, [currentStepIndex, transactionHash, dataAvailableFunds, depositsValue, isError, t]);

    return (
      <BoxRounded
        className={className}
        isGrey
        isVertical
        {...(currentStepIndex === 0
          ? { alignment: 'left', title: t('currentlyLocked') }
          : {
              alignment: 'center',
            })}
        ref={ref}
      >
        {children}
      </BoxRounded>
    );
  },
);

export default BudgetBox;

import { BigNumber } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { useMetamask } from 'use-metamask';
import { useQuery } from 'react-query';
import React, { Fragment, ReactElement, useState } from 'react';

import { ApprovalState, useMaxApproveCallback } from 'hooks/useMaxApproveCallback';
import { floatNumberWithUpTo18DecimalPlaces } from 'utils/regExp';
import { useDepositsContract } from 'hooks/useContract';
import Button from 'components/core/button/button.component';
import InputText from 'components/core/input-text/input-text.component';
import env from 'env';

const DepositView = (): ReactElement => {
  const {
    metaState: { account, web3 },
  } = useMetamask();
  const address = account[0];
  const { depositsAddress, glmAddress } = env;
  const [valueToDepose, setValueToDepose] = useState<string>('');
  const [valueToWithdraw, setValueToWithdraw] = useState<string>('');
  const signer = web3?.getSigner();
  const contractDeposits = useDepositsContract(depositsAddress, signer);
  const [approvalState, approveCallback] = useMaxApproveCallback(
    glmAddress,
    BigNumber.from(parseUnits(valueToDepose || '1', 18)),
    depositsAddress,
    signer,
    address,
  );

  const { data: depositsValue } = useQuery(
    ['depositsValue'],
    () => contractDeposits?.deposits(address),
    { enabled: !!contractDeposits && !!address },
  );

  const onChangeValue = (value, actionType: 'deposit' | 'withdraw'): void => {
    if (value && !floatNumberWithUpTo18DecimalPlaces.test(value)) {
      return;
    }

    switch (actionType) {
      case 'deposit':
        setValueToDepose(value);
        break;
      case 'withdraw':
        setValueToWithdraw(value);
        break;
      default:
    }
  };

  const onDeposit = async (): Promise<void> => {
    if (!signer || !valueToDepose) {
      return;
    }
    await contractDeposits?.deposit(parseUnits(valueToDepose.toString(), 18));
  };

  const onWithdraw = async (): Promise<void> => {
    if (!signer) {
      return;
    }

    await contractDeposits?.withdraw(parseUnits(valueToWithdraw.toString(), 18));
  };

  const isDepositButtonDisabled = !signer || valueToDepose.length === 0;
  const isWithdrawButtonDisabled = !signer || valueToWithdraw.length === 0;

  const buttonDepositProps =
    approvalState === ApprovalState.APPROVED
      ? {
          label: 'Depose',
          onClick: onDeposit,
        }
      : {
          label: isDepositButtonDisabled ? 'Connect your wallet and enter value above' : 'Approve',
          onClick: approveCallback,
        };

  return (
    <Fragment>
      <div>
        {depositsValue
          ? `Value deposited: ${formatUnits(depositsValue)} GLMs`
          : 'Connect your wallet to check deposits value.'}
      </div>
      <br />
      <InputText
        onChange={({ target: { value } }) => onChangeValue(value, 'deposit')}
        value={valueToDepose.toString()}
      />
      <br />
      <Button isDisabled={isDepositButtonDisabled} {...buttonDepositProps} />
      <br />
      <InputText
        onChange={({ target: { value } }) => onChangeValue(value, 'withdraw')}
        value={valueToWithdraw.toString()}
      />
      <br />
      <Button
        isDisabled={isWithdrawButtonDisabled}
        label={isWithdrawButtonDisabled ? 'Connect your wallet and enter value above' : 'Withdraw'}
        onClick={onWithdraw}
      />
    </Fragment>
  );
};

export default DepositView;

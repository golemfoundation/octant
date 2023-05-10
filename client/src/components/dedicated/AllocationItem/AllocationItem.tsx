import cx from 'classnames';
import { BigNumber } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import React, { FC, Fragment, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Button from 'components/core/Button/Button';
import InputText from 'components/core/InputText/InputText';
import Svg from 'components/core/Svg/Svg';
import ProposalLoadingStates from 'components/dedicated/ProposalLoadingStates/ProposalLoadingStates';
import useIsDonationAboveThreshold from 'hooks/helpers/useIsDonationAboveThreshold';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useProposalsIpfs from 'hooks/queries/useProposalsIpfs';
import { minus, plus } from 'svg/misc';
import getFormattedEthValue from 'utils/getFormattedEthValue';
import { comma, floatNumberWithUpTo18DecimalPlaces } from 'utils/regExp';

import styles from './AllocationItem.module.scss';
import AllocationItemProps from './types';

const AllocationItem: FC<AllocationItemProps> = ({
  address,
  className,
  isSelected,
  isAllocatedTo,
  onChange,
  onSelectItem,
  percentage,
  totalValueOfAllocations,
  value,
}) => {
  const { isConnected } = useAccount();
  const { data: proposalsIpfs, isLoading } = useProposalsIpfs([address]);
  const isDonationAboveThreshold = useIsDonationAboveThreshold(address);
  const { data: individualReward } = useIndividualReward();
  const inputRef = useRef<HTMLInputElement>(null);
  const { name, isLoadingError } = proposalsIpfs[0] || {};

  useEffect(() => {
    if (isSelected && inputRef.current) {
      inputRef.current.focus();
    }
  });

  const onChangeValue = (newValue: string) => {
    if (newValue && !floatNumberWithUpTo18DecimalPlaces.test(newValue)) {
      return;
    }

    onChange(address, newValue);
  };

  const onInputTextChange = event => {
    const newValue = event.target.value.replace(comma, '.');

    onChangeValue(newValue);
  };

  const inputProps = {
    isDisabled: !isSelected,
    onChange: onInputTextChange,
    placeholder: isSelected ? '' : '0',
  };

  const isLoadingStates = isLoadingError || isLoading;
  const isChangeAvailable = isConnected && individualReward;
  const valueToCalculate = value === undefined ? BigNumber.from('0') : parseUnits(value);

  return (
    <BoxRounded
      alignment="center"
      className={cx(styles.box, isAllocatedTo && styles.isAllocatedTo, className)}
      onClick={isConnected ? () => onSelectItem(address) : undefined}
    >
      {isLoadingStates ? (
        <ProposalLoadingStates isLoading={isLoading} isLoadingError={isLoadingError} />
      ) : (
        <Fragment>
          <div className={styles.details}>
            <div className={styles.name}>{name}</div>
            <div className={styles.funds}>
              {totalValueOfAllocations !== undefined && percentage !== undefined ? (
                <Fragment>
                  <div>{getFormattedEthValue(totalValueOfAllocations).fullString}</div>
                  <div className={styles.percent}>
                    {percentage}%
                    <div
                      className={cx(
                        styles.indicator,
                        isDonationAboveThreshold && styles.isAboveThreshold,
                      )}
                    />
                  </div>
                </Fragment>
              ) : (
                <Fragment>Allocation values are not available</Fragment>
              )}
            </div>
          </div>
          <div className={cx(styles.value, isSelected && styles.isSelected)}>
            <InputText
              ref={inputRef}
              inputMode="decimal"
              value={value || '0'}
              variant="borderless"
              {...inputProps}
            />
            <div className={styles.currency}>ETH</div>
          </div>
          <div className={cx(styles.buttons, isSelected && styles.isSelected)}>
            <Button
              className={styles.button}
              Icon={<Svg img={plus} size={1.2} />}
              onClick={
                isChangeAvailable
                  ? () => onChangeValue(formatUnits(valueToCalculate.add(individualReward.div(10))))
                  : undefined
              }
              variant="iconOnlyTransparent"
            />
            <Button
              className={styles.button}
              Icon={<Svg img={minus} size={1.2} />}
              onClick={
                isChangeAvailable
                  ? () => onChangeValue(formatUnits(valueToCalculate.sub(individualReward.div(10))))
                  : undefined
              }
              variant="iconOnlyTransparent"
            />
          </div>
        </Fragment>
      )}
    </BoxRounded>
  );
};

export default AllocationItem;

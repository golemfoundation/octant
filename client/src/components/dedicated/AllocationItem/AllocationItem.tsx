import cx from 'classnames';
import { BigNumber } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import React, { FC, Fragment, useEffect, useRef } from 'react';
import { useMetamask } from 'use-metamask';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Button from 'components/core/Button/Button';
import InputText from 'components/core/InputText/InputText';
import Svg from 'components/core/Svg/Svg';
import useIndividualReward from 'hooks/useIndividualReward';
import { minus, plus } from 'svg/misc';
import isAboveProposalDonationThresholdPercent from 'utils/isAboveProposalDonationThresholdPercent';
import { floatNumberWithUpTo18DecimalPlaces } from 'utils/regExp';

import styles from './style.module.scss';
import AllocationItemProps from './types';

const AllocationItem: FC<AllocationItemProps> = ({
  className,
  name,
  id,
  onSelectItem,
  isSelected,
  onChange,
  value,
  totalValueOfAllocations,
  percentage,
}) => {
  const {
    metaState: { isConnected },
  } = useMetamask();
  const { data: individualReward } = useIndividualReward();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSelected && inputRef.current) {
      inputRef.current.focus();
    }
  });

  const onChangeValue = (newValue: string) => {
    if (newValue && !floatNumberWithUpTo18DecimalPlaces.test(newValue)) {
      return;
    }

    onChange(id.toNumber(), newValue);
  };

  const onInputTextChange = event => {
    const {
      target: { value: newValue },
    } = event;

    onChangeValue(newValue);
  };

  const inputProps = {
    isDisabled: !isSelected,
    onChange: onInputTextChange,
    placeholder: isSelected ? '' : '0',
  };

  const isChangeAvailable = isConnected && individualReward;
  const valueToCalculate = value === undefined ? BigNumber.from('0') : parseUnits(value);

  return (
    <BoxRounded
      alignment="center"
      className={cx(styles.box, className)}
      onClick={isConnected ? () => onSelectItem(id.toNumber()) : undefined}
    >
      <div className={styles.details}>
        <div className={styles.name}>{name}</div>
        <div className={styles.funds}>
          {totalValueOfAllocations !== undefined && percentage !== undefined ? (
            <Fragment>
              <div>{totalValueOfAllocations}</div>
              <div className={styles.percent}>
                {percentage}%
                <div
                  className={cx(
                    styles.indicator,
                    percentage &&
                      isAboveProposalDonationThresholdPercent(percentage) &&
                      styles.isAboveThreshold,
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
        <InputText ref={inputRef} value={value || '0'} variant="borderless" {...inputProps} />
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
    </BoxRounded>
  );
};

export default AllocationItem;

import React, { FC, useEffect, useRef } from 'react';
import cx from 'classnames';

import { minus, plus } from 'svg/misc';
import { numbersOnly } from 'utils/regExp';
import BoxRounded from 'components/core/box-rounded/box-rounded.component';
import Button from 'components/core/button/button.component';
import InputText from 'components/core/input-text/input-text.component';
import Svg from 'components/core/svg/svg.component';

import AllocationItemProps from './types';
import styles from './style.module.scss';

const AllocationItem: FC<AllocationItemProps> = ({
  className,
  name,
  eth,
  percent,
  id,
  onSelectItem,
  isSelected,
  onChange,
  value,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSelected && inputRef.current) {
      inputRef.current.focus();
    }
  });

  const onChangeNumber = (newValue: number) => {
    if (newValue < 0) {
      return;
    }
    onChange(id.toNumber(), newValue);
  };

  const onInputTextChange = event => {
    const {
      target: { value: newValue },
    } = event;

    if ((!value && !newValue) || !numbersOnly.test(newValue)) {
      return;
    }

    const newValueNumber = newValue ? parseInt(newValue, 10) : 0;

    onChangeNumber(newValueNumber);
  };

  const inputProps = {
    isDisabled: !isSelected,
    onChange: onInputTextChange,
    placeholder: isSelected ? '' : '0',
  };

  return (
    <BoxRounded
      alignment="center"
      className={className}
      onClick={() => onSelectItem(id.toNumber())}
    >
      <div className={styles.details}>
        <div className={styles.name}>{name}</div>
        <div className={styles.funds}>
          <div>{eth} ETH</div>
          <div className={styles.percent}>
            {percent}%
            <div className={styles.indicator} />
          </div>
        </div>
      </div>
      <div className={cx(styles.value, isSelected && styles.isSelected)}>
        <InputText ref={inputRef} value={value.toString()} variant="borderless" {...inputProps} />
        <div className={styles.currency}>ETH</div>
      </div>
      <div className={cx(styles.buttons, isSelected && styles.isSelected)}>
        <Button
          className={styles.button}
          Icon={<Svg img={plus} size={1.2} />}
          onClick={() => onChangeNumber(value + 1)}
          variant="iconOnlyTransparent"
        />
        <Button
          className={styles.button}
          Icon={<Svg img={minus} size={1.2} />}
          onClick={() => onChangeNumber(value - 1)}
          variant="iconOnlyTransparent"
        />
      </div>
    </BoxRounded>
  );
};

export default AllocationItem;

import cx from 'classnames';
import React, { FC, Fragment, useState } from 'react';
import Select, { SingleValue } from 'react-select';

import Button from 'components/core/Button/Button';
import Svg from 'components/core/Svg/Svg';
import { cross, tick } from 'svg/misc';

import './InputSelect.scss';
import styles from './InputSelect.module.scss';
import InputSelectProps, { Option } from './types';

const CustomSingleValue = ({ dataTest, innerProps, children }) => (
  <div {...innerProps} className={styles.singleValue} data-test={`${dataTest}__CustomSingleValue`}>
    {children}
  </div>
);

const CustomOption = ({ dataTest, innerRef, innerProps, children, isSelected }) => {
  return (
    <div
      ref={innerRef}
      className={styles.option}
      data-test={`${dataTest}__CustomOption--${children}`}
      {...innerProps}
    >
      {isSelected && <Svg classNameSvg={styles.iconTick} img={tick} size={1} />}
      {children}
    </div>
  );
};

const CustomMenu = ({ innerRef, innerProps, children, setIsMenuOpen }) => (
  <Fragment>
    {/* isOpen class is added in overlay mixin. */}
    <div className={cx(styles.overlay, styles.isOpen)} onClick={() => setIsMenuOpen(false)} />
    <div ref={innerRef} {...innerProps} className={styles.menu}>
      {children}
    </div>
  </Fragment>
);

const CustomMenuList = ({ innerRef, innerProps, setIsMenuOpen, children }) => (
  <div ref={innerRef} {...innerProps}>
    {children}
    <Button
      className={styles.buttonClose}
      Icon={<Svg img={cross} size={1} />}
      onClick={() => setIsMenuOpen(false)}
      variant="iconOnly"
    />
  </div>
);

const InputSelect: FC<InputSelectProps> = ({
  dataTest = 'InputSelect',
  options,
  onChange,
  selectedOption,
  isDisabled,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [_selectedOption, _setSelectedOption] = useState<SingleValue<Option>>(
    selectedOption || options[0],
  );

  const onOptionClick = (option: SingleValue<Option>): void => {
    _setSelectedOption(option);
    setIsMenuOpen(false);

    if (onChange) {
      onChange(option);
    }
  };

  return (
    <div data-test={dataTest}>
      <Select
        classNamePrefix="InputSelect"
        components={{
          /* eslint-disable react/no-unstable-nested-components */
          Menu: args => <CustomMenu {...args} setIsMenuOpen={setIsMenuOpen} />,
          MenuList: args => <CustomMenuList {...args} setIsMenuOpen={setIsMenuOpen} />,
          Option: args => <CustomOption dataTest={dataTest} {...args} />,
          SingleValue: args => <CustomSingleValue {...args} dataTest={dataTest} />,
          /* eslint-enable react/no-unstable-nested-components */
        }}
        isDisabled={isDisabled}
        isSearchable={false}
        menuIsOpen={isMenuOpen}
        onChange={option => onOptionClick(option)}
        onMenuOpen={() => setIsMenuOpen(true)}
        options={options}
        value={_selectedOption}
      />
    </div>
  );
};

export default InputSelect;

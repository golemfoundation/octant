import React, { FC, ReactNode } from 'react';

import BoxRounded from 'components/ui/BoxRounded';
import InputToggle from 'components/ui/InputToggle';

import styles from './SettingsToggleBox.module.scss';

type SettingsToggleBoxProps = {
  children: ReactNode;
  dataTest?: string;
  isChecked?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const SettingsToggleBox: FC<SettingsToggleBoxProps> = ({
  children,
  isChecked,
  onChange,
  dataTest = 'SettingsToggleBox',
}) => {
  return (
    <BoxRounded
      className={styles.box}
      dataTest={dataTest}
      hasPadding={false}
      justifyContent="spaceBetween"
      textAlign="left"
    >
      {children}
      <InputToggle
        className={styles.inputToggle}
        dataTest={`${dataTest}__InputToggle`}
        isChecked={isChecked}
        onChange={onChange}
      />
    </BoxRounded>
  );
};

export default SettingsToggleBox;

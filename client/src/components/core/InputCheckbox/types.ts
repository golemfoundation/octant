import { ChangeEvent } from 'react';

export default interface InputCheckboxProps {
  dataTest?: string;
  isChecked?: boolean;
  isDisabled?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

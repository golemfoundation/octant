import { ChangeEvent } from 'react';

export default interface InputCheckboxProps {
  isChecked?: boolean;
  isDisabled?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

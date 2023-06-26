import { ChangeEvent } from 'react';

export default interface InputCheckboxProps {
  className?: string;
  dataTest?: string;
  isChecked?: boolean;
  isDisabled?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

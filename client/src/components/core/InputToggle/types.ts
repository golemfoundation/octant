import { ChangeEvent } from 'react';

export default interface InputToggleProps {
  className?: string;
  dataTest?: string;
  isChecked?: boolean;
  isDisabled?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

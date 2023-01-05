import { Options, SingleValue } from 'react-select';

export interface Option {
  label: string;
  value: string;
}

export default interface InputSelectProps {
  isDisabled?: boolean;
  onChange?: (option: SingleValue<Option>) => void;
  options: Options<Option>;
  selectedOption?: SingleValue<Option>;
}

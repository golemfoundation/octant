import { Options, SingleValue } from 'react-select';

export interface Option {
  label: string;
  value: string;
}

export default interface InputSelectProps {
  onChange?: (option: SingleValue<Option>) => void;
  options: Options<Option>;
  selectedOption?: SingleValue<Option>;
}

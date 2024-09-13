export interface Option {
  label: string;
  value: string;
}

export default interface InputSelectProps {
  dataTest?: string;
  onChange?: (option: Option) => void;
  options: Option[];
  selectedOption?: Option;
  variant?: 'overselect' | 'underselect';
}

export interface Option {
  label: string;
  value: string;
}

export default interface InputSelectProps {
  className?: string;
  dataTest?: string;
  onChange?: (option: Option) => void;
  options: Option[];
  selectedOption?: Option;
  variant?: 'overselect' | 'underselect';
}

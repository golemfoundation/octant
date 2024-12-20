import { ReactNode } from 'react';

export interface Option {
  label: string;
  value: string;
}

export default interface InputSelectProps {
  Icon?: ReactNode;
  className?: string;
  dataTest?: string;
  onChange?: (option: Option) => void;
  options: Option[];
  selectedOption?: Option;
  variant?: 'topselect' | 'overselect' | 'belowselect';
}

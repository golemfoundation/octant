import { ReactNode } from 'react';

const INPUT_SELECT_VARIANTS = ['topselect', 'overselect', 'belowselect'] as const;

export type InputSelectVariants = (typeof INPUT_SELECT_VARIANTS)[number];

export interface Option {
  dataTest?: string;
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
  variant?: InputSelectVariants;
}

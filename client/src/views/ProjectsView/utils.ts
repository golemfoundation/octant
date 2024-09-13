import { Option } from 'components/ui/InputSelect/types';

export const ORDER_OPTIONS: Option[] = [
  {
    label: 'Randomised',
    value: 'randomized',
  },
  {
    label: 'A -> Z',
    value: 'alphabeticalAscending',
  },
  {
    label: 'Z -> A',
    value: 'alphabeticalDescending',
  },
  {
    label: 'Totals high to low',
    value: 'totalsDescending',
  },
  {
    label: 'Totals low to high',
    value: 'totalsAscending',
  },
  {
    label: 'Donors most to least',
    value: 'donorsDescending',
  },
  {
    label: 'Donors least to most',
    value: 'donorsAscending',
  },
];

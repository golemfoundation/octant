import { TFunction } from 'i18next';

import { Option } from 'components/ui/InputSelect/types';

export const ORDER_OPTIONS = (t: TFunction): Option[] => [
  {
    label: t('sortOptions.randomised'),
    value: 'randomized',
  },
  {
    label: t('sortOptions.alphabeticalAscending'),
    value: 'alphabeticalAscending',
  },
  {
    label: t('sortOptions.alphabeticalDescending'),
    value: 'alphabeticalDescending',
  },
  {
    label: t('sortOptions.totalsDescending'),
    value: 'totalsDescending',
  },
  {
    label: t('sortOptions.totalsAscending'),
    value: 'totalsAscending',
  },
  {
    label: t('sortOptions.donorsDescending'),
    value: 'donorsDescending',
  },
  {
    label: t('sortOptions.donorsAscending'),
    value: 'donorsAscending',
  },
];

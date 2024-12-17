import { TFunction } from 'i18next';

import { Option } from 'components/ui/InputSelect/types';

export const languageKey = {
  enEn: 'en-EN',
  esEs: 'es-ES',
};

export const defaultLang = languageKey.enEn;

export const getLanguageOptions = (t: TFunction): Option[] => [
  {
    label: t('languageSelector.english'),
    value: languageKey.enEn,
  },
  {
    label: t('languageSelector.spanish'),
    value: languageKey.esEs,
  },
];

import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import InputSelect from 'components/ui/InputSelect';
import { Option } from 'components/ui/InputSelect/types';
import Svg from 'components/ui/Svg';
import { earth } from 'svg/misc';

import styles from './LanguageSelector.module.scss';

const LanguageSelector = (): ReactElement => {
  const { t, i18n } = useTranslation('translation');

  const languageOptions: Option[] = [
    {
      label: t('languageSelector.english'),
      value: 'en-EN',
    },
    {
      label: t('languageSelector.spanish'),
      value: 'es-Es',
    },
  ];

  return (
    <InputSelect
      className={styles.root}
      Icon={<Svg img={earth} size={1.2} />}
      onChange={option => i18n.changeLanguage(option!.value)}
      options={languageOptions}
      selectedOption={languageOptions.find(({ value }) => value === i18n.language)}
      variant="topselect"
    />
  );
};

export default LanguageSelector;

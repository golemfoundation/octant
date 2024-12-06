import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import InputSelect from 'components/ui/InputSelect';
import Svg from 'components/ui/Svg';
import { getLanguageOptions } from 'i18n/languages';
import { earth } from 'svg/misc';

import styles from './LanguageSelector.module.scss';

const LanguageSelector = (): ReactElement => {
  const { t, i18n } = useTranslation('translation');

  const languageOptions = getLanguageOptions(t);

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

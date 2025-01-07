import cx from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import InputSelect from 'components/ui/InputSelect';
import Svg from 'components/ui/Svg';
import { LANGUAGE_UI } from 'constants/localStorageKeys';
import { getLanguageOptions } from 'i18n/languages';
import { earth } from 'svg/misc';

import styles from './LanguageSelector.module.scss';
import LanguageSelectorProps from './types';

const LanguageSelector: FC<LanguageSelectorProps> = ({ className, dataTest, variant }) => {
  const { t, i18n } = useTranslation('translation');

  const languageOptions = getLanguageOptions(t);

  return (
    <InputSelect
      className={cx(styles.root, className)}
      dataTest={dataTest}
      Icon={<Svg img={earth} size={1.2} />}
      onChange={({ value }) => {
        localStorage.setItem(LANGUAGE_UI, value);
        i18n.changeLanguage(value);
      }}
      options={languageOptions}
      selectedOption={languageOptions.find(({ value }) => value === i18n.language)}
      variant={variant}
    />
  );
};

export default LanguageSelector;

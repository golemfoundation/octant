import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import LanguageSelector from 'components/shared/LanguageSelector';
import BoxRounded from 'components/ui/BoxRounded';

import styles from './SettingsLanguageSelectorBox.module.scss';

const SettingsLanguageSelectorBox = (): ReactElement => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.settings' });

  return (
    <BoxRounded
      className={styles.root}
      dataTest="SettingsLanguageSelectorBox"
      hasPadding={false}
      justifyContent="spaceBetween"
      textAlign="left"
    >
      {t('language')}
      <div className={styles.wrapper}>
        <div className={styles.spacer} />
        <LanguageSelector
          className={styles.languageSelector}
          dataTest="SettingsLanguageSelectorBox__InputSelect"
          variant="overselect"
        />
      </div>
    </BoxRounded>
  );
};

export default SettingsLanguageSelectorBox;

import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import SettingsProgressPath from 'components/Settings/SettingsProgressPath';

import styles from './SettingsRecalculatingScoreProgressPath.module.scss';

const SettingsRecalculatingScoreProgressPath: FC = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.settings' });

  return (
    <div className={styles.root}>
      <SettingsProgressPath
        steps={[t('checkingPassportScore'), t('POAPsAndNFTs'), t('octantHistory'), t('finished')]}
      />
    </div>
  );
};

export default SettingsRecalculatingScoreProgressPath;

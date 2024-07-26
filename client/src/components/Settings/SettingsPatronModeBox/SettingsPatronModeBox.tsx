import React, { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ModalSettingsPatronMode from 'components/Settings/ModalSettingsPatronMode';
import SettingsToggleBox from 'components/Settings/SettingsToggleBox';
import Svg from 'components/ui/Svg';
import Tooltip from 'components/ui/Tooltip';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';
import { questionMark } from 'svg/misc';

import styles from './SettingsPatronModeBox.module.scss';

const SettingsPatronModeBox = (): ReactElement => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.settings' });
  const [isPatronModeModalOpen, setIsPatronModeModalOpen] = useState(false);
  const { data: isPatronModeEnabled } = useIsPatronMode();

  return (
    <>
      <SettingsToggleBox
        dataTest="SettingsPatronModeBox"
        isChecked={isPatronModeEnabled}
        onChange={() => setIsPatronModeModalOpen(true)}
      >
        <div className={styles.patronModeBox}>
          {t('enablePatronMode')}
          <Tooltip
            dataTest="SettingsPatronModeBox__Tooltip"
            position="bottom-right"
            text={t('patronModeTooltip')}
          >
            <Svg
              classNameWrapper={styles.patronModeBoxQuestionMarkWrapper}
              displayMode="wrapperDefault"
              img={questionMark}
              size={1.6}
            />
          </Tooltip>
        </div>
      </SettingsToggleBox>
      <ModalSettingsPatronMode
        modalProps={{
          isOpen: isPatronModeModalOpen,
          onClosePanel: () => setIsPatronModeModalOpen(false),
        }}
      />
    </>
  );
};

export default SettingsPatronModeBox;

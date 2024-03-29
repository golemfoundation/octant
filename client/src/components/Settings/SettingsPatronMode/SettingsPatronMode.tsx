import cx from 'classnames';
import React, { FC, useState } from 'react';
import { Trans } from 'react-i18next';

import SettingsPatronModeSlider from 'components/Settings/SettingsPatronModeSlider';
import BoxRounded from 'components/ui/BoxRounded';
import Button from 'components/ui/Button';
import Svg from 'components/ui/Svg';
import { OCTANT_DOCS } from 'constants/urls';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';
import { notificationIconWarning } from 'svg/misc';

import styles from './SettingsPatronMode.module.scss';
import SettingsPatronModeProps from './types';

const SettingsPatronMode: FC<SettingsPatronModeProps> = ({ onPatronModeStatusChange }) => {
  const { data: isPatronMode } = useIsPatronMode();
  const [isPatronModeEnabled] = useState(isPatronMode);
  const keyPrefix = 'components.settings.patronMode';

  return (
    <div className={styles.root}>
      <BoxRounded
        alignment="left"
        childrenWrapperClassName={styles.boxBodyWrapper}
        className={styles.box}
        hasPadding={false}
        isGrey
      >
        <Svg classNameSvg={styles.warningIcon} img={notificationIconWarning} size={3.2} />
        <div className={styles.info}>
          <span className={styles.paragraph}>
            <Trans i18nKey={`${keyPrefix}.firstParagraph`} />
          </span>
          <span className={cx(styles.paragraph, styles.bold)}>
            <Trans i18nKey={`${keyPrefix}.secondParagraph`} />
          </span>
          <span className={styles.paragraph}>
            <Trans
              components={[
                <Button className={styles.docsLink} href={OCTANT_DOCS} variant="link3" />,
              ]}
              i18nKey={`${keyPrefix}.thirdParagraph`}
            />
          </span>
          <span className={styles.paragraph} data-test="SettingsPatronMode__fourthParagraph">
            <Trans
              i18nKey={
                isPatronModeEnabled
                  ? `${keyPrefix}.fourthParagraphDisable`
                  : `${keyPrefix}.fourthParagraphEnable`
              }
            />
          </span>
        </div>
      </BoxRounded>
      <SettingsPatronModeSlider onPatronModeStatusChange={onPatronModeStatusChange} />
    </div>
  );
};

export default SettingsPatronMode;

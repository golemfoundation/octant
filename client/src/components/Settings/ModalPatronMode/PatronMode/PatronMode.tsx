import cx from 'classnames';
import React, { FC, useState } from 'react';
import { Trans } from 'react-i18next';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Button from 'components/core/Button/Button';
import Svg from 'components/core/Svg/Svg';
import PatronModeSlider from 'components/Settings/ModalPatronMode/PatronModeSlider/PatronModeSlider';
import { OCTANT_DOCS } from 'constants/urls';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';
import { notificationIconWarning } from 'svg/misc';

import styles from './PatronMode.module.scss';
import PatronModeProps from './types';

const PatronMode: FC<PatronModeProps> = ({ onPatronModeStatusChange }) => {
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
          <span className={styles.paragraph}>
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
      <PatronModeSlider onPatronModeStatusChange={onPatronModeStatusChange} />
    </div>
  );
};

export default PatronMode;

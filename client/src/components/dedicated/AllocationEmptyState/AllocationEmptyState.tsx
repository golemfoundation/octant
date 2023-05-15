import React, { ReactElement } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import Button from 'components/core/Button/Button';
import Svg from 'components/core/Svg/Svg';
import { DISCORD_LINK } from 'constants/urls';
import { octantBlurred } from 'svg/logo';

import styles from './AllocationEmptyState.module.scss';

const AllocationEmptyState = (): ReactElement => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.allocationEmptyState',
  });

  return (
    <div className={styles.root}>
      <Svg classNameSvg={styles.icon} img={octantBlurred} size={[23.6, 17.8]} />
      <Trans
        components={[<div className={styles.text} />]}
        i18nKey="components.dedicated.allocationEmptyState.text"
      />
      <Button
        className={styles.buttonDiscord}
        href={DISCORD_LINK}
        label={t('joinUsOnDiscord')}
        variant="link2"
      />
    </div>
  );
};

export default AllocationEmptyState;

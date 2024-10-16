import React, { ReactElement } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import Button from 'components/ui/Button';
import Img from 'components/ui/Img';
import { KARMA_GAP } from 'constants/urls';

import styles from './ProjectMilestonesNoResults.module.scss';

const ProjectMilestonesNoResults = (): ReactElement => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.project.milestones.noResults' });

  return (
    <div className={styles.root}>
      <Img alt="leafBlower" className={styles.image} src="/images/leafBlower.webp" />
      <div className={styles.header}>{t('header')}</div>
      <div className={styles.description}>
        <Trans
          components={[<Button className={styles.button} href={KARMA_GAP} variant="link3" />]}
          i18nKey="views.project.milestones.noResults.description"
        />
      </div>
    </div>
  );
};

export default ProjectMilestonesNoResults;

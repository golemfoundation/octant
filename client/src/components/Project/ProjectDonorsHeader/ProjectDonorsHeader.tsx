import cx from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import useProjectDonors from 'hooks/queries/donors/useProjectDonors';

import styles from './ProjectDonorsHeader.module.scss';
import ProjectDonorsListProps from './types';

const ProjectDonorsHeader: FC<ProjectDonorsListProps> = ({
  projectAddress,
  dataTest = 'DonorsHeader',
  className,
}) => {
  const { epoch } = useParams();
  const { i18n } = useTranslation('translation');

  const { data: projectDonors, isFetching } = useProjectDonors(
    projectAddress,
    parseInt(epoch!, 10),
  );
  return (
    <div className={cx(styles.header, className)} data-test={dataTest}>
      <span className={styles.headerLabel}>{i18n.t('common.donors')}</span>{' '}
      <div className={styles.count} data-test={`${dataTest}__count`}>
        {isFetching ? '--' : projectDonors?.length}
      </div>
    </div>
  );
};

export default ProjectDonorsHeader;

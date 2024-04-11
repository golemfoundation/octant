import cx from 'classnames';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import useProjectDonors from 'hooks/queries/donors/useProjectDonors';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';

import styles from './ProjectDonorsHeader.module.scss';
import ProjectDonorsListProps from './types';

const ProjectDonorsHeader: FC<ProjectDonorsListProps> = ({
  projectAddress,
  dataTest = 'DonorsHeader',
  className,
}) => {
  const { epoch } = useParams();
  const { i18n } = useTranslation('translation');
  const { data: currentEpoch } = useCurrentEpoch();

  const epochNumber = parseInt(epoch!, 10);

  const { data: projectDonors, isFetching } = useProjectDonors(
    projectAddress,
    epochNumber === currentEpoch ? undefined : epochNumber,
  );

  const numberOfDonors = useMemo(() => {
    if (epochNumber === currentEpoch) {
      return 0;
    }
    return isFetching ? '--' : projectDonors?.length;
  }, [isFetching, projectDonors, epochNumber, currentEpoch]);

  return (
    <div className={cx(styles.header, className)} data-test={dataTest}>
      <span className={styles.headerLabel}>{i18n.t('common.donors')}</span>{' '}
      <div className={styles.count} data-test={`${dataTest}__count`}>
        {numberOfDonors}
      </div>
    </div>
  );
};

export default ProjectDonorsHeader;

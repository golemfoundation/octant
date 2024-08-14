import cx from 'classnames';
import React, { FC, useState, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import ModalProjectDonorsListFull from 'components/Project/ModalProjectDonorsListFull';
import ProjectDonorsHeader from 'components/Project/ProjectDonorsHeader';
import ProjectDonorsList from 'components/Project/ProjectDonorsList';
import Button from 'components/ui/Button';
import { DONORS_SHORT_LIST_LENGTH } from 'constants/donors';
import useProjectsDonors from 'hooks/queries/donors/useProjectsDonors';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';

import styles from './ProjectDonors.module.scss';
import ProjectDonorsProps from './types';

const ProjectDonors: FC<ProjectDonorsProps> = ({
  className,
  dataTest = 'Donors',
  projectAddress,
}) => {
  const { epoch } = useParams();
  const { data: currentEpoch } = useCurrentEpoch();

  const epochNumber = parseInt(epoch!, 10);
  const { t } = useTranslation('translation', { keyPrefix: 'components.dedicated.donors' });
  const { data: projectsDonors, isFetching } = useProjectsDonors(
    epochNumber === currentEpoch ? undefined : epochNumber,
  );
  const projectDonors = projectsDonors?.[projectAddress];

  const [isFullDonorsListModalOpen, setIsFullDonorsListModalOpen] = useState(false);

  const isEpoch1 = currentEpoch === 1;

  const isListExpandable = projectDonors && projectDonors.length > DONORS_SHORT_LIST_LENGTH;

  return (
    <div className={cx(styles.root, className)} data-test={dataTest}>
      {isEpoch1 && (
        <div className={styles.noDataInformation} data-test={`${dataTest}__donationsNotEnabled`}>
          {t('donationsNotEnabled')}
        </div>
      )}
      {!isEpoch1 && (
        <Fragment>
          <ProjectDonorsHeader
            className={styles.donorsHeader}
            dataTest={`${dataTest}__DonorsHeader`}
            projectAddress={projectAddress}
          />
          <div className={styles.body}>
            {projectDonors && projectDonors.length > 0 ? (
              <ProjectDonorsList
                dataTest={`${dataTest}__DonorsList`}
                projectAddress={projectAddress}
              />
            ) : (
              <div
                className={cx(styles.noDataInformation, styles.noDonationsYet)}
                data-test={`${dataTest}__noDonationsYet`}
              >
                {t('noDonationsYet')}
              </div>
            )}
          </div>
          <Button
            className={cx(styles.buttonDonors, isListExpandable && styles.isListExpandable)}
            dataTest={`${dataTest}__Button`}
            isDisabled={!isListExpandable}
            label={t('viewAll')}
            onClick={() => setIsFullDonorsListModalOpen(true)}
            variant="secondary2"
          />
          {(isFetching || (projectDonors && projectDonors?.length > 0)) && (
            <div className={styles.divider} />
          )}
          <ModalProjectDonorsListFull
            modalProps={{
              isOpen: isFullDonorsListModalOpen,
              onClosePanel: () => setIsFullDonorsListModalOpen(false),
            }}
            projectAddress={projectAddress}
          />
        </Fragment>
      )}
    </div>
  );
};

export default ProjectDonors;

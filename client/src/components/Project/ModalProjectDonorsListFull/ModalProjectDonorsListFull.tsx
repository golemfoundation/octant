import React, { FC } from 'react';

import ProjectDonorsHeader from 'components/Project/ProjectDonorsHeader';
import ProjectDonorsList from 'components/Project/ProjectDonorsList';
import Modal from 'components/ui/Modal';

import styles from './ModalProjectDonorsListFull.module.scss';
import ModalProjectDonorsListFullProps from './types';

const ModalProjectDonorsListFull: FC<ModalProjectDonorsListFullProps> = ({
  modalProps,
  projectAddress,
}) => {
  return (
    <Modal
      bodyClassName={styles.modalBody}
      dataTest="ModalFullDonorsList"
      header={
        <ProjectDonorsHeader className={styles.donorsHeader} projectAddress={projectAddress} />
      }
      isOpen={modalProps.isOpen}
      onClosePanel={modalProps.onClosePanel}
      overflowClassName={styles.overflow}
    >
      <ProjectDonorsList
        className={styles.donorsList}
        projectAddress={projectAddress}
        showFullList
      />
    </Modal>
  );
};

export default ModalProjectDonorsListFull;

import React, { FC } from 'react';

import ProjectDonorsHeader from 'components/Project/ProjectDonorsHeader';
import ProjectDonorsList from 'components/Project/ProjectDonorsList';
import Modal from 'components/ui/Modal';

import styles from './ModalProjectDonorsListFull.module.scss';
import ModalProjectDonorsListFullProps from './types';

const ModalProjectDonorsListFull: FC<ModalProjectDonorsListFullProps> = ({
  modalProps,
  proposalAddress,
}) => {
  return (
    <Modal
      bodyClassName={styles.modalBody}
      dataTest="ModalFullDonorsList"
      header={
        <ProjectDonorsHeader className={styles.donorsHeader} proposalAddress={proposalAddress} />
      }
      isOpen={modalProps.isOpen}
      onClosePanel={modalProps.onClosePanel}
      overflowClassName={styles.overflow}
    >
      <ProjectDonorsList
        className={styles.donorsList}
        proposalAddress={proposalAddress}
        showFullList
      />
    </Modal>
  );
};

export default ModalProjectDonorsListFull;

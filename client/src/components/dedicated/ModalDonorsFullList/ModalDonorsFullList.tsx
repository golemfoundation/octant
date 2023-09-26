import React, { FC } from 'react';

import Modal from 'components/core/Modal/Modal';
import DonorsHeader from 'components/dedicated//DonorsHeader/DonorsHeader';
import DonorsList from 'components/dedicated/DonorsList/DonorsList';

import styles from './ModalDonorsFullList.module.scss';
import ModalDonorsFullListProps from './types';

const ModalDonorsFullList: FC<ModalDonorsFullListProps> = ({ modalProps, proposalAddress }) => {
  return (
    <Modal
      bodyClassName={styles.modalBody}
      dataTest="ModalFullDonorsList"
      header={<DonorsHeader className={styles.donorsHeader} proposalAddress={proposalAddress} />}
      isOpen={modalProps.isOpen}
      onClosePanel={modalProps.onClosePanel}
      overflowClassName={styles.overflow}
    >
      <DonorsList className={styles.donorsList} proposalAddress={proposalAddress} showFullList />
    </Modal>
  );
};

export default ModalDonorsFullList;

import React, { FC } from 'react';

import ProposalDonorsHeader from 'components/Proposal/ProposalDonorsHeader';
import ProposalDonorsList from 'components/Proposal/ProposalDonorsList';
import Modal from 'components/ui/Modal';

import styles from './ModalProposalDonorsListFull.module.scss';
import ModalProposalDonorsListFullProps from './types';

const ModalProposalDonorsListFull: FC<ModalProposalDonorsListFullProps> = ({
  modalProps,
  proposalAddress,
}) => {
  return (
    <Modal
      bodyClassName={styles.modalBody}
      dataTest="ModalFullDonorsList"
      header={
        <ProposalDonorsHeader className={styles.donorsHeader} proposalAddress={proposalAddress} />
      }
      isOpen={modalProps.isOpen}
      onClosePanel={modalProps.onClosePanel}
      overflowClassName={styles.overflow}
    >
      <ProposalDonorsList
        className={styles.donorsList}
        proposalAddress={proposalAddress}
        showFullList
      />
    </Modal>
  );
};

export default ModalProposalDonorsListFull;

import cx from 'classnames';
import React, { FC, useState, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import ModalProposalDonorsListFull from 'components/Proposal/ModalProposalDonorsListFull';
import ProposalDonorsHeader from 'components/Proposal/ProposalDonorsHeader';
import ProposalDonorsList from 'components/Proposal/ProposalDonorsList';
import Button from 'components/ui/Button';
import { DONORS_SHORT_LIST_LENGTH } from 'constants/donors';
import useProposalDonors from 'hooks/queries/donors/useProposalDonors';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';

import styles from './ProposalDonors.module.scss';
import ProposalDonorsProps from './types';

const ProposalDonors: FC<ProposalDonorsProps> = ({
  className,
  dataTest = 'Donors',
  proposalAddress,
}) => {
  const { epoch } = useParams();
  const { t } = useTranslation('translation', { keyPrefix: 'components.dedicated.donors' });
  const { data: proposalDonors, isFetching } = useProposalDonors(
    proposalAddress,
    parseInt(epoch!, 10),
  );
  const { data: currentEpoch } = useCurrentEpoch();

  const [isFullDonorsListModalOpen, setIsFullDonorsListModalOpen] = useState(false);

  const isEpoch1 = currentEpoch === 1;

  const isListExpandable = proposalDonors && proposalDonors.length > DONORS_SHORT_LIST_LENGTH;

  return (
    <div className={cx(styles.root, className)} data-test={dataTest}>
      {isEpoch1 && (
        <div className={styles.noDataInformation} data-test={`${dataTest}__donationsNotEnabled`}>
          {t('donationsNotEnabled')}
        </div>
      )}
      {!isEpoch1 && (
        <Fragment>
          <ProposalDonorsHeader
            className={styles.donorsHeader}
            dataTest={`${dataTest}__DonorsHeader`}
            proposalAddress={proposalAddress}
          />
          <div className={styles.body}>
            {proposalDonors && proposalDonors.length > 0 ? (
              <ProposalDonorsList
                dataTest={`${dataTest}__DonorsList`}
                proposalAddress={proposalAddress}
              />
            ) : (
              <div className={cx(styles.noDataInformation, styles.noDonationsYet)}>
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
          {(isFetching || (proposalDonors && proposalDonors?.length > 0)) && (
            <div className={styles.divider} />
          )}
          <ModalProposalDonorsListFull
            modalProps={{
              isOpen: isFullDonorsListModalOpen,
              onClosePanel: () => setIsFullDonorsListModalOpen(false),
            }}
            proposalAddress={proposalAddress}
          />
        </Fragment>
      )}
    </div>
  );
};

export default ProposalDonors;

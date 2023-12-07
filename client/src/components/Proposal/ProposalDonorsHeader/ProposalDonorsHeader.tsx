import cx from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import useProposalDonors from 'hooks/queries/donors/useProposalDonors';

import styles from './ProposalDonorsHeader.module.scss';
import ProposalDonorsHeaderProps from './types';

const ProposalDonorsHeader: FC<ProposalDonorsHeaderProps> = ({
  proposalAddress,
  dataTest = 'DonorsHeader',
  className,
}) => {
  const { epoch } = useParams();
  const { i18n } = useTranslation('translation');

  const { data: proposalDonors, isFetching } = useProposalDonors(
    proposalAddress,
    parseInt(epoch!, 10),
  );
  return (
    <div className={cx(styles.header, className)} data-test={dataTest}>
      <span className={styles.headerLabel}>{i18n.t('common.donors')}</span>{' '}
      <div className={styles.count} data-test={`${dataTest}__count`}>
        {isFetching ? '--' : proposalDonors?.length}
      </div>
    </div>
  );
};

export default ProposalDonorsHeader;

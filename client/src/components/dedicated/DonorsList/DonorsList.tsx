import cx from 'classnames';
import React, { FC, useState, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import Button from 'components/core/Button/Button';
import DonorsItem from 'components/dedicated/DonorsItem/DonorsItem';
import DonorsItemSkeleton from 'components/dedicated/DonorsItem/DonorsItemSkeleton/DonorsItemSkeleton';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useProposalDonors from 'hooks/queries/useProposalDonors';

import styles from './DonorsList.module.scss';
import DonorsListProps from './types';

const SHORT_LIST_LENGTH = 5;

const DonorsList: FC<DonorsListProps> = ({
  className,
  dataTest = 'DonorsList',
  proposalAddress,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'components.dedicated.donorsList' });
  const [isDonorsListExpanded, setIsDonorsListExpanded] = useState<boolean>(false);
  const { data: proposalDonors, isFetching } = useProposalDonors(proposalAddress);
  const { data: currentEpoch } = useCurrentEpoch();

  const isEpoch1 = currentEpoch === 1;

  return (
    <div className={cx(styles.root, className)} data-test={dataTest}>
      <div className={styles.header}>
        <span className={styles.headerLabel}>{t('donors')}</span>{' '}
        <div className={styles.count} data-test={`${dataTest}__count`}>
          {isFetching || isEpoch1 ? '--' : proposalDonors?.length}
        </div>
      </div>
      {isFetching ? (
        // eslint-disable-next-line react/no-array-index-key
        [...Array(SHORT_LIST_LENGTH)].map((_, idx) => <DonorsItemSkeleton key={idx} />)
      ) : (
        <Fragment>
          {isEpoch1 ? (
            <div
              className={styles.donationsNotEnabled}
              data-test={`${dataTest}__donationsNotEnabled`}
            >
              {t('donationsNotEnabled')}
            </div>
          ) : (
            proposalDonors
              ?.slice(0, isDonorsListExpanded ? proposalDonors.length : SHORT_LIST_LENGTH)
              ?.map(({ amount, address }) => (
                <DonorsItem
                  key={address}
                  amount={amount}
                  className={styles.donorsItem}
                  donorAddress={address}
                />
              ))
          )}
          {proposalDonors && proposalDonors.length > SHORT_LIST_LENGTH && (
            <Button
              className={styles.buttonDonors}
              label={isDonorsListExpanded ? `- ${t('seeLess')}` : t('viewAll')}
              onClick={() => setIsDonorsListExpanded(!isDonorsListExpanded)}
              variant="secondary2"
            />
          )}
        </Fragment>
      )}
      {(isFetching || (proposalDonors && proposalDonors?.length > 0)) && (
        <div className={styles.divider} />
      )}
    </div>
  );
};

export default DonorsList;

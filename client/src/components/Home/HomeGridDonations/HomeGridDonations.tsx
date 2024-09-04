import React, { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import DonationsList from 'components/Home/HomeGridDonations/DonationsList';
import { getReducedUserAllocationsAllEpochs } from 'components/Metrics/MetricsPersonal/MetricsPersonalGridAllocations/utils';
import GridTile from 'components/shared/Grid/GridTile';
import Button from 'components/ui/Button';
import Img from 'components/ui/Img';
import useUserAllocationsAllEpochs from 'hooks/helpers/useUserAllocationsAllEpochs';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useUserAllocations from 'hooks/queries/useUserAllocations';

import styles from './HomeGridDonations.module.scss';
import HomeGridDonationsProps from './types';

const HomeGridDonations: FC<HomeGridDonationsProps> = ({ className }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridDonations',
  });
  const { isConnected } = useAccount();
  const { data: userAllocationsAllEpochs, isFetching: isFetchingUserAllocationsAllEpochs } =
    useUserAllocationsAllEpochs();
  const reducedUserAllocationsAllEpochs =
    getReducedUserAllocationsAllEpochs(userAllocationsAllEpochs);

  const areAllocationsEmpty =
    !isConnected ||
    (!isFetchingUserAllocationsAllEpochs && reducedUserAllocationsAllEpochs?.length === 0);
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();

  const { data: userAllocations } = useUserAllocations();

  return (
    <GridTile
      className={className}
      showTitleDivider={!areAllocationsEmpty}
      title={
        <div className={styles.titleWrapper}>
          {!isDecisionWindowOpen && !areAllocationsEmpty ? t('donationHistory') : t('donations')}
          {isDecisionWindowOpen &&
            userAllocations?.elements &&
            userAllocations?.elements?.length > 0 && (
              <div className={styles.numberOfAllocations}>{userAllocations?.elements?.length}</div>
            )}
        </div>
      }
      titleSuffix={
        isDecisionWindowOpen && userAllocations?.hasUserAlreadyDoneAllocation ? (
          // TODO: open allocation drawer in edit mode -> https://linear.app/golemfoundation/issue/OCT-1907/allocate-drawer
          <Button className={styles.editButton} variant="cta">
            {t('edit')}
          </Button>
        ) : null
      }
    >
      <div className={styles.root}>
        {areAllocationsEmpty ? (
          <div className={styles.noDonationsYet}>
            <Img className={styles.noDonationsYetImage} src="/images/headphones_girl.webp" />
            <div className={styles.noDonationsYetLabel}>
              <Trans i18nKey="components.home.homeGridDonations.noDonationsYet" />
            </div>
          </div>
        ) : (
          <DonationsList
            donations={reducedUserAllocationsAllEpochs}
            isLoading={isFetchingUserAllocationsAllEpochs}
            numberOfSkeletons={4}
          />
        )}
      </div>
    </GridTile>
  );
};

export default HomeGridDonations;

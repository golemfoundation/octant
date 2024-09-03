import React, { FC, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import GridTile from 'components/shared/Grid/GridTile';

import useUserAllocations from 'hooks/queries/useUserAllocations';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useUserAllocationsAllEpochs from 'hooks/helpers/useUserAllocationsAllEpochs';
import DonationsList from 'components/Home/HomeGridDonations/DonationsList';

import { getReducedUserAllocationsAllEpochs } from 'components/Metrics/MetricsPersonal/MetricsPersonalGridAllocations/utils';
import Img from 'components/ui/Img';

import styles from './HomeGridDonations.module.scss';
import HomeGridDonationsProps from './types';
import Button from 'components/ui/Button';
import { useAccount } from 'wagmi';
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
      showTitleDivider={!areAllocationsEmpty}
      className={className}
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
          <Button variant="cta" className={styles.editButton}>
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
              <Trans i18nKey="components.home.homeGridDonations.noDonationsYet"></Trans>
            </div>
          </div>
        ) : (
          <DonationsList
            isLoading={isFetchingUserAllocationsAllEpochs}
            numberOfSkeletons={4}
            donations={reducedUserAllocationsAllEpochs}
          />
        )}
      </div>
    </GridTile>
  );
};

export default HomeGridDonations;

import React, { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import DonationsList from 'components/Home/HomeGridDonations/DonationsList';
import { getReducedUserAllocationsAllEpochs } from 'components/Metrics/MetricsPersonal/MetricsPersonalGridAllocations/utils';
import GridTile from 'components/shared/Grid/GridTile';
import Button from 'components/ui/Button';
import Img from 'components/ui/Img';
import useUserAllocationsAllEpochs from 'hooks/helpers/useUserAllocationsAllEpochs';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import useAllocationsStore from 'store/allocations/store';
import useLayoutStore from 'store/layout/store';

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
  const { data: userAllocations, isFetching: isFetchingUserAllocations } = useUserAllocations();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { setShowAllocationDrawer } = useLayoutStore(state => ({
    setShowAllocationDrawer: state.setShowAllocationDrawer,
  }));

  const { setCurrentView } = useAllocationsStore(state => ({
    setCurrentView: state.setCurrentView,
  }));

  const areAllocationsEmpty =
    !isConnected ||
    (isDecisionWindowOpen
      ? !isFetchingUserAllocations && userAllocations?.elements.length === 0
      : !isFetchingUserAllocationsAllEpochs && reducedUserAllocationsAllEpochs?.length === 0);

  return (
    <GridTile
      className={className}
      showTitleDivider={!areAllocationsEmpty}
      title={
        <div className={styles.titleWrapper}>
          {!isDecisionWindowOpen && !areAllocationsEmpty ? t('donationHistory') : t('donations')}
          {isDecisionWindowOpen && userAllocations?.elements !== undefined && (
            <div className={styles.numberOfAllocations}>{userAllocations?.elements?.length}</div>
          )}
        </div>
      }
      titleSuffix={
        isDecisionWindowOpen ? (
          // TODO: open allocation drawer in edit mode -> https://linear.app/golemfoundation/issue/OCT-1907/allocate-drawer
          <Button
            className={styles.editButton}
            onClick={() => {
              setCurrentView('edit');
              setShowAllocationDrawer(true);
            }}
            variant="cta"
          >
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
              <Trans
                i18nKey={`components.home.homeGridDonations.${isDecisionWindowOpen ? 'noDonationsYetAWOpen' : 'noDonationsYet'}`}
              />
            </div>
          </div>
        ) : (
          <DonationsList
            donations={
              isDecisionWindowOpen && userAllocations?.elements
                ? userAllocations.elements.map(a => ({ ...a, epoch: currentEpoch! - 1 }))
                : reducedUserAllocationsAllEpochs
            }
            isLoading={
              isDecisionWindowOpen ? isFetchingUserAllocations : isFetchingUserAllocationsAllEpochs
            }
            numberOfSkeletons={4}
          />
        )}
      </div>
    </GridTile>
  );
};

export default HomeGridDonations;

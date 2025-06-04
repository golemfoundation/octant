import React, { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import DonationsList from 'components/Home/HomeGridDonations/DonationsList';
import GridTile from 'components/shared/Grid/GridTile';
import Button from 'components/ui/Button';
import Img from 'components/ui/Img';
import useUserAllocationsAllEpochs from 'hooks/helpers/useUserAllocationsAllEpochs';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import { ROOT_ROUTES } from 'routes/RootRoutes/routes';
import useAllocationsStore from 'store/allocations/store';
import useLayoutStore from 'store/layout/store';

import styles from './HomeGridDonations.module.scss';
import HomeGridDonationsProps from './types';
import { getReducedUserAllocationsAllEpochs } from './utils';

const HomeGridDonations: FC<HomeGridDonationsProps> = ({ className }) => {
  const { i18n, t } = useTranslation('translation', {
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
  const { isAllocationDrawerOpen, setIsAllocationDrawerOpen } = useLayoutStore(state => ({
    isAllocationDrawerOpen: state.data.isAllocationDrawerOpen,
    setIsAllocationDrawerOpen: state.setIsAllocationDrawerOpen,
  }));

  const { allocations, setCurrentView } = useAllocationsStore(state => ({
    allocations: state.data.allocations,
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
      dataTest="HomeGridDonations"
      showTitleDivider={!areAllocationsEmpty}
      title={
        <div className={styles.titleWrapper}>
          {!isDecisionWindowOpen && !areAllocationsEmpty
            ? t('donationHistory')
            : i18n.t('common.donations')}
          {isDecisionWindowOpen && userAllocations?.elements !== undefined && (
            <div
              className={styles.numberOfAllocations}
              data-test="HomeGridDonations__numberOfAllocations"
            >
              {userAllocations?.elements?.length}
            </div>
          )}
        </div>
      }
      titleSuffix={
        isDecisionWindowOpen ? (
          <Button
            className={styles.editButton}
            dataTest="HomeGridDonations__Button--edit"
            isDisabled={allocations.length === 0}
            onClick={() => {
              setCurrentView('edit');
              setIsAllocationDrawerOpen(!isAllocationDrawerOpen);
            }}
            variant="cta2"
          >
            {i18n.t('common.update')}
          </Button>
        ) : null
      }
    >
      <div className={styles.root}>
        {areAllocationsEmpty ? (
          <div className={styles.noDonationsYet} data-test="HomeGridDonations__noDonationsYet">
            <Img className={styles.noDonationsYetImage} src="/images/headphones_girl.webp" />
            <div className={styles.noDonationsYetLabel}>
              <Trans
                components={[
                  <Button
                    className={styles.projectsLink}
                    to={ROOT_ROUTES.projects.absolute}
                    variant="link3"
                  />,
                ]}
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

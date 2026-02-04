import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import GridTile from 'components/shared/Grid/GridTile';
import Button from 'components/ui/Button';
import Img from 'components/ui/Img';
import Slider from 'components/ui/Slider';
import useAllocationViewSetRewardsForProjects from 'hooks/helpers/useAllocationViewSetRewardsForProjects';
import useGetValuesToDisplay from 'hooks/helpers/useGetValuesToDisplay';
import useIdsInAllocation from 'hooks/helpers/useIdsInAllocation';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useProjectsEpoch from 'hooks/queries/useProjectsEpoch';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import useAllocationsStore from 'store/allocations/store';
import useLayoutStore from 'store/layout/store';

import styles from './HomeGridAllocate.module.scss';
import HomeAllocateProps from './types';

const HomeGridAllocate: FC<HomeAllocateProps> = ({ className }) => {
  const { isConnected } = useAccount();
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridAllocate',
  });
  const { setIsAllocationDrawerOpen } = useLayoutStore(state => ({
    setIsAllocationDrawerOpen: state.setIsAllocationDrawerOpen,
  }));
  useAllocationViewSetRewardsForProjects();
  const { data: individualReward } = useIndividualReward();
  const { data: projectsEpoch, isFetching: isFetchingProjectsEpoch } = useProjectsEpoch();
  const { data: userAllocations, isFetching: isFetchingUserAllocations } = useUserAllocations();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const getValuesToDisplay = useGetValuesToDisplay();

  const { allocations, addAllocations, removeAllocations, rewardsForProjects } =
    useAllocationsStore(state => ({
      addAllocations: state.addAllocations,
      allocations: state.data.allocations,
      removeAllocations: state.removeAllocations,
      rewardsForProjects: state.data.rewardsForProjects,
    }));

  const { onAddRemoveFromAllocate } = useIdsInAllocation({
    addAllocations,
    allocations,
    isDecisionWindowOpen,
    removeAllocations,
    userAllocationsElements: userAllocations?.elements,
  });

  const hasUserIndividualReward = !!individualReward && individualReward !== 0n;
  const isDecisionWindowOpenAndHasIndividualReward =
    hasUserIndividualReward && isDecisionWindowOpen;

  const percentRewardsForProjects = isDecisionWindowOpenAndHasIndividualReward
    ? Number((rewardsForProjects * BigInt(100)) / individualReward)
    : 50;

  const rewardsForProjectsFinal = isDecisionWindowOpenAndHasIndividualReward
    ? rewardsForProjects
    : BigInt(0);
  const rewardsForWithdraw = isDecisionWindowOpenAndHasIndividualReward
    ? individualReward - rewardsForProjects
    : BigInt(0);

  const isFetching = isFetchingProjectsEpoch || isFetchingUserAllocations;

  const sections = [
    {
      header: 'Donate',
      value: getValuesToDisplay({
        cryptoCurrency: 'ethereum',
        showCryptoSuffix: true,
        showLessThanOneCentFiat: true,
        valueCrypto: rewardsForProjectsFinal,
      }).primary,
    },
    {
      header: 'Personal',
      value: getValuesToDisplay({
        cryptoCurrency: 'ethereum',
        showCryptoSuffix: true,
        showLessThanOneCentFiat: true,
        valueCrypto: rewardsForWithdraw,
      }).primary,
    },
  ];

  return (
    <GridTile className={className} dataTest="HomeGridAllocate" title={t('title')}>
      <div className={styles.root}>
        <Img className={styles.image} src="/images/migration/allocate.webp" />
        <Slider
          className={styles.slider}
          dataTest="AllocationSliderBox__Slider"
          hideThumb
          isDisabled={!isConnected}
          isError={false}
          max={100}
          min={0}
          value={percentRewardsForProjects}
        />
        <div className={styles.sections}>
          {sections.map((section, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={index} className={styles.section}>
              <div className={styles.name}>
                <div className={styles.square} />
                {section.header}
              </div>
              <div className={styles.value}>{section.value}</div>
            </div>
          ))}
        </div>
        <Button
          className={styles.button}
          dataTest="HomeGridAllocate__Button"
          isDisabled={!isConnected || isFetching || !isDecisionWindowOpen}
          isHigh
          onClick={() => {
            const isAddedToAllocate = projectsEpoch
              ? allocations!.includes(projectsEpoch.projectsAddresses[0])
              : false;

            setIsAllocationDrawerOpen(true);

            if (projectsEpoch !== undefined && !isAddedToAllocate) {
              onAddRemoveFromAllocate(projectsEpoch.projectsAddresses[0]);
            }
          }}
          variant="cta"
        >
          {t(
            isDecisionWindowOpen && userAllocations?.hasUserAlreadyDoneAllocation
              ? 'button.afterAllocation'
              : 'button.beforeAllocation',
          )}
        </Button>
      </div>
    </GridTile>
  );
};

export default HomeGridAllocate;

import { BigNumber } from 'ethers';
import React, { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Sections from 'components/core/BoxRounded/Sections/Sections';
import { SectionProps } from 'components/core/BoxRounded/Sections/types';
import HistoryItemDateAndTime from 'components/dedicated/History/HistoryItemDetails/HistoryItemDateAndTime/HistoryItemDateAndTime';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import useEpochTimestampHappenedIn from 'hooks/subgraph/useEpochTimestampHappenedIn';

import styles from './HistoryItemDetailsAllocation.module.scss';
import ProjectRow from './ProjectRow/ProjectRow';
import HistoryItemDetailsAllocationProps from './types';

const HistoryItemDetailsAllocation: FC<HistoryItemDetailsAllocationProps> = ({
  projectsNumber,
  projects,
  timestamp,
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.historyItemModal',
  });
  const { data: epochTimestampHappenedIn, isFetching: isFetchingEpochTimestampHappenedIn } =
    useEpochTimestampHappenedIn(timestamp);

  const allocationEpoch = epochTimestampHappenedIn ? epochTimestampHappenedIn - 1 : undefined;

  const { data: userAllocations, isFetching: isFetchingUserAllocations } =
    useUserAllocations(allocationEpoch);
  const { data: individualReward, isFetching: isFetchingIndividualReward } =
    useIndividualReward(allocationEpoch);

  const userAllocationsSum = userAllocations?.elements.reduce(
    (acc, curr) => acc.add(curr.value),
    BigNumber.from(0),
  );

  const sections: SectionProps[] = [
    {
      doubleValueProps: {
        cryptoCurrency: 'ethereum',
        isFetching:
          isFetchingEpochTimestampHappenedIn ||
          isFetchingIndividualReward ||
          isFetchingUserAllocations,
        valueCrypto:
          individualReward && userAllocationsSum
            ? individualReward.sub(userAllocationsSum)
            : BigNumber.from(0),
      },
      label: t('sections.allocationPersonal'),
    },
    {
      doubleValueProps: {
        cryptoCurrency: 'ethereum',
        valueCrypto: userAllocationsSum,
      },
      label: t('sections.allocationProjects', { projectsNumber }),
    },
    {
      childrenRight: <HistoryItemDateAndTime timestamp={timestamp} />,
      label: t('sections.when'),
    },
  ];

  return (
    <Fragment>
      <BoxRounded alignment="left" hasSections isGrey isVertical>
        <Sections hasBottomDivider sections={sections} variant="small" />
      </BoxRounded>
      <BoxRounded alignment="left" className={styles.projects} isGrey isVertical>
        {projects?.map(project => <ProjectRow key={project.address} {...project} />)}
      </BoxRounded>
    </Fragment>
  );
};

export default HistoryItemDetailsAllocation;

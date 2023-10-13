import { BigNumber } from 'ethers';
import React, { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Sections from 'components/core/BoxRounded/Sections/Sections';
import { SectionProps } from 'components/core/BoxRounded/Sections/types';
import HistoryItemDateAndTime from 'components/dedicated/History/HistoryItemDetails/HistoryItemDateAndTime/HistoryItemDateAndTime';
import ProjectAllocationDetailRow from 'components/dedicated/ProjectAllocationDetailRow/ProjectAllocationDetailRow';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useEpochTimestampHappenedIn from 'hooks/subgraph/useEpochTimestampHappenedIn';

import styles from './HistoryItemDetailsAllocation.module.scss';
import HistoryItemDetailsAllocationProps from './types';

const HistoryItemDetailsAllocation: FC<HistoryItemDetailsAllocationProps> = ({
  amount,
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

  const { data: individualReward, isFetching: isFetchingIndividualReward } =
    useIndividualReward(allocationEpoch);

  const sections: SectionProps[] = [
    {
      doubleValueProps: {
        cryptoCurrency: 'ethereum',
        isFetching: isFetchingEpochTimestampHappenedIn || isFetchingIndividualReward,
        valueCrypto: individualReward ? individualReward.sub(amount) : BigNumber.from(0),
      },
      label: t('sections.allocationPersonal'),
    },
    {
      doubleValueProps: {
        cryptoCurrency: 'ethereum',
        valueCrypto: amount,
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
        {projects?.map(project => (
          <ProjectAllocationDetailRow key={project.address} {...project} />
        ))}
      </BoxRounded>
    </Fragment>
  );
};

export default HistoryItemDetailsAllocation;

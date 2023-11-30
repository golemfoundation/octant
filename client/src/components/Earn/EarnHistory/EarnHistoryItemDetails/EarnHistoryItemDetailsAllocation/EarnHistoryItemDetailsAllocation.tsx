import { BigNumber } from 'ethers';
import React, { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import ProjectAllocationDetailRow from 'components/dedicated/ProjectAllocationDetailRow/ProjectAllocationDetailRow';
import EarnHistoryItemDateAndTime from 'components/Earn/EarnHistory/EarnHistoryItemDetails/EarnHistoryItemDateAndTime';
import BoxRounded from 'components/ui/BoxRounded';
import Sections from 'components/ui/BoxRounded/Sections/Sections';
import { SectionProps } from 'components/ui/BoxRounded/Sections/types';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useEpochTimestampHappenedIn from 'hooks/subgraph/useEpochTimestampHappenedIn';
import { CryptoCurrency } from 'types/cryptoCurrency';

import styles from './EarnHistoryItemDetailsAllocation.module.scss';
import EarnHistoryItemDetailsAllocationProps from './types';

const EarnHistoryItemDetailsAllocation: FC<EarnHistoryItemDetailsAllocationProps> = ({
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

  const isPersonalOnlyAllocation = amount.isZero();

  const sections: SectionProps[] = [
    {
      doubleValueProps: {
        cryptoCurrency: 'ethereum',
        isFetching: isFetchingEpochTimestampHappenedIn || isFetchingIndividualReward,
        valueCrypto: individualReward ? individualReward.sub(amount) : BigNumber.from(0),
      },
      label: t('sections.allocationPersonal'),
    },
    ...(isPersonalOnlyAllocation
      ? []
      : [
          {
            doubleValueProps: {
              cryptoCurrency: 'ethereum' as CryptoCurrency,
              valueCrypto: amount,
            },
            label: t('sections.allocationProjects', { projectsNumber }),
          },
        ]),
    {
      childrenRight: <EarnHistoryItemDateAndTime timestamp={timestamp} />,
      label: t('sections.when'),
    },
  ];

  return (
    <Fragment>
      <BoxRounded alignment="left" hasSections isGrey isVertical>
        <Sections hasBottomDivider sections={sections} variant="small" />
      </BoxRounded>
      {!isPersonalOnlyAllocation && (
        <BoxRounded alignment="left" className={styles.projects} isGrey isVertical>
          {projects?.map(project => (
            <ProjectAllocationDetailRow key={project.address} {...project} />
          ))}
        </BoxRounded>
      )}
    </Fragment>
  );
};

export default EarnHistoryItemDetailsAllocation;

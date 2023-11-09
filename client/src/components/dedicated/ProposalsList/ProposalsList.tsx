import { format, isSameYear } from 'date-fns';
import React, { FC, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import ProposalsListItem from 'components/dedicated/ProposalsList/ProposalsListItem/ProposalsListItem';
import ProposalsListItemSkeleton from 'components/dedicated/ProposalsList/ProposalsListItemSkeleton/ProposalsListItemSkeleton';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useProposalsContract from 'hooks/queries/useProposalsContract';
import useProposalsIpfsWithRewards from 'hooks/queries/useProposalsIpfsWithRewards';
import useEpochsStartEndTime from 'hooks/subgraph/useEpochsStartEndTime';

import styles from './ProposalsList.module.scss';
import ProposalsListProps from './types';

const ProposalsList: FC<ProposalsListProps> = ({
  areCurrentEpochsProjectsHiddenOutsideAllocationWindow,
  epoch,
  isFirstArchive,
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.proposalsList',
  });

  const { isDesktop } = useMediaQuery();

  const { data: proposalsAddresses } = useProposalsContract(epoch);
  const { data: proposalsWithRewards } = useProposalsIpfsWithRewards(epoch);
  const { data: epochsStartEndTime } = useEpochsStartEndTime();

  const epochDurationLabel = useMemo(() => {
    if (!epoch || !epochsStartEndTime) {
      return '';
    }

    const epochData = epochsStartEndTime[epoch - 1];
    const epochStartTimestamp = parseInt(epochData.fromTs, 10) * 1000;
    const epochEndTimestampPlusDecisionWindowDuration =
      (parseInt(epochData.toTs, 10) + parseInt(epochData.decisionWindow, 10)) * 1000;

    const isEpochEndedAtTheSameYear = isSameYear(
      epochStartTimestamp,
      epochEndTimestampPlusDecisionWindowDuration,
    );

    const epochStartLabel = format(
      epochStartTimestamp,
      `${isDesktop ? 'dd MMMM' : 'MMM'} ${isEpochEndedAtTheSameYear ? '' : 'yyyy'}`,
    );
    const epochEndLabel = format(
      epochEndTimestampPlusDecisionWindowDuration,
      `${isDesktop ? 'dd MMMM' : 'MMM'} yyyy`,
    );

    return `${epochStartLabel} -> ${epochEndLabel}`;
  }, [epoch, epochsStartEndTime, isDesktop]);

  return (
    <div
      className={styles.list}
      data-test={epoch ? 'ProposalsView__ProposalsList--archive' : 'ProposalsView__ProposalsList'}
    >
      {epoch && (
        <>
          {areCurrentEpochsProjectsHiddenOutsideAllocationWindow && isFirstArchive ? null : (
            <div className={styles.divider} />
          )}
          <div className={styles.epochArchive}>
            {t('epochArchive', { epoch })}
            <span className={styles.epochDuration}>{epochDurationLabel}</span>
          </div>
        </>
      )}
      {proposalsWithRewards.length > 0
        ? proposalsWithRewards.map((proposalWithRewards, index) => (
            <ProposalsListItem
              key={proposalWithRewards.address}
              className={styles.element}
              dataTest={
                epoch
                  ? `ProposalsView__ProposalsListItem--archive--${index}`
                  : `ProposalsView__ProposalsListItem--${index}`
              }
              epoch={epoch}
              {...proposalWithRewards}
            />
          ))
        : (proposalsAddresses || []).map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <ProposalsListItemSkeleton key={index} className={styles.element} />
          ))}
    </div>
  );
};

export default memo(ProposalsList);

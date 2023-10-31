import { formatDistanceToNow } from 'date-fns';
import React, { FC, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import ProposalsListItem from 'components/dedicated/ProposalsList/ProposalsListItem/ProposalsListItem';
import ProposalsListItemSkeleton from 'components/dedicated/ProposalsList/ProposalsListItemSkeleton/ProposalsListItemSkeleton';
import env from 'env';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useProposalsContract from 'hooks/queries/useProposalsContract';
import useProposalsIpfsWithRewards from 'hooks/queries/useProposalsIpfsWithRewards';
import useEpochsEndTime from 'hooks/subgraph/useEpochsEndTime';

import styles from './ProposalsList.module.scss';
import ProposalsListProps from './types';

const ProposalsList: FC<ProposalsListProps> = ({ epoch, isFirstArchive }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.proposalsList',
  });

  const { data: proposalsAddresses } = useProposalsContract(epoch);
  const { data: proposalsWithRewards } = useProposalsIpfsWithRewards(epoch);
  const { data: epochsEndTime } = useEpochsEndTime();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();

  const epochEndedLabel = useMemo(() => {
    if (!epoch || !epochsEndTime) {
      return '';
    }

    return formatDistanceToNow(new Date(parseInt(epochsEndTime[epoch - 1].toTs, 10) * 1000), {
      addSuffix: true,
    });
  }, [epoch, epochsEndTime]);

  if (env.areCurrentEpochsProjectsVisible && epoch === undefined && !isDecisionWindowOpen) {
    return null;
  }

  return (
    <div
      className={styles.list}
      data-test={epoch ? 'ProposalsView__ProposalsList--archive' : 'ProposalsView__ProposalsList'}
    >
      {epoch && (
        <>
          {env.areCurrentEpochsProjectsVisible !== 'true' && !isFirstArchive && (
            <div className={styles.divider} />
          )}
          <div className={styles.epochArchive}>
            {t('epochArchive', { epoch })}
            <span className={styles.epochArchiveEnded}>{epochEndedLabel}</span>
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

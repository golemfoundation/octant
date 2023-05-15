import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import React, { FC, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import DoubleValue from 'components/core/DoubleValue/DoubleValue';
import Header from 'components/core/Header/Header';
import ProgressBar from 'components/core/ProgressBar/ProgressBar';
import Svg from 'components/core/Svg/Svg';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useMatchedRewards from 'hooks/queries/useMatchedRewards';
import useProposalsContract from 'hooks/queries/useProposalsContract';
import useProposalsIpfs from 'hooks/queries/useProposalsIpfs';
import { arrowRight } from 'svg/misc';
import { ExtendedProposal } from 'types/proposals';
import getFormattedEthValue from 'utils/getFormattedEthValue';

import styles from './AllocationSummary.module.scss';
import ExpandableList from './ExpandableList/ExpandableList';
import AllocationSummaryProps from './types';

const getHeader = (
  proposals: ExtendedProposal[],
  allocations: AllocationSummaryProps['allocations'],
) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.allocationSummary',
  });

  if (allocations.length > 1) {
    return t('header.allocations', {
      allocationsLength: allocations.length,
    });
  }
  const proposal = proposals.find(({ address }) => allocations[0] === address)!.name;

  return t('header.proposal', {
    proposal,
  });
};

const AllocationSummary: FC<AllocationSummaryProps> = ({ allocations, allocationValues = {} }) => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.allocationSummary',
  });
  const [isProjectsTileExpanded, setIsProjectsTileExpanded] = useState<boolean>(false);
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: proposalsContracts } = useProposalsContract();
  const { data: proposals } = useProposalsIpfs(proposalsContracts);
  const { data: individualReward } = useIndividualReward();
  const { data: matchedRewards } = useMatchedRewards();
  const newAllocationValuesSum = Object.values(allocationValues).reduce(
    (acc, value) => acc.add(parseUnits(value || '0')),
    BigNumber.from(0),
  );
  const newClaimableAndClaimed = (individualReward as BigNumber).sub(newAllocationValuesSum);

  const isExpandableListAvailable = allocations.length > 1;

  const budgetBefore = individualReward ? getFormattedEthValue(individualReward) : undefined;
  const budgetAfter = individualReward
    ? getFormattedEthValue(individualReward.sub(newAllocationValuesSum))
    : undefined;

  return (
    <Fragment>
      <Header
        text={t('confirmEpochAllocation', {
          currentEpoch,
        })}
      />
      <BoxRounded
        alignment="left"
        className={styles.box}
        expandableChildren={
          isExpandableListAvailable ? (
            <ExpandableList allocations={allocations} allocationValues={allocationValues} />
          ) : null
        }
        isExpanded={isProjectsTileExpanded}
        isVertical
        onToggle={isExpanded => setIsProjectsTileExpanded(isExpanded)}
        suffix={t('estimatedMatchFunding', {
          matchedRewards: matchedRewards ? getFormattedEthValue(matchedRewards).fullString : '0',
        })}
        title={getHeader(proposals, allocations)}
      >
        <div className={styles.totalDonation}>
          {isProjectsTileExpanded && <div className={styles.label}>{t('totalDonation')}</div>}
          <DoubleValue valueCrypto={newAllocationValuesSum} />
        </div>
      </BoxRounded>
      <BoxRounded isVertical>
        <div className={styles.values}>
          <div>
            <div className={styles.header}>
              {i18n.t('common.budget', {
                budget: budgetBefore && `(${budgetBefore.suffix})`,
              })}
            </div>
            <DoubleValue
              className={styles.budgetValue}
              valueString={budgetBefore ? budgetBefore.value : '0.0'}
            />
          </div>
          <div className={styles.separator}>
            <div className={styles.header} />
            <Svg img={arrowRight} size={[1.5, 1.4]} />
          </div>
          <div>
            <div className={styles.header}>
              {t('afterAllocation', {
                budget: budgetAfter && `(${budgetAfter.suffix})`,
              })}
            </div>
            <DoubleValue
              className={styles.budgetValue}
              valueString={budgetAfter ? budgetAfter.value : '0.0'}
            />
          </div>
        </div>
        <ProgressBar
          className={styles.progressBar}
          labelLeft={t('allocations', {
            allocations: getFormattedEthValue(newAllocationValuesSum).fullString,
          })}
          labelRight={t('claimed', {
            claimed: getFormattedEthValue(newClaimableAndClaimed).fullString,
          })}
          progressPercentage={newAllocationValuesSum
            .mul(100)
            .div(newClaimableAndClaimed.add(newAllocationValuesSum))
            .toNumber()}
        />
      </BoxRounded>
    </Fragment>
  );
};

export default AllocationSummary;

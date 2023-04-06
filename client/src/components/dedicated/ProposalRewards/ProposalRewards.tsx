import cx from 'classnames';
import React, { FC, Fragment } from 'react';

import useProposalRewardsThresholdFraction from 'hooks/queries/useProposalRewardsThresholdFraction';
import getFormattedEthValue from 'utils/getFormattedEthValue';

import styles from './ProposalRewards.module.scss';
import ProposalRewardsProps from './types';

const ProposalRewards: FC<ProposalRewardsProps> = ({ proposalMatchedProposalRewards }) => {
  const { data: proposalRewardsThresholdFraction } = useProposalRewardsThresholdFraction();

  return (
    <div className={styles.root}>
      {proposalMatchedProposalRewards ? (
        <Fragment>
          <div>
            {
              getFormattedEthValue(proposalMatchedProposalRewards.totalValueOfAllocations!)
                .fullString
            }
          </div>
          {proposalRewardsThresholdFraction && (
            <Fragment>
              <div className={styles.separator} />
              <div
                className={cx(
                  styles.percentage,
                  proposalMatchedProposalRewards.percentage! > proposalRewardsThresholdFraction &&
                    styles.isAboveThreshold,
                )}
              >
                {proposalMatchedProposalRewards.percentage!} %
              </div>
            </Fragment>
          )}
        </Fragment>
      ) : (
        <Fragment>Allocation values are not available</Fragment>
      )}
    </div>
  );
};

export default ProposalRewards;

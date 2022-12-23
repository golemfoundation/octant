import { Link } from 'react-router-dom';
import React, { FC, Fragment } from 'react';
import cx from 'classnames';

import { ROOT_ROUTES } from 'routes/root-routes/routes';
import { tick } from 'svg/misc';
import Button from 'components/core/button/button.component';
import Img from 'components/core/img/img.component';
import Svg from 'components/core/svg/svg.component';
import isAboveProposalDonationThresholdPercent from 'utils/isAboveProposalDonationThresholdPercent';

import { ProposalItemProps } from './types';
import styles from './style.module.scss';

const ProposalItem: FC<ProposalItemProps> = ({
  description,
  isLoadingError,
  name,
  onAddRemoveFromAllocate,
  isAlreadyAdded,
  id,
  landscapeImageUrl,
  profileImageUrl,
  totalValueOfAllocations,
  percentage,
}) => {
  const buttonProps = isAlreadyAdded
    ? {
        Icon: <Svg img={tick} size={1.5} />,
        label: 'Added',
        variant: 'secondaryGrey',
      }
    : {
        label: 'Add to Allocate',
        variant: 'secondary',
      };

  return (
    <Link className={styles.root} to={`${ROOT_ROUTES.proposal.absolute}/${id}`}>
      {isLoadingError ? (
        'Loading of proposal encountered an error.'
      ) : (
        <Fragment>
          <div className={styles.header}>
            <div className={styles.imageLandscapeWrapper}>
              <Img className={styles.imageLandscape} src={landscapeImageUrl} />
            </div>
            <Img className={styles.imageProfile} src={profileImageUrl} />
          </div>
          <div className={styles.body}>
            <div className={styles.name}>{name}</div>
            <div className={styles.description}>{description}</div>
          </div>
          <div className={styles.footer}>
            <div className={styles.numbers}>
              <div className={styles.sum}>{totalValueOfAllocations} ETH</div>
              <div
                className={cx(
                  styles.percentage,
                  percentage &&
                    isAboveProposalDonationThresholdPercent(percentage) &&
                    styles.isAboveThreshold,
                )}
              >
                {percentage}%
              </div>
            </div>
            <div>
              <Button
                className={styles.button}
                onClick={event => {
                  event!.preventDefault();
                  onAddRemoveFromAllocate();
                }}
                {...buttonProps}
              />
            </div>
          </div>
        </Fragment>
      )}
    </Link>
  );
};

export default ProposalItem;

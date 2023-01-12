import { Link } from 'react-router-dom';
import React, { FC, Fragment } from 'react';
import cx from 'classnames';

import { ROOT_ROUTES } from 'routes/RootRoutes/routes';
import { tick } from 'svg/misc';
import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Button from 'components/core/Button/Button';
import Description from 'components/core/Description/Description';
import Img from 'components/core/Img/Img';
import Svg from 'components/core/Svg/Svg';
import env from 'env';
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
  landscapeImageCID,
  profileImageCID,
  totalValueOfAllocations,
  percentage,
}) => {
  const { ipfsGateway } = env;
  const buttonProps = isAlreadyAdded
    ? {
        Icon: <Svg img={tick} size={1.5} />,
        label: 'Added',
      }
    : {
        label: 'Add to Allocate',
      };

  return (
    <Link className={styles.root} to={`${ROOT_ROUTES.proposal.absolute}/${id}`}>
      {isLoadingError ? (
        <BoxRounded>Loading of a proposal encountered an error.</BoxRounded>
      ) : (
        <Fragment>
          <div className={styles.header}>
            <div className={styles.imageLandscapeWrapper}>
              <Img className={styles.imageLandscape} src={`${ipfsGateway}${landscapeImageCID}`} />
            </div>
            <Img className={styles.imageProfile} src={`${ipfsGateway}${profileImageCID}`} />
          </div>
          <div className={styles.body}>
            <div className={styles.name}>{name}</div>
            <Description className={styles.description} text={description} />
          </div>
          <div className={styles.footer}>
            <div className={styles.numbers}>
              {totalValueOfAllocations !== undefined && percentage !== undefined ? (
                <Fragment>
                  <div className={styles.sum}>{totalValueOfAllocations}</div>
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
                </Fragment>
              ) : (
                <Fragment>Allocation values are not available</Fragment>
              )}
            </div>
            <div>
              <Button
                className={styles.button}
                onClick={event => {
                  event!.preventDefault();
                  onAddRemoveFromAllocate();
                }}
                variant="secondary"
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

import cx from 'classnames';
import React, { FC, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Button from 'components/core/Button/Button';
import Description from 'components/core/Description/Description';
import Img from 'components/core/Img/Img';
import Svg from 'components/core/Svg/Svg';
import env from 'env';
import useIsDonationAboveThreshold from 'hooks/queries/useIsDonationAboveThreshold';
import { ROOT_ROUTES } from 'routes/RootRoutes/routes';
import { tick } from 'svg/misc';
import getFormattedEthValue from 'utils/getFormattedEthValue';

import styles from './ProposalItem.module.scss';
import ProposalItemProps from './types';

const ProposalItem: FC<ProposalItemProps> = ({
  address,
  description,
  isAlreadyAdded,
  isLoadingError,
  landscapeImageCID,
  name,
  onAddRemoveFromAllocate,
  percentage,
  profileImageCID,
  totalValueOfAllocations,
}) => {
  const isDonationAboveThreshold = useIsDonationAboveThreshold(address);
  const { ipfsGateway } = env;
  const navigate = useNavigate();
  const buttonProps = isAlreadyAdded
    ? {
        Icon: <Svg img={tick} size={1.5} />,
        label: 'Added',
      }
    : {
        label: 'Add to Allocate',
      };

  return (
    <div
      className={cx(styles.root, !isLoadingError && styles.isClickable)}
      onClick={
        isLoadingError ? () => {} : () => navigate(`${ROOT_ROUTES.proposal.absolute}/${address}`)
      }
    >
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
            <Description className={styles.description} text={description!} />
          </div>
          <div className={styles.footer}>
            <div className={styles.numbers}>
              {totalValueOfAllocations !== undefined && percentage !== undefined ? (
                <Fragment>
                  <div className={styles.sum}>
                    {getFormattedEthValue(totalValueOfAllocations).fullString}
                  </div>
                  <div
                    className={cx(
                      styles.percentage,
                      isDonationAboveThreshold && styles.isAboveThreshold,
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
                isSmallFont
                onClick={onAddRemoveFromAllocate}
                variant="secondary"
                {...buttonProps}
              />
            </div>
          </div>
        </Fragment>
      )}
    </div>
  );
};

export default ProposalItem;

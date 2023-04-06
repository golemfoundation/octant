import cx from 'classnames';
import React, { FC, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from 'components/core/Button/Button';
import Description from 'components/core/Description/Description';
import Img from 'components/core/Img/Img';
import Svg from 'components/core/Svg/Svg';
import ProposalLoadingStates from 'components/dedicated/ProposalLoadingStates/ProposalLoadingStates';
import env from 'env';
import useIdsInAllocation from 'hooks/helpers/useIdsInAllocation';
import useIsDonationAboveThreshold from 'hooks/helpers/useIsDonationAboveThreshold';
import useProposalsIpfs from 'hooks/queries/useProposalsIpfs';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import { ROOT_ROUTES } from 'routes/RootRoutes/routes';
import useAllocationsStore from 'store/allocations/store';
import { tick } from 'svg/misc';
import getFormattedEthValue from 'utils/getFormattedEthValue';

import styles from './ProposalItem.module.scss';
import ProposalItemProps from './types';

const ProposalItem: FC<ProposalItemProps> = ({
  address,
  className,
  percentage,
  totalValueOfAllocations,
}) => {
  const { ipfsGateway } = env;
  const navigate = useNavigate();
  const { data: userAllocations } = useUserAllocations();
  const { data: allocations, setAllocations } = useAllocationsStore();
  const { data: proposalsIpfs } = useProposalsIpfs([address]);
  const isDonationAboveThreshold = useIsDonationAboveThreshold(address);
  const isAlreadyAdded = allocations!.includes(address);
  const buttonProps = isAlreadyAdded
    ? {
        Icon: <Svg img={tick} size={1.5} />,
        label: 'Added',
      }
    : {
        label: 'Add to Allocate',
      };

  const isLoading = !proposalsIpfs || proposalsIpfs.length === 0;
  const proposal = proposalsIpfs[0] || {};
  const { isLoadingError, landscapeImageCID, profileImageCID, name, description } = proposal;

  const { onAddRemoveFromAllocate } = useIdsInAllocation({
    allocations: allocations!,
    proposalName: name,
    setAllocations,
    userAllocations,
  });

  const isLoadingStates = isLoadingError || isLoading;

  return (
    <div
      className={cx(
        styles.root,
        className,
        !isLoadingStates && styles.isClickable,
        isLoadingStates && styles.isLoadingStates,
      )}
      onClick={
        isLoadingStates ? () => {} : () => navigate(`${ROOT_ROUTES.proposal.absolute}/${address}`)
      }
    >
      {isLoadingStates ? (
        <ProposalLoadingStates isLoading={isLoading} isLoadingError={isLoadingError} />
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
                onClick={() => onAddRemoveFromAllocate(address)}
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

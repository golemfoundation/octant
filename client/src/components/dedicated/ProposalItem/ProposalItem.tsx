import cx from 'classnames';
import React, { FC, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';

import Description from 'components/core/Description/Description';
import Img from 'components/core/Img/Img';
import ButtonAddToAllocate from 'components/dedicated/ButtonAddToAllocate/ButtonAddToAllocate';
import ProposalLoadingStates from 'components/dedicated/ProposalLoadingStates/ProposalLoadingStates';
import ProposalRewards from 'components/dedicated/ProposalRewards/ProposalRewards';
import env from 'env';
import useIdsInAllocation from 'hooks/helpers/useIdsInAllocation';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import { ROOT_ROUTES } from 'routes/RootRoutes/routes';
import useAllocationsStore from 'store/allocations/store';

import styles from './ProposalItem.module.scss';
import ProposalItemProps from './types';

const ProposalItem: FC<ProposalItemProps> = ({
  address,
  className,
  dataTest,
  introDescription,
  isLoadingError,
  name,
  profileImageSmall,
}) => {
  const { ipfsGateway } = env;
  const navigate = useNavigate();
  const { data: userAllocations } = useUserAllocations();
  const { allocations, setAllocations } = useAllocationsStore(state => ({
    allocations: state.data.allocations,
    setAllocations: state.setAllocations,
  }));
  const { data: currentEpoch } = useCurrentEpoch();
  const isAddedToAllocate = allocations!.includes(address);

  const { onAddRemoveFromAllocate } = useIdsInAllocation({
    allocations,
    setAllocations,
    userAllocationsElements: userAllocations?.elements,
  });

  const isAllocatedTo = !!userAllocations?.elements.find(
    ({ address: userAllocationAddress }) => userAllocationAddress === address,
  );
  const isEpoch1 = currentEpoch === 1;

  return (
    <div
      className={cx(
        styles.root,
        className,
        !isLoadingError && styles.isClickable,
        isEpoch1 && styles.isEpoch1,
      )}
      data-test={dataTest}
      onClick={
        isLoadingError
          ? () => {}
          : () => navigate(`${ROOT_ROUTES.proposal.absolute}/${currentEpoch}/${address}`)
      }
    >
      {isLoadingError ? (
        <ProposalLoadingStates isLoadingError={isLoadingError} />
      ) : (
        <Fragment>
          <div className={styles.header}>
            <Img
              className={styles.imageProfile}
              dataTest="ProposalItem__imageProfile"
              src={`${ipfsGateway}${profileImageSmall}`}
            />
            <ButtonAddToAllocate
              className={styles.button}
              dataTest="ProposalItem__ButtonAddToAllocate"
              isAddedToAllocate={isAddedToAllocate}
              isAllocatedTo={isAllocatedTo}
              onClick={() => onAddRemoveFromAllocate(address)}
            />
          </div>
          <div className={styles.body}>
            <div className={styles.name} data-test="ProposalItem__name">
              {name}
            </div>
            <Description
              className={styles.introDescription}
              dataTest="ProposalItem__IntroDescription"
              text={introDescription!}
            />
          </div>
          {!isEpoch1 && <ProposalRewards address={address} className={styles.proposalRewards} />}
        </Fragment>
      )}
    </div>
  );
};

export default ProposalItem;

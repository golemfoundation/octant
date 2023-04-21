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
import useProposalsIpfs from 'hooks/queries/useProposalsIpfs';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import { ROOT_ROUTES } from 'routes/RootRoutes/routes';
import useAllocationsStore from 'store/allocations/store';

import styles from './ProposalItem.module.scss';
import ProposalItemProps from './types';

// TODO To README add format of propsals that need to be in IPFS.
// TODO Animation in the bottom navbar when the number changes.

const ProposalItem: FC<ProposalItemProps> = ({ address, className, totalValueOfAllocations }) => {
  const { ipfsGateway } = env;
  const navigate = useNavigate();
  const { data: userAllocations } = useUserAllocations();
  const { data: allocations, setAllocations } = useAllocationsStore();
  const { data: proposalsIpfs } = useProposalsIpfs([address]);
  const isAlreadyAdded = allocations!.includes(address);

  const isLoading = !proposalsIpfs || proposalsIpfs.length === 0;
  const proposal = proposalsIpfs[0] || {};
  const { isLoadingError, profileImageCID, name, description } = proposal;

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
            <Img className={styles.imageProfile} src={`${ipfsGateway}${profileImageCID}`} />
            <ButtonAddToAllocate
              className={styles.button}
              isAlreadyAdded={isAlreadyAdded}
              onClick={() => onAddRemoveFromAllocate(address)}
            />
          </div>
          <div className={styles.body}>
            <div className={styles.name}>{name}</div>
            <Description className={styles.description} text={description!} />
          </div>
          <ProposalRewards
            className={styles.proposalRewards}
            totalValueOfAllocations={totalValueOfAllocations}
          />
        </Fragment>
      )}
    </div>
  );
};

export default ProposalItem;

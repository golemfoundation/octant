import React, { FC } from 'react';
import { useParams } from 'react-router-dom';

import ProjectListItemButtonsWebsiteAndShare from 'components/Project/ProjectListItemButtonsWebsiteAndShare';
import ButtonAddToAllocate from 'components/shared/ButtonAddToAllocate';
import Img from 'components/ui/Img';
import env from 'env';
import useIdsInAllocation from 'hooks/helpers/useIdsInAllocation';
import useIsAllocatedTo from 'hooks/helpers/useIsAllocatedTo';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import useAllocationsStore from 'store/allocations/store';

import styles from './ProjectListItemHeader.module.scss';
import ProjectListItemHeaderProps from './types';

const ProjectListItemHeader: FC<ProjectListItemHeaderProps> = ({
  address,
  name,
  profileImageSmall,
  website,
  epoch,
}) => {
  const { ipfsGateways } = env;
  const { epoch: epochUrl } = useParams();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: userAllocations } = useUserAllocations(epoch);
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { allocations, addAllocations, removeAllocations } = useAllocationsStore(state => ({
    addAllocations: state.addAllocations,
    allocations: state.data.allocations,
    removeAllocations: state.removeAllocations,
  }));
  const { onAddRemoveFromAllocate } = useIdsInAllocation({
    addAllocations,
    allocations: allocations!,
    isDecisionWindowOpen,
    removeAllocations,
    userAllocationsElements: userAllocations?.elements,
  });

  const epochUrlInt = parseInt(epochUrl!, 10);
  const isArchivedProject =
    epochUrlInt < (isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch!);

  const isAllocatedTo = useIsAllocatedTo(
    address,
    allocations,
    epoch!,
    isDecisionWindowOpen!,
    userAllocations,
  );

  return (
    <div className={styles.root}>
      <Img
        className={styles.imageProfile}
        dataTest="ProjectListItemHeader__Img"
        sources={ipfsGateways.split(',').map(element => `${element}${profileImageSmall}`)}
      />
      <div className={styles.name} data-test="ProjectListItemHeader__name">
        {name}
      </div>
      <div className={styles.wrapper}>
        <ProjectListItemButtonsWebsiteAndShare address={address} name={name} website={website} />
        <ButtonAddToAllocate
          className={styles.buttonAddToAllocate}
          dataTest="ProjectListItemHeader__ButtonAddToAllocate"
          isAddedToAllocate={allocations.includes(address)}
          isAllocatedTo={isAllocatedTo}
          isArchivedProject={isArchivedProject}
          onClick={() => onAddRemoveFromAllocate(address)}
          variant="cta"
        />
      </div>
    </div>
  );
};

export default ProjectListItemHeader;

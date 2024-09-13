import cx from 'classnames';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import ButtonAddToAllocate from 'components/shared/ButtonAddToAllocate';
import Button from 'components/ui/Button';
import Img from 'components/ui/Img';
import Svg from 'components/ui/Svg';
import Tooltip from 'components/ui/Tooltip';
import env from 'env';
import useIdsInAllocation from 'hooks/helpers/useIdsInAllocation';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import { ROOT_ROUTES } from 'routes/RootRoutes/routes';
import useAllocationsStore from 'store/allocations/store';
import { share } from 'svg/misc';

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
  const { i18n } = useTranslation('translation', { keyPrefix: 'views.project' });
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const { epoch: epochUrl } = useParams();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: userAllocations } = useUserAllocations(epoch);
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const isProjectAdminMode = useIsProjectAdminMode();
  const { data: isPatronMode } = useIsPatronMode();
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
  const isAllocatedTo = !!userAllocations?.elements.find(
    ({ address: userAllocationAddress }) => userAllocationAddress === address,
  );

  const showAddToAllocateButton =
    !isProjectAdminMode &&
    !isPatronMode &&
    ((isAllocatedTo && isArchivedProject) || !isArchivedProject);

  const onShareClick = (): boolean | Promise<boolean> => {
    const { origin } = window.location;
    const url = `${origin}${ROOT_ROUTES.project.absolute}/${epochUrl}/${address}`;

    if ((window.navigator.share as any) && !window.navigator.userAgent.includes('Macintosh')) {
      window.navigator.share({
        title: i18n.t('meta.fundrasingOnOctant', {
          projectName: name,
        }),
        url,
      });

      return false;
    }

    return window.navigator.clipboard.writeText(url).then(() => {
      setIsLinkCopied(true);

      setTimeout(() => {
        setIsLinkCopied(false);
      }, 1000);
      return true;
    });
  };

  return (
    <div className={styles.root}>
      <div className={styles.imageProfileWrapper}>
        <Img
          className={styles.imageProfile}
          dataTest="ProjectListItemHeader__Img"
          sources={ipfsGateways.split(',').map(element => `${element}${profileImageSmall}`)}
        />
        <div className={styles.actionsWrapper}>
          <Tooltip
            className={styles.tooltip}
            hideAfterClick
            onClickCallback={onShareClick}
            text={isLinkCopied ? i18n.t('common.copied') : i18n.t('common.copy')}
            variant="small"
          >
            <Svg
              classNameSvg={cx(styles.shareIcon, isLinkCopied && styles.isCopied)}
              img={share}
              size={3.2}
            />
          </Tooltip>
          {showAddToAllocateButton && (
            <ButtonAddToAllocate
              className={styles.buttonAddToAllocate}
              dataTest="ProjectListItemHeader__ButtonAddToAllocate"
              isAddedToAllocate={allocations.includes(address)}
              isAllocatedTo={isAllocatedTo}
              isArchivedProject={isArchivedProject}
              onClick={() => onAddRemoveFromAllocate(address)}
            />
          )}
        </div>
      </div>
      <span className={styles.name} data-test="ProjectListItemHeader__name">
        {name}
      </span>
      <Button
        className={styles.buttonWebsite}
        dataTest="ProjectListItemHeader__Button"
        href={website!.url}
        variant="link5"
      >
        {website!.label || website!.url}
      </Button>
    </div>
  );
};

export default ProjectListItemHeader;

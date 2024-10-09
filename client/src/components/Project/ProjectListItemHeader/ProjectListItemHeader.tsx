import cx from 'classnames';
import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import ButtonAddToAllocate from 'components/shared/ButtonAddToAllocate';
import Img from 'components/ui/Img';
import Svg from 'components/ui/Svg';
import Tooltip from 'components/ui/Tooltip';
import env from 'env';
import useIdsInAllocation from 'hooks/helpers/useIdsInAllocation';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import { ROOT_ROUTES } from 'routes/RootRoutes/routes';
import useAllocationsStore from 'store/allocations/store';
import { arrowTopRight, share } from 'svg/misc';

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
  const { t, i18n } = useTranslation('translation', { keyPrefix: 'views.project' });
  const [isLinkCopied, setIsLinkCopied] = useState(false);
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

  const isAllocatedTo = useMemo(() => {
    const isInUserAllocations = !!userAllocations?.elements.find(
      ({ address: userAllocationAddress }) => userAllocationAddress === address,
    );
    const isInAllocations = allocations.includes(address);
    if (epoch !== undefined) {
      return isInUserAllocations;
    }
    if (isDecisionWindowOpen) {
      return isInUserAllocations && isInAllocations;
    }
    return false;
  }, [address, allocations, userAllocations, epoch, isDecisionWindowOpen]);

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
      <Img
        className={styles.imageProfile}
        dataTest="ProjectListItemHeader__Img"
        sources={ipfsGateways.split(',').map(element => `${element}${profileImageSmall}`)}
      />
      <div className={styles.name} data-test="ProjectListItemHeader__name">
        {name}
      </div>
      <div className={styles.wrapper}>
        <div className={styles.actionButtonsWrapper}>
          <a
            className={cx(styles.element, styles.actionButton, styles.websiteLink)}
            href={website?.url}
            rel="noreferrer"
            target="_blank"
          >
            <span className={styles.labelOrUrl}>{website!.label || website!.url}</span>
            <Svg classNameSvg={styles.arrowTopRightIcon} img={arrowTopRight} size={1} />
          </a>
          <Tooltip
            className={styles.element}
            hideAfterClick
            onClickCallback={onShareClick}
            text={isLinkCopied ? i18n.t('common.copied') : i18n.t('common.copy')}
            variant="small"
          >
            <button className={styles.actionButton} type="button">
              <span>{t('share')}</span>
              <Svg
                classNameSvg={cx(styles.shareIcon, isLinkCopied && styles.isCopied)}
                img={share}
                size={3.2}
              />
            </button>
          </Tooltip>
        </div>
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

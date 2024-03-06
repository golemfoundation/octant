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
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useUserAllocations from 'hooks/queries/useUserAllocations';
import { ROOT_ROUTES } from 'routes/RootRoutes/routes';
import useAllocationsStore from 'store/allocations/store';
import { share } from 'svg/misc';

import styles from './ProposalListItemHeader.module.scss';
import ProposalListItemHeaderProps from './types';

const ProposalListItemHeader: FC<ProposalListItemHeaderProps> = ({
  address,
  name,
  profileImageSmall,
  website,
  epoch,
}) => {
  const { ipfsGateways } = env;
  const { i18n } = useTranslation('translation', { keyPrefix: 'views.proposal' });
  const { epoch: epochUrl } = useParams();
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

  const [isLinkCopied, setIsLinkCopied] = useState(false);

  const isArchivedProposal = epoch !== undefined;
  const isAllocatedTo = !!userAllocations?.elements.find(
    ({ address: userAllocationAddress }) => userAllocationAddress === address,
  );

  const onShareClick = (): boolean | Promise<boolean> => {
    const { origin } = window.location;
    const url = `${origin}${ROOT_ROUTES.proposal.absolute}/${epochUrl}/${address}`;

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
          dataTest="ProposalListItemHeader__Img"
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
          {((isAllocatedTo && isArchivedProposal) || !isArchivedProposal) && (
            <ButtonAddToAllocate
              className={styles.buttonAddToAllocate}
              dataTest="ProposalListItemHeader__ButtonAddToAllocate"
              isAddedToAllocate={allocations.includes(address)}
              isAllocatedTo={isAllocatedTo}
              isArchivedProposal={isArchivedProposal}
              onClick={() => onAddRemoveFromAllocate(address)}
            />
          )}
        </div>
      </div>
      <span className={styles.name} data-test="ProposalListItemHeader__name">
        {name}
      </span>
      <Button
        className={styles.buttonWebsite}
        dataTest="ProposalListItemHeader__Button"
        href={website!.url}
        variant="link5"
      >
        {website!.label || website!.url}
      </Button>
    </div>
  );
};

export default ProposalListItemHeader;

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
  const { ipfsGateway } = env;
  const { i18n } = useTranslation('translation', { keyPrefix: 'views.proposal' });
  const { epoch: epochUrl } = useParams();
  const { data: userAllocations } = useUserAllocations(epoch);
  const { allocations, setAllocations } = useAllocationsStore(state => ({
    allocations: state.data.allocations,
    setAllocations: state.setAllocations,
  }));
  const { onAddRemoveFromAllocate } = useIdsInAllocation({
    allocations: allocations!,
    setAllocations,
    userAllocationsElements: userAllocations?.elements,
  });

  const [isLinkCopied, setIsLinkCopied] = useState(false);

  const isArchivedProposal = epoch !== undefined;

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
          src={`${ipfsGateway}${profileImageSmall}`}
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
          <ButtonAddToAllocate
            className={styles.buttonAddToAllocate}
            dataTest="ProposalListItemHeader__ButtonAddToAllocate"
            isAddedToAllocate={allocations.includes(address)}
            isAllocatedTo={
              !!userAllocations?.elements.find(
                ({ address: userAllocationAddress }) => userAllocationAddress === address,
              )
            }
            isArchivedProposal={isArchivedProposal}
            onClick={() => onAddRemoveFromAllocate(address)}
          />
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

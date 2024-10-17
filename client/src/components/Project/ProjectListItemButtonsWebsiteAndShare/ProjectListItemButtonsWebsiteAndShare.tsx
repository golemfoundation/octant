import cx from 'classnames';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import Svg from 'components/ui/Svg/Svg';
import Tooltip from 'components/ui/Tooltip';
import { ROOT_ROUTES } from 'routes/RootRoutes/routes';
import { arrowTopRight, share } from 'svg/misc';

import styles from './ProjectListItemButtonsWebsiteAndShare.module.scss';
import ProjectListItemButtonsWebsiteAndShareProps from './types';

const ProjectListItemButtonsWebsiteAndShare: FC<ProjectListItemButtonsWebsiteAndShareProps> = ({
  address,
  className,
  name,
  website,
}) => {
  const { t, i18n } = useTranslation('translation', { keyPrefix: 'views.project' });

  const { epoch: epochUrl } = useParams();

  const [isLinkCopied, setIsLinkCopied] = useState(false);

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
    <div className={cx(styles.root, className)}>
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
  );
};

export default ProjectListItemButtonsWebsiteAndShare;

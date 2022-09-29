import React, { FC, Fragment } from 'react';

import Button from 'components/core/button/button.component';

import { ProposalItemProps } from './types';
import styles from './style.module.scss';

const ProposalItem: FC<ProposalItemProps> = ({
  description,
  name,
  socialLinks,
  website,
  isLoadingError,
}) => (
  <div className={styles.root}>
    {isLoadingError ? (
      'Loading of proposal encountered an error.'
    ) : (
      // eslint-disable-next-line react/no-array-index-key
      <Fragment>
        <div>{name}</div>
        <div>{description}</div>
        <div>
          <Button href={website} label="Website" target="_blank" />
        </div>
        <div className={styles.buttons}>
          {socialLinks.map((link, buttonIndex) => (
            // eslint-disable-next-line react/no-array-index-key
            <Button key={buttonIndex} href={link} label="Social link" target="_blank" />
          ))}
        </div>
      </Fragment>
    )}
  </div>
);

export default ProposalItem;

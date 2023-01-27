import React, { ReactElement } from 'react';

import Button from 'components/core/Button/Button';
import Svg from 'components/core/Svg/Svg';
import { DISCORD_INVITE_LINK } from 'constants/social';
import { hexagonEmpty } from 'svg/logo';

import styles from './style.module.scss';

const AllocationEmptyState = (): ReactElement => (
  <div className={styles.root}>
    <Svg classNameSvg={styles.icon} img={hexagonEmpty} size={16.8} />
    <div className={styles.text}>
      You haven’t made any allocations yet.
      <br />
      Need a bit of help getting started?
    </div>
    <Button
      className={styles.buttonDiscord}
      href={DISCORD_INVITE_LINK}
      label="Join us on Discord"
      variant="link2"
    />
  </div>
);

export default AllocationEmptyState;

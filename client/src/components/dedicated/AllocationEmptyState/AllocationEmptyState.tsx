import React, { ReactElement } from 'react';

import allocationEmpty from 'assets/images/allocation/empty.png';
import Button from 'components/core/Button/Button';
import Img from 'components/core/Img/Img';
import { DISCORD_LINK } from 'constants/urls';

import styles from './AllocationEmptyState.module.scss';

const AllocationEmptyState = (): ReactElement => (
  <div className={styles.root}>
    <Img alt="Octant logo blurred" src={allocationEmpty} />
    <div className={styles.text}>
      You haven’t made any allocations yet.
      <br />
      Need a bit of help getting started?
    </div>
    <Button
      className={styles.buttonDiscord}
      href={DISCORD_LINK}
      label="Join us on Discord"
      variant="link2"
    />
  </div>
);

export default AllocationEmptyState;

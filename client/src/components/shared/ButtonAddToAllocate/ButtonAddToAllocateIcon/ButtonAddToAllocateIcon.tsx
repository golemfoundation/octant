import cx from 'classnames';
import React, { forwardRef } from 'react';

import Svg from 'components/ui/Svg';
import { checkMark, heart } from 'svg/misc';

import styles from './ButtonAddToAllocateIcon.module.scss';
import ButtonAddToAllocateIconProps from './types';

const ButtonAddToAllocateIcon = (
  { isDisabled, isAllocatedTo, isArchivedProject, isAddedToAllocate },
  ref,
) => (
  <div
    ref={ref}
    className={cx(
      styles.root,
      isDisabled && styles.isDisabled,
      isArchivedProject && styles.isArchivedProject,
      isAllocatedTo && styles.isAllocatedTo,
      isAddedToAllocate && styles.isAddedToAllocate,
    )}
  >
    <Svg img={isAllocatedTo ? checkMark : heart} size={3.2} />
  </div>
);

export default forwardRef<HTMLDivElement, ButtonAddToAllocateIconProps>(ButtonAddToAllocateIcon);

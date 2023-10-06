import cx from 'classnames';
import React, { FC, useRef, useEffect } from 'react';

import Button from 'components/core/Button/Button';
import Svg from 'components/core/Svg/Svg';
import { IS_INITIAL_LOAD_DONE } from 'constants/dataAttributes';
import { checkMark, heart } from 'svg/misc';

import styles from './ButtonAddToAllocate.module.scss';
import ButtonAddToAllocateProps from './types';

const ButtonAddToAllocate: FC<ButtonAddToAllocateProps> = ({
  className,
  dataTest,
  onClick,
  isAddedToAllocate,
  isAllocatedTo,
  isArchivedProposal,
}) => {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    ref?.current?.setAttribute(IS_INITIAL_LOAD_DONE, 'true');
  }, []);

  return (
    <Button
      ref={ref}
      className={cx(
        styles.root,
        isAddedToAllocate && styles.isAddedToAllocate,
        isAllocatedTo && styles.isAllocatedTo,
        isArchivedProposal && styles.isArchivedProposal,
        className,
      )}
      dataParameters={{
        [IS_INITIAL_LOAD_DONE]: 'false',
      }}
      dataTest={dataTest}
      Icon={<Svg img={isAllocatedTo ? checkMark : heart} size={3.2} />}
      onClick={onClick}
      variant="iconOnly"
    />
  );
};

export default ButtonAddToAllocate;

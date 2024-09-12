import { AnimatePresence, motion } from 'framer-motion';
import React, { FC } from 'react';
import { createPortal } from 'react-dom';

import Button from 'components/ui/Button';
import Svg from 'components/ui/Svg';
import { cross } from 'svg/misc';

import styles from './Drawer.module.scss';
import DrawerProps from './types';

const Drawer: FC<DrawerProps> = ({ children, isOpen, onClose }) =>
  createPortal(
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          animate={{
            x: '0',
          }}
          className={styles.root}
          exit={{ x: '100%' }}
          initial={{ x: '100%' }}
          transition={{ ease: 'easeInOut' }}
        >
          <Button
            className={styles.buttonClose}
            Icon={<Svg img={cross} size={1} />}
            onClick={onClose}
            variant="iconOnly"
          />
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );

export default Drawer;

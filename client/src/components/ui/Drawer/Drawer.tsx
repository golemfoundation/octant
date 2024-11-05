import { AnimatePresence, motion } from 'framer-motion';
import React, { FC, Fragment } from 'react';
import { createPortal } from 'react-dom';

import Button from 'components/ui/Button';
import Svg from 'components/ui/Svg';
import { DRAWER_TRANSITION_TIME } from 'constants/animations';
import { cross } from 'svg/misc';

import styles from './Drawer.module.scss';
import DrawerProps from './types';

const Drawer: FC<DrawerProps> = ({ children, isOpen, onClose, dataTest = 'Drawer' }) =>
  createPortal(
    <Fragment>
      {isOpen && (
        <div className={styles.overlay} onClick={onClose} data-test={`${dataTest}__overlay`} />
      )}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            data-test={dataTest}
            animate={{
              x: '0',
            }}
            className={styles.root}
            exit={{ x: '100%' }}
            initial={{ x: '100%' }}
            transition={{ duration: DRAWER_TRANSITION_TIME, ease: 'easeInOut' }}
          >
            <Button
              dataTest={`${dataTest}__closeButton`}
              className={styles.buttonClose}
              Icon={<Svg img={cross} size={1} />}
              onClick={onClose}
              variant="iconOnly"
            />
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </Fragment>,
    document.body,
  );

export default Drawer;

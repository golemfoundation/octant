import ModalProps from 'components/core/Modal/types';

export type CurrentMode = 'lock' | 'unlock';

export type CurrentStepIndex = 0 | 1 | 2 | 3;

export default interface GlmStakingFlowProps {
  modalProps: Omit<ModalProps, 'children' | 'header'>;
}

import ModalProps from 'components/core/modal/types';

export type CurrentMode = 'deposit' | 'withdraw';

export type CurrentStepIndex = 0 | 1 | 2 | 3;

export default interface GlmStakingFlowProps {
  modalProps: Omit<ModalProps, 'children'>;
}

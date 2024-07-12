import { Id, toast } from 'react-toastify';

import ToastProps from 'components/ui/Toast/types';
import triggerToast from 'utils/triggerToast';

export const TOAST_NAMES = [
  'allocationSuccessful',
  'backendError',
  'changeNetwork',
  'confirmChanges',
  'ipfsError',
  'projectForbiddenOperation',
  'projectLoadingProblem',
  'allocationMultisigInitialSignature',
  'delegationTooManyUniqueAddresses',
] as const;
export type ToastName = (typeof TOAST_NAMES)[number];

interface ShowToast extends ToastProps {
  name: ToastName;
}

const ToastService = () => {
  let toastIds: { [key: string]: Id | undefined } = {};
  const toastsVisibleUntilManuallyHidden: ToastName[] = [
    'confirmChanges',
    'ipfsError',
    'allocationMultisigInitialSignature',
  ];

  const setToastIdValue = (name: ToastName, value: Id | undefined) => {
    toastIds = {
      ...toastIds,
      [name]: value,
    };
  };

  const showToast = ({ name, ...toastProps }: ShowToast): void => {
    if (toastsVisibleUntilManuallyHidden.includes(name) && toastIds[name] !== undefined) {
      return;
    }
    setToastIdValue(
      name,
      triggerToast({
        autoClose: toastsVisibleUntilManuallyHidden.includes(name) ? false : undefined,
        options: {
          onClose: () => {
            setToastIdValue(name, undefined);
          },
        },
        ...toastProps,
      }),
    );
  };

  const hideToast = (name: ToastName): void => {
    if (toastIds[name] === undefined) {
      return;
    }
    toast.dismiss(toastIds[name]);
    setToastIdValue(name, undefined);
  };

  return {
    hideToast,
    showToast,
  };
};

const toastService = ToastService();

export default toastService;

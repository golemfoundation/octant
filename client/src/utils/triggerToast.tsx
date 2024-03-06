import React from 'react';
import { ToastOptions, toast, Id } from 'react-toastify';

import Toast from 'components/ui/Toast';
import ToastProps from 'components/ui/Toast/types';

interface TriggerToast extends ToastProps {
  autoClose?: number | false;
  options?: ToastOptions;
}

export const autoCloseDefault = 5000;

export default function triggerToast({ options, autoClose, ...rest }: TriggerToast): Id {
  return toast(<Toast {...rest} />, {
    autoClose: autoClose ?? autoCloseDefault,
    hideProgressBar: true,
    ...options,
  });
}

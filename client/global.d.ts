import { QueryClient } from '@tanstack/react-query';

import {
  WINDOW_PROJECTS_LOADED_ARCHIVED_EPOCHS_NUMBER,
  WINDOW_PROJECTS_SCROLL_Y,
} from 'constants/window';

export declare global {
  interface Window {
    Cypress?: Cypress.Cypress;
    [WINDOW_PROJECTS_LOADED_ARCHIVED_EPOCHS_NUMBER]?: number;
    [WINDOW_PROJECTS_SCROLL_Y]?: number;
    clientReactQuery?: QueryClient;
    timeToIncrease?: number;
  }
}

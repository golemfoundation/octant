import { QueryClient } from '@tanstack/react-query';

export declare global {
  interface Window {
    Cypress?: Cypress.Cypress;
    clientReactQuery?: QueryClient;
  }
}

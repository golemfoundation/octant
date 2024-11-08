import { synpressCommandsForMetaMask } from '@synthetixio/synpress/cypress/support';
import 'cypress-real-events';

Cypress.on('uncaught:exception', () => {
  // failing the test
  return false;
});

synpressCommandsForMetaMask();

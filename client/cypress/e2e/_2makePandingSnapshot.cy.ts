import axios from 'axios';

import { mockCoinPricesServer, visitWithLoader } from 'cypress/utils/e2e';
import { IS_ONBOARDING_ALWAYS_VISIBLE, IS_ONBOARDING_DONE } from 'src/constants/localStorageKeys';
import env from 'src/env';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

// In E2E snapshotter is disabled. Before the first test can be run, pending snapshot needs to be done.
describe('Make pending snapshot', () => {
  before(() => {
    /**
     * Global Metamask setup done by Synpress is not always done.
     * Since Synpress needs to have valid provider to fetch the data from contracts,
     * setupMetamask is required in each test suite.
     */
    cy.setupMetamask();
  });

  beforeEach(() => {
    cy.disconnectMetamaskWalletFromAllDapps();
    mockCoinPricesServer();
    localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
    localStorage.setItem(IS_ONBOARDING_DONE, 'true');
    visitWithLoader(ROOT_ROUTES.earn.absolute);
  });

  it('make pending snapshot', () => {
    cy.window().then(async () => {
      await axios.post(`${env.serverEndpoint}snapshots/pending`);
      cy.get('[data-test=SyncView]', { timeout: 60000 }).should('not.exist');
    });
  });
});

import { mockCoinPricesServer, visitWithLoader } from 'cypress/utils/e2e';
import { mutateAsyncMakeSnapshot } from 'cypress/utils/moveTime';
import {
  HAS_ONBOARDING_BEEN_CLOSED,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
} from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

// In E2E snapshotter is disabled. Before the first test can be run, pending snapshot needs to be done.
describe('Make pending snapshot', () => {
  before(() => {
    /**
     * Global Metamask setup done by Synpress is not always done.
     * Since Synpress needs to have valid provider to fetch the data from contracts,
     * setupMetamask is required in each test suite.
     */
    // cy.setupMetamask();
  });

  beforeEach(() => {
    cy.disconnectMetamaskWalletFromAllDapps();
    mockCoinPricesServer();
    localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
    localStorage.setItem(IS_ONBOARDING_DONE, 'true');
    localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, 'true');
    visitWithLoader(ROOT_ROUTES.playground.absolute);
  });

  it('make pending snapshot', () => {
    cy.window().then(async win => {
      cy.wrap(null).then(() => {
        return mutateAsyncMakeSnapshot(win, 'pending').then(str => {
          expect(str).to.eq(true);
        });
      });
      cy.get('[data-test=SyncView]', { timeout: 60000 }).should('not.exist');
      cy.wait(5000);
    });
  });
});

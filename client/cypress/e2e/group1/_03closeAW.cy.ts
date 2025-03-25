import { moveTime, setupAndMoveToPlayground } from 'cypress/utils/moveTime';
import { QUERY_KEYS } from 'src/api/queryKeys';

describe('move time - AW IS CLOSED', () => {
  before(() => {
    /**
     * Global Metamask setup done by Synpress is not always done.
     * Since Synpress needs to have valid provider to fetch the data from contracts,
     * setupMetamask is required in each test suite.
     */
    // cy.setupMetamask();
  });

  it('allocation window is closed, when it is not, move time', () => {
    setupAndMoveToPlayground();

    cy.window().then(async win => {
      moveTime(win, 'nextEpochDecisionWindowClosed').then(() => {
        cy.get('[data-test=PlaygroundView]').should('be.visible');
        const isDecisionWindowOpenAfter = win.clientReactQuery.getQueryData(
          QUERY_KEYS.isDecisionWindowOpen,
        );
        expect(isDecisionWindowOpenAfter).to.be.false;
      });
    });
  });
});

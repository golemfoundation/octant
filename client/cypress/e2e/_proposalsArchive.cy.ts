import { checkLocationWithLoader, moveToNextEpoch, visitWithLoader } from 'cypress/utils/e2e';
// import viewports from 'cypress/utils/viewports';
import { IS_ONBOARDING_ALWAYS_VISIBLE, IS_ONBOARDING_DONE } from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

describe('move to the next epoch', () => {
  it('moves to the next epoch', () => {
    // visitWithLoader(ROOT_ROUTES.proposals.absolute);
    // @ts-expect-error
    cy.log('window.jsonRpcEndpoint:', window.jsonRpcEndpoint);
    // @ts-expect-error
    cy.log('window.cyEnv:', JSON.stringify(window.cyEnv));
    cy.wrap(null, { timeout: 60000 }).then(() => {
      return moveToNextEpoch().then(isEpochChanged => {
        expect(isEpochChanged).to.be.true;
      });
    });
  });
});

// Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight }) => {
describe(`proposals archive:`, () => { // ${device}`, { viewportHeight, viewportWidth },
  beforeEach(() => {
    localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
    localStorage.setItem(IS_ONBOARDING_DONE, 'true');
    visitWithLoader(ROOT_ROUTES.proposals.absolute);
  });

  it('renders archive elements + clicking on epoch archive ProposalsListItem opens ProposalView for particular epoch and project', () => {
    cy.get('[data-test=MainLayout__body]').then(el => {
      const mainLayoutPaddingTop = parseInt(el.css('paddingTop'), 10);

      cy.get('[data-test=ProposalsView__ProposalsList]')
        .should('be.visible')
        .children()
        .then(children => {
          children[children.length - 1].scrollIntoView();
          cy.window().then(window => window.scrollTo(0, window.scrollY - mainLayoutPaddingTop));
          // header test
          cy.get('[data-test=ProposalsView__ProposalsList__header--archive]').should('be.visible');

          // list test
          cy.get('[data-test=ProposalsView__ProposalsList--archive]')
            .first()
            .should('be.visible')
            .children()
            .then(childrenArchive => {
              const numberOfArchivedProposals = childrenArchive.length - 2; // archived proposals tiles - (header + divider)[2]

              for (let i = 0; i < numberOfArchivedProposals; i++) {
                cy.get(`[data-test=ProposalsView__ProposalsListItem--archive--${i}]`)
                  .first()
                  .scrollIntoView();
                cy.window().then(window =>
                  window.scrollTo(0, window.scrollY - mainLayoutPaddingTop),
                );
                // list item test
                cy.get(`[data-test=ProposalsView__ProposalsListItem--archive--${i}]`)
                  .first()
                  .should('be.visible')
                  .within(() => {
                    // rewards test
                    cy.get('[data-test=ProposalRewards]').should('be.visible');
                  });

                if (numberOfArchivedProposals - 1) {
                  cy.get('[data-test=ProposalsViem__Loader--archive]').should('not.exist');
                  cy.get('[data-test=ProposalsView__ProposalsList--archive]')
                    .first()
                    .should('have.length', 1);
                }

                cy.get(`[data-test=ProposalsView__ProposalsListItem--archive--${i}]`)
                  .first()
                  .invoke('data', 'address')
                  .then(address => {
                    cy.get(`[data-test=ProposalsView__ProposalsListItem--archive--${i}]`)
                      .first()
                      .invoke('data', 'epoch')
                      .then(epoch => {
                        cy.get(`[data-test=ProposalsView__ProposalsListItem--archive--${i}]`)
                          .first()
                          .click();
                        checkLocationWithLoader(
                          `${ROOT_ROUTES.proposal.absolute}/${epoch}/${address}`,
                        );
                        cy.go('back');
                        checkLocationWithLoader(ROOT_ROUTES.proposals.absolute);
                      });
                  });
              }
            });
        });
    });
  });
});
// });

import {
  checkLocationWithLoader,
  visitWithLoader,
  checkProjectsViewLoaded,
} from 'cypress/utils/e2e';
import { moveTime } from 'cypress/utils/moveTime';
import viewports from 'cypress/utils/viewports';
import { QUERY_KEYS } from 'src/api/queryKeys';
import {
  HAS_ONBOARDING_BEEN_CLOSED,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
} from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

let wasEpochMoved = false;

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight }) => {
  describe(`projects archive: ${device}`, { viewportHeight, viewportWidth }, () => {
    beforeEach(() => {
      localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
      localStorage.setItem(IS_ONBOARDING_DONE, 'true');
      localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, 'true');
      visitWithLoader(ROOT_ROUTES.projects.absolute);
    });

    it('moves to the next epoch', () => {
      // Move time only once, for the first device.
      if (!wasEpochMoved) {
        cy.window().then(async win => {
          const currentEpochBefore = Number(
            win.clientReactQuery.getQueryData(QUERY_KEYS.currentEpoch),
          );

          cy.wrap(null).then(() => {
            return moveTime(win, 'nextEpochDecisionWindowClosed').then(() => {
              const currentEpochAfter = Number(
                win.clientReactQuery.getQueryData(QUERY_KEYS.currentEpoch),
              );
              wasEpochMoved = true;
              expect(currentEpochBefore + 1).to.eq(currentEpochAfter);
            });
          });
        });
      } else {
        expect(true).to.be.true;
      }
    });

    it('renders archive elements + clicking on epoch archive ProjectsListItem opens ProjectView for particular epoch and project', () => {
      cy.get('[data-test=MainLayout__body]').then(el => {
        const mainLayoutPaddingTop = parseInt(el.css('paddingTop'), 10);

        checkProjectsViewLoaded();
        cy.get('[data-test=ProjectsView__ProjectsList]')
          .should('be.visible')
          .children()
          .then(children => {
            children[children.length - 1].scrollIntoView();
            cy.window().then(window => window.scrollTo(0, window.scrollY - mainLayoutPaddingTop));
            cy.wait(1000);
            // header test
            cy.get('[data-test=ProjectsView__ProjectsList__header--archive]').should('be.visible');

            // list test
            cy.get('[data-test=ProjectsView__ProjectsList--archive]').first().should('be.visible');
            checkProjectsViewLoaded();
            cy.get('[data-test=ProjectsView__ProjectsList--archive]')
              .first()
              .children()
              .then(childrenArchive => {
                const numberOfArchivedProjects = childrenArchive.length - 2; // archived projects tiles - (header + divider)[2]
                for (let i = 0; i < numberOfArchivedProjects; i++) {
                  cy.get(`[data-test=ProjectsView__ProjectsListItem--archive--${i}]`)
                    .first()
                    .scrollIntoView();
                  cy.window().then(window =>
                    window.scrollTo(0, window.scrollY - mainLayoutPaddingTop),
                  );
                  // list item test
                  cy.get(`[data-test=ProjectsView__ProjectsListItem--archive--${i}]`)
                    .first()
                    .should('be.visible')
                    .within(() => {
                      // rewards test
                      cy.get('[data-test=ProjectRewards]').should('be.visible');
                    });

                  if (numberOfArchivedProjects - 1) {
                    cy.get('[data-test=ProjectsView__ProjectsList--archive]')
                      .first()
                      .should('have.length', 1);
                  }

                  checkProjectsViewLoaded();
                  cy.get(`[data-test=ProjectsView__ProjectsListItem--archive--${i}]`)
                    .first()
                    .invoke('data', 'address')
                    .then(address => {
                      cy.get(`[data-test=ProjectsView__ProjectsListItem--archive--${i}]`)
                        .first()
                        .invoke('data', 'epoch')
                        .then(epoch => {
                          cy.get(`[data-test=ProjectsView__ProjectsListItem--archive--${i}]`)
                            .first()
                            .click();
                          checkLocationWithLoader(
                            `${ROOT_ROUTES.project.absolute}/${epoch}/${address}`,
                          );
                          cy.go('back');
                          checkLocationWithLoader(ROOT_ROUTES.projects.absolute);
                        });
                    });
                }
              });
          });
      });
    });
  });
});

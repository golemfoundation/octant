import { connectWallet, mockCoinPricesServer, visitWithLoader } from 'cypress/utils/e2e';
import { getNamesOfProjects } from 'cypress/utils/projects';
import viewports from 'cypress/utils/viewports';
import { IS_ONBOARDING_DONE } from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

import Chainable = Cypress.Chainable;

const getButtonAddToAllocate = (): Chainable<any> => {
  const projectListItemFirst = cy.get('[data-test=ProjectListItem').first();

  return projectListItemFirst.find('[data-test=ProjectListItemHeader__ButtonAddToAllocate]');
};

const checkProjectItemElements = (): Chainable<any> => {
  cy.get('[data-test^=ProjectsView__ProjectsListItem').first().click();
  const projectListItemFirst = cy.get('[data-test=ProjectListItem').first();
  projectListItemFirst.get('[data-test=ProjectListItemHeader__Img]').should('be.visible');
  projectListItemFirst.get('[data-test=ProjectListItemHeader__name]').should('be.visible');
  getButtonAddToAllocate().should('be.visible');
  projectListItemFirst.get('[data-test=ProjectListItemHeader__Button]').should('be.visible');
  projectListItemFirst.get('[data-test=ProjectListItem__Description]').should('be.visible');

  cy.get('[data-test=ProjectListItem__Donors]')
    .first()
    .scrollIntoView({ offset: { left: 0, top: 100 } });

  cy.get('[data-test=ProjectListItem__Donors]').first().should('be.visible');
  cy.get('[data-test=ProjectListItem__Donors__DonorsHeader__count]')
    .first()
    .should('be.visible')
    .should('have.text', '0');
  return cy.get('[data-test=ProjectListItem__Donors__noDonationsYet]').first().should('be.visible');
};

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight }) => {
  describe(`project: ${device}`, { viewportHeight, viewportWidth }, () => {
    let projectNames: string[] = [];

    beforeEach(() => {
      mockCoinPricesServer();
      localStorage.setItem(IS_ONBOARDING_DONE, 'true');
      visitWithLoader(ROOT_ROUTES.projects.absolute);
      cy.get('[data-test^=ProjectItemSkeleton').should('not.exist');

      /**
       * This could be done in before hook, but CY wipes the state after each test
       * (could be disabled, but creates other problems)
       */
      if (projectNames.length === 0) {
        projectNames = getNamesOfProjects();
      }
    });

    it('entering project view directly renders content', () => {
      cy.get('[data-test^=ProjectsView__ProjectsListItem').first().click();
      cy.reload();
      const projectListItemFirst = cy.get('[data-test=ProjectListItem').first();
      projectListItemFirst.get('[data-test=ProjectListItemHeader__Img]').should('be.visible');
      projectListItemFirst.get('[data-test=ProjectListItemHeader__name]').should('be.visible');
    });

    it('entering project view renders all its elements', () => {
      checkProjectItemElements();
    });

    it('entering project view renders all its elements with fallback IPFS provider', () => {
      cy.intercept('GET', '**/ipfs/**', req => {
        if (req.url.includes('infura')) {
          req.destroy();
        }
      });

      checkProjectItemElements();
    });

    it('entering project view shows Toast with info about IPFS failure when all providers fail', () => {
      cy.intercept('GET', '**/ipfs/**', req => {
        req.destroy();
      });

      cy.get('[data-test=Toast--ipfsMessage').should('be.visible');
    });

    it('entering project view allows to add it to allocation and remove, triggering change of the icon, change of the number in navbar', () => {
      cy.get('[data-test^=ProjectsView__ProjectsListItem').first().click();

      getButtonAddToAllocate().click();

      // cy.get('@buttonAddToAllocate').click();
      cy.get('[data-test=Navbar__numberOfAllocations]').contains(1);
      getButtonAddToAllocate().click();
      cy.get('[data-test=Navbar__numberOfAllocations]').should('not.exist');
    });

    it('Entering project view allows scroll only to the last project', () => {
      cy.get('[data-test^=ProjectsView__ProjectsListItem]').first().click();

      for (let i = 0; i < projectNames.length; i++) {
        cy.get('[data-test=ProjectListItem]').should(
          'have.length.greaterThan',
          i === projectNames.length - 1 ? projectNames.length - 1 : i,
        );
        cy.get('[data-test=ProjectListItemHeader__name]')
          .eq(i)
          .scrollIntoView({ offset: { left: 0, top: -150 } })
          .contains(projectNames[i]);
        cy.get('[data-test=ProjectListItem__Donors]')
          .eq(i)
          .scrollIntoView({ offset: { left: 0, top: -150 } })
          .should('be.visible');
      }
    });

    it('"Back to top" button is displayed if the user has scrolled past the start of the final project description', () => {
      cy.get('[data-test^=ProjectsView__ProjectsListItem]').first().click();

      for (let i = 0; i < projectNames.length - 1; i++) {
        cy.get('[data-test=ProjectListItem__Donors]')
          .eq(i)
          .scrollIntoView({ offset: { left: 0, top: 100 } });

        if (i === projectNames.length - 1) {
          cy.get('[data-test=ProjectBackToTopButton__Button]').should('be.visible');
        }
      }
    });

    it('Clicking on "Back to top" button scrolls to the top of view (first project is visible)', () => {
      cy.get('[data-test^=ProjectsView__ProjectsListItem]').first().click();

      for (let i = 0; i < projectNames.length - 1; i++) {
        cy.get('[data-test=ProjectListItem__Donors]')
          .eq(i)
          .scrollIntoView({ offset: { left: 0, top: 100 } });

        if (i === projectNames.length - 1) {
          cy.get('[data-test=ProjectBackToTopButton__Button]').click();
          cy.get('[data-test=ProjectListItem]').eq(0).should('be.visible');
        }
      }
    });
  });

  describe(`project (patron mode): ${device}`, { viewportHeight, viewportWidth }, () => {
    let projectNames: string[] = [];

    before(() => {
      /**
       * Global Metamask setup done by Synpress is not always done.
       * Since Synpress needs to have valid provider to fetch the data from contracts,
       * setupMetamask is required in each test suite.
       */
      cy.setupMetamask();
    });

    beforeEach(() => {
      mockCoinPricesServer();
      localStorage.setItem(IS_ONBOARDING_DONE, 'true');
      visitWithLoader(ROOT_ROUTES.projects.absolute);
      connectWallet(true, true);
      cy.get('[data-test^=ProjectItemSkeleton').should('not.exist');

      /**
       * This could be done in before hook, but CY wipes the state after each test
       * (could be disabled, but creates other problems)
       */
      if (projectNames.length === 0) {
        projectNames = getNamesOfProjects();
      }
    });

    it('button "add to allocate" is disabled', () => {
      for (let i = 0; i < projectNames.length; i++) {
        cy.get('[data-test^=ProjectsView__ProjectsListItem]').eq(i).click();
        getButtonAddToAllocate().should('be.visible').should('be.disabled');
        cy.go('back');
      }
    });
  });
});

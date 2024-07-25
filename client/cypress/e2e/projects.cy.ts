// eslint-disable-next-line import/no-extraneous-dependencies
import chaiColors from 'chai-colors';

import {
  connectWallet,
  mockCoinPricesServer,
  visitWithLoader,
  navigateWithCheck,
  checkProjectsViewLoaded,
  changeMainValueToFiat,
} from 'cypress/utils/e2e';
import { getNamesOfProjects } from 'cypress/utils/projects';
import viewports from 'cypress/utils/viewports';
import {
  HAS_ONBOARDING_BEEN_CLOSED,
  IS_CRYPTO_MAIN_VALUE_DISPLAY,
  IS_ONBOARDING_DONE,
} from 'src/constants/localStorageKeys';
import getMilestones from 'src/constants/milestones';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

import Chainable = Cypress.Chainable;

chai.use(chaiColors);

function checkProjectItemElements(index, name, isPatronMode = false): Chainable<any> {
  cy.get('[data-test^=ProjectsView__ProjectsListItem')
    .eq(index)
    .find('[data-test=ProjectsListItem__imageProfile]')
    .should('be.visible');
  cy.get('[data-test^=ProjectsView__ProjectsListItem]')
    .eq(index)
    .should('be.visible')
    .find('[data-test=ProjectsListItem__name]')
    .should('be.visible')
    .contains(name);
  cy.get('[data-test^=ProjectsView__ProjectsListItem')
    .eq(index)
    .find('[data-test=ProjectsListItem__IntroDescription]')
    .should('be.visible');
  cy.get('[data-test^=ProjectsView__ProjectsListItem')
    .eq(index)
    .find('[data-test=ProjectsListItem__ButtonAddToAllocate]')
    .should('be.visible');

  if (isPatronMode) {
    cy.get('[data-test^=ProjectsView__ProjectsListItem')
      .eq(index)
      .find('[data-test=ProjectsListItem__ButtonAddToAllocate]')
      .should('be.disabled');
  }

  return cy
    .get('[data-test^=ProjectsView__ProjectsListItem')
    .eq(index)
    .find('[data-test=ProjectRewards]')
    .should('be.visible');
  // TODO OCT-663 Make CY check if rewards are available (Epoch 2, decision window open).
  // return cy
  //   .get('[data-test^=ProjectsView__ProjectsListItem')
  //   .eq(index)
  //   .find('[data-test=ProjectRewards__currentTotal__label]')
  //   .should('be.visible');
}

function addProjectToAllocate(index, numberOfAddedProjects): Chainable<any> {
  cy.get('[data-test^=ProjectsView__ProjectsListItem')
    .eq(index)
    .find('[data-test=ProjectsListItem__imageProfile]')
    .should('be.visible');
  cy.get('[data-test^=ProjectsView__ProjectsListItem')
    .eq(index)
    .find('[data-test=ProjectsListItem__IntroDescription]')
    .should('be.visible');
  cy.get('[data-test^=ProjectsView__ProjectsListItem')
    .eq(index)
    .find('[data-test=ProjectsListItem__ButtonAddToAllocate]')
    .scrollIntoView();
  cy.get('[data-test^=ProjectsView__ProjectsListItem')
    .eq(index)
    .find('[data-test=ProjectsListItem__ButtonAddToAllocate]')
    .click();
  cy.get('[data-test^=ProjectsView__ProjectsListItem')
    .eq(index)
    .find('[data-test=ProjectsListItem__ButtonAddToAllocate]')
    .find('svg')
    .find('path')
    .then($el => $el.css('fill'))
    .should('be.colored', '#FF6157');
  cy.get('[data-test^=ProjectsView__ProjectsListItem')
    .eq(index)
    .find('[data-test=ProjectsListItem__ButtonAddToAllocate]')
    .find('svg')
    .find('path')
    .then($el => $el.css('stroke'))
    .should('be.colored', '#FF6157');
  cy.get('[data-test=Navbar__numberOfAllocations]').contains(numberOfAddedProjects + 1);
  navigateWithCheck(ROOT_ROUTES.allocation.absolute);
  cy.get('[data-test=AllocationItem]').should('have.length', numberOfAddedProjects + 1);
  return cy.go('back');
}

function removeProjectFromAllocate(numberOfProjects, numberOfAddedProjects, index): Chainable<any> {
  cy.get('[data-test^=ProjectsView__ProjectsListItem')
    .eq(index)
    .find('[data-test=ProjectsListItem__ButtonAddToAllocate]')
    .scrollIntoView();
  cy.get('[data-test^=ProjectsView__ProjectsListItem')
    .eq(index)
    .find('[data-test=ProjectsListItem__ButtonAddToAllocate]')
    .click();
  navigateWithCheck(ROOT_ROUTES.allocation.absolute);
  cy.get('[data-test=AllocationItem]').should('have.length', numberOfAddedProjects - 1);
  if (index < numberOfProjects - 1) {
    cy.get('[data-test=Navbar__numberOfAllocations]').contains(numberOfAddedProjects - 1);
  } else {
    cy.get('[data-test=Navbar__numberOfAllocations]').should('not.exist');
  }
  return cy.go('back');
}

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight }) => {
  describe(`projects: ${device}`, { viewportHeight, viewportWidth }, () => {
    let projectNames: string[] = [];

    beforeEach(() => {
      mockCoinPricesServer();
      localStorage.setItem(IS_ONBOARDING_DONE, 'true');
      localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, 'true');
      visitWithLoader(ROOT_ROUTES.projects.absolute);
      checkProjectsViewLoaded();

      /**
       * This could be done in before hook, but CY wipes the state after each test
       * (could be disabled, but creates other problems)
       */
      if (projectNames.length === 0) {
        projectNames = getNamesOfProjects();
      }
    });

    it('user is able to see all the projects in the view', () => {
      for (let i = 0; i < projectNames.length; i++) {
        cy.get('[data-test^=ProjectsView__ProjectsListItem]').eq(i).scrollIntoView();
        checkProjectItemElements(i, projectNames[i]);
      }
    });

    it('user is able to add & remove the first and the last project to/from allocation, triggering change of the icon, change of the number in navbar', () => {
      // This test checks the first and the last elements only to save time.
      cy.get('[data-test=Navbar__numberOfAllocations]').should('not.exist');

      addProjectToAllocate(0, 0);
      addProjectToAllocate(projectNames.length - 1, 1);
      removeProjectFromAllocate(projectNames.length, 2, 0);
      removeProjectFromAllocate(projectNames.length, 1, projectNames.length - 1);
    });

    it('user is able to add project to allocation in ProjectsView and remove it from allocation in AllocationView', () => {
      cy.get('[data-test=Navbar__numberOfAllocations]').should('not.exist');
      addProjectToAllocate(0, 0);
      navigateWithCheck(ROOT_ROUTES.allocation.absolute);
      cy.get('[data-test=AllocationItemSkeleton]').should('not.exist');
      cy.get('[data-test=AllocationItem]').then(el => {
        const { x } = el[0].getBoundingClientRect();
        cy.get('[data-test=AllocationItem]')
          .trigger('pointerdown')
          .trigger('pointermove', { pageX: x - 20 })
          .trigger('pointerup', { pageX: x - 40 });
        cy.wait(500);
        cy.get('[data-test=AllocationItem__removeButton]').should('be.visible');
        cy.get('[data-test=AllocationItem__removeButton]').click();
        cy.get('[data-test=AllocationItem__removeButton]').should('not.exist');
        cy.get('[data-test=AllocationItem]').should('not.exist');
        cy.get('[data-test=Navbar__numberOfAllocations]').should('not.exist');
      });
    });

    it('ProjectsTimelineWidgetItem with href opens link when clicked without mouse movement', () => {
      const milestones = getMilestones();
      cy.get('[data-test=ProjectsTimelineWidget]').should('be.visible');
      cy.get('[data-test=ProjectsTimelineWidgetItem]').should('have.length', milestones.length);
      for (let i = 0; i < milestones.length; i++) {
        if (milestones[i].href) {
          cy.get('[data-test=ProjectsTimelineWidgetItem]')
            .eq(i)
            .within(() => {
              cy.get('[data-test=ProjectsTimelineWidgetItem__Svg--arrowTopRight]').should(
                'be.visible',
              );
            });

          cy.get('[data-test=ProjectsTimelineWidgetItem]')
            .eq(i)
            .then(el => {
              const { x } = el[0].getBoundingClientRect();
              cy.get('[data-test=ProjectsTimelineWidgetItem]')
                .eq(i)
                .trigger('mousedown')
                .trigger('mouseup', { clientX: x + 10 });
              cy.location('pathname').should('eq', ROOT_ROUTES.projects.absolute);

              cy.get('[data-test=ProjectsTimelineWidgetItem]')
                .eq(i)
                .trigger('mousedown')
                .trigger('mouseup');
              cy.location('pathname').should('not.eq', ROOT_ROUTES.projects.absolute);
            });
        }
      }
    });

    it(`shows current total (${IS_CRYPTO_MAIN_VALUE_DISPLAY}: true)`, () => {
      cy.get('[data-test=ProjectRewards__currentTotal__number]')
        .first()
        .invoke('text')
        .should('eq', '0 ETH');
    });

    it(`shows current total (${IS_CRYPTO_MAIN_VALUE_DISPLAY}: false)`, () => {
      changeMainValueToFiat(ROOT_ROUTES.projects.absolute);

      cy.get('[data-test=ProjectRewards__currentTotal__number]')
        .first()
        .invoke('text')
        .should('eq', '$0.00');
    });

    it('search field -- results should show project', () => {
      cy.get('[data-test=ProjectsList__InputText]').clear().type(projectNames[0]);
      cy.get('[data-test=ProjectsView__ProjectsList]')
        .find('[data-test^=ProjectsView__ProjectsListItem]')
        .should('have.length', 1);
    });

    it('search field -- no results should show no results image & text', () => {
      cy.get('[data-test=ProjectsList__InputText]')
        .clear()
        .type('there-is-no-way-there-will-ever-be-a-project-with-such-a-name');
      cy.get('[data-test=ProjectsList__noSearchResults]').should('be.visible');
      cy.get('[data-test=ProjectsList__noSearchResults__Img]').should('be.visible');
    });
  });

  describe(`projects (patron mode): ${device}`, { viewportHeight, viewportWidth }, () => {
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
      localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, 'true');
      visitWithLoader(ROOT_ROUTES.projects.absolute);
      connectWallet({ isPatronModeEnabled: true, isTOSAccepted: true });
      checkProjectsViewLoaded();
      /**
       * This could be done in before hook, but CY wipes the state after each test
       * (could be disabled, but creates other problems)
       */
      if (projectNames.length === 0) {
        projectNames = getNamesOfProjects();
      }
    });

    after(() => {
      cy.disconnectMetamaskWalletFromAllDapps();
    });

    it('button "add to allocate" is disabled', () => {
      for (let i = 0; i < projectNames.length; i++) {
        cy.get('[data-test^=ProjectsView__ProjectsListItem]').eq(i).scrollIntoView();
        checkProjectItemElements(i, projectNames[i], true);
      }
    });
  });
});

// eslint-disable-next-line import/no-extraneous-dependencies
import chaiColors from 'chai-colors';

import {
  connectWallet,
  mockCoinPricesServer,
  visitWithLoader,
  checkProjectsViewLoaded,
  getHeartedProjectsIndicator,
  changeMainValueToCryptoToggle,
} from 'cypress/utils/e2e';
import { getNamesOfProjects } from 'cypress/utils/projects';
import viewports from 'cypress/utils/viewports';
import { QUERY_KEYS } from 'src/api/queryKeys';
import {
  HAS_ONBOARDING_BEEN_CLOSED,
  IS_CRYPTO_MAIN_VALUE_DISPLAY,
  IS_ONBOARDING_DONE,
} from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';
import { ORDER_OPTIONS } from 'src/views/ProjectsView/utils';

import Chainable = Cypress.Chainable;

chai.use(chaiColors);

function checkProjectItemElements(
  index: number,
  name: string,
  isPatronMode = false,
): Chainable<any> {
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
      .should('not.exist');
  } else {
    cy.get('[data-test^=ProjectsView__ProjectsListItem')
      .eq(index)
      .find('[data-test=ProjectsListItem__ButtonAddToAllocate]')
      .should('be.visible');
  }

  return cy
    .get('[data-test^=ProjectsView__ProjectsListItem')
    .eq(index)
    .find('[data-test=ProjectRewards]')
    .should('be.visible');
}

function addProjectToAllocate(
  index: number,
  numberOfAddedProjects: number,
  isNavbarVisible: boolean,
): Chainable<any> {
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
  getHeartedProjectsIndicator(isNavbarVisible).contains(numberOfAddedProjects + 1);

  if (isNavbarVisible) {
    visitWithLoader(
      ROOT_ROUTES.allocation.absolute,
      isNavbarVisible ? ROOT_ROUTES.allocation.absolute : ROOT_ROUTES.home.absolute,
    );
    cy.get('[data-test=AllocationView]').should('be.visible');
  } else {
    cy.get('[data-test=LayoutTopBar__allocationButton]').click();
    cy.get('[data-test=AllocationDrawer]').should('be.visible');
  }
  cy.get('[data-test=AllocationItem]').should('have.length', numberOfAddedProjects + 1);

  return isNavbarVisible
    ? cy.go('back')
    : cy.get('[data-test=AllocationDrawer__closeButton]').click();
}

function removeProjectFromAllocate(
  numberOfProjects: number,
  numberOfAddedProjects: number,
  index: number,
  isNavbarVisible: boolean,
): Chainable<any> {
  cy.get('[data-test^=ProjectsView__ProjectsListItem')
    .eq(index)
    .find('[data-test=ProjectsListItem__ButtonAddToAllocate]')
    .scrollIntoView();
  cy.get('[data-test^=ProjectsView__ProjectsListItem')
    .eq(index)
    .find('[data-test=ProjectsListItem__ButtonAddToAllocate]')
    .click();
  if (isNavbarVisible) {
    visitWithLoader(
      ROOT_ROUTES.allocation.absolute,
      isNavbarVisible ? ROOT_ROUTES.allocation.absolute : ROOT_ROUTES.home.absolute,
    );
    cy.get('[data-test=AllocationView]').should('be.visible');
  } else {
    cy.get('[data-test=LayoutTopBar__allocationButton]').click();
    cy.get('[data-test=AllocationDrawer]').should('be.visible');
  }
  cy.get('[data-test=AllocationItem]').should('have.length', numberOfAddedProjects - 1);
  if (index < numberOfProjects - 1) {
    getHeartedProjectsIndicator(isNavbarVisible).contains(numberOfAddedProjects - 1);
  } else {
    getHeartedProjectsIndicator(isNavbarVisible).should('not.exist');
  }

  return isNavbarVisible
    ? cy.go('back')
    : cy.get('[data-test=AllocationDrawer__closeButton]').click();
}

Object.values(viewports).forEach(
  ({ device, viewportWidth, viewportHeight, isMobile, isTablet }) => {
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
         * (could be disabled, but creates other problems).
         *
         * Needs to be done for each test, because each has different default "random" order for projects.
         */
        projectNames = getNamesOfProjects();
      });

      it('header is visible', () => {
        cy.get('[data-test^=ProjectsView__ViewTitle]').should('be.visible');
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

        addProjectToAllocate(0, 0, isMobile || isTablet);
        addProjectToAllocate(projectNames.length - 1, 1, isMobile || isTablet);
        removeProjectFromAllocate(projectNames.length, 2, 0, isMobile || isTablet);
        removeProjectFromAllocate(
          projectNames.length,
          1,
          projectNames.length - 1,
          isMobile || isTablet,
        );
      });

      it('user is able to add project to allocation in ProjectsView and remove it from allocation in AllocationView', () => {
        cy.get('[data-test=Navbar__numberOfAllocations]').should('not.exist');
        addProjectToAllocate(0, 0, isMobile || isTablet);

        const isNavbarVisible = isMobile || isTablet;
        if (isNavbarVisible) {
          visitWithLoader(
            ROOT_ROUTES.allocation.absolute,
            isNavbarVisible ? ROOT_ROUTES.allocation.absolute : ROOT_ROUTES.home.absolute,
          );
          cy.get('[data-test=AllocationView]').should('be.visible');
        } else {
          cy.get('[data-test=LayoutTopBar__allocationButton]').click();
          cy.get('[data-test=AllocationDrawer]').should('be.visible');
        }

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

      it(`shows current total (${IS_CRYPTO_MAIN_VALUE_DISPLAY}: true)`, () => {
        changeMainValueToCryptoToggle(!isMobile && !isTablet, 'crypto');
        visitWithLoader(ROOT_ROUTES.projects.absolute);
        cy.get('[data-test=ProjectRewards__currentTotal__number]')
          .first()
          .invoke('text')
          .should('eq', '0 ETH');
      });

      it(`shows current total (${IS_CRYPTO_MAIN_VALUE_DISPLAY}: false)`, () => {
        changeMainValueToCryptoToggle(!isMobile && !isTablet, 'fiat');
        visitWithLoader(ROOT_ROUTES.projects.absolute);

        cy.get('[data-test=ProjectRewards__currentTotal__number]')
          .first()
          .invoke('text')
          .should('eq', '$0.00');
      });

      it('every sorting option is clickable', () => {
        // @ts-expect-error I don't want to define entire TFunction here.
        const orderOptionsValues = ORDER_OPTIONS((key: string) => {}).map(element => element.value);
        orderOptionsValues.forEach(orderOptionsValue => {
          cy.get('[data-test=ProjectsView__InputSelect]').click();
          cy.get(`[data-test=ProjectsView__InputSelect__Option--${orderOptionsValue}]`).click();
        });
      });

      it('search field -- results should show project', () => {
        cy.window().then(win => {
          const { currentEpoch } = win.clientReactQuery.getQueryData(QUERY_KEYS.currentEpoch);

          /**
           * We search for projectn name having "a" letter inside.
           *
           * Initially we implemented getting here actual name from the current epoch list,
           * but BE requires migrations to be done to have results available.
           *
           * These migrations do not happen automatically when epoch is changed,
           * and epochs do not change in the BE at all actually.
           *
           * When we move time in E2E we move them in contracts only.
           *
           * Assumption here is that any project in current epoch will have "a" letter in their name,
           * which is very likely.
           */
          cy.get('[data-test=ProjectsList__InputText]')
            .clear()
            .type(`a Epoch ${currentEpoch - 1}`);
          cy.get('[data-test^=ProjectsSearchResults__ProjectsListItem]').should('have.length.gt', 1);
        });
      });

      it('search field -- no results should show no results image & text', () => {
        cy.get('[data-test=ProjectsList__InputText]')
          .clear()
          .type('there-is-no-way-there-will-ever-be-a-project-with-such-a-name');
        cy.get('[data-test=ProjectsSearchResults__noSearchResults]').should('be.visible');
        cy.get('[data-test=ProjectsSearchResults__noSearchResults__Img]').should('be.visible');
      });
    });

    describe(`projects (patron mode): ${device}`, { viewportHeight, viewportWidth }, () => {
      let projectNames: string[] = [];

      before(() => {
        cy.clearLocalStorage();

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
        connectWallet({ isPatronModeEnabled: true });
        checkProjectsViewLoaded();

        /**
         * This could be done in before hook, but CY wipes the state after each test
         * (could be disabled, but creates other problems).
         *
         * Needs to be done for each test, because each has different default "random" order for projects.
         */
        projectNames = getNamesOfProjects();
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
  },
);

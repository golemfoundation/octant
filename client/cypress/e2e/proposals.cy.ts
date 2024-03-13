// eslint-disable-next-line import/no-extraneous-dependencies
import chaiColors from 'chai-colors';

import { connectWallet, mockCoinPricesServer, visitWithLoader } from 'cypress/utils/e2e';
import { getNamesOfProposals } from 'cypress/utils/proposals';
import viewports from 'cypress/utils/viewports';
import { IS_ONBOARDING_DONE } from 'src/constants/localStorageKeys';
import getMilestones from 'src/constants/milestones';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

import Chainable = Cypress.Chainable;

chai.use(chaiColors);

function checkProposalItemElements(index, name, isPatronMode = false): Chainable<any> {
  cy.get('[data-test^=ProposalsView__ProposalsListItem')
    .eq(index)
    .find('[data-test=ProposalsListItem__imageProfile]')
    .should('be.visible');
  cy.get('[data-test^=ProposalsView__ProposalsListItem]')
    .eq(index)
    .should('be.visible')
    .get('[data-test=ProposalsListItem__name]')
    .should('be.visible')
    .contains(name);
  cy.get('[data-test^=ProposalsView__ProposalsListItem')
    .eq(index)
    .find('[data-test=ProposalsListItem__IntroDescription]')
    .should('be.visible');
  cy.get('[data-test^=ProposalsView__ProposalsListItem')
    .eq(index)
    .find('[data-test=ProposalsListItem__ButtonAddToAllocate]')
    .should('be.visible');

  if (isPatronMode) {
    cy.get('[data-test^=ProposalsView__ProposalsListItem')
      .eq(index)
      .find('[data-test=ProposalsListItem__ButtonAddToAllocate]')
      .should('be.disabled');
  }

  return cy
    .get('[data-test^=ProposalsView__ProposalsListItem')
    .eq(index)
    .find('[data-test=ProposalRewards]')
    .should('be.visible');
  // TODO OCT-663 Make CY check if rewards are available (Epoch 2, decision window open).
  // return cy
  //   .get('[data-test^=ProposalsView__ProposalsListItem')
  //   .eq(index)
  //   .find('[data-test=ProposalRewards__currentTotal__label]')
  //   .should('be.visible');
}

function addProposalToAllocate(index, numberOfAddedProposals): Chainable<any> {
  cy.get('[data-test^=ProposalsView__ProposalsListItem')
    .eq(index)
    .find('[data-test=ProposalsListItem__imageProfile]')
    .should('be.visible');
  cy.get('[data-test^=ProposalsView__ProposalsListItem')
    .eq(index)
    .find('[data-test=ProposalsListItem__IntroDescription]')
    .should('be.visible');
  cy.get('[data-test^=ProposalsView__ProposalsListItem')
    .eq(index)
    .find('[data-test=ProposalsListItem__ButtonAddToAllocate]')
    .scrollIntoView();
  cy.get('[data-test^=ProposalsView__ProposalsListItem')
    .eq(index)
    .find('[data-test=ProposalsListItem__ButtonAddToAllocate]')
    .click();
  cy.get('[data-test^=ProposalsView__ProposalsListItem')
    .eq(index)
    .find('[data-test=ProposalsListItem__ButtonAddToAllocate]')
    .find('svg')
    .find('path')
    .then($el => $el.css('fill'))
    .should('be.colored', '#FF6157');
  cy.get('[data-test^=ProposalsView__ProposalsListItem')
    .eq(index)
    .find('[data-test=ProposalsListItem__ButtonAddToAllocate]')
    .find('svg')
    .find('path')
    .then($el => $el.css('stroke'))
    .should('be.colored', '#FF6157');
  cy.get('[data-test=Navbar__numberOfAllocations]').contains(numberOfAddedProposals + 1);
  visitWithLoader(ROOT_ROUTES.allocation.absolute);
  cy.get('[data-test=AllocationItem]').should('have.length', numberOfAddedProposals + 1);
  return cy.go('back');
}

function removeProposalFromAllocate(
  numberOfProposals,
  numberOfAddedProposals,
  index,
): Chainable<any> {
  cy.get('[data-test^=ProposalsView__ProposalsListItem')
    .eq(index)
    .find('[data-test=ProposalsListItem__ButtonAddToAllocate]')
    .scrollIntoView();
  cy.get('[data-test^=ProposalsView__ProposalsListItem')
    .eq(index)
    .find('[data-test=ProposalsListItem__ButtonAddToAllocate]')
    .click();
  visitWithLoader(ROOT_ROUTES.allocation.absolute);
  cy.get('[data-test=AllocationItem]').should('have.length', numberOfAddedProposals - 1);
  if (index < numberOfProposals - 1) {
    cy.get('[data-test=Navbar__numberOfAllocations]').contains(numberOfAddedProposals - 1);
  } else {
    cy.get('[data-test=Navbar__numberOfAllocations]').should('not.exist');
  }
  return cy.go('back');
}

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight }) => {
  describe(`proposals: ${device}`, { viewportHeight, viewportWidth }, () => {
    let proposalNames: string[] = [];

    beforeEach(() => {
      mockCoinPricesServer();
      localStorage.setItem(IS_ONBOARDING_DONE, 'true');
      visitWithLoader(ROOT_ROUTES.proposals.absolute);
      cy.get('[data-test^=ProposalItemSkeleton').should('not.exist');

      /**
       * This could be done in before hook, but CY wipes the state after each test
       * (could be disabled, but creates other problems)
       */
      if (proposalNames.length === 0) {
        proposalNames = getNamesOfProposals();
      }
    });

    it('user is able to see all the projects in the view', () => {
      for (let i = 0; i < proposalNames.length; i++) {
        cy.get('[data-test^=ProposalsView__ProposalsListItem]').eq(i).scrollIntoView();
        checkProposalItemElements(i, proposalNames[i]);
      }
    });

    it('user is able to add & remove the first and the last project to/from allocation, triggering change of the icon, change of the number in navbar', () => {
      // This test checks the first and the last elements only to save time.
      cy.get('[data-test=Navbar__numberOfAllocations]').should('not.exist');

      addProposalToAllocate(0, 0);
      addProposalToAllocate(proposalNames.length - 1, 1);
      removeProposalFromAllocate(proposalNames.length, 2, 0);
      removeProposalFromAllocate(proposalNames.length, 1, proposalNames.length - 1);
    });

    it('user is able to add project to allocation in ProjectsView and remove it from allocation in AllocationView', () => {
      cy.get('[data-test=Navbar__numberOfAllocations]').should('not.exist');
      addProposalToAllocate(0, 0);
      visitWithLoader(ROOT_ROUTES.allocation.absolute);
      cy.get('[data-test=AllocationItemSkeleton]').should('not.exist');
      cy.get('[data-test=AllocationItem]').then(el => {
        const { x } = el[0].getBoundingClientRect();
        cy.get('[data-test=AllocationItem]')
          .trigger('pointerdown')
          .trigger('pointermove', { pageX: x - 20 })
          .trigger('pointerup');
        cy.get('[data-test=AllocationItem__removeButton]').should('be.visible');
        cy.get('[data-test=AllocationItem__removeButton]').click();
        cy.get('[data-test=AllocationItem__removeButton]').should('not.exist');
        cy.get('[data-test=AllocationItem]').should('not.exist');
        cy.get('[data-test=Navbar__numberOfAllocations]').should('not.exist');
      });

      it('ProposalsTimelineWidgetItem with href opens link when clicked without mouse movement', () => {
        const milestones = getMilestones();
        cy.get('[data-test=ProposalsTimelineWidget]').should('be.visible');
        cy.get('[data-test=ProposalsTimelineWidgetItem]').should('have.length', milestones.length);
        for (let i = 0; i < milestones.length; i++) {
          if (milestones[i].href) {
            cy.get('[data-test=ProposalsTimelineWidgetItem]')
              .eq(i)
              .within(() => {
                cy.get('[data-test=ProposalsTimelineWidgetItem__Svg--arrowTopRight]').should(
                  'be.visible',
                );
              });

            cy.get('[data-test=ProposalsTimelineWidgetItem]')
              .eq(i)
              .then(el => {
                const { x } = el[0].getBoundingClientRect();
                cy.get('[data-test=ProposalsTimelineWidgetItem]')
                  .eq(i)
                  .trigger('mousedown')
                  .trigger('mouseup', { clientX: x + 10 });
                cy.location('pathname').should('eq', ROOT_ROUTES.proposals.absolute);

                cy.get('[data-test=ProposalsTimelineWidgetItem]')
                  .eq(i)
                  .trigger('mousedown')
                  .trigger('mouseup');
                cy.location('pathname').should('not.eq', ROOT_ROUTES.proposals.absolute);
              });
          }
        }
      });
    });
  });

  describe(`proposals (patron mode): ${device}`, { viewportHeight, viewportWidth }, () => {
    let proposalNames: string[] = [];

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
      visitWithLoader(ROOT_ROUTES.proposals.absolute);
      connectWallet(true, true);
      cy.get('[data-test^=ProposalItemSkeleton').should('not.exist');
      /**
       * This could be done in before hook, but CY wipes the state after each test
       * (could be disabled, but creates other problems)
       */
      if (proposalNames.length === 0) {
        proposalNames = getNamesOfProposals();
      }
    });

    after(() => {
      cy.disconnectMetamaskWalletFromAllDapps();
    });

    it('button "add to allocate" is disabled', () => {
      for (let i = 0; i < proposalNames.length; i++) {
        cy.get('[data-test^=ProposalsView__ProposalsListItem]').eq(i).scrollIntoView();
        checkProposalItemElements(i, proposalNames[i], true);
      }
    });
  });
});

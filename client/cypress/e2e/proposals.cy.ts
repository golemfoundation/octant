// eslint-disable-next-line import/no-extraneous-dependencies
import chaiColors from 'chai-colors';

import { visitWithLoader } from 'cypress/utils/e2e';
import { getNamesOfProposals } from 'cypress/utils/proposals';
import viewports from 'cypress/utils/viewports';
import { QUERY_KEYS } from 'src/api/queryKeys';
import { IS_ONBOARDING_DONE } from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

import Chainable = Cypress.Chainable;

chai.use(chaiColors);

function checkProposalItemElements(index, name): Chainable<any> {
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

  return cy.window().then(window => {
    // @ts-expect-error missing typing for client window elements.
    const currentEpoch = Number(window.clientReactQuery.getQueryData(QUERY_KEYS.currentEpoch));

    switch (currentEpoch) {
      case 0:
        // In Epoch 0 rewards are not shown.
        return cy;
      case 1:
        // In Epoch 1 rewards are not shown.
        return cy;
      default:
        return cy
          .get('[data-test^=ProposalsView__ProposalsListItem')
          .eq(index)
          .find('[data-test=ProposalRewards__notAvailable]')
          .should('be.visible');
      // TODO OCT-663 Make CY check if rewards are available (Epoch 2, decision window open).
      // return cy
      //   .get('[data-test^=ProposalsView__ProposalsListItem')
      //   .eq(index)
      //   .find('[data-test=ProposalRewards__currentTotal__label]')
      //   .should('be.visible');
    }
  });
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
    .scrollIntoView()
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
  return cy.get('[data-test=Navbar__numberOfAllocations]').contains(numberOfAddedProposals + 1);
}

function removeProposalFromAllocate(
  numberOfProposals,
  numberOfAddedProposals,
  index,
): Chainable<any> {
  cy.get('[data-test^=ProposalsView__ProposalsListItem')
    .eq(index)
    .find('[data-test=ProposalsListItem__ButtonAddToAllocate]')
    .scrollIntoView()
    .click();
  if (index < numberOfProposals - 1) {
    return cy.get('[data-test=Navbar__numberOfAllocations]').contains(numberOfAddedProposals - 1);
  }
  return cy.get('[data-test=Navbar__numberOfAllocations]').should('not.exist');
}

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight }) => {
  describe(`proposals: ${device}`, { viewportHeight, viewportWidth }, () => {
    let proposalNames: string[] = [];

    beforeEach(() => {
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
  });
});

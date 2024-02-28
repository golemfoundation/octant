import { connectWallet, mockCoinPricesServer, visitWithLoader } from 'cypress/utils/e2e';
import { getNamesOfProposals } from 'cypress/utils/proposals';
import viewports from 'cypress/utils/viewports';
import { IS_ONBOARDING_DONE } from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

import Chainable = Cypress.Chainable;

const getButtonAddToAllocate = (): Chainable<any> => {
  const proposalView = cy.get('[data-test=ProposalListItem').first();

  return proposalView.find('[data-test=ProposalListItemHeader__ButtonAddToAllocate]');
};

const checkProposalItemElements = (): Chainable<any> => {
  cy.get('[data-test^=ProposalsView__ProposalsListItem').first().click();
  const proposalView = cy.get('[data-test=ProposalListItem').first();
  proposalView.get('[data-test=ProposalListItemHeader__Img]').should('be.visible');
  proposalView.get('[data-test=ProposalListItemHeader__name]').should('be.visible');
  getButtonAddToAllocate().should('be.visible');
  proposalView.get('[data-test=ProposalListItemHeader__Button]').should('be.visible');
  proposalView.get('[data-test=ProposalListItem__Description]').should('be.visible');

  cy.get('[data-test=ProposalListItem__Donors]')
    .first()
    .scrollIntoView({ offset: { left: 0, top: 100 } });

  cy.get('[data-test=ProposalListItem__Donors]').first().should('be.visible');
  cy.get('[data-test=ProposalListItem__Donors__DonorsHeader__count]')
    .first()
    .should('be.visible')
    .should('have.text', '0');
  return cy
    .get('[data-test=ProposalListItem__Donors__noDonationsYet]')
    .first()
    .should('be.visible');
};

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight }) => {
  describe(`proposal: ${device}`, { viewportHeight, viewportWidth }, () => {
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

    it('entering proposal view directly renders content', () => {
      cy.get('[data-test^=ProposalsView__ProposalsListItem').first().click();
      cy.reload();
      const proposalView = cy.get('[data-test=ProposalListItem').first();
      proposalView.get('[data-test=ProposalListItemHeader__Img]').should('be.visible');
      proposalView.get('[data-test=ProposalListItemHeader__name]').should('be.visible');
    });

    it('entering proposal view renders all its elements', () => {
      checkProposalItemElements();
    });

    it('entering proposal view renders all its elements with fallback IPFS provider', () => {
      cy.intercept('GET', '**/ipfs/**', req => {
        if (req.url.includes('infura')) {
          req.destroy();
        }
      });

      checkProposalItemElements();
    });

    it('entering proposal view renders all its elements with fallback IPFS provider', () => {
      cy.intercept('GET', '**/ipfs/**', req => {
        req.destroy();
      });

      cy.get('[data-test=Toast--ipfsMessage').should('be.visible');
    });

    it('entering proposal view allows to add it to allocation and remove, triggering change of the icon, change of the number in navbar', () => {
      cy.get('[data-test^=ProposalsView__ProposalsListItem').first().click();

      getButtonAddToAllocate().click();

      // cy.get('@buttonAddToAllocate').click();
      cy.get('[data-test=Navbar__numberOfAllocations]').contains(1);
      getButtonAddToAllocate().click();
      cy.get('[data-test=Navbar__numberOfAllocations]').should('not.exist');
    });

    it('Entering proposal view allows scroll only to the last project', () => {
      cy.get('[data-test^=ProposalsView__ProposalsListItem]').first().click();

      for (let i = 0; i < proposalNames.length; i++) {
        cy.get('[data-test=ProposalListItem]').should(
          'have.length.greaterThan',
          i === proposalNames.length - 1 ? proposalNames.length - 1 : i,
        );
        cy.get('[data-test=ProposalListItemHeader__name]')
          .eq(i)
          .scrollIntoView({ offset: { left: 0, top: -150 } })
          .contains(proposalNames[i]);
        cy.get('[data-test=ProposalListItem__Donors]')
          .eq(i)
          .scrollIntoView({ offset: { left: 0, top: -150 } })
          .should('be.visible');
      }
    });

    it('"Back to top" button is displayed if the user has scrolled past the start of the final project description', () => {
      cy.get('[data-test^=ProposalsView__ProposalsListItem]').first().click();

      for (let i = 0; i < proposalNames.length - 1; i++) {
        cy.get('[data-test=ProposalListItem__Donors]')
          .eq(i)
          .scrollIntoView({ offset: { left: 0, top: 100 } });

        if (i === proposalNames.length - 1) {
          cy.get('[data-test=ProposalBackToTopButton__Button]').should('be.visible');
        }
      }
    });

    it('Clicking on "Back to top" button scrolls to the top of view (first project is visible)', () => {
      cy.get('[data-test^=ProposalsView__ProposalsListItem]').first().click();

      for (let i = 0; i < proposalNames.length - 1; i++) {
        cy.get('[data-test=ProposalListItem__Donors]')
          .eq(i)
          .scrollIntoView({ offset: { left: 0, top: 100 } });

        if (i === proposalNames.length - 1) {
          cy.get('[data-test=ProposalBackToTopButton__Button]').click();
          cy.get('[data-test=ProposalListItem]').eq(0).should('be.visible');
        }
      }
    });
  });

  describe(`proposal (patron mode): ${device}`, { viewportHeight, viewportWidth }, () => {
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

    it('button "add to allocate" is disabled', () => {
      for (let i = 0; i < proposalNames.length; i++) {
        cy.get('[data-test^=ProposalsView__ProposalsListItem]').eq(i).click();
        getButtonAddToAllocate().should('be.visible').should('be.disabled');
        cy.go('back');
      }
    });
  });
});

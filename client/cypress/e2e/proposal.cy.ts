import { visitWithLoader } from 'cypress/utils/e2e';
import { getNamesOfProposals } from 'cypress/utils/proposals';
import viewports from 'cypress/utils/viewports';
import { QUERY_KEYS } from 'src/api/queryKeys';
import { IS_ONBOARDING_DONE } from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

import Chainable = Cypress.Chainable;

const getButtonAddToAllocate = (currentEpoch: number, isDesktop: boolean): Chainable<any> => {
  const proposalView = cy.get('[data-test=ProposalView__proposal').first();

  switch (currentEpoch) {
    case 1:
      return proposalView.find('[data-test=ProposalView__proposal__ButtonAddToAllocate--primary]');
    default:
      return proposalView.find(
        `[data-test=${
          isDesktop
            ? 'ProposalView__proposal__ButtonAddToAllocate--secondary'
            : 'ProposalView__proposal__ButtonAddToAllocate--primary'
        }]`,
      );
  }
};

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight, isDesktop }) => {
  describe(`proposal: ${device}`, { viewportHeight, viewportWidth }, () => {
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

      // Wait for all loaders (in ProposalItem) to disappear.
      cy.get('[data-test*=Loader]').should('not.exist');
    });

    it('entering proposal view renders all its elements', () => {
      cy.get('[data-test^=ProposalsView__ProposalItem').first().click();
      const proposalView = cy.get('[data-test=ProposalView__proposal').first();
      proposalView.get('[data-test=ProposalView__proposal__Img]').should('be.visible');
      proposalView.get('[data-test=ProposalView__proposal__name]').should('be.visible');

      cy.window().then(window => {
        // @ts-expect-error missing typing for client window elements.
        const currentEpoch = Number(window.clientReactQuery.getQueryData(QUERY_KEYS.currentEpoch));
        getButtonAddToAllocate(currentEpoch, isDesktop).should('be.visible');
      });
      proposalView.get('[data-test=ProposalView__proposal__Button]').should('be.visible');
      proposalView.get('[data-test=ProposalView__proposal__Description]').should('be.visible');

      cy.window().then(window => {
        // @ts-expect-error missing typing for client window elements.
        const currentEpoch = Number(window.clientReactQuery.getQueryData(QUERY_KEYS.currentEpoch));
        cy.get('[data-test=ProposalView__proposal__DonorsList]')
          .first()
          .scrollIntoView({ offset: { left: 0, top: 100 } });

        switch (currentEpoch) {
          case 1:
            return cy
              .get('[data-test=ProposalView__proposal__DonorsList__donationsNotEnabled]')
              .first()
              .should('be.visible');
          default:
            cy.get('[data-test=ProposalView__proposal__DonorsList]').first().should('be.visible');
            cy.get('[data-test=ProposalView__proposal__DonorsList__count]')
              .first()
              .should('be.visible')
              .should('have.text', '0');
            return cy
              .get('[data-test=ProposalView__proposal__DonorsList__Loader]')
              .first()
              .should('be.visible');
        }
      });
    });

    it('entering proposal view allows to add it to allocation and remove, triggering change of the icon, change of the number in navbar', () => {
      cy.get('[data-test^=ProposalsView__ProposalItem').first().click();

      cy.window().then(window => {
        // @ts-expect-error missing typing for client window elements.
        const currentEpoch = Number(window.clientReactQuery.getQueryData(QUERY_KEYS.currentEpoch));
        getButtonAddToAllocate(currentEpoch, isDesktop).click();
      });

      // cy.get('@buttonAddToAllocate').click();
      cy.get('[data-test=Navbar__numberOfAllocations]').contains(1);
      cy.window().then(window => {
        // @ts-expect-error missing typing for client window elements.
        const currentEpoch = Number(window.clientReactQuery.getQueryData(QUERY_KEYS.currentEpoch));
        getButtonAddToAllocate(currentEpoch, isDesktop).click();
      });
      cy.get('[data-test=Navbar__numberOfAllocations]').should('not.exist');
    });

    it('Entering proposal view allows scroll only to the last project', () => {
      cy.get('[data-test^=ProposalsView__ProposalItem]').first().click();

      for (let i = 0; i <= proposalNames.length; i++) {
        if (i < proposalNames.length) {
          cy.get('[data-test=ProposalView__proposal]').eq(i).scrollIntoView();
          cy.get('[data-test=ProposalView__proposal]')
            .eq(i)
            .get('[data-test=ProposalView__proposal__name]')
            .contains(proposalNames[i]);
          cy.get('[data-test=ProposalView__proposal__DonorsList]')
            .eq(i)
            .scrollIntoView({ offset: { left: 0, top: 100 } });
        } else {
          cy.get('[data-test=ProposalView__proposal]').should('have.length', proposalNames.length);
          cy.get('[data-test=ProposalView__proposal]')
            .eq(i - 1)
            .should('be.visible');
        }
      }
    });

    it('"Back to top" button is displayed if the user has scrolled past the start of the final project description', () => {
      cy.get('[data-test^=ProposalsView__ProposalItem]').first().click();

      for (let i = 0; i < proposalNames.length - 1; i++) {
        cy.get('[data-test=ProposalView__proposal__DonorsList]')
          .eq(i)
          .scrollIntoView({ offset: { left: 0, top: 100 } });

        if (i === proposalNames.length - 1) {
          cy.get('[data-test=ProposalView__proposal__ButtonBackToTop]').should('be.visible');
        }
      }
    });

    it('Clicking on "Back to top" button scrolls to the top of view (first project is visible)', () => {
      cy.get('[data-test^=ProposalsView__ProposalItem]').first().click();

      for (let i = 0; i < proposalNames.length - 1; i++) {
        cy.get('[data-test=ProposalView__proposal__DonorsList]')
          .eq(i)
          .scrollIntoView({ offset: { left: 0, top: 100 } });

        if (i === proposalNames.length - 1) {
          cy.get('[data-test=ProposalView__proposal__ButtonBackToTop]').click();
          cy.get('[data-test=ProposalView__proposal]').eq(0).should('be.visible');
        }
      }
    });
  });
});

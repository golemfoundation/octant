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
    });

    it('entering proposal view directly renders content', () => {
      cy.get('[data-test^=ProposalsView__ProposalsListItem').first().click();
      cy.reload();
      const proposalView = cy.get('[data-test=ProposalView__proposal').first();
      proposalView.get('[data-test=ProposalView__proposal__Img]').should('be.visible');
      proposalView.get('[data-test=ProposalView__proposal__name]').should('be.visible');
    });

    it('entering proposal view renders all its elements', () => {
      cy.get('[data-test^=ProposalsView__ProposalsListItem').first().click();
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
        cy.get('[data-test=ProposalView__proposal__Donors]')
          .first()
          .scrollIntoView({ offset: { left: 0, top: 100 } });

        switch (currentEpoch) {
          case 1:
            return cy
              .get('[data-test=ProposalView__proposal__Donors__donationsNotEnabled]')
              .first()
              .should('be.visible');
          default:
            cy.get('[data-test=ProposalView__proposal__Donors]').first().should('be.visible');
            cy.get('[data-test=ProposalView__proposal__Donors__DonorsHeader__count]')
              .first()
              .should('be.visible')
              .should('have.text', '0');
            return cy
              .get('[data-test=ProposalView__proposal__Donors__Loader]')
              .first()
              .should('be.visible');
        }
      });
    });

    it('entering proposal view allows to add it to allocation and remove, triggering change of the icon, change of the number in navbar', () => {
      cy.get('[data-test^=ProposalsView__ProposalsListItem').first().click();

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
      cy.get('[data-test^=ProposalsView__ProposalsListItem]').first().click();

      for (let i = 0; i < proposalNames.length; i++) {
        cy.get('[data-test=ProposalView__proposal]').should(
          'have.length.greaterThan',
          i === proposalNames.length - 1 ? proposalNames.length - 1 : i,
        );
        cy.get('[data-test=ProposalView__proposal__name]')
          .eq(i)
          .scrollIntoView({ offset: { left: 0, top: -150 } })
          .contains(proposalNames[i]);
        cy.get('[data-test=ProposalView__proposal__Donors]')
          .eq(i)
          .scrollIntoView({ offset: { left: 0, top: -150 } })
          .should('be.visible');
      }
    });

    it('"Back to top" button is displayed if the user has scrolled past the start of the final project description', () => {
      cy.get('[data-test^=ProposalsView__ProposalsListItem]').first().click();

      for (let i = 0; i < proposalNames.length - 1; i++) {
        cy.get('[data-test=ProposalView__proposal__Donors]')
          .eq(i)
          .scrollIntoView({ offset: { left: 0, top: 100 } });

        if (i === proposalNames.length - 1) {
          cy.get('[data-test=ProposalView__proposal__ButtonBackToTop]').should('be.visible');
        }
      }
    });

    it('Clicking on "Back to top" button scrolls to the top of view (first project is visible)', () => {
      cy.get('[data-test^=ProposalsView__ProposalsListItem]').first().click();

      for (let i = 0; i < proposalNames.length - 1; i++) {
        cy.get('[data-test=ProposalView__proposal__Donors]')
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

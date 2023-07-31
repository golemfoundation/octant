import { visitWithLoader } from 'cypress/utils/e2e';
import { getNamesOfProposals } from 'cypress/utils/proposals';
import viewports from 'cypress/utils/viewports';
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
      cy.intercept('GET', '/epochs/current').as('requestGetCurrentEpoch');

      localStorage.setItem(IS_ONBOARDING_DONE, 'true');
      visitWithLoader(ROOT_ROUTES.proposals.absolute);
      cy.get('[data-test^=ProposalItemSkeleton').should('not.exist');

      cy.wait('@requestGetCurrentEpoch').its('response.body.currentEpoch').as('currentEpoch');

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

      cy.get('@currentEpoch').then(currentEpoch => {
        // @ts-expect-error currentEpoch is a number
        getButtonAddToAllocate(currentEpoch, isDesktop).should('be.visible');
      });
      proposalView.get('[data-test=ProposalView__proposal__Button]').should('be.visible');
      proposalView.get('[data-test=ProposalView__proposal__Description]').should('be.visible');

      cy.get('@currentEpoch').then(currentEpoch => {
        switch (currentEpoch) {
          // @ts-expect-error currentEpoch is a number
          case 1:
            return cy
              .get('[data-test=ProposalView__proposal__DonorsList__donationsNotEnabled]')
              .should('be.visible');
          default:
            cy.get('[data-test=ProposalView__proposal__DonorsList]').first().should('be.visible');
            cy.get('[data-test=ProposalView__proposal__DonorsList__count]')
              .first()
              .should('be.visible')
              .should('have.text', '0');
            return cy
              .get('[data-test=ProposalView__proposal__DonorsList__Loader]')
              .should('be.visible');
        }
      });
    });

    it('entering proposal view allows to add it to allocation and remove, triggering change of the icon, change of the number in navbar', () => {
      cy.get('[data-test^=ProposalsView__ProposalItem').first().click();
      cy.get('@currentEpoch').then(currentEpoch => {
        // @ts-expect-error currentEpoch is a number
        getButtonAddToAllocate(currentEpoch, isDesktop).click();
      });

      // cy.get('@buttonAddToAllocate').click();
      cy.get('[data-test=Navbar__numberOfAllocations]').contains(1);
      cy.get('@currentEpoch').then(currentEpoch => {
        // @ts-expect-error currentEpoch is a number
        getButtonAddToAllocate(currentEpoch, isDesktop).click();
      });
      cy.get('[data-test=Navbar__numberOfAllocations]').should('not.exist');
    });

    it('entering proposal 1 view allows infinite scroll down in 1, 2, 3, ... , n - 1 , n, 0, 1, 2, ... order', () => {
      cy.get('[data-test^=ProposalsView__ProposalItem]').first().click();

      for (let i = 0; i < proposalNames.length; i++) {
        cy.get('[data-test=ProposalView__proposal]').eq(i).scrollIntoView();
        cy.get('[data-test=ProposalView__proposal]')
          .eq(i)
          .get('[data-test=ProposalView__proposal__name]')
          .contains(proposalNames[i]);
        cy.get('[data-test=ProposalView__proposal__DonorsList]')
          .eq(i)
          .scrollIntoView({ offset: { left: 0, top: 100 } });
      }

      // Second iteration, from the start.
      for (let i = proposalNames.length; i < proposalNames.length * 2; i++) {
        cy.get('[data-test=ProposalView__proposal]').eq(i).scrollIntoView();
        cy.get('[data-test=ProposalView__proposal]')
          .eq(i)
          .get('[data-test=ProposalView__proposal__name]')
          .contains(proposalNames[i - proposalNames.length]);
        cy.get('[data-test=ProposalView__proposal__DonorsList]')
          .eq(i)
          .scrollIntoView({ offset: { left: 0, top: 100 } });
      }
    });

    it('entering proposal 2 view allows infinite scroll down in 0, 1, 3, ..., n - 1, n, 0, 1, 2 order', () => {
      const elementToEnter = 2;
      const proposalNamesWithoutElementToEnter = [...proposalNames];
      proposalNamesWithoutElementToEnter.splice(elementToEnter, 1);
      cy.get('[data-test^=ProposalsView__ProposalItem]').eq(elementToEnter).click();
      const proposalNamesWithoutSecondElement = [
        proposalNames[elementToEnter],
        ...proposalNamesWithoutElementToEnter,
        ...proposalNames,
      ];
      for (let i = 0; i < proposalNamesWithoutSecondElement.length; i++) {
        cy.get('[data-test=ProposalView__proposal]').eq(i).scrollIntoView();
        cy.get('[data-test=ProposalView__proposal]')
          .eq(i)
          .get('[data-test=ProposalView__proposal__name]')
          .contains(proposalNamesWithoutSecondElement[i]);
        cy.get('[data-test=ProposalView__proposal__DonorsList]')
          .eq(i)
          .scrollIntoView({ offset: { left: 0, top: 100 } });
      }

      // Second iteration, from the start.
      for (
        let i = proposalNamesWithoutSecondElement.length;
        i < proposalNamesWithoutSecondElement.length * 2;
        i++
      ) {
        cy.get('[data-test=ProposalView__proposal]').eq(i).scrollIntoView();
        cy.get('[data-test=ProposalView__proposal]')
          .eq(i)
          .get('[data-test=ProposalView__proposal__name]')
          .contains(
            proposalNamesWithoutSecondElement[i - proposalNamesWithoutSecondElement.length],
          );
        cy.get('[data-test=ProposalView__proposal__DonorsList]')
          .eq(i)
          .scrollIntoView({ offset: { left: 0, top: 100 } });
      }
    });
  });
});

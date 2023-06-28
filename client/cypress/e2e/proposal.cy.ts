import { visitWithLoader } from 'cypress/utils/e2e';
import { getNamesOfProposals } from 'cypress/utils/proposals';
import viewports from 'cypress/utils/viewports';
import { IS_ONBOARDING_DONE } from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';
import { autoClose } from 'src/utils/triggerToast';

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight, isDesktop }) => {
  describe(`proposal: ${device}`, { viewportHeight, viewportWidth }, () => {
    let proposalNames: string[] = [];

    beforeEach(() => {
      localStorage.setItem(IS_ONBOARDING_DONE, 'true');
      visitWithLoader(ROOT_ROUTES.proposals.absolute);

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
      proposalView
        .get(`[data-test=ProposalView__proposal__ButtonAddToAllocate]`)
        .should('be.visible');
      proposalView.get('[data-test=ProposalView__proposal__Button]').should('be.visible');
      proposalView.get('[data-test=ProposalView__proposal__Description]').should('be.visible');
      cy.get('[data-test=ProposalView__proposal__DonorsList]').first().should('be.visible');
      // Requests to subgraph are disabled in Cypress before transition to the server is done.
      // cy.get('[data-test=ProposalView__proposal__DonorsList__count]')
      //   .first()
      //   .should('be.visible')
      //   .should('have.text', '0');

      cy.get('[data-test=ProposalView__proposal__DonorsList__Loader]').should('be.visible');
    });

    it('entering proposal view allows to add it to allocation and remove, triggering change of the icon, change of the number in navbar & toast', () => {
      cy.get('[data-test^=ProposalsView__ProposalItem').first().click();

      cy.get('[data-test=ProposalView__proposal]')
        .first()
        .find(`[data-test=ProposalView__proposal__ButtonAddToAllocate]`)
        .click();
      cy.get('[data-test=Toast--addToAllocate]')
        .last()
        .find('[data-test=Toast--addToAllocate__title]')
        .as('toast');
      cy.get('[data-test=ProposalView__proposal]')
        .first()
        .find('[data-test=ProposalView__proposal__name]')
        .then($name => {
          cy.get('@toast').then($toastName => {
            expect($toastName.text()).to.eq(`Added ${$name.text()} to Allocate`);
            cy.get('[data-test=MainLayout__navigation__numberOfAllocations]').contains(1);
            cy.wait(autoClose);
          });
        });
      cy.get('[data-test=ProposalView__proposal]')
        .first()
        .find(`[data-test=ProposalView__proposal__ButtonAddToAllocate]`)
        .click();
      cy.get('[data-test=Toast--removeFromAllocate]')
        .last()
        .find('[data-test=Toast--removeFromAllocate__title]')
        .as('toast');
      cy.get('[data-test=ProposalView__proposal]')
        .first()
        .find('[data-test=ProposalView__proposal__name]')
        .then($name => {
          cy.get('@toast').then($toastName => {
            expect($toastName.text()).to.eq(`Removed ${$name.text()} from Allocate`);
            cy.get('[data-test=MainLayout__navigation__numberOfAllocations]').should('not.exist');
          });
        });
    });

    it('entering proposal 1 view allows infinite scroll down in 1, 2, 3, ... , n - 1 , n, 0, 1, 2, ... order', () => {
      cy.get('[data-test^=ProposalsView__ProposalItem]').first().click();

      for (let i = 0; i < proposalNames.length; i++) {
        cy.get('[data-test=ProposalView__proposal]').eq(i).scrollIntoView();
        cy.get('[data-test=ProposalView__proposal]')
          .eq(i)
          .get('[data-test=ProposalView__proposal__name]')
          .contains(proposalNames[i]);
      }

      // Second iteration, from the start.
      for (let i = proposalNames.length; i < proposalNames.length * 2; i++) {
        cy.get('[data-test=ProposalView__proposal').eq(i).scrollIntoView();
        cy.get('[data-test=ProposalView__proposal')
          .eq(i)
          .get('[data-test=ProposalView__proposal__name]')
          .contains(proposalNames[i - proposalNames.length]);
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
      }
    });
  });
});

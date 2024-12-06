// eslint-disable-next-line import/no-extraneous-dependencies
import chaiColors from 'chai-colors';

import { mockCoinPricesServer, visitWithLoader } from 'cypress/utils/e2e';
import viewports from 'cypress/utils/viewports';
import {
  HAS_ONBOARDING_BEEN_CLOSED,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
} from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

chai.use(chaiColors);

Object.values(viewports).forEach(
  ({ device, viewportWidth, viewportHeight, isLargeDesktop, isDesktop }) => {
    describe(`[AW IS CLOSED] Allocation: ${device}`, { viewportHeight, viewportWidth }, () => {
      before(() => {
        cy.clearLocalStorage();
      });

      beforeEach(() => {
        mockCoinPricesServer();
        localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
        localStorage.setItem(IS_ONBOARDING_DONE, 'true');
        localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, 'true');
        visitWithLoader(
          ROOT_ROUTES.allocation.absolute,
          isLargeDesktop || isDesktop ? ROOT_ROUTES.home.absolute : ROOT_ROUTES.allocation.absolute,
        );
      });

      if (isLargeDesktop || isDesktop) {
        it('Allocation render as a drawer', () => {
          cy.get('[data-test=AllocationDrawer]').should('be.visible');
          cy.get('[data-test=AllocationView]').should('not.exist');
        });

        it('if user resize viewport from large-desktop/desktop to tablet/mobile allocation drawer will hide and current view will change to Allocation view.', () => {
          // mobile
          cy.viewport(viewports.mobile.viewportWidth, viewports.mobile.viewportHeight);
          cy.get('[data-test=AllocationDrawer]').should('not.exist');
          cy.get('[data-test=AllocationView]').should('be.visible');
          cy.location('pathname').should('eq', ROOT_ROUTES.allocation.absolute);
          // tablet
          cy.viewport(viewports.tablet.viewportWidth, viewports.tablet.viewportHeight);
          cy.get('[data-test=AllocationDrawer]').should('not.exist');
          cy.get('[data-test=AllocationView]').should('be.visible');
          cy.location('pathname').should('eq', ROOT_ROUTES.allocation.absolute);
        });

        it('If user resize viewport from large-desktop/desktop to tablet/mobile when allocation drawer was open and then change view and resize again to large/desktop allocation drawer won`t be visible.', () => {
          // mobile
          cy.viewport(viewports.mobile.viewportWidth, viewports.mobile.viewportHeight);
          cy.get('[data-test=LayoutNavbar__Button--projects]').click();
          cy.viewport(
            viewports[isDesktop ? 'desktop' : 'largeDesktop'].viewportWidth,
            viewports[isDesktop ? 'desktop' : 'largeDesktop'].viewportHeight,
          );
          cy.location('pathname').should('eq', ROOT_ROUTES.projects.absolute);
          cy.get('[data-test=AllocationDrawer]').should('not.exist');

          cy.get('[data-test=LayoutTopBar__allocationButton]').click();
          cy.get('[data-test=AllocationDrawer]').should('be.visible');

          // tablet
          cy.viewport(viewports.tablet.viewportWidth, viewports.tablet.viewportHeight);
          cy.get('[data-test=LayoutNavbar__Button--projects]').click();
          cy.viewport(
            viewports[isDesktop ? 'desktop' : 'largeDesktop'].viewportWidth,
            viewports[isDesktop ? 'desktop' : 'largeDesktop'].viewportHeight,
          );
          cy.location('pathname').should('eq', ROOT_ROUTES.projects.absolute);
          cy.get('[data-test=AllocationDrawer]').should('not.exist');
        });
      } else {
        it('Allocation render as a independent view', () => {
          cy.get('[data-test=AllocationDrawer]').should('not.exist');
          cy.get('[data-test=AllocationView]').should('be.visible');
        });

        it('if user resize viewport from tablet/mobile to large-desktop/desktop allocation view will change to the last opened or Home view and Allocation drawer will be visible.', () => {
          // desktop
          cy.viewport(viewports.desktop.viewportWidth, viewports.desktop.viewportHeight);
          cy.get('[data-test=AllocationDrawer]').should('be.visible');
          cy.get('[data-test=AllocationView]').should('not.exist');
          cy.location('pathname').should('eq', ROOT_ROUTES.home.absolute);
          // large-desktop
          cy.viewport(viewports.largeDesktop.viewportWidth, viewports.largeDesktop.viewportHeight);
          cy.get('[data-test=AllocationDrawer]').should('be.visible');
          cy.get('[data-test=AllocationView]').should('not.exist');
          cy.location('pathname').should('eq', ROOT_ROUTES.home.absolute);
        });
      }

      it('User sees amount of rewards available during allocation', () => {
        cy.get('[data-test=AllocationRewardsBox]').should('be.visible');
        cy.get('[data-test=AllocationRewardsBox__value]').should('be.visible');
        cy.get('[data-test=AllocationRewardsBox__value]').invoke('text').should('eq', '0 ETH');
      });

      it('User sees info about locking GLM to earn rewards when there are no projects added to allocation', () => {
        if (isLargeDesktop || isDesktop) {
          cy.get('[data-test=Allocation__emptyState]').should('be.visible');
        } else {
          cy.get('[data-test=AllocationView__emptyState]').should('be.visible');
        }
      });

      it('User can add and remove projects from allocation ', () => {
        if (isLargeDesktop || isDesktop) {
          cy.get('[data-test=AllocationDrawer__closeButton]').click();
          cy.get('[data-test=LayoutTopBar__link--projects]').click();
        } else {
          cy.get('[data-test=LayoutNavbar__Button--projects]').click();
        }
        cy.get('[data-test=ProjectsListItem__ButtonAddToAllocate]').eq(0).click();
        cy.get('[data-test=ProjectsListItem__ButtonAddToAllocate]').eq(1).click();
        cy.get('[data-test=ProjectsListItem__ButtonAddToAllocate]').eq(2).click();

        if (isLargeDesktop || isDesktop) {
          cy.get('[data-test=LayoutTopBar__allocationButton]').click();
        } else {
          cy.get('[data-test=LayoutNavbar__Button--allocate]').click();
        }

        cy.wait(1000);

        cy.get('[data-test=AllocationItem]').should('have.length', 3);

        cy.get('[data-test=AllocationItem]')
          .eq(0)
          .then($allocationItem => {
            const { right: allocationItemLeft } = $allocationItem[0].getBoundingClientRect();

            cy.get('[data-test=AlloocationItem__draggableContainer]')
              .eq(0)
              .trigger('pointerdown', {
                pageX: allocationItemLeft,
              })
              .trigger('pointermove', {
                pageX: allocationItemLeft - 100,
              })
              .trigger('pointerup', {
                pageX: allocationItemLeft - 100,
              });

            cy.get('[data-test=AllocationItem__removeButton]').eq(0).should('be.visible');
            cy.get('[data-test=AllocationItem__removeButton]').eq(0).click();
            cy.wait(1000);
            cy.get('[data-test=AllocationItem]').should('have.length', 2);
          });
      });

      it('User can`t reset allocation', () => {
        cy.get('[data-test=AllocationNavigation__resetButton]').should('be.visible');
        cy.get('[data-test=AllocationNavigation__resetButton]').should('be.disabled');
      });

      it('User can`t confirm allocation', () => {
        cy.get('[data-test=AllocationNavigation__ctaButton]').should('be.visible');
        cy.get('[data-test=AllocationNavigation__ctaButton]').should('be.disabled');
      });
    });
  },
);

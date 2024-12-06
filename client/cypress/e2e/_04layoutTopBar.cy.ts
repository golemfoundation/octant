// eslint-disable-next-line import/no-extraneous-dependencies
import chaiColors from 'chai-colors';

import { mockCoinPricesServer, visitWithLoader } from 'cypress/utils/e2e';
import viewports from 'cypress/utils/viewports';
import {
  HAS_ONBOARDING_BEEN_CLOSED,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
} from 'src/constants/localStorageKeys';
import { ROOT, ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

chai.use(chaiColors);

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight }) => {
  describe(`[AW IS CLOSED] LayoutTopBar: ${device}`, { viewportHeight, viewportWidth }, () => {
    before(() => {
      cy.clearLocalStorage();
    });

    beforeEach(() => {
      mockCoinPricesServer();
      localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
      localStorage.setItem(IS_ONBOARDING_DONE, 'true');
      localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, 'true');
      visitWithLoader(ROOT.absolute, ROOT_ROUTES.home.absolute);
    });

    it('Top bar is visible ', () => {
      cy.get('[data-test=Layout__topBarWrapper]').should('be.visible');
      cy.get('[data-test=LayoutTopBar]').should('be.visible');
    });

    it('Top bar has grey background', () => {
      cy.get('[data-test=Layout__topBarWrapper]')
        .then($el => $el.css('backgroundColor'))
        .should('be.colored', '#f8f8f8');
    });

    it('Octant logo is visible and has correct background colour', () => {
      cy.get('[data-test=LayoutTopBar__Logo]').should('be.visible');
      cy.get('[data-test=LayoutTopBar__Logo]').within(() => {
        cy.get('path')
          .then($el => $el.css('fill'))
          .should('be.colored', '#171717');
      });
    });

    it('Octant testnet indicator not exist', () => {
      cy.get('[data-test=LayoutTopBar__Logo__testnetIndicator]').should('not.exist');
    });

    it('Clicking on Octant logo scrolls view to the top on logo click (Home view)', () => {
      cy.get('[data-test=HomeView]').should('be.visible');
      cy.scrollTo(0, 500);
      cy.get('[data-test=LayoutTopBar__Logo]').click();
      // waiting for scrolling to finish
      cy.wait(2000);
      cy.window().then(cyWindow => {
        expect(cyWindow.scrollY).to.be.eq(0);
      });
    });

    it('Clicking on Octant logo redirects to Home view (outside Home view)', () => {
      if (device === 'large-desktop' || device === 'desktop') {
        cy.get('[data-test=LayoutTopBar__link--metrics]').click();
      } else {
        cy.get(`[data-test=LayoutNavbar__Button--metrics]`).click();
      }
      cy.get('[data-test=MetricsView]').should('be.visible');
      cy.get('[data-test=LayoutTopBar__Logo]').click();
      cy.get('[data-test=HomeView]').should('be.visible');
    });

    if (device !== 'mobile') {
      it('Top bar is visible when user scrolls down/up', () => {
        // scroll down
        cy.scrollTo(0, 500);
        cy.get('[data-test=Layout__topBarWrapper]').should('be.visible');
        cy.get('[data-test=LayoutTopBar]').should('be.visible');
        // scroll up
        cy.scrollTo(0, 250);
        cy.get('[data-test=Layout__topBarWrapper]').should('be.visible');
        cy.get('[data-test=LayoutTopBar]').should('be.visible');
      });
    } else {
      it('Top bar hides when user scrolls down then top bar shows when user scrolls up', () => {
        cy.get('[data-test=Layout__topBarWrapper]').should('be.visible');
        cy.get('[data-test=LayoutTopBar]').should('be.visible');
        cy.scrollTo(0, 500);
        cy.get('[data-test=Layout__topBarWrapper]').should('not.be.visible');
        cy.get('[data-test=LayoutTopBar]').should('not.be.visible');
        cy.scrollTo(0, 250);
        cy.get('[data-test=Layout__topBarWrapper]').should('be.visible');
        cy.get('[data-test=LayoutTopBar]').should('be.visible');
      });
    }

    if (device === 'large-desktop' || device === 'desktop') {
      it('Projects view link is visible and redirects to Projects view after click', () => {
        cy.get('[data-test=HomeView]').should('be.visible');
        cy.get('[data-test=LayoutTopBar__link--projects]').click();
        cy.get('[data-test=ProjectsView]').should('be.visible');
      });

      it('Metrics view link is visible and redirects to Metrics view after click', () => {
        cy.get('[data-test=HomeView]').should('be.visible');
        cy.get('[data-test=LayoutTopBar__link--metrics]').click();
        cy.get('[data-test=MetricsView]').should('be.visible');
      });

      it('Home view link is visible and redirects to Home view after click', () => {
        cy.get('[data-test=HomeView]').should('be.visible');
        cy.get('[data-test=LayoutTopBar__link--metrics]').click();
        cy.get('[data-test=MetricsView]').should('be.visible');
        cy.get('[data-test=LayoutTopBar__link--home]').click();
        cy.get('[data-test=HomeView]').should('be.visible');
      });

      it('Active/Inactive link has proper style', () => {
        cy.get('[data-test=HomeView]').should('be.visible');
        cy.get('[data-test=LayoutTopBar__link--home]')
          .then($el => $el.css('color'))
          .should('be.colored', '#171717');
        cy.get('[data-test=LayoutTopBar__underline--home]').should('be.visible');
        cy.get('[data-test=LayoutTopBar__link--projects]')
          .then($el => $el.css('color'))
          .should('be.colored', '#cdd1cd');
        cy.get('[data-test=LayoutTopBar__link--metrics]')
          .then($el => $el.css('color'))
          .should('be.colored', '#cdd1cd');
      });
    }

    it('Epoch info badge is visible', () => {
      cy.get('[data-test=LayoutTopBarCalendar]').should('be.visible');
    });

    it('Connect wallet button is visible', () => {
      cy.get('[data-test=LayoutTopBar__Button]').should('be.visible');
    });

    it('Connect wallet button has proper label', () => {
      cy.get('[data-test=LayoutTopBar__Button]')
        .invoke('text')
        .should('eq', device === 'mobile' ? 'Connect' : 'Connect wallet');
    });

    if (device === 'large-desktop' || device === 'desktop') {
      it('Settings button is visible and has white background', () => {
        cy.get('[data-test=LayoutTopBar__settingsButton]').should('be.visible');
        cy.get('[data-test=LayoutTopBar__settingsButton]')
          .then($el => $el.css('backgroundColor'))
          .should('be.colored', '#ffffff');
      });

      it('Settings button opens Settings drawer', () => {
        cy.get('[data-test=LayoutTopBar__settingsButton]').click();
        cy.get('[data-test=SettingsDrawer]').should('be.visible');
      });

      it('Allocation button is visible and has white background', () => {
        cy.get('[data-test=LayoutTopBar__allocationButton]').should('be.visible');
        cy.get('[data-test=LayoutTopBar__allocationButton]')
          .then($el => $el.css('backgroundColor'))
          .should('be.colored', '#ffffff');
      });

      it('Allocation button opens Allocation drawer', () => {
        cy.get('[data-test=LayoutTopBar__allocationButton]').click();
        cy.get('[data-test=AllocationDrawer]').should('be.visible');
      });
    }

    describe('[TESTNET]', () => {
      beforeEach(() => {
        cy.window().then(win => {
          // eslint-disable-next-line no-param-reassign
          win.isTestnetCypress = true;
          // wait for re-render
          cy.wait(2500);
        });
      });

      it('Top bar has red background', () => {
        cy.get('[data-test=Layout__topBarWrapper]')
          .then($el => $el.css('backgroundColor'))
          .should('be.colored', '#ffefee');
      });

      it('Octant logo exists and has correct background colour', () => {
        cy.get('[data-test=LayoutTopBar__Logo]').should('exist');
        cy.get('[data-test=LayoutTopBar__Logo]').within(() => {
          cy.get('path')
            .then($el => $el.css('fill'))
            .should('be.colored', '#ff6157');
        });
      });

      it('Octant testnet indicator is visible, has correct style and text', () => {
        cy.get('[data-test=LayoutTopBar__Logo__testnetIndicator]').should('be.visible');
        cy.get('[data-test=LayoutTopBar__Logo__testnetIndicator]')
          .then($el => $el.css('backgroundColor'))
          .should('be.colored', '#ffefee');
        cy.get('[data-test=LayoutTopBar__Logo__testnetIndicator]')
          .invoke('text')
          .should('eq', 'Local');
      });

      it('Clicking on testnet indicator scrolls view to the top on logo click (Home view)', () => {
        cy.get('[data-test=HomeView]').should('be.visible');
        cy.scrollTo(0, 500);
        cy.get('[data-test=LayoutTopBar__Logo__testnetIndicator]').click();
        // waiting for scrolling to finish
        cy.wait(2000);
        cy.window().then(cyWindow => {
          expect(cyWindow.scrollY).to.be.eq(0);
        });
      });

      it('Clicking on testnet indicator redirects to Home view (outside Home view)', () => {
        if (device === 'large-desktop' || device === 'desktop') {
          cy.get('[data-test=LayoutTopBar__link--metrics]').click();
        } else {
          cy.get(`[data-test=LayoutNavbar__Button--metrics]`).click();
        }
        cy.get('[data-test=MetricsView]').should('be.visible');
        cy.get('[data-test=LayoutTopBar__Logo__testnetIndicator]').click();
        cy.get('[data-test=HomeView]').should('be.visible');
      });

      if (device === 'large-desktop' || device === 'desktop') {
        it('Settings button is visible and has red background', () => {
          cy.get('[data-test=LayoutTopBar__settingsButton]').should('be.visible');
          cy.get('[data-test=LayoutTopBar__settingsButton]')
            .then($el => $el.css('backgroundColor'))
            .should('be.colored', '#fffafa');
        });

        it('Allocation button is visible and has red background', () => {
          cy.get('[data-test=LayoutTopBar__allocationButton]').should('be.visible');
          cy.get('[data-test=LayoutTopBar__allocationButton]')
            .then($el => $el.css('backgroundColor'))
            .should('be.colored', '#fffafa');
        });
      }
    });
  });
});

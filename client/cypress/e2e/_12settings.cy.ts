// eslint-disable-next-line import/no-extraneous-dependencies
import chaiColors from 'chai-colors';

import {
  checkLocationWithLoader,
  connectWallet,
  mockCoinPricesServer,
  visitWithLoader,
} from 'cypress/utils/e2e';
import { beforeSetup } from 'cypress/utils/onboarding';
import viewports from 'cypress/utils/viewports';
import { DISPLAY_CURRENCIES, FIAT_CURRENCIES_SYMBOLS } from 'src/constants/currencies';
import {
  DISPLAY_CURRENCY,
  HAS_ONBOARDING_BEEN_CLOSED,
  IS_CRYPTO_MAIN_VALUE_DISPLAY,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
  SHOW_HELP_VIDEOS,
} from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

chai.use(chaiColors);

Object.values(viewports).forEach(
  ({ device, viewportWidth, viewportHeight, isLargeDesktop, isDesktop }) => {
    describe(`[AW IS OPEN] Settings: ${device}`, { viewportHeight, viewportWidth }, () => {
      before(() => {
        cy.clearLocalStorage();
        beforeSetup();
      });

      beforeEach(() => {
        mockCoinPricesServer();
        localStorage.setItem(IS_ONBOARDING_DONE, 'true');
        localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, 'true');
        visitWithLoader(
          ROOT_ROUTES.settings.absolute,
          isLargeDesktop || isDesktop ? ROOT_ROUTES.home.absolute : ROOT_ROUTES.settings.absolute,
        );
      });

      if (isLargeDesktop || isDesktop) {
        it('Settings render as a drawer', () => {
          cy.get('[data-test=SettingsDrawer]').should('be.visible');
          cy.get('[data-test=SettingsView]').should('not.exist');
        });

        it('if user resize viewport from large-desktop/desktop to tablet/mobile settings drawer will hide and current view will change to Settings view.', () => {
          // mobile
          cy.viewport(viewports.mobile.viewportWidth, viewports.mobile.viewportHeight);
          cy.get('[data-test=SettingsDrawer]').should('not.exist');
          cy.get('[data-test=SettingsView]').should('be.visible');
          cy.location('pathname').should('eq', ROOT_ROUTES.settings.absolute);
          // tablet
          cy.viewport(viewports.tablet.viewportWidth, viewports.tablet.viewportHeight);
          cy.get('[data-test=SettingsDrawer]').should('not.exist');
          cy.get('[data-test=SettingsView]').should('be.visible');
          cy.location('pathname').should('eq', ROOT_ROUTES.settings.absolute);
        });

        it('If user resize viewport from large-desktop/desktop to tablet/mobile when settings drawer was open and then change view and resize again to large/desktop settings drawer won`t be visible.', () => {
          // mobile
          cy.viewport(viewports.mobile.viewportWidth, viewports.mobile.viewportHeight);
          cy.get('[data-test=LayoutNavbar__Button--projects]').click();
          cy.viewport(
            viewports[isDesktop ? 'desktop' : 'largeDesktop'].viewportWidth,
            viewports[isDesktop ? 'desktop' : 'largeDesktop'].viewportHeight,
          );
          cy.location('pathname').should('eq', ROOT_ROUTES.projects.absolute);
          cy.get('[data-test=SettingsDrawer]').should('not.exist');

          cy.get('[data-test=LayoutTopBar__settingsButton]').click();
          cy.get('[data-test=SettingsDrawer]').should('be.visible');

          // tablet
          cy.viewport(viewports.tablet.viewportWidth, viewports.tablet.viewportHeight);
          cy.get('[data-test=LayoutNavbar__Button--projects]').click();
          cy.viewport(
            viewports[isDesktop ? 'desktop' : 'largeDesktop'].viewportWidth,
            viewports[isDesktop ? 'desktop' : 'largeDesktop'].viewportHeight,
          );
          cy.location('pathname').should('eq', ROOT_ROUTES.projects.absolute);
          cy.get('[data-test=SettingsDrawer]').should('not.exist');
        });
      } else {
        it('Settings render as a independent view', () => {
          cy.get('[data-test=SettingsDrawer]').should('not.exist');
          cy.get('[data-test=SettingsView]').should('be.visible');
        });

        it('if user resize viewport from tablet/mobile to large-desktop/desktop settings view will change to the last opened or Home view and Settings drawer will be visible.', () => {
          // desktop
          cy.viewport(viewports.desktop.viewportWidth, viewports.desktop.viewportHeight);
          cy.get('[data-test=SettingsDrawer]').should('be.visible');
          cy.get('[data-test=SettingsView]').should('not.exist');
          cy.location('pathname').should('eq', ROOT_ROUTES.home.absolute);
          // large-desktop
          cy.viewport(viewports.largeDesktop.viewportWidth, viewports.largeDesktop.viewportHeight);
          cy.get('[data-test=SettingsDrawer]').should('be.visible');
          cy.get('[data-test=SettingsView]').should('not.exist');
          cy.location('pathname').should('eq', ROOT_ROUTES.home.absolute);
        });
      }

      it('Settings title is visible and has correct text', () => {
        const dataTestRoot = isLargeDesktop || isDesktop ? 'Settings' : 'SettingsView';
        cy.get(`[data-test=${dataTestRoot}__title]`).should('be.visible');
        cy.get(`[data-test=${dataTestRoot}__title]`).invoke('text').should('eq', 'Settings');
      });

      it('Octant info tile is visible', () => {
        cy.get('[data-test=SettingsMainInfoBox]').should('be.visible');
      });

      it('"Use ETH as main value display" tile is visible', () => {
        cy.get('[data-test=SettingsCryptoMainValueBox]').should('be.visible');
      });

      it('"Choose a display currency" tile is visible', () => {
        cy.get('[data-test=SettingsCurrencyBox]').should('be.visible');
      });

      it('"Show help videos" tile is visible', () => {
        cy.get('[data-test=SettingsShowHelpVideosBox]').should('be.visible');
      });

      it('"Always show onboarding" tile is visible', () => {
        cy.get('[data-test=SettingsShowOnboardingBox]').should('be.visible');
      });

      it(`"Use ETH as main value display" option is checked by default`, () => {
        cy.get('[data-test=SettingsCryptoMainValueBox__InputToggle]').should('be.checked');
        cy.getAllLocalStorage().then(() => {
          expect(localStorage.getItem(IS_CRYPTO_MAIN_VALUE_DISPLAY)).eq('true');
        });
      });

      it('Default currency is "usd"', () => {
        cy.getAllLocalStorage().then(() => {
          expect(localStorage.getItem(DISPLAY_CURRENCY)).eq('"usd"');
        });
        cy.get('[data-test=SettingsCurrencyBox__InputSelect--currency__SingleValue]')
          .invoke('text')
          .should('eq', 'USD');
      });

      it(`"Show help videos" option is checked by default`, () => {
        cy.get('[data-test=SettingsShowHelpVideosBox__InputToggle]').should('be.checked');
        cy.getAllLocalStorage().then(() => {
          expect(localStorage.getItem(SHOW_HELP_VIDEOS)).eq('true');
        });
      });

      it(`"Always show onboarding" option is not checked by default`, () => {
        cy.get('[data-test=SettingsShowOnboardingBox__InputToggle]').should('not.be.checked');
        cy.getAllLocalStorage().then(() => {
          expect(localStorage.getItem(IS_ONBOARDING_ALWAYS_VISIBLE)).eq('false');
        });
      });

      it('"Use ETH as main value display" option toggle works', () => {
        cy.get('[data-test=SettingsCryptoMainValueBox__InputToggle]').check({ force: true });
        cy.get('[data-test=SettingsCryptoMainValueBox__InputToggle]').should('be.checked');
        cy.getAllLocalStorage().then(() => {
          expect(localStorage.getItem(IS_CRYPTO_MAIN_VALUE_DISPLAY)).eq('true');
        });

        cy.get('[data-test=SettingsCryptoMainValueBox__InputToggle]').click({ force: true });
        cy.get('[data-test=SettingsCryptoMainValueBox__InputToggle]').should('not.be.checked');
        cy.getAllLocalStorage().then(() => {
          expect(localStorage.getItem(IS_CRYPTO_MAIN_VALUE_DISPLAY)).eq('false');
        });

        cy.get('[data-test=SettingsCryptoMainValueBox__InputToggle]').click({ force: true });
        cy.get('[data-test=SettingsCryptoMainValueBox__InputToggle]').should('be.checked');
        cy.getAllLocalStorage().then(() => {
          expect(localStorage.getItem(IS_CRYPTO_MAIN_VALUE_DISPLAY)).eq('true');
        });
      });

      it('"Choose a display currency" option works', () => {
        for (let i = 0; i < DISPLAY_CURRENCIES.length - 1; i++) {
          const displayCurrency = DISPLAY_CURRENCIES[i];
          const displayCurrencyToUppercase = displayCurrency.toUpperCase();
          const nextDisplayCurrencyToUppercase =
            i < DISPLAY_CURRENCIES.length - 1 ? DISPLAY_CURRENCIES[i + 1].toUpperCase() : undefined;

          cy.get('[data-test=SettingsCurrencyBox__InputSelect--currency__SingleValue]').contains(
            displayCurrencyToUppercase,
          );
          if (!isLargeDesktop && !isDesktop) {
            cy.get(`[data-test=LayoutNavbar__Button--home]`).click();
            checkLocationWithLoader(ROOT_ROUTES.home.absolute);
          }

          if (FIAT_CURRENCIES_SYMBOLS[displayCurrency]) {
            cy.get('[data-test=HomeGridCurrentGlmLock__DoubleValue__secondary]').contains(
              FIAT_CURRENCIES_SYMBOLS[displayCurrency],
            );
          } else {
            cy.get('[data-test=HomeGridCurrentGlmLock__DoubleValue__secondary]').contains(
              displayCurrencyToUppercase,
            );
          }

          if (!isLargeDesktop && !isDesktop) {
            cy.get(`[data-test=LayoutNavbar__Button--settings]`).click();
            checkLocationWithLoader(ROOT_ROUTES.settings.absolute);
          }
          cy.get('[data-test=SettingsCurrencyBox__InputSelect--currency]').click();
          cy.get(
            `[data-test=SettingsCurrencyBox__InputSelect--currency__Option--${nextDisplayCurrencyToUppercase}]`,
          ).click();
        }
      });

      it('"Show help videos" option toggle works', () => {
        cy.get('[data-test=SettingsShowHelpVideosBox__InputToggle]').check();
        cy.get('[data-test=SettingsShowHelpVideosBox__InputToggle]').should('be.checked');
        cy.getAllLocalStorage().then(() => {
          expect(localStorage.getItem(SHOW_HELP_VIDEOS)).eq('true');
        });

        cy.get('[data-test=SettingsShowHelpVideosBox__InputToggle]').click();
        cy.get('[data-test=SettingsShowHelpVideosBox__InputToggle]').should('not.be.checked');
        cy.getAllLocalStorage().then(() => {
          expect(localStorage.getItem(SHOW_HELP_VIDEOS)).eq('false');
        });

        if (isLargeDesktop || isDesktop) {
          cy.get('[data-test=HomeGridVideoBar]').should('not.exist');
        } else {
          cy.get(`[data-test=LayoutNavbar__Button--home]`).click();
          cy.get('[data-test=HomeGridVideoBar]').should('not.exist');
          cy.get(`[data-test=LayoutNavbar__Button--settings]`).click();
        }

        cy.get('[data-test=SettingsShowHelpVideosBox__InputToggle]').click();
        cy.get('[data-test=SettingsShowHelpVideosBox__InputToggle]').should('be.checked');
        cy.getAllLocalStorage().then(() => {
          expect(localStorage.getItem(SHOW_HELP_VIDEOS)).eq('true');
        });

        if (isLargeDesktop || isDesktop) {
          cy.get('[data-test=HomeGridVideoBar]').should('be.visible');
        } else {
          cy.get(`[data-test=LayoutNavbar__Button--home]`).click();
          cy.get('[data-test=HomeGridVideoBar]').should('be.visible');
        }
      });

      it('"Always show onboarding" option toggle works', () => {
        connectWallet({ isPatronModeEnabled: false });

        cy.get('[data-test=SettingsShowOnboardingBox__InputToggle]').check();
        cy.get('[data-test=SettingsShowOnboardingBox__InputToggle]').should('be.checked');
        cy.getAllLocalStorage().then(() => {
          expect(localStorage.getItem(IS_ONBOARDING_ALWAYS_VISIBLE)).eq('true');
        });

        cy.reload();
        cy.get('[data-test=ModalOnboarding]').should('be.visible');
        cy.get('[data-test=ModalOnboarding__Button]').click();

        if (isLargeDesktop || isDesktop) {
          cy.get('[data-test=LayoutTopBar__settingsButton]').click();
        } else {
          cy.get(`[data-test=LayoutNavbar__Button--settings]`).click();
        }

        cy.get('[data-test=SettingsShowOnboardingBox__InputToggle]').click();
        cy.get('[data-test=SettingsShowOnboardingBox__InputToggle]').should('not.be.checked');
        cy.getAllLocalStorage().then(() => {
          expect(localStorage.getItem(IS_ONBOARDING_ALWAYS_VISIBLE)).eq('false');
        });

        cy.reload();
        cy.get('[data-test=ModalOnboarding]').should('not.exist');

        if (isLargeDesktop || isDesktop) {
          cy.get('[data-test=LayoutTopBar__settingsButton]').click();
        } else {
          cy.get(`[data-test=LayoutNavbar__Button--settings]`).click();
        }

        cy.get('[data-test=SettingsShowOnboardingBox__InputToggle]').click();
        cy.get('[data-test=SettingsShowOnboardingBox__InputToggle]').should('be.checked');
        cy.getAllLocalStorage().then(() => {
          expect(localStorage.getItem(IS_ONBOARDING_ALWAYS_VISIBLE)).eq('true');
        });
      });
    });
  },
);

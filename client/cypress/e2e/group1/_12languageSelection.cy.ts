// eslint-disable-next-line import/no-extraneous-dependencies
import chaiColors from 'chai-colors';

import { checkLocationWithLoader, mockCoinPricesServer, visitWithLoader } from 'cypress/utils/e2e';
import viewports from 'cypress/utils/viewports';
import {
  HAS_ONBOARDING_BEEN_CLOSED,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
} from 'src/constants/localStorageKeys';
import { languageKey } from 'src/i18n/languages';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

chai.use(chaiColors);

Object.values(viewports).forEach(
  ({ device, viewportWidth, viewportHeight, isDesktop, isLargeDesktop }) => {
    const isDesktopSize = isDesktop || isLargeDesktop;

    describe(
      `[AW IS CLOSED] Language selection: ${device}`,
      { viewportHeight, viewportWidth },
      () => {
        before(() => {
          cy.clearLocalStorage();

          /**
           * Global Metamask setup done by Synpress is not always done.
           * Since Synpress needs to have valid provider to fetch the data from contracts,
           * setupMetamask is required in each test suite.
           */
          cy.setupMetamask();
        });

        beforeEach(() => {
          cy.disconnectMetamaskWalletFromAllDapps();
          mockCoinPricesServer();
          localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
          localStorage.setItem(IS_ONBOARDING_DONE, 'true');
          localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, 'true');
        });

        it(`shows LayoutTopBar__Button label in ${languageKey.esEs} when window.navigator.language indicates ${languageKey.esEs}`, () => {
          visitWithLoader(ROOT_ROUTES.projects.absolute, ROOT_ROUTES.projects.absolute, {
            onBeforeLoad(win) {
              // DOES NOT WORK
              // Uncaught TypeError: Cannot assign to read only property
              // 'language' of object '[object Navigator]'
              // win.navigator.language = 'es-ES'

              // instead we need to define a property like this
              Object.defineProperty(win.navigator, 'language', {
                value: languageKey.esEs,
              });
            },
          });
          cy.contains(
            '[data-test=LayoutTopBar__Button]',
            isDesktopSize ? 'Conectar billetera' : 'Conectar',
          ).should('be.visible');
        });

        it('"Language" option works', () => {
          visitWithLoader(
            ROOT_ROUTES.settings.absolute,
            isLargeDesktop || isDesktop ? ROOT_ROUTES.home.absolute : ROOT_ROUTES.settings.absolute,
          );

          if (isDesktopSize) {
            cy.get('[data-test=SettingsDrawer]').should('be.visible');
          } else {
            checkLocationWithLoader(ROOT_ROUTES.settings.absolute);
          }
          /**
           * Sometimes when the view loads on mobile, it scrolls to the bottom
           * and after a moment shows the topbar.
           *
           * It happens in Synpress only because of its extreme speed.
           *
           * .scrollIntoView() solves the problem.
           */
          cy.get('[data-test=SettingsLanguageSelectorBox__InputSelect]').scrollIntoView().click();
          cy.get(
            `[data-test=SettingsLanguageSelectorBox__InputSelect__Option--${languageKey.enEn}]`,
          ).click();

          if (isDesktopSize) {
            cy.get('[data-test=SettingsDrawer__closeButton]').click();
          }

          cy.contains(
            '[data-test=LayoutTopBar__Button]',
            isDesktopSize ? 'Connect wallet' : 'Connect',
          ).should('be.visible');

          if (isDesktopSize) {
            cy.get('[data-test=LayoutTopBar__settingsButton]').click();
          }

          /**
           * Sometimes when the view loads on mobile, it scrolls to the bottom
           * and after a moment shows the topbar.
           *
           * It happens in Synpress only because of its extreme speed.
           *
           * cy.wait() & .scrollIntoView() should solve this problem.
           */
          cy.wait(2000);
          cy.get('[data-test=SettingsLanguageSelectorBox__InputSelect]').scrollIntoView().click();
          cy.get(
            `[data-test=SettingsLanguageSelectorBox__InputSelect__Option--${languageKey.esEs}]`,
          ).click();

          if (isDesktopSize) {
            cy.get('[data-test=SettingsDrawer__closeButton]').click();
          }

          cy.contains(
            '[data-test=LayoutTopBar__Button]',
            isDesktopSize ? 'Conectar billetera' : 'Conectar',
          ).should('be.visible');
        });
      },
    );
  },
);

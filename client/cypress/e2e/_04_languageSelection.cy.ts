// eslint-disable-next-line import/no-extraneous-dependencies
import chaiColors from 'chai-colors';

import { mockCoinPricesServer, visitWithLoader } from 'cypress/utils/e2e';
import viewports from 'cypress/utils/viewports';
import {
  HAS_ONBOARDING_BEEN_CLOSED,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
} from 'src/constants/localStorageKeys';
import { languageKey } from 'src/i18n/languages';
import { ROOT, ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

chai.use(chaiColors);

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight }) => {
  describe(
    `[AW IS CLOSED] Language selection: ${device}`,
    { viewportHeight, viewportWidth },
    () => {
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

      it('shows Klingon greeting', () => {
        cy.visit(ROOT_ROUTES.projects, {
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
        cy.contains('[data-test=LayoutTopBar__Button]', 'Conectar billetera').should('be.visible');
      });
    },
  );
});

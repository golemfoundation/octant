import { visitWithLoader } from 'cypress/utils/e2e';
import { FIAT_CURRENCIES_SYMBOLS, DISPLAY_CURRENCIES } from 'src/constants/currencies';
import {
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
  DISPLAY_CURRENCY,
} from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

describe('settings', () => {
  beforeEach(() => {
    localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
    localStorage.setItem(IS_ONBOARDING_DONE, 'true');
    visitWithLoader(ROOT_ROUTES.settings.absolute);
  });

  it('"Always show Allocate onboarding" option toggle works', () => {
    const onboardingToggle = cy.get('[data-test=AlwaysShowOnboarding__InputCheckbox]');

    onboardingToggle.check();
    onboardingToggle.should('be.checked');
    cy.getAllLocalStorage().then(() => {
      expect(localStorage.getItem(IS_ONBOARDING_ALWAYS_VISIBLE)).eq('true');
    });

    onboardingToggle.click();
    onboardingToggle.should('not.be.checked');
    cy.getAllLocalStorage().then(() => {
      expect(localStorage.getItem(IS_ONBOARDING_ALWAYS_VISIBLE)).eq('false');
    });

    onboardingToggle.click();
    onboardingToggle.should('be.checked');
    cy.getAllLocalStorage().then(() => {
      expect(localStorage.getItem(IS_ONBOARDING_ALWAYS_VISIBLE)).eq('true');
    });
  });

  it('"Choose a display currency" option works', () => {
    cy.getAllLocalStorage().then(() => {
      expect(localStorage.getItem(DISPLAY_CURRENCY)).eq('"usd"');
    });

    for (let i = 0; i < DISPLAY_CURRENCIES.length - 1; i++) {
      const displayCurrency = DISPLAY_CURRENCIES[i];
      const displayCurrencyToUppercase = displayCurrency.toUpperCase();
      const nextDisplayCurrencyToUppercase =
        i < DISPLAY_CURRENCIES.length - 1 ? DISPLAY_CURRENCIES[i + 1].toUpperCase() : undefined;

      cy.get('[data-test=InputSelect__CustomSingleValue]').contains(displayCurrencyToUppercase);
      cy.get('[data-test=Metrics__Button]').click();

      if (FIAT_CURRENCIES_SYMBOLS[displayCurrency]) {
        cy.get('[data-test=MetricsView__DoubleValue--ethStaked__secondary]').contains(
          FIAT_CURRENCIES_SYMBOLS[displayCurrency],
        );
      } else {
        cy.get('[data-test=MetricsView__DoubleValue--ethStaked__secondary]').contains(
          displayCurrencyToUppercase,
        );
      }

      cy.get('[data-test=Settings__Button]').click();
      cy.get('[data-test=InputSelect]').click();
      cy.get(`[data-test=InputSelect__CustomOption--${nextDisplayCurrencyToUppercase}]`).click();
    }
  });
});

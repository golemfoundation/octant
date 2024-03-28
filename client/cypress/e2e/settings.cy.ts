import { visitWithLoader, navigateWithCheck, mockCoinPricesServer } from 'cypress/utils/e2e';
import viewports from 'cypress/utils/viewports';
import { FIAT_CURRENCIES_SYMBOLS, DISPLAY_CURRENCIES } from 'src/constants/currencies';
import {
  ARE_OCTANT_TIPS_ALWAYS_VISIBLE,
  DISPLAY_CURRENCY,
  IS_CRYPTO_MAIN_VALUE_DISPLAY,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
} from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';
import getValueCryptoToDisplay from 'src/utils/getValueCryptoToDisplay';

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight }) => {
  describe(`settings: ${device}`, { viewportHeight, viewportWidth }, () => {
    beforeEach(() => {
      mockCoinPricesServer();
      localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
      localStorage.setItem(IS_ONBOARDING_DONE, 'true');
      visitWithLoader(ROOT_ROUTES.settings.absolute);
    });

    it('"Always show Allocate onboarding" option toggle works', () => {
      cy.get('[data-test=SettingsShowOnboardingBox__InputToggle]').check();
      cy.get('[data-test=SettingsShowOnboardingBox__InputToggle]').should('be.checked');
      cy.getAllLocalStorage().then(() => {
        expect(localStorage.getItem(IS_ONBOARDING_ALWAYS_VISIBLE)).eq('true');
      });

      cy.get('[data-test=SettingsShowOnboardingBox__InputToggle]').click();
      cy.get('[data-test=SettingsShowOnboardingBox__InputToggle]').should('not.be.checked');
      cy.getAllLocalStorage().then(() => {
        expect(localStorage.getItem(IS_ONBOARDING_ALWAYS_VISIBLE)).eq('false');
      });

      cy.get('[data-test=SettingsShowOnboardingBox__InputToggle]').click();
      cy.get('[data-test=SettingsShowOnboardingBox__InputToggle]').should('be.checked');
      cy.getAllLocalStorage().then(() => {
        expect(localStorage.getItem(IS_ONBOARDING_ALWAYS_VISIBLE)).eq('true');
      });
    });

    it('"Use crypto as main value display" option is checked by default', () => {
      cy.get('[data-test=SettingsCryptoMainValueBox__InputToggle]').should('be.checked');
      cy.getAllLocalStorage().then(() => {
        expect(localStorage.getItem(IS_CRYPTO_MAIN_VALUE_DISPLAY)).eq('true');
      });
    });

    it('"Use crypto as main value display" option toggle works', () => {
      cy.get('[data-test=SettingsCryptoMainValueBox__InputToggle]').check();
      cy.get('[data-test=SettingsCryptoMainValueBox__InputToggle]').should('be.checked');
      cy.getAllLocalStorage().then(() => {
        expect(localStorage.getItem(IS_CRYPTO_MAIN_VALUE_DISPLAY)).eq('true');
      });

      cy.get('[data-test=SettingsCryptoMainValueBox__InputToggle]').click();
      cy.get('[data-test=SettingsCryptoMainValueBox__InputToggle]').should('not.be.checked');
      cy.getAllLocalStorage().then(() => {
        expect(localStorage.getItem(IS_CRYPTO_MAIN_VALUE_DISPLAY)).eq('false');
      });

      cy.get('[data-test=SettingsCryptoMainValueBox__InputToggle]').click();
      cy.get('[data-test=SettingsCryptoMainValueBox__InputToggle]').should('be.checked');
      cy.getAllLocalStorage().then(() => {
        expect(localStorage.getItem(IS_CRYPTO_MAIN_VALUE_DISPLAY)).eq('true');
      });
    });

    it('"Use crypto as main value display" option by default displays crypto value as primary in DoubleValue component', () => {
      navigateWithCheck(ROOT_ROUTES.earn.absolute);

      const cryptoValue = getValueCryptoToDisplay({
        cryptoCurrency: 'golem',
        valueCrypto: BigInt(0),
      });

      cy.get('[data-test=BoxGlmLock__Section--effective__DoubleValue__primary]')
        .invoke('text')
        .should('eq', cryptoValue);
      cy.get('[data-test=BoxGlmLock__Section--effective__DoubleValue__secondary]')
        .invoke('text')
        .should('not.eq', cryptoValue);
    });

    it('"Use crypto as main value display" option changes DoubleValue sections order', () => {
      cy.get('[data-test=SettingsCryptoMainValueBox__InputToggle]').uncheck();
      navigateWithCheck(ROOT_ROUTES.earn.absolute);

      const cryptoValue = getValueCryptoToDisplay({
        cryptoCurrency: 'golem',
        valueCrypto: BigInt(0),
      });

      cy.get('[data-test=BoxGlmLock__Section--effective__DoubleValue__primary]')
        .invoke('text')
        .should('not.eq', cryptoValue);
      cy.get('[data-test=BoxGlmLock__Section--effective__DoubleValue__secondary]')
        .invoke('text')
        .should('eq', cryptoValue);
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

        cy.get('[data-test=SettingsCurrencyBox__InputSelect--currency__SingleValue]').contains(
          displayCurrencyToUppercase,
        );
        navigateWithCheck(ROOT_ROUTES.earn.absolute);

        if (FIAT_CURRENCIES_SYMBOLS[displayCurrency]) {
          cy.get('[data-test=BoxGlmLock__Section--effective__DoubleValue__secondary]').contains(
            FIAT_CURRENCIES_SYMBOLS[displayCurrency],
          );
        } else {
          cy.get('[data-test=BoxGlmLock__Section--effective__DoubleValue__secondary]').contains(
            displayCurrencyToUppercase,
          );
        }

        navigateWithCheck(ROOT_ROUTES.settings.absolute);
        cy.get('[data-test=SettingsCurrencyBox__InputSelect--currency]').click();
        cy.get(
          `[data-test=SettingsCurrencyBox__InputSelect--currency__Option--${nextDisplayCurrencyToUppercase}]`,
        ).click();
      }
    });

    it('"Always show Octant tips" option toggle works', () => {
      cy.get('[data-test=SettingsShowTipsBox__InputToggle]').check();
      cy.get('[data-test=SettingsShowTipsBox__InputToggle]').should('be.checked');
      cy.getAllLocalStorage().then(() => {
        expect(localStorage.getItem(ARE_OCTANT_TIPS_ALWAYS_VISIBLE)).eq('true');
      });

      cy.get('[data-test=SettingsShowTipsBox__InputToggle]').click();
      cy.get('[data-test=SettingsShowTipsBox__InputToggle]').should('not.be.checked');
      cy.getAllLocalStorage().then(() => {
        expect(localStorage.getItem(ARE_OCTANT_TIPS_ALWAYS_VISIBLE)).eq('false');
      });

      cy.get('[data-test=SettingsShowTipsBox__InputToggle]').click();
      cy.get('[data-test=SettingsShowTipsBox__InputToggle]').should('be.checked');
      cy.getAllLocalStorage().then(() => {
        expect(localStorage.getItem(ARE_OCTANT_TIPS_ALWAYS_VISIBLE)).eq('true');
      });
    });

    it('"Always show Octant tips" works (checked)', () => {
      cy.get('[data-test=SettingsShowTipsBox__InputToggle]').check();

      navigateWithCheck(ROOT_ROUTES.earn.absolute);
      cy.get('[data-test=EarnView__TipTile--connectWallet]').should('exist');
      cy.get('[data-test=EarnView__TipTile--connectWallet]').should('be.visible');

      cy.get('[data-test=EarnView__TipTile--connectWallet__Button]').click();
      cy.get('[data-test=EarnView__TipTile--connectWallet]').should('not.exist');

      cy.reload();

      cy.get('[data-test=EarnView__TipTile--connectWallet]').should('exist');
      cy.get('[data-test=EarnView__TipTile--connectWallet]').should('be.visible');
    });

    it('"Always show Octant tips" works (unchecked)', () => {
      cy.get('[data-test=SettingsShowTipsBox__InputToggle]').uncheck();

      navigateWithCheck(ROOT_ROUTES.earn.absolute);
      cy.get('[data-test=EarnView__TipTile--connectWallet]').should('exist');
      cy.get('[data-test=EarnView__TipTile--connectWallet]').should('be.visible');

      cy.get('[data-test=EarnView__TipTile--connectWallet__Button]').click();
      cy.get('[data-test=EarnView__TipTile--connectWallet]').should('not.exist');

      cy.reload();

      cy.get('[data-test=EarnView__TipTile--connectWallet]').should('not.exist');
    });
  });
});

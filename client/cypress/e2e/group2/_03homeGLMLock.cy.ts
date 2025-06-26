// eslint-disable-next-line import/no-extraneous-dependencies
import chaiColors from 'chai-colors';

import { connectWallet, GLM_USD, mockCoinPricesServer, visitWithLoader } from 'cypress/utils/e2e';
import viewports from 'cypress/utils/viewports';
import {
  HAS_ONBOARDING_BEEN_CLOSED,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
} from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

chai.use(chaiColors);
Object.values(viewports).forEach(
  ({ device, viewportWidth, viewportHeight, isLargeDesktop, isDesktop }, idx) => {
    describe(`[AW IS CLOSED] HomeGlmLock: ${device}`, { viewportHeight, viewportWidth }, () => {
      before(() => {
        /**
         * Global Metamask setup done by Synpress is not always done.
         * Since Synpress needs to have valid provider to fetch the data from contracts,
         * setupMetamask is required in each test suite.
         */
        cy.setupMetamask();
        cy.clearLocalStorage();
      });

      beforeEach(() => {
        cy.disconnectMetamaskWalletFromAllDapps();
        mockCoinPricesServer();
        localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
        localStorage.setItem(IS_ONBOARDING_DONE, 'true');
        localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, 'true');
        visitWithLoader(ROOT_ROUTES.home.absolute);
      });

      it('Title is visible and has correct text', { scrollBehavior: false }, () => {
        cy.get('[data-test=HomeGridCurrentGlmLock__title]').should('be.visible');
        cy.get('[data-test=HomeGridCurrentGlmLock__title]')
          .invoke('text')
          .should('eq', 'Current GLM lock');
      });

      it('Main value is 0 (GLM/$) when wallet isn`t connected ', { scrollBehavior: false }, () => {
        cy.get('[data-test=HomeGridCurrentGlmLock--current__primary]')
          .invoke('text')
          .should('eq', '0 GLM');
        cy.get('[data-test=HomeGridCurrentGlmLock--current__secondary]')
          .invoke('text')
          .should('eq', '$0.00');
      });

      it(
        'Effective value is 0 (GLM/$) when wallet isn`t connected ',
        { scrollBehavior: false },
        () => {
          cy.get('[data-test=HomeGridCurrentGlmLock__Section--effective__DoubleValue__primary]')
            .invoke('text')
            .should('eq', '0 GLM');
          cy.get('[data-test=HomeGridCurrentGlmLock__Section--effective__DoubleValue__secondary]')
            .invoke('text')
            .should('eq', '$0.00');
        },
      );

      it('Effective label has a tooltip with correct text', { scrollBehavior: false }, () => {
        if (isLargeDesktop || isDesktop) {
          cy.get('[data-test=TooltipEffectiveLockedBalance]').trigger('mouseover');
        } else {
          cy.get('[data-test=TooltipEffectiveLockedBalance]').click();
        }

        cy.get('[data-test=TooltipEffectiveLockedBalance__content]').should('be.visible');
        cy.get('[data-test=TooltipEffectiveLockedBalance__content]')
          .invoke('text')
          .should(
            'eq',
            "Effective Lock (EL) is your GLM that's earning rewards. The more you lock and the earlier you lock it, the more you earn. Any unlocked GLM is removed from EL for the whole epoch. EL must be 100+ to earn any rewards.",
          );
      });

      it(
        'Button has "Lock GLM" text and is disabled when wallet isn`t connected',
        { scrollBehavior: false },
        () => {
          cy.get('[data-test=HomeGridCurrentGlmLock__Button]').should('be.disabled');
          cy.get('[data-test=HomeGridCurrentGlmLock__Button]')
            .invoke('text')
            .should('eq', 'Lock GLM');
        },
      );

      it('User is able to close Lock/Unlock GLM Modal', { scrollBehavior: false }, () => {
        connectWallet({ isPatronModeEnabled: false });
        cy.wait(5000);

        cy.get('[data-test=HomeGridCurrentGlmLock__Button]').click();
        cy.get('[data-test=ModalLockGlm__overflow]').should('exist');
        cy.get('[data-test=ModalLockGlm]').should('be.visible');
        cy.get('[data-test=ModalLockGlm__overflow]').click({ force: true });
        cy.get('[data-test=ModalLockGlm]').should('not.exist');
        cy.get('[data-test=HomeGridCurrentGlmLock__Button]').click();
        cy.get('[data-test=ModalLockGlm]').should('be.visible');
        cy.get('[data-test=ModalLockGlm__Button]').click();
        cy.get('[data-test=ModalLockGlm]').should('not.exist');
        cy.disconnectMetamaskWalletFromAllDapps();
      });

      it('Wallet connected: Lock 1000 GLM', { scrollBehavior: false }, () => {
        connectWallet({ isPatronModeEnabled: false });
        cy.wait(5000);

        cy.get('[data-test=HomeGridCurrentGlmLock]').scrollIntoView({
          offset: { left: 0, top: -100 },
        });
        cy.get('[data-test=HomeGridCurrentGlmLock--current__primary__DoubleValueSkeleton]', {
          timeout: 60000,
        }).should('not.exist');
        cy.wait(1000);
        cy.get('[data-test=HomeGridCurrentGlmLock--current__primary]').then($elPrev => {
          const amountToLock = 1000;
          const lockedGlms = parseInt($elPrev.text(), 10);

          cy.get('[data-test=HomeGridCurrentGlmLock__Button]').click();
          cy.get('[data-test=InputsCryptoFiat__InputText--crypto]').clear().type(`${amountToLock}`);
          cy.get('[data-test=LockGlmTabs__Button]').should('have.text', 'Lock');
          cy.wait(5000);
          cy.get('[data-test=LockGlmTabs__Button]').click();
          cy.get('[data-test=LockGlmTabs__Button]').should('have.text', 'Waiting for confirmation');
          cy.switchToMetamaskNotification();
          cy.confirmMetamaskPermissionToSpend({
            shouldWaitForPopupClosure: true,
            spendLimit: '99999999999999999999',
          });
          // Workaround for two notifications during first transaction.
          // 1. Allow the third party to spend TKN from your current balance.
          // 2. Confirm permission to spend
          if (Cypress.env('CI') === 'true' && idx === 0) {
            cy.wait(30000);
            cy.confirmMetamaskPermissionToSpend({
              spendLimit: '99999999999999999999',
            });
          }
          cy.get('[data-test=LockGlmTabs__Button]', { timeout: 180000 }).should(
            'have.text',
            'Close',
          );
          cy.get('[data-test=LockGlmNotification--success]').should('be.visible');
          cy.get('[data-test=LockGlmTabs__Button]').click();
          cy.wait(5000);
          cy.get('[data-test=HomeGridCurrentGlmLock]').scrollIntoView({
            offset: { left: 0, top: -100 },
          });
          cy.get('[data-test=HomeGridCurrentGlmLock--current__primary__DoubleValueSkeleton]', {
            timeout: 60000,
          }).should('not.exist');
          cy.wait(1000);
          cy.get('[data-test=HomeGridCurrentGlmLock--current__primary]', {
            timeout: 60000,
          }).then($elNext => {
            const lockedGlmsAfterLock = parseInt($elNext.text(), 10);
            expect(lockedGlms + amountToLock).to.be.eq(lockedGlmsAfterLock);
          });
          cy.get('[data-test=HomeGridTransactions]').scrollIntoView({
            offset: { left: 0, top: -100 },
          });
          cy.get('[data-test=TransactionsListItem__title]')
            .first()
            .should('have.text', 'Locked GLM');
          cy.get('[data-test=TransactionsListItem__DoubleValue__primary]')
            .first()
            .should('have.text', `${amountToLock} GLM`);
          cy.get('[data-test=TransactionsListItem__DoubleValue__secondary]')
            .first()
            .should('have.text', `$${(amountToLock * GLM_USD).toFixed(2)}`);

          cy.get('[data-test=TransactionsListItem]').first().click();
          cy.get('[data-test=ModalTransactionDetails]').should('be.visible');

          cy.get('[data-test=TransactionDetailsRest__amount__DoubleValue__primary]')
            .invoke('text')
            .should('eq', `${amountToLock} GLM`);
          cy.get('[data-test=TransactionDetailsRest__amount__DoubleValue__secondary]')
            .invoke('text')
            .should('eq', `$${(amountToLock * GLM_USD).toFixed(2)}`);

          cy.get('[data-test=ModalTransactionDetails__Button]').click();
          cy.get('[data-test=ModalTransactionDetails]').should('not.exist');
        });
        cy.disconnectMetamaskWalletFromAllDapps();
      });

      it('Wallet connected: Unlock 1 GLM', { scrollBehavior: false }, () => {
        connectWallet({ isPatronModeEnabled: false });
        cy.wait(5000);

        cy.get('[data-test=HomeGridCurrentGlmLock]').scrollIntoView({
          offset: { left: 0, top: -100 },
        });
        cy.get('[data-test=HomeGridCurrentGlmLock--current__primary__DoubleValueSkeleton]', {
          timeout: 60000,
        }).should('not.exist');
        cy.wait(1000);
        cy.get('[data-test=HomeGridCurrentGlmLock--current__primary]').then($elPrev => {
          const amountToUnlock = 1;
          const lockedGlms = parseInt($elPrev.text(), 10);

          cy.get('[data-test=HomeGridCurrentGlmLock__Button]').click();
          cy.get('[data-test=LockGlmTabs__tab--1]').click();
          cy.get('[data-test=InputsCryptoFiat__InputText--crypto]')
            .clear()
            .type(`${amountToUnlock}`);
          cy.get('[data-test=LockGlmTabs__Button]').should('have.text', 'Unlock');
          cy.get('[data-test=LockGlmTabs__Button]').click();
          cy.get('[data-test=LockGlmTabs__Button]').should('have.text', 'Waiting for confirmation');
          cy.switchToMetamaskNotification();
          cy.confirmMetamaskPermissionToSpend({
            shouldWaitForPopupClosure: true,
            spendLimit: '99999999999999999999',
          });
          cy.get('[data-test=LockGlmTabs__Button]', { timeout: 60000 }).should(
            'have.text',
            'Close',
          );
          cy.get('[data-test=LockGlmNotification--success]').should('be.visible');
          cy.get('[data-test=LockGlmTabs__Button]').click();
          cy.wait(5000);
          cy.get('[data-test=HomeGridCurrentGlmLock]').scrollIntoView({
            offset: { left: 0, top: -100 },
          });
          cy.get('[data-test=HomeGridCurrentGlmLock--current__primary__DoubleValueSkeleton]', {
            timeout: 60000,
          }).should('not.exist');
          cy.wait(1000);
          cy.get('[data-test=HomeGridCurrentGlmLock--current__primary]', {
            timeout: 60000,
          }).then($elNext => {
            const lockedGlmsAfterUnlock = parseInt($elNext.text(), 10);
            expect(lockedGlms - amountToUnlock).to.be.eq(lockedGlmsAfterUnlock);
          });
          cy.get('[data-test=HomeGridTransactions]').scrollIntoView({
            offset: { left: 0, top: -100 },
          });

          cy.get('[data-test=TransactionsListItem__title]')
            .first()
            .should('have.text', 'Unlocked GLM');
          cy.get('[data-test=TransactionsListItem__DoubleValue__primary]')
            .first()
            .should('have.text', `${amountToUnlock} GLM`);
          cy.get('[data-test=TransactionsListItem__DoubleValue__secondary]')
            .first()
            .should('have.text', `$${(amountToUnlock * GLM_USD).toFixed(2)}`);

          cy.get('[data-test=TransactionsListItem]').first().click();
          cy.get('[data-test=ModalTransactionDetails]').should('be.visible');

          cy.get('[data-test=TransactionDetailsRest__amount__DoubleValue__primary]')
            .invoke('text')
            .should('eq', `${amountToUnlock} GLM`);
          cy.get('[data-test=TransactionDetailsRest__amount__DoubleValue__secondary]')
            .invoke('text')
            .should('eq', `$${(amountToUnlock * GLM_USD).toFixed(2)}`);

          cy.get('[data-test=ModalTransactionDetails__Button]').click();
          cy.get('[data-test=ModalTransactionDetails]').should('not.exist');

          // Change main value to FIAT
          if (isLargeDesktop || isDesktop) {
            cy.get('[data-test=LayoutTopBar__settingsButton]').click();
            cy.get('[data-test=SettingsCryptoMainValueBox__InputToggle]').uncheck();
            cy.get('[data-test=SettingsDrawer__closeButton]').click();
          } else {
            cy.get(`[data-test=LayoutNavbar__Button--settings]`).click();
            cy.wait(500);
            cy.get('[data-test=SettingsCryptoMainValueBox]').scrollIntoView({
              offset: { left: 0, top: -100 },
            });
            cy.get('[data-test=SettingsCryptoMainValueBox__InputToggle]').uncheck();
            cy.get(`[data-test=LayoutNavbar__Button--home]`).click();
            cy.get('[data-test=HomeGridTransactions]').scrollIntoView({
              offset: { left: 0, top: -100 },
            });
          }

          cy.get('[data-test=TransactionsListItem__DoubleValue__primary]')
            .first()
            .should('have.text', `$${(amountToUnlock * GLM_USD).toFixed(2)}`);
          cy.get('[data-test=TransactionsListItem__DoubleValue__secondary]')
            .first()
            .should('have.text', `${amountToUnlock} GLM`);

          cy.get('[data-test=TransactionsListItem]').first().click();
          cy.get('[data-test=ModalTransactionDetails]').should('be.visible');

          cy.get('[data-test=TransactionDetailsRest__amount__DoubleValue__primary]')
            .invoke('text')
            .should('eq', `$${(amountToUnlock * GLM_USD).toFixed(2)}`);
          cy.get('[data-test=TransactionDetailsRest__amount__DoubleValue__secondary]')
            .invoke('text')
            .should('eq', `${amountToUnlock} GLM`);

          cy.get('[data-test=ModalTransactionDetails__Button]').click();

          // Change main value to ETH
          if (isLargeDesktop || isDesktop) {
            cy.get('[data-test=LayoutTopBar__settingsButton]').click();
            cy.get('[data-test=SettingsCryptoMainValueBox__InputToggle]').check();
            cy.get('[data-test=SettingsDrawer__closeButton]').click();
          } else {
            cy.get(`[data-test=LayoutNavbar__Button--settings]`).click();
            cy.wait(500);
            cy.get('[data-test=SettingsCryptoMainValueBox]').scrollIntoView({
              offset: { left: 0, top: -100 },
            });
            cy.get('[data-test=SettingsCryptoMainValueBox__InputToggle]').check();
            cy.get(`[data-test=LayoutNavbar__Button--home]`).click();
          }
        });
        cy.disconnectMetamaskWalletFromAllDapps();
      });
    });
  },
);

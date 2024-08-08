import {
  visitWithLoader,
  mockCoinPricesServer,
  connectWallet,
  GLM_USD,
  changeMainValueToFiat,
} from 'cypress/utils/e2e';
import { moveTime } from 'cypress/utils/moveTime';
import { ConnectWalletParameters } from 'cypress/utils/types';
import viewports from 'cypress/utils/viewports';
import {
  HAS_ONBOARDING_BEEN_CLOSED,
  IS_CRYPTO_MAIN_VALUE_DISPLAY,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
} from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

const checkValues = (isCryptoAsAMainValue: boolean) => {
  if (!isCryptoAsAMainValue) {
    changeMainValueToFiat(ROOT_ROUTES.earn.absolute);
  }

  cy.get('[data-test=BoxGlmLock__Section--current__DoubleValue__primary]')
    .invoke('text')
    .should('eq', isCryptoAsAMainValue ? '0 GLM' : '$0.00');
  cy.get('[data-test=BoxGlmLock__Section--current__DoubleValue__secondary]')
    .invoke('text')
    .should('eq', isCryptoAsAMainValue ? '$0.00' : '0 GLM');

  cy.get('[data-test=BoxGlmLock__Section--effective__DoubleValue__primary]')
    .invoke('text')
    .should('eq', isCryptoAsAMainValue ? '0 GLM' : '$0.00');
  cy.get('[data-test=BoxGlmLock__Section--effective__DoubleValue__secondary]')
    .invoke('text')
    .should('eq', isCryptoAsAMainValue ? '$0.00' : '0 GLM');

  cy.get('[data-test=BoxPersonalAllocation__Section--pending__DoubleValue__primary]')
    .invoke('text')
    .should('eq', isCryptoAsAMainValue ? '0 ETH' : '$0.00');
  cy.get('[data-test=BoxPersonalAllocation__Section--pending__DoubleValue__secondary]')
    .invoke('text')
    .should('eq', isCryptoAsAMainValue ? '$0.00' : '0 ETH');

  cy.get('[data-test=BoxPersonalAllocation__Section--availableNow__DoubleValue__primary]')
    .invoke('text')
    .should('eq', isCryptoAsAMainValue ? '0 ETH' : '$0.00');
  cy.get('[data-test=BoxPersonalAllocation__Section--availableNow__DoubleValue__secondary]')
    .invoke('text')
    .should('eq', isCryptoAsAMainValue ? '$0.00' : '0 ETH');
};

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight, isDesktop }, idx) => {
  describe(`earn: ${device}`, { viewportHeight, viewportWidth }, () => {
    before(() => {
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
      visitWithLoader(ROOT_ROUTES.earn.absolute);
    });

    after(() => {
      cy.disconnectMetamaskWalletFromAllDapps();
    });

    it('renders "Locked balance" box', () => {
      cy.get('[data-test=BoxGlmLock__BoxRounded]').should('be.visible');
    });

    it('renders "Personal allocation" box', () => {
      cy.get('[data-test=BoxPersonalAllocation]').should('be.visible');
    });

    it('renders "History"', () => {
      cy.get('[data-test=History]').should('be.visible');
    });

    it('"Lock GLM" button is visible', () => {
      cy.get('[data-test=BoxGlmLock__Button]').should('be.visible');
    });

    it('"Lock GLM" button is disabled', () => {
      cy.get('[data-test=BoxGlmLock__Button]').should('be.disabled');
    });

    it('"Withdraw to wallet" button is visible', () => {
      cy.get('[data-test=BoxPersonalAllocation__Button]').should('be.visible');
    });

    it('"Withdraw to wallet" button is disabled', () => {
      cy.get('[data-test=BoxPersonalAllocation__Button]').should('be.disabled');
    });

    it('"Effective" section has tooltip', () => {
      cy.get('[data-test=BoxGlmLock__Section--effective]').should('be.visible');
    });

    if (!isDesktop) {
      it('"Effective" section tooltip svg icon opens "TooltipEffectiveLockedBalance"', () => {
        cy.get('[data-test=BoxGlmLock__Section--effective__Svg]').click();
        cy.get('[data-test=TooltipEffectiveLockedBalance]').should('be.visible');
      });
    }

    it('Wallet connected: "Lock GLM" / "Edit Locked GLM" button is active', () => {
      connectWallet({ isPatronModeEnabled: false });
      cy.get('[data-test=BoxGlmLock__Button]').should('not.be.disabled');
    });

    it('Wallet connected: "Lock GLM" / "Edit Locked GLM" button opens "ModalGlmLock"', () => {
      connectWallet({ isPatronModeEnabled: false });
      cy.get('[data-test=BoxGlmLock__Button]').click();
      cy.get('[data-test=ModalGlmLock]').should('be.visible');
    });

    it('Wallet connected: "ModalGlmLock" has overflow', () => {
      connectWallet({ isPatronModeEnabled: false });
      cy.get('[data-test=BoxGlmLock__Button]').click();
      cy.get('[data-test=ModalGlmLock__overflow]').should('exist');
    });

    it('Wallet connected: inputs allow to type multiple characters without focus problems', () => {
      /**
       * In EarnGlmLock there are multiple autofocus rules set.
       * This test checks if user is still able to type without any autofocus disruption.
       */
      connectWallet({ isPatronModeEnabled: false });
      cy.get('[data-test=BoxGlmLock__Button]').click();
      cy.get('[data-test=ModalGlmLock]').should('be.visible');
      cy.get('[data-test=InputsCryptoFiat__InputText--crypto]').should('have.focus');
      cy.get('[data-test=InputsCryptoFiat__InputText--crypto]').clear().type('100');
      cy.get('[data-test=InputsCryptoFiat__InputText--crypto]').should('have.value', '100');
      cy.get('[data-test=EarnGlmLockTabs__tab--1]').click();
      cy.get('[data-test=InputsCryptoFiat__InputText--crypto]').clear().type('100');
      cy.get('[data-test=InputsCryptoFiat__InputText--crypto]').should('have.value', '100');
    });

    it('Wallet connected: "ModalGlmLock" - changing tabs keep focus on first input', () => {
      connectWallet({ isPatronModeEnabled: false });
      cy.get('[data-test=BoxGlmLock__Button]').click();
      cy.get('[data-test=ModalGlmLock]').should('be.visible');
      cy.get('[data-test=InputsCryptoFiat__InputText--crypto]').should('have.focus');
      cy.get('[data-test=EarnGlmLockTabs__tab--1]').click();
      cy.get('[data-test=InputsCryptoFiat__InputText--crypto]').should('have.focus');
      cy.get('[data-test=EarnGlmLockTabs__tab--0]').click();
      cy.get('[data-test=InputsCryptoFiat__InputText--crypto]').should('have.focus');
    });

    it('Wallet connected: Lock 1 GLM', () => {
      connectWallet({ isPatronModeEnabled: false });

      cy.get('[data-test=BoxGlmLock__Section--current__DoubleValue__primary]')
        .invoke('text')
        .then(text => {
          const amountToLock = 1;
          const lockedGlms = parseInt(text, 10);

          cy.get('[data-test=BoxGlmLock__Button]').click();
          cy.get('[data-test=InputsCryptoFiat__InputText--crypto]').clear().type(`${amountToLock}`);
          cy.get('[data-test=GlmLockTabs__Button]').should('have.text', 'Lock');
          cy.get('[data-test=GlmLockTabs__Button]').click();
          cy.get('[data-test=GlmLockTabs__Button]').should('have.text', 'Waiting for confirmation');
          cy.confirmMetamaskPermissionToSpend({
            spendLimit: '99999999999999999999',
          });
          // Workaround for two notifications during first transaction.
          // 1. Allow the third party to spend TKN from your current balance.
          // 2. Confirm permission to spend
          if (Cypress.env('CI') === 'true' && idx === 0) {
            cy.wait(1000);
            cy.confirmMetamaskPermissionToSpend({
              spendLimit: '99999999999999999999',
            });
          }
          cy.get('[data-test=GlmLockTabs__Button]', { timeout: 180000 }).should(
            'have.text',
            'Close',
          );
          cy.get('[data-test=GlmLockNotification--success]').should('be.visible');
          cy.get('[data-test=GlmLockTabs__Button]').click();
          cy.get(
            '[data-test=BoxGlmLock__Section--current__DoubleValue__DoubleValueSkeleton]',
            // Small timeout ensures skeleton shows up quickly after the transaction.
            { timeout: 1000 },
          ).should('be.visible');
          cy.get('[data-test=BoxGlmLock__Section--current__DoubleValue__primary]', {
            timeout: 60000,
          })
            .invoke('text')
            .then(nextText => {
              const lockedGlmsAfterLock = parseInt(nextText, 10);
              expect(lockedGlms + amountToLock).to.be.eq(lockedGlmsAfterLock);
            });
          cy.get('[data-test=HistoryItem__title]').first().should('have.text', 'Locked GLM');
          cy.get('[data-test=HistoryItem__DoubleValue__primary]')
            .first()
            .should('have.text', '1 GLM');
        });
    });

    it('Wallet connected: Unlock 1 GLM', () => {
      connectWallet({ isPatronModeEnabled: false });

      cy.get('[data-test=BoxGlmLock__Section--current__DoubleValue__primary]')
        .invoke('text')
        .then(text => {
          const amountToUnlock = 1;
          const lockedGlms = parseInt(text, 10);

          cy.get('[data-test=BoxGlmLock__Button]').click();
          cy.get('[data-test=EarnGlmLockTabs__tab--1]').click();
          cy.get('[data-test=InputsCryptoFiat__InputText--crypto]')
            .clear()
            .type(`${amountToUnlock}`);
          cy.get('[data-test=GlmLockTabs__Button]').should('have.text', 'Unlock');
          cy.get('[data-test=GlmLockTabs__Button]').click();
          cy.get('[data-test=GlmLockTabs__Button]').should('have.text', 'Waiting for confirmation');
          cy.confirmMetamaskPermissionToSpend({
            shouldWaitForPopupClosure: true,
            spendLimit: '99999999999999999999',
          });
          cy.get('[data-test=GlmLockTabs__Button]', { timeout: 60000 }).should(
            'have.text',
            'Close',
          );
          cy.get('[data-test=GlmLockNotification--success]').should('be.visible');
          cy.get('[data-test=GlmLockTabs__Button]').click();
          cy.get(
            '[data-test=BoxGlmLock__Section--current__DoubleValue__DoubleValueSkeleton]',
            // Small timeout ensures skeleton shows up quickly after the transaction.
            { timeout: 1000 },
          ).should('be.visible');
          cy.get('[data-test=BoxGlmLock__Section--current__DoubleValue__primary]', {
            timeout: 60000,
          })
            .invoke('text')
            .then(nextText => {
              const lockedGlmsAfterUnlock = parseInt(nextText, 10);
              expect(lockedGlms - amountToUnlock).to.be.eq(lockedGlmsAfterUnlock);
            });
          cy.get('[data-test=HistoryItem__title]').first().should('have.text', 'Unlocked GLM');
          cy.get('[data-test=HistoryItem__DoubleValue__primary]')
            .first()
            .should('have.text', '1 GLM');
          cy.get('[data-test=HistoryItem__DoubleValue__secondary]')
            .first()
            .should('have.text', `$${(1 * GLM_USD).toFixed(2)}`);

          cy.get('[data-test=HistoryItem]').first().click();
          cy.get('[data-test=EarnHistoryItemDetailsModal]').should('be.visible');

          cy.get('[data-test=EarnHistoryItemDetailsRest__amount__DoubleValue__primary]')
            .invoke('text')
            .should('eq', '1 GLM');
          cy.get('[data-test=EarnHistoryItemDetailsRest__amount__DoubleValue__secondary]')
            .invoke('text')
            .should('eq', `$${(1 * GLM_USD).toFixed(2)}`);

          cy.get('[data-test=EarnHistoryItemDetailsModal__Button]').click();
          cy.get('[data-test=EarnHistoryItemDetailsModal]').should('not.be.visible');

          changeMainValueToFiat(ROOT_ROUTES.earn.absolute);

          cy.get('[data-test=HistoryItem__DoubleValue__primary]')
            .first()
            .should('have.text', `$${(1 * GLM_USD).toFixed(2)}`);
          cy.get('[data-test=HistoryItem__DoubleValue__secondary]')
            .first()
            .should('have.text', '1 GLM');

          cy.get('[data-test=HistoryItem]').first().click();
          cy.get('[data-test=EarnHistoryItemDetailsModal]').should('be.visible');

          cy.get('[data-test=EarnHistoryItemDetailsRest__amount__DoubleValue__primary]')
            .invoke('text')
            .should('eq', `$${(1 * GLM_USD).toFixed(2)}`);
          cy.get('[data-test=EarnHistoryItemDetailsRest__amount__DoubleValue__secondary]')
            .invoke('text')
            .should('eq', `1 GLM`);
        });
    });

    it('Wallet connected: Effective deposit after locking 1000 GLM and moving epoch is equal to current deposit', () => {
      const connectWalletParameters: ConnectWalletParameters = {
        isPatronModeEnabled: false,
      };
      connectWallet(connectWalletParameters);

      cy.get('[data-test=BoxGlmLock__Section--current__DoubleValue__primary]')
        .invoke('text')
        .then(text => {
          const amountToLock = 1000;
          const lockedGlms = parseInt(text.replace(/\u200a/g, ''), 10);

          cy.get('[data-test=BoxGlmLock__Button]').click();
          cy.get('[data-test=InputsCryptoFiat__InputText--crypto]').clear().type(`${amountToLock}`);
          cy.get('[data-test=GlmLockTabs__Button]').should('have.text', 'Lock');
          cy.get('[data-test=GlmLockTabs__Button]').click();
          cy.get('[data-test=GlmLockTabs__Button]').should('have.text', 'Waiting for confirmation');
          cy.confirmMetamaskPermissionToSpend({
            spendLimit: '99999999999999999999',
          });
          cy.get('[data-test=GlmLockTabs__Button]', { timeout: 180000 }).should(
            'have.text',
            'Close',
          );
          cy.get('[data-test=GlmLockNotification--success]').should('be.visible');
          cy.get('[data-test=GlmLockTabs__Button]').click();
          cy.get(
            '[data-test=BoxGlmLock__Section--current__DoubleValue__DoubleValueSkeleton]',
            // Small timeout ensures skeleton shows up quickly after the transaction.
            { timeout: 1000 },
          ).should('be.visible');
          // Waiting for skeletons to disappear ensures Graph indexed lock/unlock.
          cy.get('[data-test=BoxGlmLock__Section--current__DoubleValue__DoubleValueSkeleton]', {
            timeout: 60000,
          }).should('not.exist');
          cy.window().then(async win => {
            cy.wrap(null).then(() => {
              return moveTime(win, 'nextEpochDecisionWindowClosed', connectWalletParameters).then(
                () => {
                  cy.get('[data-test=BoxGlmLock__Section--current__DoubleValue__primary]', {
                    timeout: 60000,
                  })
                    .invoke('text')
                    .then(nextText => {
                      const lockedGlmsAfterLock = parseInt(nextText.replace(/\u200a/g, ''), 10);
                      expect(lockedGlms + amountToLock).to.be.eq(lockedGlmsAfterLock);
                    });
                  cy.get('[data-test=BoxGlmLock__Section--effective__DoubleValue__primary]', {
                    timeout: 60000,
                  })
                    .invoke('text')
                    .then(nextText => {
                      const lockedGlmsAfterLock = parseInt(nextText.replace(/\u200a/g, ''), 10);
                      expect(lockedGlms + amountToLock).to.be.eq(lockedGlmsAfterLock);
                    });
                },
              );
            });
          });
        });
    });

    it(`check boxes values ${IS_CRYPTO_MAIN_VALUE_DISPLAY}: true`, () => {
      checkValues(true);
    });

    it(`check boxes values ${IS_CRYPTO_MAIN_VALUE_DISPLAY}: false`, () => {
      checkValues(false);
    });
  });
});

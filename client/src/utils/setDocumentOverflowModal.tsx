import { FIXED_ELEMENT_CLASSNAME } from 'constants/css';

const getElementsWithPositionFixed = (): HTMLCollectionOf<HTMLElement> => {
  return document.getElementsByClassName(FIXED_ELEMENT_CLASSNAME) as HTMLCollectionOf<HTMLElement>;
};

let scrollbarWidth: number | undefined;
export default function setDocumentOverflowModal(isOpen: boolean, durationOfClosing: number): void {
  /**
   * scrollbarWidth needs to be set once.
   * When it's not, following scenario happens:
   * 1. Open a modal on desktop (or mobile).
   * 2. Change the width of the view to the other (desktop => mobile / mobile => desktop).
   * 3. Close the modal.
   * 4. FIXED_ELEMENT_CLASSNAME elements move to the left/right.
   *
   * It happens because setDocumentOverflowModal is triggered
   * with isOpen === true during change between mobile/desktop.
   * When it happens, since scrollbar is hidden, its width is 0, causing padding offsetting
   * the scrollbar to disappear.
   */
  if (scrollbarWidth === undefined) {
    const documentWidth = document.documentElement.clientWidth;
    const windowWidth = window.innerWidth;
    scrollbarWidth = windowWidth - documentWidth;
  }
  if (!isOpen) {
    setTimeout(() => {
      document.body.style.overflowY = 'scroll';
      document.body.style.paddingRight = '0';

      [...getElementsWithPositionFixed()].forEach(fixedElement => {
        // eslint-disable-next-line no-param-reassign
        fixedElement.style.paddingRight = '0';
        fixedElement.classList.remove('isScrollbarOffsetEnabled');
      });
    }, durationOfClosing);
    return;
  }
  /**
   * Overflow hidden is added to prevent scrolling of the body while modal is open.
   * Scrollbar width is added as padding to offset modal's disappearance.
   */
  document.body.style.overflowY = 'hidden';
  document.body.style.paddingRight = `${scrollbarWidth}px`;
  [...getElementsWithPositionFixed()].forEach(fixedElement => {
    // eslint-disable-next-line no-param-reassign
    fixedElement.style.paddingRight = `${scrollbarWidth}px`;
    fixedElement.classList.add('isScrollbarOffsetEnabled');
  });
}

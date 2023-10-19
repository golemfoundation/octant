export default function setDocumentOverflowModal(isOpen: boolean, durationOfClosing: number): void {
  if (!isOpen) {
    setTimeout(() => {
      document.body.style.overflowY = 'scroll';
      document.body.style.paddingRight = `0`;
    }, durationOfClosing);
    return;
  }
  /**
   * Overflow hidden is added to prevent scrolling of the body while modal is open.
   * Scrollbar width is added as padding to offset modal's disappearance.
   */
  const documentWidth = document.documentElement.clientWidth;
  const windowWidth = window.innerWidth;
  const scrollBarWidth = windowWidth - documentWidth; // scrollbar width
  document.body.style.paddingRight = `${scrollBarWidth}px`;
  document.body.style.overflowY = 'hidden';
}

/**
 * The chrome every page shares: the full-screen menu and the block page
 * transition. Imported for its side effect, so a page picks both up with one
 * line and neither is duplicated across six HTML files.
 *
 * privacy.html and terms.html deliberately stay out of this — they are
 * standalone documents with their own inline styles and no bundle.
 */

import NavMenu from './animations/NavMenu';
import PageTransition from './animations/PageTransition';

document.addEventListener('DOMContentLoaded', () => {
  new NavMenu();
  new PageTransition();
});

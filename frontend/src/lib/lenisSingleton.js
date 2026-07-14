// Small singleton retained for API compatibility; scrolling uses native
// browser smooth-scroll (CSS `scroll-behavior: smooth`) which -- unlike
// Lenis's transform-based approach -- plays correctly with keyboard nav,
// browser back/forward + scroll restoration, deep links, and automated
// testing tools that call scrollIntoView/scrollTo programmatically.
export function setLenisInstance(_instance) {
  // no-op: native scrolling only
}

export function scrollToElement(idOrEl, _options = {}) {
  let el = typeof idOrEl === "string" ? document.getElementById(idOrEl) : idOrEl;
  if (!el && typeof idOrEl === "string") {
    el = document.querySelector(`[data-section-type="${idOrEl}"]`);
  }
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

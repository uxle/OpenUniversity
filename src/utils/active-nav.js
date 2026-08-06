// src/utils/active-nav.js — marks the nav link matching the current route
// with aria-current="page" (screen readers announce it, and CSS hooks
// off it for active-tab styling). Not automatic in the router itself,
// since nav chrome and routing are otherwise decoupled by design.

export function markActiveNavLink(navContainer, currentPath) {
  const links = navContainer.querySelectorAll("a[href^='#/']");
  links.forEach((link) => {
    const linkPath = link.getAttribute("href").slice(1); // drop leading '#'
    const isActive = linkPath === "/" ? currentPath === "/" : currentPath.startsWith(linkPath);
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

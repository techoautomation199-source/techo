// ===================== TECHO — SHARED NAV SCRIPT =====================
// Handles the mobile hamburger menu open/close on every page.

document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });

    // close the menu automatically once a link is tapped (mobile UX)
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
      });
    });
  }
});

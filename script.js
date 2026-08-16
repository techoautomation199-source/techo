// ===================== TECHO — SHARED NAV SCRIPT =====================
// Handles the mobile hamburger menu open/close on every page, and a
// hidden gesture: holding the logo for 5 seconds opens the internal
// Admin/Student portal (not linked anywhere else on the public site).

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

  const logo = document.querySelector('.logo');
  if (logo) {
    let holdTimer = null;
    const HOLD_MS = 5000;

    const startHold = function () {
      holdTimer = setTimeout(function () {
        window.location.href = 'portal.html';
      }, HOLD_MS);
    };
    const cancelHold = function () {
      if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
    };

    logo.addEventListener('mousedown', startHold);
    logo.addEventListener('touchstart', startHold, { passive: true });
    ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach(function (evt) {
      logo.addEventListener(evt, cancelHold);
    });
  }
});

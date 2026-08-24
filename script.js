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

  // ---- Home page live stats counter (Happy Customers / Industries /
  // Total Projects / Completed Projects / Trained Students) ----
  const statsGrid = document.getElementById('statsCounterGrid');

  // Counts a single number span up from 1 to its target value, then stops.
  const runCounterAnimation = function (el, target) {
    const endValue = parseFloat(target);
    if (isNaN(endValue)) { el.textContent = target; return; }

    const isInt = Number.isInteger(endValue);
    const duration = 1500; // ms
    const startValue = endValue > 1 ? 1 : endValue;
    let startTime = null;

    const step = function (timestamp) {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // ease-out for a smooth finish
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * eased;
      el.textContent = isInt ? Math.round(current) : current.toFixed(1);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = isInt ? endValue : endValue.toFixed(1);
      }
    };

    window.requestAnimationFrame(step);
  };

  if (statsGrid && typeof TECHO_SCRIPT_URL !== 'undefined') {
    fetch(TECHO_SCRIPT_URL + '?action=getSiteStats')
      .then(function (res) { return res.json(); })
      .then(function (stats) {
        const map = {
          scHappyCustomers: stats.happyCustomers,
          scIndustries: stats.industries,
          scTotalProjects: stats.totalProjects,
          scCompletedProjects: stats.completedProjects,
          scTrainedStudents: stats.trainedStudents
        };

        // Store final values on the elements and show them immediately
        // as a fallback; the observer below replaces this with the
        // count-up animation the moment the section is scrolled into view.
        let played = false;
        Object.keys(map).forEach(function (id) {
          const el = document.getElementById(id);
          if (el) el.textContent = map[id];
        });

        if ('IntersectionObserver' in window) {
          const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting && !played) {
                played = true;
                Object.keys(map).forEach(function (id) {
                  const el = document.getElementById(id);
                  if (el && map[id] !== undefined && map[id] !== null && map[id] !== '') {
                    runCounterAnimation(el, map[id]);
                  }
                });
                observer.disconnect();
              }
            });
          }, { threshold: 0.3 });

          observer.observe(statsGrid);
        }
      })
      .catch(function (err) { console.error('Could not load site stats:', err); });
  }
});

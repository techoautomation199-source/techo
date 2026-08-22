/* =========================================================================
   TECHO — RATE US / FEEDBACK PAGE
   -------------------------------------------------------------------------
   Uses the same Apps Script backend as excel.js / services.js
   (techoautomation199@gmail.com). Feedback is saved to a "Feedback" tab
   in the Sheet, a notification email goes to the institute, and this page
   shows live Trainee / Service / Total feedback counts.
   ========================================================================= */


/* ---------------- star rating widget ---------------- */
function setupStarRating(wrapId, hiddenInputId) {
  const wrap = document.getElementById(wrapId);
  const hidden = document.getElementById(hiddenInputId);
  if (!wrap || !hidden) return;
  const stars = Array.from(wrap.querySelectorAll('i'));

  function paint(value) {
    stars.forEach(function (s) {
      s.classList.toggle('filled', Number(s.getAttribute('data-star')) <= value);
    });
  }

  stars.forEach(function (s) {
    s.addEventListener('click', function () {
      const val = Number(s.getAttribute('data-star'));
      hidden.value = val;
      wrap.setAttribute('data-value', val);
      paint(val);
    });
    s.addEventListener('mouseenter', function () {
      paint(Number(s.getAttribute('data-star')));
    });
  });
  wrap.addEventListener('mouseleave', function () {
    paint(Number(hidden.value) || 0);
  });
}

/* ---------------- Trainee / Service toggle ---------------- */
function setupToggle() {
  const toggle = document.getElementById('ratingToggle');
  const studentForm = document.getElementById('studentRatingForm');
  const serviceForm = document.getElementById('serviceRatingForm');
  if (!toggle) return;

  toggle.querySelectorAll('.rt-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      toggle.querySelectorAll('.rt-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      const type = btn.getAttribute('data-type');
      studentForm.style.display = (type === 'student') ? 'flex' : 'none';
      serviceForm.style.display = (type === 'service') ? 'flex' : 'none';
    });
  });
}

/* ---------------- live counts ---------------- */
function renderPie(pieId, aCount, bCount, colorA, colorB) {
  const pie = document.getElementById(pieId);
  if (!pie) return;
  const total = aCount + bCount;
  if (total === 0) {
    pie.style.background = 'conic-gradient(var(--border) 0deg 360deg)';
    return;
  }
  const aDeg = (aCount / total) * 360;
  pie.style.background =
    'conic-gradient(' + colorA + ' 0deg ' + aDeg + 'deg, ' + colorB + ' ' + aDeg + 'deg 360deg)';
}

function renderProblemPie(problemCount, noProblemCount) {
  document.getElementById('pcProblemCount').textContent = problemCount;
  document.getElementById('pcNoProblemCount').textContent = noProblemCount;
  renderPie('problemPie', problemCount, noProblemCount, 'var(--red)', 'var(--green)');
}

function renderUpgradePie(upgradeCount, noUpgradeCount) {
  document.getElementById('pcUpgradeCount').textContent = upgradeCount;
  document.getElementById('pcNoUpgradeCount').textContent = noUpgradeCount;
  renderPie('upgradePie', upgradeCount, noUpgradeCount, 'var(--blue)', '#c7cce0');
}

function renderRatingBars(ratingCounts) {
  const counts = ratingCounts || {};
  const max = Math.max(1, counts['1'] || 0, counts['2'] || 0, counts['3'] || 0, counts['4'] || 0, counts['5'] || 0);
  [1, 2, 3, 4, 5].forEach(function (star) {
    const n = counts[String(star)] || 0;
    const fill = document.getElementById('rbFill' + star);
    const countEl = document.getElementById('rbCount' + star);
    if (fill) fill.style.width = ((n / max) * 100) + '%';
    if (countEl) countEl.textContent = n;
  });
}

async function loadFeedbackCounts() {
  try {
    const res = await fetch(TECHO_SCRIPT_URL + '?action=getFeedbackCounts');
    const data = await res.json();
    document.getElementById('rcStudent').textContent = data.student ?? 0;
    document.getElementById('rcService').textContent = data.service ?? 0;
    document.getElementById('rcTotal').textContent = data.total ?? 0;
    renderProblemPie(data.problemCount ?? 0, data.noProblemCount ?? 0);
    renderUpgradePie(data.upgradeCount ?? 0, data.noUpgradeCount ?? 0);
    renderRatingBars(data.ratingCounts);
  } catch (err) {
    console.error('Could not load feedback counts:', err);
    document.getElementById('rcStudent').textContent = '—';
    document.getElementById('rcService').textContent = '—';
    document.getElementById('rcTotal').textContent = '—';
  }
}

/* ---------------- submit handling ---------------- */
async function sendFeedback(payload) {
  await fetch(TECHO_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  });
}

function showThankYou() {
  const overlay = document.getElementById('ratingPopupOverlay');
  if (!overlay) return;
  overlay.classList.add('show');
  setTimeout(function () { overlay.classList.remove('show'); }, 4000);
}

function currentLang() {
  return localStorage.getItem('techoLang') || 'en';
}

function wireForm(formId, errId, submitBtnId, ratingHiddenId, type) {
  const form = document.getElementById(formId);
  if (!form) return;
  const errEl = document.getElementById(errId);
  const submitBtn = document.getElementById(submitBtnId);

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    errEl.textContent = '';

    const rating = Number(document.getElementById(ratingHiddenId).value) || 0;
    if (rating < 1) {
      errEl.textContent = (TECHO_I18N.rt_select_rating && TECHO_I18N.rt_select_rating[currentLang()]) || 'Please select a star rating.';
      return;
    }

    const payload = {
      action: 'submitFeedback',
      timestamp: new Date().toLocaleString(),
      type: type,
      rating: rating
    };

    if (type === 'student') {
      payload.name = document.getElementById('srtName').value.trim();
      payload.upgrade = document.getElementById('srtUpgrade').value.trim();
      payload.problem = document.getElementById('srtProblem').value.trim();
    } else {
      payload.name = document.getElementById('svrName').value.trim();
      payload.service = document.getElementById('svrService').value.trim();
      payload.upgrade = document.getElementById('svrUpgrade').value.trim();
      payload.problem = document.getElementById('svrProblem').value.trim();
    }

    submitBtn.disabled = true;
    try {
      await sendFeedback(payload);
      showThankYou();
      form.reset();
      document.getElementById(ratingHiddenId).value = 0;
      document.querySelectorAll('#' + formId + ' .star-rating i').forEach(function (s) { s.classList.remove('filled'); });
      loadFeedbackCounts();
    } catch (err) {
      console.error('Feedback send failed:', err);
      errEl.textContent = (TECHO_I18N.rt_send_fail && TECHO_I18N.rt_send_fail[currentLang()]) || 'Could not send your feedback. Please try again.';
    }
    submitBtn.disabled = false;
  });
}

document.addEventListener('DOMContentLoaded', function () {
  setupStarRating('srtStars', 'srtRatingValue');
  setupStarRating('svrStars', 'svrRatingValue');
  setupToggle();
  wireForm('studentRatingForm', 'srtError', 'srtSubmitBtn', 'srtRatingValue', 'student');
  wireForm('serviceRatingForm', 'svrError', 'svrSubmitBtn', 'svrRatingValue', 'service');
  loadFeedbackCounts();
});

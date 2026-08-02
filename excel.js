/* =========================================================================
   TECHO — ENROLLMENT FORM BACKEND LOGIC
   -------------------------------------------------------------------------
   On "SUBMIT ENROLLMENT" the form sends the entry (including the selected
   Training options) to a Google Apps Script Web App, which appends it as
   a new row in YOUR Google Sheet ("TECHO Site Visit"). This works from
   ANY device, anywhere — every submission lands directly in that one
   central Google Sheet, and the institute's Google account also emails
   the student an automatic confirmation.

   Whenever you want an Excel (.xlsx) copy on your Desktop:
   open the Google Sheet -> File -> Download -> Microsoft Excel (.xlsx).
   ========================================================================= */

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyhYAaSkRumPZHy_OAyG6u5gzar2Tu2Rs9dU6NVfiV5xcpUTcLpseONlscWnul0XN86/exec";

/* ---------------- send the entry to the central Google Sheet ------------ */
async function saveToGoogleSheet(data) {
  if (!SCRIPT_URL || SCRIPT_URL.indexOf('PASTE_YOUR_WEB_APP_URL_HERE') !== -1) {
    throw new Error('SCRIPT_URL not configured yet');
  }
  await fetch(SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(data)
  });
}

/* ---------------- TRAINING SELECTOR (nested checkboxes) ----------------- */
function setupTrainingSelector() {
  const groupsWrap = document.getElementById('trainingGroups');
  if (!groupsWrap) return;

  // Expand/collapse the sub-options when a main training checkbox is toggled
  groupsWrap.querySelectorAll('.main-training').forEach(function (mainBox) {
    mainBox.addEventListener('change', function () {
      const targetId = mainBox.getAttribute('data-target');
      if (!targetId) return;
      const subBox = document.getElementById(targetId);
      if (!subBox) return;
      if (mainBox.checked) {
        subBox.classList.add('open');
      } else {
        subBox.classList.remove('open');
        // unchecking the main option clears its sub-selections too
        subBox.querySelectorAll('input[type="checkbox"]').forEach(function (cb) { cb.checked = false; });
      }
    });
  });

  // "Select All" within a group checks/unchecks every other checkbox in that group
  groupsWrap.querySelectorAll('.select-all').forEach(function (allBox) {
    allBox.addEventListener('change', function () {
      const subOptions = allBox.closest('.sub-options');
      if (!subOptions) return;
      subOptions.querySelectorAll('input[type="checkbox"]:not(.select-all)').forEach(function (cb) {
        cb.checked = allBox.checked;
      });
    });
  });
}

/* Build a readable "PLC (Delta, Siemens); SCADA (InTouch); AUTO CAD" string
   from the checked boxes, for the Training column in the Sheet. */
function collectTrainingSelection() {
  const groupsWrap = document.getElementById('trainingGroups');
  if (!groupsWrap) return '';

  const parts = [];
  groupsWrap.querySelectorAll('.training-group').forEach(function (group) {
    const mainBox = group.querySelector('.main-training');
    if (!mainBox || !mainBox.checked) return;

    const subWrap = group.querySelector('.sub-options');
    if (!subWrap) {
      parts.push(mainBox.value);
      return;
    }
    const chosen = Array.from(subWrap.querySelectorAll('input[type="checkbox"]:not(.select-all)'))
      .filter(function (cb) { return cb.checked; })
      .map(function (cb) { return cb.value; });

    parts.push(chosen.length ? mainBox.value + ' (' + chosen.join(', ') + ')' : mainBox.value);
  });
  return parts.join('; ');
}

/* ---------------- THANK YOU POPUP ---------------------------------------- */
function showPopup(title, message, isError) {
  const overlay = document.getElementById('popupOverlay');
  const icon = document.getElementById('popupIcon');
  const titleEl = document.getElementById('popupTitle');
  const msgEl = document.getElementById('popupMessage');
  if (!overlay) return;

  titleEl.textContent = title;
  msgEl.textContent = message;
  icon.className = isError
    ? 'fa-solid fa-circle-exclamation popup-icon'
    : 'fa-solid fa-circle-check popup-icon';
  icon.style.color = isError ? '#e53935' : '';

  overlay.classList.add('show');
  setTimeout(function () {
    overlay.classList.remove('show');
  }, 4000);
}

/* ---------------- wire up the form -------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
  setupTrainingSelector();

  const form = document.getElementById('enrollForm');
  if (!form) return;

  const submitBtn = document.getElementById('submitBtn');
  const saveNote = document.getElementById('saveNote');
  const trainingHint = document.getElementById('trainingHint');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const training = collectTrainingSelection();
    if (!training) {
      if (trainingHint) trainingHint.classList.add('show');
      document.getElementById('trainingGroups').scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (trainingHint) trainingHint.classList.remove('show');

    const data = {
      timestamp: new Date().toLocaleString(),
      fullName: document.getElementById('fullName').value.trim(),
      address: document.getElementById('address').value.trim(),
      email: document.getElementById('email').value.trim(),
      mobile: document.getElementById('mobile').value.trim(),
      whatsapp: document.getElementById('whatsapp').value.trim(),
      college: document.getElementById('college').value.trim(),
      qualification: document.getElementById('qualification').value,
      enrollDate: document.getElementById('enrollDate').value,
      training: training
    };

    submitBtn.disabled = true;
    let cloudOk = false;

    try {
      await saveToGoogleSheet(data);
      cloudOk = true;
    } catch (err) {
      console.error('Google Sheet save failed:', err);
    }

    if (cloudOk) {
      showPopup(
        'Thank You!',
        'Thank you for submitting the form. You will receive a phone call from TECHO Institute shortly.',
        false
      );
      if (saveNote) saveNote.textContent = 'Saved directly to the central TECHO Google Sheet.';
      form.reset();
      document.querySelectorAll('.sub-options.open').forEach(function (el) { el.classList.remove('open'); });
    } else {
      showPopup(
        'Could Not Submit',
        'We could not reach the server. Please check your internet connection and try again.',
        true
      );
      if (saveNote) saveNote.textContent = 'Central save failed — check the SCRIPT_URL / your internet connection.';
    }

    submitBtn.disabled = false;
  });
});

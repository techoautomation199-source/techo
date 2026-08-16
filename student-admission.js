const ADMIN_SCRIPT_URL_SA = "https://script.google.com/macros/s/AKfycbw3UmPIGbGPyVLkjcnPeAbTezSLP5ljYHyImD_VvUd5kS5OM6GP3IpOVu4gTIjqcZgWGQ/exec";

async function apiSA(action, payload) {
  const body = Object.assign({ action: action }, payload || {});
  const res = await fetch(ADMIN_SCRIPT_URL_SA, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body)
  });
  return res.json();
}

function checkedValues(name) {
  return Array.from(document.querySelectorAll('input[name="' + name + '"]:checked')).map(function (el) { return el.value; });
}
function radioValue(name) {
  const el = document.querySelector('input[name="' + name + '"]:checked');
  return el ? el.value : '';
}

document.addEventListener('DOMContentLoaded', function () {
  const totalEl = document.getElementById('feeTotal');
  const paidEl = document.getElementById('feePaid');
  const balEl = document.getElementById('feeBalance');
  function recalc() {
    const total = Number(totalEl.value) || 0;
    const paid = Number(paidEl.value) || 0;
    balEl.value = total - paid;
  }
  totalEl.addEventListener('input', recalc);
  paidEl.addEventListener('input', recalc);

  document.getElementById('btnReset').addEventListener('click', function () {
    document.getElementById('formAdmission').reset();
    balEl.value = '';
  });

  document.getElementById('formAdmission').addEventListener('submit', async function (e) {
    e.preventDefault();
    const errEl = document.getElementById('admError');
    errEl.textContent = '';

    const payload = {
      fullName: document.getElementById('stName').value.trim(),
      mobile: document.getElementById('stMobile').value.trim(),
      whatsapp: document.getElementById('stWhatsapp').value.trim(),
      email: document.getElementById('stEmail').value.trim(),
      aadhaar: document.getElementById('stAadhaar').value.trim(),
      address: [
        document.getElementById('addHouse').value.trim(),
        document.getElementById('addCity').value.trim(),
        document.getElementById('addTaluka').value.trim(),
        document.getElementById('addDistrict').value.trim(),
        document.getElementById('addState').value.trim(),
        document.getElementById('addPin').value.trim()
      ].filter(Boolean).join(', '),
      course: checkedValues('course').join(', '),
      batch: radioValue('batch'),
      admissionDate: document.getElementById('admDate').value,
      totalFee: document.getElementById('feeTotal').value,
      paidFee: document.getElementById('feePaid').value,
      createdBy: 'Admin'
    };

    let result;
    if (!payload.course) { errEl.textContent = 'Please select at least one course.'; return; }
    try {
      result = await apiSA('addStudent', payload);
    } catch (err) {
      errEl.textContent = 'Could not reach the server. Check that ADMIN_SCRIPT_URL is set correctly in student-admission.js.';
      console.error(err);
      return;
    }
    if (result.error) { errEl.textContent = result.error; return; }

    document.getElementById('popupMsg').textContent = 'Student ID: ' + result.id + ' | Password: ' + result.password;
    document.getElementById('popupOverlay').classList.add('show');
    document.getElementById('formAdmission').reset();
    setTimeout(function () {
      window.location.href = 'fee-receipt.html?studentId=' + encodeURIComponent(result.id);
    }, 2500);
  });
});

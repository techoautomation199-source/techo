async function apiSA(action, payload) {
  const body = Object.assign({ action: action }, payload || {});
  const res = await fetch(TECHO_SCRIPT_URL, {
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

let _saPhotoCtl = null;

document.addEventListener('DOMContentLoaded', function () {
  _saPhotoCtl = techoSetupPhotoUpload({
    fileInputId: 'saPhotoFile', previewImgId: 'saPhotoImg', previewBoxId: 'saPhotoPreview',
    hiddenUrlId: 'saPhoto', removeBtnId: 'saPhotoRemove', errorId: 'saPhotoError'
  });

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
    if (_saPhotoCtl) _saPhotoCtl.reset();
  });

  document.getElementById('formAdmission').addEventListener('submit', async function (e) {
    e.preventDefault();
    const errEl = document.getElementById('admError');
    errEl.textContent = '';

    let photoUrl = document.getElementById('saPhoto').value.trim();
    if (_saPhotoCtl && _saPhotoCtl.hasPending()) {
      errEl.textContent = 'Uploading photo...';
      try {
        photoUrl = await _saPhotoCtl.upload(apiSA, 'Students', 'student');
        errEl.textContent = '';
      } catch (err) {
        errEl.textContent = 'Photo upload failed: ' + err.message;
        return;
      }
    }

    const payload = {
      photoUrl: photoUrl,
      fullName: document.getElementById('stName').value.trim(),
      dob: document.getElementById('stDob').value,
      age: document.getElementById('stAge').value,
      mobile: document.getElementById('stMobile').value.trim(),
      whatsapp: document.getElementById('stWhatsapp').value.trim(),
      email: document.getElementById('stEmail').value.trim(),
      aadhaar: document.getElementById('stAadhaar').value.trim(),
      pan: document.getElementById('stPan').value.trim(),
      address: [
        document.getElementById('addHouse').value.trim(),
        document.getElementById('addCity').value.trim(),
        document.getElementById('addTaluka').value.trim(),
        document.getElementById('addDistrict').value.trim(),
        document.getElementById('addState').value.trim(),
        document.getElementById('addPin').value.trim()
      ].filter(Boolean).join(', '),
      mode: radioValue('mode'),
      course: checkedValues('course').join(', '),
      batch: radioValue('batch'),
      qualification: checkedValues('qualification').join(', '),
      qualBranch: document.getElementById('qualBranch').value.trim(),
      qualCollege: document.getElementById('qualCollege').value.trim(),
      qualYear: document.getElementById('qualYear').value.trim(),
      employment: radioValue('employment'),
      empCompany: document.getElementById('empCompany').value.trim(),
      empDesignation: document.getElementById('empDesignation').value.trim(),
      documents: checkedValues('documents').join(', '),
      admissionDate: document.getElementById('admDate').value,
      totalFee: document.getElementById('feeTotal').value,
      paidFee: document.getElementById('feePaid').value,
      paymentMethod: radioValue('payMethod'),
      transactionId: document.getElementById('feeTxn').value.trim(),
      emName: document.getElementById('emName').value.trim(),
      emRelation: document.getElementById('emRelation').value.trim(),
      emMobile: document.getElementById('emMobile').value.trim(),
      createdBy: 'Admin'
    };

    let result;
    if (!payload.course) { errEl.textContent = 'Please select at least one specialization.'; return; }
    try {
      result = await apiSA('addStudent', payload);
    } catch (err) {
      errEl.textContent = 'Could not reach the server. Check that TECHO_SCRIPT_URL is set correctly in config.js.';
      console.error(err);
      return;
    }
    if (result.error) { errEl.textContent = result.error; return; }

    document.getElementById('popupMsg').textContent = 'Trainee ID: ' + result.id + ' | Password: ' + result.password;
    document.getElementById('popupOverlay').classList.add('show');
    document.getElementById('formAdmission').reset();
    if (_saPhotoCtl) _saPhotoCtl.reset();
    setTimeout(function () {
      window.location.href = 'fee-receipt.html?studentId=' + encodeURIComponent(result.id);
    }, 2500);
  });
});

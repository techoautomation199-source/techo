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
/* Builds a readable summary of the sub-options ticked under each selected
   course, e.g. "PLC: Delta, Siemens | SCADA: WinCC" — saved as a separate
   CourseOptions column alongside the plain Course list. */
function courseOptionsSummary() {
  const selectedCourses = checkedValues('course');
  const parts = [];
  selectedCourses.forEach(function (course) {
    const opts = checkedValues('courseOpt_' + course);
    if (opts.length) parts.push(course + ': ' + opts.join(', '));
  });
  return parts.join(' | ');
}

let _saPhotoCtl = null;
let _docPhoto1Ctl = null;
let _docPhoto2Ctl = null;

document.addEventListener('DOMContentLoaded', function () {
  /* ---------------- course toggle -> show/hide its sub-options panel ---------------- */
  document.querySelectorAll('.course-toggle').forEach(function (cb) {
    cb.addEventListener('change', function () {
      const course = cb.getAttribute('data-course');
      const panel = document.querySelector('.course-sub-panel[data-course-panel="' + course + '"]');
      if (!panel) return;
      panel.style.display = cb.checked ? 'flex' : 'none';
      if (!cb.checked) {
        // unchecking the course clears its sub-options too
        panel.querySelectorAll('input[type="checkbox"]').forEach(function (opt) { opt.checked = false; });
      }
    });
  });

  /* ---------------- "Select All" inside each course's sub-panel ---------------- */
  document.querySelectorAll('.select-all-cb').forEach(function (allCb) {
    allCb.addEventListener('change', function () {
      const course = allCb.getAttribute('data-target');
      document.querySelectorAll('input[name="courseOpt_' + course + '"]').forEach(function (opt) {
        opt.checked = allCb.checked;
      });
    });
  });

  /* keep each course's "Select All" checkbox in sync if options are ticked individually */
  document.querySelectorAll('.course-sub-panel').forEach(function (panel) {
    const course = panel.getAttribute('data-course-panel');
    const optionCbs = panel.querySelectorAll('input[name="courseOpt_' + course + '"]');
    const allCb = panel.querySelector('.select-all-cb');
    optionCbs.forEach(function (opt) {
      opt.addEventListener('change', function () {
        allCb.checked = Array.from(optionCbs).every(function (o) { return o.checked; });
      });
    });
  });

  _saPhotoCtl = techoSetupPhotoUpload({
    fileInputId: 'saPhotoFile', previewImgId: 'saPhotoImg', previewBoxId: 'saPhotoPreview',
    hiddenUrlId: 'saPhoto', removeBtnId: 'saPhotoRemove', errorId: 'saPhotoError'
  });
  _docPhoto1Ctl = techoSetupPhotoUpload({
    fileInputId: 'docPhoto1File', previewImgId: 'docPhoto1Img', previewBoxId: 'docPhoto1Preview',
    hiddenUrlId: 'docPhoto1', removeBtnId: 'docPhoto1Remove', errorId: 'docPhoto1Error'
  });
  _docPhoto2Ctl = techoSetupPhotoUpload({
    fileInputId: 'docPhoto2File', previewImgId: 'docPhoto2Img', previewBoxId: 'docPhoto2Preview',
    hiddenUrlId: 'docPhoto2', removeBtnId: 'docPhoto2Remove', errorId: 'docPhoto2Error'
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

  /* Transaction ID only makes sense for online payments — hide it (and
     show a "Cash Payment" note instead) whenever "Cash" is selected. */
  const feeTxnWrap = document.getElementById('feeTxnWrap');
  const feeCashNote = document.getElementById('feeCashNote');
  function togglePayMethodUI() {
    const isCash = radioValue('payMethod') === 'Cash';
    feeTxnWrap.style.display = isCash ? 'none' : '';
    feeCashNote.style.display = isCash ? '' : 'none';
    if (isCash) document.getElementById('feeTxn').value = '';
  }
  document.querySelectorAll('input[name="payMethod"]').forEach(function (r) {
    r.addEventListener('change', togglePayMethodUI);
  });
  togglePayMethodUI();

  document.getElementById('btnReset').addEventListener('click', function () {
    document.getElementById('formAdmission').reset();
    balEl.value = '';
    if (_saPhotoCtl) _saPhotoCtl.reset();
    if (_docPhoto1Ctl) _docPhoto1Ctl.reset();
    if (_docPhoto2Ctl) _docPhoto2Ctl.reset();
    document.querySelectorAll('.course-sub-panel').forEach(function (p) { p.style.display = 'none'; });
    togglePayMethodUI();
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

    let documentPhoto1Url = document.getElementById('docPhoto1').value.trim();
    if (_docPhoto1Ctl && _docPhoto1Ctl.hasPending()) {
      errEl.textContent = 'Uploading document photo 1...';
      try {
        documentPhoto1Url = await _docPhoto1Ctl.upload(apiSA, 'Students', 'document1');
        errEl.textContent = '';
      } catch (err) {
        errEl.textContent = 'Document Photo 1 upload failed: ' + err.message;
        return;
      }
    }

    let documentPhoto2Url = document.getElementById('docPhoto2').value.trim();
    if (_docPhoto2Ctl && _docPhoto2Ctl.hasPending()) {
      errEl.textContent = 'Uploading document photo 2...';
      try {
        documentPhoto2Url = await _docPhoto2Ctl.upload(apiSA, 'Students', 'document2');
        errEl.textContent = '';
      } catch (err) {
        errEl.textContent = 'Document Photo 2 upload failed: ' + err.message;
        return;
      }
    }

    const payload = {
      photoUrl: photoUrl,
      documentPhoto1Url: documentPhoto1Url,
      documentPhoto2Url: documentPhoto2Url,
      fullName: document.getElementById('stName').value.trim(),
      dob: document.getElementById('stDob').value,
      age: document.getElementById('stAge').value,
      gender: radioValue('gender'),
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
      courseOptions: courseOptionsSummary(),
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
    if (_docPhoto1Ctl) _docPhoto1Ctl.reset();
    if (_docPhoto2Ctl) _docPhoto2Ctl.reset();
    document.querySelectorAll('.course-sub-panel').forEach(function (p) { p.style.display = 'none'; });
    setTimeout(function () {
      window.location.href = 'fee-receipt.html?studentId=' + encodeURIComponent(result.id);
    }, 2500);
  });
});

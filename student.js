async function apiS(action, payload) {
  const body = Object.assign({ action: action }, payload || {});
  const res = await fetch(TECHO_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body)
  });
  return res.json();
}

/* Generated avatar for a trainee with no uploaded photo: the DiceBear
   face uses only the safe seed+backgroundColor params (always renders),
   and a CSS black t-shirt bar + "TECHO" nameplate is drawn on top —
   see the .techo-avatar-* classes in admin.css. */
function studentAvatarUrl(name) {
  const seed = encodeURIComponent(name || 'TECHO');
  return 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + seed + '&backgroundColor=eef2fb';
}

/* Shows the two admission-time document photos (if any were uploaded)
   as small thumbnails at the bottom of the profile. */
function documentPhotosBlock(result) {
  const photos = [
    { url: result.DocumentPhoto1, label: 'Document Photo 1' },
    { url: result.DocumentPhoto2, label: 'Document Photo 2' }
  ].filter(function (p) { return !!p.url; });

  if (!photos.length) return '';

  return '<div class="doc-photos-block"><h4 class="sub-heading" style="margin-top:18px;">Uploaded Document Photos</h4>' +
    '<div class="doc-photos-row">' +
    photos.map(function (p) {
      return '<a href="' + p.url + '" target="_blank" rel="noopener" class="doc-photo-thumb">' +
        '<img src="' + p.url + '" alt="' + p.label + '"><span>' + p.label + '</span></a>';
    }).join('') +
    '</div></div>';
}

function renderStudentAvatar(result) {
  const wrap = document.getElementById('sPhotoWrap');
  if (!wrap) return;
  const hasPhoto = !!result.PhotoURL;
  const fallback = studentAvatarUrl(result.FullName);
  const outfit = hasPhoto ? '' :
    '<span class="techo-avatar-outfit student"></span><span class="techo-avatar-tag">TECHO</span>';
  wrap.innerHTML = '<span class="avatar-wrap"><span class="avatar-circle">' +
    '<img src="' + (result.PhotoURL || fallback) + '" alt="" onerror="this.src=\'' + fallback + '\'">' +
    outfit + '</span></span>';
}

/* Single source of truth for every editable admission-form field:
   [ SheetColumn, payloadKey (used by updateStudent), display label,
     i18n key, input type ]. Used to both render the read-only profile
   and build the Edit Profile form, so the two never drift apart. */
const STUDENT_FIELDS = [
  ['DOB', 'dob', 'Date of Birth', 'dob', 'date'],
  ['Age', 'age', 'Age', 'age', 'number'],
  ['Gender', 'gender', 'Gender', 'gender', 'text'],
  ['Mobile', 'mobile', 'Mobile Number', 'mobile', 'tel'],
  ['WhatsApp', 'whatsapp', 'WhatsApp Number', 'whatsapp', 'tel'],
  ['Email', 'email', 'Email', 'email', 'email'],
  ['Aadhaar', 'aadhaar', 'Aadhaar Number', 'aadhaar', 'text'],
  ['PAN', 'pan', 'PAN Number', 'pan_optional', 'text'],
  ['Address', 'address', 'Permanent Address', 'permanent_address', 'text'],
  ['TrainingMode', 'mode', 'Training Mode', 'training_mode', 'text'],
  ['Course', 'course', 'Course', 'course_name', 'text'],
  ['CourseOptions', 'courseOptions', 'Course Options', 'course_options_label', 'text'],
  ['Batch', 'batch', 'Batch', 'batch', 'text'],
  ['Qualification', 'qualification', 'Qualification', 'qualification', 'text'],
  ['QualBranch', 'qualBranch', 'Branch', 'branch', 'text'],
  ['QualCollege', 'qualCollege', 'College / Institute', 'college_institute', 'text'],
  ['QualYear', 'qualYear', 'Passing Year', 'passing_year', 'text'],
  ['Employment', 'employment', 'Employment', 'employment', 'text'],
  ['EmpCompany', 'empCompany', 'Company Name', 'company_name', 'text'],
  ['EmpDesignation', 'empDesignation', 'Designation', 'designation', 'text'],
  ['Documents', 'documents', 'Documents Submitted', 'documents', 'text'],
  ['AdmissionDate', 'admissionDate', 'Admission Date', 'admission_date', 'date'],
  ['TotalFee', 'totalFee', 'Total Fee (₹)', 'total_fee', 'number'],
  ['PaidFee', 'paidFee', 'Paid Fee (₹)', 'paid_fee', 'number'],
  ['PaymentMethod', 'paymentMethod', 'Payment Method', 'payment_method', 'text'],
  ['TransactionID', 'transactionId', 'Transaction ID', 'transaction_id', 'text'],
  ['Remarks', 'remarks', 'Remarks', 'remarks', 'text'],
  ['CourseStatus', 'courseStatus', 'Course Status', 'course_status', 'select'],
  ['EmergencyName', 'emName', 'Emergency Contact Name', 'contact_name', 'text'],
  ['EmergencyRelation', 'emRelation', 'Emergency Relation', 'relation', 'text'],
  ['EmergencyMobile', 'emMobile', 'Emergency Mobile', 'mobile', 'tel']
];
const COURSE_STATUS_OPTIONS = ['Pending', 'Complete', 'Stopped'];

let _currentStudent = null;   // full record from studentLogin
let _editAdminCreds = null;   // { adminId, adminPassword } once gate passes
let _edPhotoCtl = null;

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('formStudentLogin').addEventListener('submit', async function (e) {
    e.preventDefault();
    const errEl = document.getElementById('sLoginError');
    errEl.textContent = '';
    const studentId = document.getElementById('sId').value.trim();
    const password = document.getElementById('sPassword').value;

    const result = await apiS('studentLogin', { studentId: studentId, password: password });
    if (result.error) { errEl.textContent = result.error; return; }

    _currentStudent = result;
    showStudent(result);

    await loadFeeAndInstallment(result.StudentID);
    if (window.techoApplyLang) techoApplyLang(localStorage.getItem('techoLang') || 'en');

    if (window.techoRenderAgreements) {
      techoRenderAgreements({ StudentID: result.StudentID, FullName: result.FullName, Course: result.Course });
    }

    document.getElementById('screen-student-login').classList.remove('active');
    document.getElementById('screen-student-dash').classList.add('active');
  });

  function showStudent(result) {
    document.getElementById('sName').textContent = result.FullName;
    renderStudentAvatar(result);
    document.getElementById('sDetailWrap').innerHTML =
      row('Student ID', result.StudentID) +
      STUDENT_FIELDS.filter(function (f) {
        // Transaction ID only makes sense for online payments — hide the
        // row entirely for Cash payments instead of showing it blank.
        if (f[0] === 'TransactionID' && result.PaymentMethod === 'Cash') return false;
        return true;
      }).map(function (f) {
        const raw = result[f[0]];
        const val = (f[0] === 'TotalFee' || f[0] === 'PaidFee') ? '₹' + raw
          : (f[0] === 'PaymentMethod' && raw === 'Cash') ? 'Cash Payment' : raw;
        return irow(f[3], f[2], val || '—');
      }).join('') +
      irow('balance_fee', 'Pending Fee', '₹' + result.PendingFee) +
      documentPhotosBlock(result);
    if (window.techoApplyLang) techoApplyLang(localStorage.getItem('techoLang') || 'en');
  }

  async function loadFeeAndInstallment(studentId) {
    const feeResult = await apiS('getFeeHistory', { studentId: studentId });
    const feeWrap = document.getElementById('sFeeWrap');
    const history = feeResult.history || [];
    feeWrap.innerHTML = history.length
      ? history.map(function (f) {
          return irow('receipt_label', 'Receipt', f.ReceiptNo + ' — ₹' + f.Amount + ' (' + f.PaymentMethod + ', ' + f.Date + ')');
        }).join('')
      : '<p class="screen-sub" data-i18n="no_fee_payments">No fee payments recorded yet.</p>';

    const instResult = await apiS('getInstallment', { studentId: studentId });
    const instWrap = document.getElementById('sInstWrap');
    const inst = instResult.installment;
    if (inst) {
      instWrap.innerHTML =
        irow('first', 'First', '₹' + inst.Installment1Amount + ' due ' + inst.Installment1Date) +
        irow('second', 'Second', '₹' + inst.Installment2Amount + ' due ' + inst.Installment2Date) +
        irow('third', 'Third', '₹' + inst.Installment3Amount + ' due ' + inst.Installment3Date) +
        irow('fourth', 'Fourth', '₹' + inst.Installment4Amount + ' due ' + inst.Installment4Date);
    } else {
      instWrap.innerHTML = '<p class="screen-sub" data-i18n="no_installment_agreement">No installment agreement on file.</p>';
    }
    if (window.techoApplyLang) techoApplyLang(localStorage.getItem('techoLang') || 'en');
  }

  /* ---------------- Trainee Attendance (Present / Absent) ---------------- */
  function curLang() { return localStorage.getItem('techoLang') || 'en'; }
  function tText(key, fallback) {
    return (window.TECHO_I18N && TECHO_I18N[key] && TECHO_I18N[key][curLang()]) || fallback;
  }

  function showAttendancePopup(status) {
    const overlay = document.getElementById('attendancePopupOverlay');
    const icon = document.getElementById('attendancePopupIcon');
    const title = document.getElementById('attendancePopupTitle');
    const msg = document.getElementById('attendancePopupMsg');
    if (!overlay) return;

    if (status === 'Absent') {
      icon.className = 'fa-solid fa-circle-check popup-icon';
      title.setAttribute('data-i18n', 'thank_you');
      msg.setAttribute('data-i18n', 'attendance_absent_msg');
      title.textContent = tText('thank_you', 'Thank You!');
      msg.textContent = tText('attendance_absent_msg', 'Your absence has been noted. Take care!');
    } else {
      icon.className = 'fa-solid fa-circle-check popup-icon';
      title.setAttribute('data-i18n', 'thank_you');
      msg.setAttribute('data-i18n', 'attendance_present_msg');
      title.textContent = tText('thank_you', 'Thank You!');
      msg.textContent = tText('attendance_present_msg', 'Your attendance at TECHO has been registered.');
    }
    overlay.classList.add('show');
    setTimeout(function () { overlay.classList.remove('show'); }, 4000);
  }

  function disableAttendanceButtons() {
    const p = document.getElementById('btnMarkPresent');
    const a = document.getElementById('btnMarkAbsent');
    if (p) p.disabled = true;
    if (a) a.disabled = true;
  }

  const btnMarkPresent = document.getElementById('btnMarkPresent');
  if (btnMarkPresent) {
    btnMarkPresent.addEventListener('click', async function () {
      if (!_currentStudent) return;
      const errEl = document.getElementById('attendanceError');
      errEl.textContent = '';
      disableAttendanceButtons();

      const result = await apiS('markTraineeAttendance', {
        studentId: _currentStudent.StudentID,
        studentName: _currentStudent.FullName,
        status: 'Present'
      });

      if (result.error) {
        errEl.textContent = result.error;
        const p = document.getElementById('btnMarkPresent');
        const a = document.getElementById('btnMarkAbsent');
        if (p) p.disabled = false;
        if (a) a.disabled = false;
        return;
      }
      showAttendancePopup('Present');
    });
  }

  const btnMarkAbsent = document.getElementById('btnMarkAbsent');
  if (btnMarkAbsent) {
    btnMarkAbsent.addEventListener('click', function () {
      document.getElementById('absentReasonInput').value = '';
      document.getElementById('absentReasonError').textContent = '';
      document.getElementById('absentReasonOverlay').classList.add('show');
    });
  }

  const btnCancelAbsent = document.getElementById('btnCancelAbsent');
  if (btnCancelAbsent) {
    btnCancelAbsent.addEventListener('click', function () {
      document.getElementById('absentReasonOverlay').classList.remove('show');
    });
  }

  const btnSubmitAbsent = document.getElementById('btnSubmitAbsent');
  if (btnSubmitAbsent) {
    btnSubmitAbsent.addEventListener('click', async function () {
      if (!_currentStudent) return;
      const reason = document.getElementById('absentReasonInput').value.trim();
      const reasonErrEl = document.getElementById('absentReasonError');
      if (!reason) {
        reasonErrEl.textContent = tText('absent_reason_required', 'Please enter a reason before submitting.');
        return;
      }
      reasonErrEl.textContent = '';
      btnSubmitAbsent.disabled = true;

      const result = await apiS('markTraineeAttendance', {
        studentId: _currentStudent.StudentID,
        studentName: _currentStudent.FullName,
        status: 'Absent',
        reason: reason
      });

      btnSubmitAbsent.disabled = false;

      if (result.error) {
        reasonErrEl.textContent = result.error;
        return;
      }

      document.getElementById('absentReasonOverlay').classList.remove('show');
      disableAttendanceButtons();
      const errEl = document.getElementById('attendanceError');
      if (errEl) errEl.textContent = '';
      showAttendancePopup('Absent');
    });
  }

  document.getElementById('btnStudentLogout').addEventListener('click', function () {
    document.getElementById('screen-student-dash').classList.remove('active');
    document.getElementById('screen-student-login').classList.add('active');
    document.getElementById('formStudentLogin').reset();
    document.getElementById('sPhotoWrap').innerHTML = '';
    exitEditMode();
    _currentStudent = null;
    _editAdminCreds = null;
  });

  /* ---------------- Edit Profile (admin-gated) ---------------- */
  document.getElementById('btnEditProfile').addEventListener('click', async function () {
    if (!_currentStudent) return;
    const adminId = prompt('Editing requires Admin authorization.\nEnter Admin ID:');
    if (adminId === null) return;
    const adminPassword = prompt('Enter Admin Password:');
    if (adminPassword === null) return;

    const gate = await apiS('verifyAdminGate', { adminId: adminId.trim(), adminPassword: adminPassword });
    if (gate.error) { alert(gate.error); return; }

    _editAdminCreds = { adminId: adminId.trim(), adminPassword: adminPassword };
    enterEditMode(_currentStudent);
  });

  function enterEditMode(s) {
    document.getElementById('sDetailWrap').style.display = 'none';
    document.getElementById('btnEditProfile').style.display = 'none';

    const photoBox =
      '<div class="photo-upload-box compact" id="edPhotoBox">' +
        '<div class="photo-preview' + (s.PhotoURL ? ' has-photo' : '') + '" id="edPhotoPreview"><img id="edPhotoImg" alt="" src="' + (s.PhotoURL || '') + '"><i class="fa-solid fa-user"></i></div>' +
        '<div class="photo-upload-actions">' +
          '<span class="photo-upload-label" data-i18n="trainee_photo">Trainee Photo</span>' +
          '<div class="photo-upload-btn-row">' +
            '<label class="photo-upload-btn" for="edPhotoFile"><i class="fa-solid fa-images"></i> <span data-i18n="upload_photo">Upload Photo</span></label>' +
            '<input type="file" id="edPhotoFile" accept="image/*" hidden>' +
            '<button type="button" class="photo-remove-btn" id="edPhotoRemove"><i class="fa-solid fa-trash"></i> <span data-i18n="remove">Remove</span></button>' +
          '</div>' +
          '<input type="hidden" id="edPhoto" value="' + (s.PhotoURL || '') + '">' +
          '<p class="form-error" id="edPhotoError"></p>' +
        '</div>' +
      '</div>';

    const nameField =
      '<label><span data-i18n="student_full_name">Full Name</span><input id="ed_fullName" type="text" value="' + escAttr(s.FullName) + '"></label>';

    const fields = STUDENT_FIELDS.map(function (f) {
      const id = 'ed_' + f[1];
      const raw = s[f[0]] || '';
      if (f[4] === 'select') {
        const opts = COURSE_STATUS_OPTIONS.map(function (o) {
          return '<option' + (o === raw ? ' selected' : '') + '>' + o + '</option>';
        }).join('');
        return '<label><span data-i18n="' + f[3] + '">' + f[2] + '</span><select id="' + id + '">' + opts + '</select></label>';
      }
      return '<label><span data-i18n="' + f[3] + '">' + f[2] + '</span><input id="' + id + '" type="' + f[4] + '" value="' + escAttr(raw) + '"></label>';
    }).join('');

    document.getElementById('sEditWrap').innerHTML =
      '<div class="reg-card">' + photoBox +
      '<div class="edit-grid">' + nameField + fields + '</div>' +
      '<p class="form-error" id="editError"></p>' +
      '<div class="form-header-actions">' +
        '<button type="button" class="fbtn-outline" id="btnCancelEdit" data-i18n="cancel">Cancel</button>' +
        '<button type="button" class="fbtn-solid" id="btnSaveEdit" data-i18n="save">Save</button>' +
      '</div></div>';
    document.getElementById('sEditWrap').style.display = 'block';
    if (window.techoApplyLang) techoApplyLang(localStorage.getItem('techoLang') || 'en');

    _edPhotoCtl = techoSetupPhotoUpload({
      fileInputId: 'edPhotoFile', previewImgId: 'edPhotoImg', previewBoxId: 'edPhotoPreview',
      hiddenUrlId: 'edPhoto', removeBtnId: 'edPhotoRemove', errorId: 'edPhotoError'
    });

    document.getElementById('btnCancelEdit').addEventListener('click', exitEditMode);
    document.getElementById('btnSaveEdit').addEventListener('click', onSaveEdit);
  }

  function exitEditMode() {
    const wrap = document.getElementById('sEditWrap');
    if (wrap) { wrap.style.display = 'none'; wrap.innerHTML = ''; }
    document.getElementById('sDetailWrap').style.display = '';
    document.getElementById('btnEditProfile').style.display = '';
    _edPhotoCtl = null;
  }

  async function onSaveEdit() {
    const errEl = document.getElementById('editError');
    errEl.textContent = '';

    let photoUrl = document.getElementById('edPhoto').value.trim();
    if (_edPhotoCtl && _edPhotoCtl.hasPending()) {
      errEl.textContent = 'Uploading photo...';
      try {
        photoUrl = await _edPhotoCtl.upload(apiS, 'Students', 'student');
        errEl.textContent = '';
      } catch (err) {
        errEl.textContent = 'Photo upload failed: ' + err.message;
        return;
      }
    }

    const payload = {
      studentId: _currentStudent.StudentID,
      adminId: _editAdminCreds.adminId,
      adminPassword: _editAdminCreds.adminPassword,
      photoUrl: photoUrl,
      fullName: document.getElementById('ed_fullName').value.trim()
    };
    STUDENT_FIELDS.forEach(function (f) {
      const el = document.getElementById('ed_' + f[1]);
      if (el) payload[f[1]] = (typeof el.value === 'string') ? el.value.trim() : el.value;
    });

    const result = await apiS('updateStudent', payload);
    if (result.error) { errEl.textContent = result.error; return; }

    const refreshed = await apiS('studentLogin', { studentId: _currentStudent.StudentID, password: _currentStudent.Password });
    if (!refreshed.error) { _currentStudent = refreshed; showStudent(refreshed); }
    exitEditMode();
  }

  function escAttr(val) {
    return String(val == null ? '' : val).replace(/"/g, '&quot;');
  }

  function row(label, val) {
    return '<div class="d-row"><span>' + label + '</span><span>' + val + '</span></div>';
  }
  function irow(key, fallbackLabel, val) {
    return '<div class="d-row"><span data-i18n="' + key + '">' + fallbackLabel + '</span><span>' + val + '</span></div>';
  }
});

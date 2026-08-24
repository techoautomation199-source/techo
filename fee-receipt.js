async function apiFR(action, payload) {
  const body = Object.assign({ action: action }, payload || {});
  const res = await fetch(TECHO_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body)
  });
  return res.json();
}

let _lookedUpStudent = null;

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('rcptDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('rcptNo').value = 'RCPT' + Date.now();

  const params = new URLSearchParams(window.location.search);
  const preId = params.get('studentId');
  if (preId) {
    document.getElementById('rcptStudentId').value = preId;
    fetchStudent();
  }

  document.getElementById('btnLookup').addEventListener('click', fetchStudent);

  /* Transaction/UTR field only makes sense for online payments — hide it
     (and show a "Cash Payment" note instead) whenever "Cash" is selected. */
  const rcptTxnWrap = document.getElementById('rcptTxnWrap');
  const rcptCashNote = document.getElementById('rcptCashNote');
  function toggleRcptPayMethodUI() {
    const method = document.querySelector('input[name="rcptMethod"]:checked').value;
    const isCash = method === 'Cash';
    rcptTxnWrap.style.display = isCash ? 'none' : '';
    rcptCashNote.style.display = isCash ? '' : 'none';
    if (isCash) document.getElementById('rcptTxn').value = '';
  }
  document.querySelectorAll('input[name="rcptMethod"]').forEach(function (r) {
    r.addEventListener('change', toggleRcptPayMethodUI);
  });
  toggleRcptPayMethodUI();

  // Auto-fetch as soon as the Student ID is entered — no need to wait/click separately.
  const rcptIdInput = document.getElementById('rcptStudentId');
  let _lastFetchedId = '';
  rcptIdInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      fetchStudent();
    }
  });
  rcptIdInput.addEventListener('blur', function () {
    const id = rcptIdInput.value.trim();
    if (id && id !== _lastFetchedId) fetchStudent();
  });

  document.getElementById('btnViewReceipts').addEventListener('click', async function () {
    const wrap = document.getElementById('pastReceiptsWrap');
    if (!_lookedUpStudent) { document.getElementById('rcptError').textContent = 'Fetch a trainee first.'; return; }
    wrap.style.display = 'block';
    wrap.innerHTML = '<p class="loading-text"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</p>';
    let result;
    try {
      result = await apiFR('getFeeHistory', { studentId: _lookedUpStudent.StudentID });
    } catch (err) {
      wrap.innerHTML = '<p class="loading-text">Could not reach the server.</p>';
      return;
    }
    const history = result.history || [];
    wrap.innerHTML = history.length
      ? '<h3 class="sub-heading">Past Receipts — ' + _lookedUpStudent.StudentID + '</h3>' +
        history.map(function (f) {
          return '<div class="d-row"><span>' + f.ReceiptNo + '</span><span>₹' + f.Amount + ' (' + f.PaymentMethod + ') — ' + f.Date + '</span></div>';
        }).join('')
      : '<p>No receipts yet for this trainee.</p>';
  });

  document.getElementById('btnDeleteStudent').addEventListener('click', function () {
    if (!_lookedUpStudent) { document.getElementById('rcptError').textContent = 'Fetch a trainee first.'; return; }
    document.getElementById('delAdminId').value = '';
    document.getElementById('delAdminPassword').value = '';
    document.getElementById('deleteAuthError').textContent = '';
    document.getElementById('deleteAuthOverlay').classList.add('show');
  });

  document.getElementById('btnCancelDelete').addEventListener('click', function () {
    document.getElementById('deleteAuthOverlay').classList.remove('show');
  });

  document.getElementById('btnConfirmDelete').addEventListener('click', async function () {
    const adminId = document.getElementById('delAdminId').value.trim();
    const adminPassword = document.getElementById('delAdminPassword').value;
    const errEl = document.getElementById('deleteAuthError');
    if (!adminId || !adminPassword) {
      errEl.textContent = 'Please enter Admin ID and Password.';
      return;
    }

    let result;
    try {
      result = await apiFR('deleteStudent', { adminId: adminId, adminPassword: adminPassword, studentId: _lookedUpStudent.StudentID });
    } catch (err) {
      errEl.textContent = 'Could not reach the server.';
      return;
    }
    if (result.error) { errEl.textContent = result.error; return; }

    document.getElementById('deleteAuthOverlay').classList.remove('show');
    document.getElementById('formReceipt').reset();
    document.getElementById('pastReceiptsWrap').style.display = 'none';
    _lookedUpStudent = null;
    document.getElementById('rcptError').textContent = '';
    alert('Trainee deleted.');
  });

  let _fetchInFlight = false;
  async function fetchStudent() {
    const errEl = document.getElementById('rcptError');
    const nameEl = document.getElementById('rcptName');
    const lookupBtn = document.getElementById('btnLookup');
    errEl.textContent = '';
    const id = document.getElementById('rcptStudentId').value.trim();
    if (!id) { errEl.textContent = 'Enter a Trainee ID first.'; return; }
    if (_fetchInFlight) return; // avoid duplicate overlapping calls

    _fetchInFlight = true;
    nameEl.value = '';
    nameEl.placeholder = 'Fetching...';
    lookupBtn.disabled = true;

    let result;
    try {
      result = await apiFR('listStudents', { query: id });
    } catch (err) {
      errEl.textContent = 'Could not reach the server. Check that TECHO_SCRIPT_URL is set correctly in config.js.';
      console.error(err);
      nameEl.placeholder = '';
      lookupBtn.disabled = false;
      _fetchInFlight = false;
      return;
    }
    _fetchInFlight = false;
    lookupBtn.disabled = false;
    nameEl.placeholder = '';

    const found = (result.students || []).find(function (s) { return String(s.StudentID) === id; });
    if (!found) { errEl.textContent = 'Trainee ID not found.'; return; }

    _lastFetchedId = id;
    _lookedUpStudent = found;
    nameEl.value = found.FullName;
    document.getElementById('rcptCourse').value = found.Course;
    document.getElementById('rcptBatch').value = found.Batch;
    document.getElementById('rcptTotal').value = found.TotalFee;
    document.getElementById('rcptPrevPaid').value = found.PaidFee;
    document.getElementById('rcptBalance').value = found.PendingFee;
  }

  document.getElementById('rcptAmount').addEventListener('input', function () {
    if (!_lookedUpStudent) return;
    const amount = Number(this.value) || 0;
    document.getElementById('rcptBalance').value = Number(_lookedUpStudent.PendingFee) - amount;
  });

  document.getElementById('btnReset').addEventListener('click', function () {
    document.getElementById('formReceipt').reset();
    document.getElementById('rcptNo').value = 'RCPT' + Date.now();
    _lookedUpStudent = null;
    _lastFetchedId = '';
  });

  document.getElementById('formReceipt').addEventListener('submit', async function (e) {
    e.preventDefault();
    const errEl = document.getElementById('rcptError');
    errEl.textContent = '';

    if (!_lookedUpStudent) { errEl.textContent = 'Please fetch a valid trainee first.'; return; }

    const method = document.querySelector('input[name="rcptMethod"]:checked').value;
    const result = await apiFR('updateFee', {
      studentId: _lookedUpStudent.StudentID,
      amount: document.getElementById('rcptAmount').value,
      method: method,
      transactionId: method === 'Cash' ? '' : document.getElementById('rcptTxn').value.trim(),
      remarks: document.getElementById('rcptRemarks').value.trim(),
      createdBy: 'Admin'
    });
    if (result.error) { errEl.textContent = result.error; return; }

    document.getElementById('popupMsg').textContent = 'Receipt: ' + result.receiptNo + ' | Paid: ₹' + result.newPaid + ' | Pending: ₹' + result.newPending +
      (_lookedUpStudent.Email ? ' — emailed to ' + _lookedUpStudent.Email : '');
    document.getElementById('popupOverlay').classList.add('show');
    const studentId = _lookedUpStudent.StudentID;
    document.getElementById('formReceipt').reset();
    document.getElementById('rcptNo').value = 'RCPT' + Date.now();
    _lookedUpStudent = null;
    _lastFetchedId = '';
    setTimeout(function () {
      window.location.href = 'installment.html?studentId=' + encodeURIComponent(studentId);
    }, 2500);
  });
});

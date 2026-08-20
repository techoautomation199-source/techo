const ADMIN_SCRIPT_URL_FR = "https://script.google.com/macros/s/AKfycbw3UmPIGbGPyVLkjcnPeAbTezSLP5ljYHyImD_VvUd5kS5OM6GP3IpOVu4gTIjqcZgWGQ/exec";

async function apiFR(action, payload) {
  const body = Object.assign({ action: action }, payload || {});
  const res = await fetch(ADMIN_SCRIPT_URL_FR, {
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

  document.getElementById('btnDeleteStudent').addEventListener('click', async function () {
    if (!_lookedUpStudent) { document.getElementById('rcptError').textContent = 'Fetch a trainee first.'; return; }
    const bossId = prompt('Enter Boss Admin ID to delete this trainee:');
    if (bossId === null) return;
    const bossPassword = prompt('Enter Boss Password:');
    if (bossPassword === null) return;

    let result;
    try {
      result = await apiFR('deleteStudent', { bossId: bossId, bossPassword: bossPassword, studentId: _lookedUpStudent.StudentID });
    } catch (err) {
      alert('Could not reach the server.');
      return;
    }
    if (result.error) { alert(result.error); return; }
    alert('Trainee deleted.');
    document.getElementById('formReceipt').reset();
    document.getElementById('pastReceiptsWrap').style.display = 'none';
    _lookedUpStudent = null;
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
      errEl.textContent = 'Could not reach the server. Check that ADMIN_SCRIPT_URL_FR is set correctly in fee-receipt.js.';
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
      createdBy: 'Admin'
    });
    if (result.error) { errEl.textContent = result.error; return; }

    document.getElementById('popupMsg').textContent = 'Receipt: ' + result.receiptNo + ' | Paid: ₹' + result.newPaid + ' | Pending: ₹' + result.newPending;
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

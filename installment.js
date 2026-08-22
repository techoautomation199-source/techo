async function apiInst(action, payload) {
  const body = Object.assign({ action: action }, payload || {});
  const res = await fetch(TECHO_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body)
  });
  return res.json();
}

let _lookedUpInstStudent = null;

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('signDate').value = new Date().toISOString().split('T')[0];

  const params = new URLSearchParams(window.location.search);
  const preId = params.get('studentId');
  if (preId) {
    document.getElementById('instStudentId').value = preId;
    fetchInstStudent();
  }

  document.getElementById('btnLookupInst').addEventListener('click', fetchInstStudent);

  async function fetchInstStudent() {
    const errEl = document.getElementById('instError');
    errEl.textContent = '';
    const id = document.getElementById('instStudentId').value.trim();
    if (!id) { errEl.textContent = 'Enter a Trainee ID first.'; return; }

    let result;
    try {
      result = await apiInst('listStudents', { query: id });
    } catch (err) {
      errEl.textContent = 'Could not reach the server. Check that TECHO_SCRIPT_URL is set correctly in config.js.';
      console.error(err);
      return;
    }
    const found = (result.students || []).find(function (s) { return String(s.StudentID) === id; });
    if (!found) { errEl.textContent = 'Trainee ID not found.'; return; }

    _lookedUpInstStudent = found;
    document.getElementById('instName').value = found.FullName;
    document.getElementById('instCourse').value = found.Course;
    document.getElementById('instMobile').value = found.Mobile;
    document.getElementById('instTotal').value = found.TotalFee;
    document.getElementById('instPaid').value = found.PaidFee;
    document.getElementById('instBalance').value = found.PendingFee;
    document.getElementById('signStudentName').value = found.FullName;
  }

  document.getElementById('btnReset').addEventListener('click', function () {
    document.getElementById('formInstallment').reset();
    _lookedUpInstStudent = null;
  });

  document.getElementById('formInstallment').addEventListener('submit', async function (e) {
    e.preventDefault();
    const errEl = document.getElementById('instError');
    errEl.textContent = '';

    if (!_lookedUpInstStudent) { errEl.textContent = 'Please fetch a valid trainee first.'; return; }

    const result = await apiInst('saveInstallment', {
      studentId: _lookedUpInstStudent.StudentID,
      studentName: _lookedUpInstStudent.FullName,
      i1amt: document.getElementById('i1amt').value, i1date: document.getElementById('i1date').value,
      i2amt: document.getElementById('i2amt').value, i2date: document.getElementById('i2date').value,
      i3amt: document.getElementById('i3amt').value, i3date: document.getElementById('i3date').value,
      i4amt: document.getElementById('i4amt').value, i4date: document.getElementById('i4date').value,
      authorizedBy: document.getElementById('signRep').value.trim()
    });
    if (result.error) { errEl.textContent = result.error; return; }

    document.getElementById('popupMsg').textContent = 'Trainee ID: ' + _lookedUpInstStudent.StudentID + ' — ' + _lookedUpInstStudent.FullName;
    document.getElementById('popupOverlay').classList.add('show');
    document.getElementById('formInstallment').reset();
    _lookedUpInstStudent = null;
  });
});

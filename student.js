const ADMIN_SCRIPT_URL_S = "https://script.google.com/macros/s/AKfycbw3UmPIGbGPyVLkjcnPeAbTezSLP5ljYHyImD_VvUd5kS5OM6GP3IpOVu4gTIjqcZgWGQ/exec";

async function apiS(action, payload) {
  const body = Object.assign({ action: action }, payload || {});
  const res = await fetch(ADMIN_SCRIPT_URL_S, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body)
  });
  return res.json();
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('formStudentLogin').addEventListener('submit', async function (e) {
    e.preventDefault();
    const errEl = document.getElementById('sLoginError');
    errEl.textContent = '';
    const studentId = document.getElementById('sId').value.trim();
    const password = document.getElementById('sPassword').value;

    const result = await apiS('studentLogin', { studentId: studentId, password: password });
    if (result.error) { errEl.textContent = result.error; return; }

    document.getElementById('sName').textContent = result.FullName;
    document.getElementById('sDetailWrap').innerHTML =
      row('Student ID', result.StudentID) + row('Course', result.Course) + row('Batch', result.Batch) +
      row('Mobile', result.Mobile) + row('Admission Date', result.AdmissionDate) +
      row('Total Fee', '₹' + result.TotalFee) + row('Paid Fee', '₹' + result.PaidFee) +
      row('Pending Fee', '₹' + result.PendingFee) + row('Course Status', result.CourseStatus);

    loadFeeAndInstallment(result.StudentID);

    document.getElementById('screen-student-login').classList.remove('active');
    document.getElementById('screen-student-dash').classList.add('active');
  });

  async function loadFeeAndInstallment(studentId) {
    const feeResult = await apiS('getFeeHistory', { studentId: studentId });
    const feeWrap = document.getElementById('sFeeWrap');
    const history = feeResult.history || [];
    feeWrap.innerHTML = history.length
      ? history.map(function (f) {
          return row('Receipt ' + f.ReceiptNo, '₹' + f.Amount + ' (' + f.PaymentMethod + ', ' + f.Date + ')');
        }).join('')
      : '<p class="screen-sub">No fee payments recorded yet.</p>';

    const instResult = await apiS('getInstallment', { studentId: studentId });
    const instWrap = document.getElementById('sInstWrap');
    const inst = instResult.installment;
    if (inst) {
      instWrap.innerHTML =
        row('Installment 1', '₹' + inst.Installment1Amount + ' due ' + inst.Installment1Date) +
        row('Installment 2', '₹' + inst.Installment2Amount + ' due ' + inst.Installment2Date) +
        row('Installment 3', '₹' + inst.Installment3Amount + ' due ' + inst.Installment3Date) +
        row('Installment 4', '₹' + inst.Installment4Amount + ' due ' + inst.Installment4Date);
    } else {
      instWrap.innerHTML = '<p class="screen-sub">No installment agreement on file.</p>';
    }
  }

  document.getElementById('btnStudentLogout').addEventListener('click', function () {
    document.getElementById('screen-student-dash').classList.remove('active');
    document.getElementById('screen-student-login').classList.add('active');
    document.getElementById('formStudentLogin').reset();
  });

  function row(label, val) {
    return '<div class="d-row"><span>' + label + '</span><span>' + val + '</span></div>';
  }
});

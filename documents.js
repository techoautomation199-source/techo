async function apiD(action, payload) {
  const body = Object.assign({ action: action }, payload || {});
  const res = await fetch(TECHO_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body)
  });
  return res.json();
}

function row(label, value) {
  return '<div class="doc-row"><span class="lbl">' + label + '</span><span class="val">' + (value || '&nbsp;') + '</span></div>';
}
/* Transaction ID only makes sense for online payments — shows "Cash
   Payment" instead whenever the payment method was Cash. */
function paymentRow(paymentMethod, transactionId) {
  if (paymentMethod === 'Cash') {
    return row('Payment Method', 'Cash Payment');
  }
  return row('Payment Method', paymentMethod || '') + row('Transaction ID', transactionId || '');
}
function today() {
  return new Date().toLocaleDateString();
}
function signBlock(extra) {
  return '<div class="sign-line">' +
    '<div><div class="line">Trainee Signature</div></div>' +
    (extra ? '<div><div class="line">' + extra + '</div></div>' : '<div><div class="line">Authorized Signature &amp; Seal</div></div>') +
    '</div>';
}

function renderAdmission(s) {
  return '<h1>TECHO Industrial Automation</h1><h2>Trainee Admission Form</h2>' +
    row('Admission No.', s.StudentID) + row('Date', today()) +
    '<h3>Personal Information</h3>' +
    row('Full Name', s.FullName) + row('Mobile Number', s.Mobile) + row('WhatsApp Number', s.WhatsApp) +
    row('Email', s.Email) + row('Aadhaar Number', s.Aadhaar) + row('Permanent Address', s.Address) +
    '<h3>Specialization Details</h3>' +
    row('Specialization Name', s.Course) + row('Batch', s.Batch) + row('Admission Date', s.AdmissionDate) + row('Training Mode', 'Online') +
    '<h3>Fee Details</h3>' +
    row('Total Fee', '₹' + s.TotalFee) + row('Paid Fee', '₹' + s.PaidFee) + row('Pending Fee', '₹' + s.PendingFee) +
    paymentRow(s.PaymentMethod, s.TransactionID) +
    signBlock('Office Use Only — Authorized Signature');
}

function renderInstallment(s) {
  return '<h1>TECHO Industrial Automation</h1><h2>Installment Payment Agreement</h2>' +
    row('Agreement No.', 'AGR-' + s.StudentID) + row('Date', today()) +
    row('Trainee Name', s.FullName) + row('Admission No.', s.StudentID) + row('Specialization', s.Course) +
    row('Total Specialization Fee', '₹' + s.TotalFee) + row('Fee Paid at Admission', '₹' + s.PaidFee) + row('Balance Fee', '₹' + s.PendingFee) +
    '<h3>Declaration</h3><ol>' +
    '<li>I agree to pay all remaining installments on time as per the agreed schedule.</li>' +
    '<li>If any installment is delayed, the institute may temporarily suspend my training, online login, study material or certificate.</li>' +
    '<li>The final certificate will not be issued until all installments are paid in full.</li>' +
    '<li>I remain responsible for paying the remaining fee even if I leave the specialization incomplete.</li>' +
    '<li>I agree to follow the institute\'s Terms &amp; Conditions and Refund &amp; Cancellation Policy.</li>' +
    '</ol>' + signBlock();
}

function renderReceipt(s) {
  return '<h1>TECHO Industrial Automation</h1><h2>Fee Receipt</h2>' +
    row('Receipt No.', 'RCPT-' + Date.now()) + row('Date', today()) +
    row('Trainee Name', s.FullName) + row('Admission No.', s.StudentID) + row('Mobile', s.Mobile) + row('Specialization', s.Course) + row('Batch', s.Batch) +
    '<h3>Fee Details</h3>' +
    row('Total Specialization Fee', '₹' + s.TotalFee) + row('Total Paid Till Date', '₹' + s.PaidFee) + row('Balance Fee', '₹' + s.PendingFee) +
    '<p style="margin-top:16px;font-size:12px;color:var(--gray-text);">This receipt is valid as per institute records. All fee-related terms are governed by the Refund &amp; Cancellation Policy and Terms &amp; Conditions.</p>' +
    signBlock();
}

function renderBonafide(s) {
  return '<h1>TECHO Industrial Automation</h1><h2>Bonafide Certificate</h2>' +
    row('Certificate No.', 'BNF-' + s.StudentID) + row('Date', today()) +
    '<p style="margin:16px 0;">This is to certify that <strong>' + (s.FullName || '_____________') + '</strong> has taken admission at ' +
    '<strong>TECHO Industrial Automation</strong> in the <strong>' + (s.Course || '_____________') + '</strong> specialization, and is / was a regular trainee of this institute.</p>' +
    row('Admission Date', s.AdmissionDate) + row('Specialization Status', s.CourseStatus) +
    '<p style="margin-top:16px;">This certificate is issued at the trainee\'s request for official purposes. This certificate should not be misused for any other purpose.</p>' +
    signBlock('Director / Authorized Signatory');
}

function renderDeclaration(s) {
  return '<h1>Trainee Declaration Form</h1>' +
    '<p style="margin:16px 0;">I, <strong>' + (s.FullName || '_____________') + '</strong>, am voluntarily taking admission at ' +
    '<strong>TECHO Industrial Automation</strong> in the <strong>' + (s.Course || '_____________') + '</strong> specialization. I have read and understood the following declarations and agree to them.</p>' +
    '<ol>' +
    '<li>All information given by me in the admission form is true and accurate.</li>' +
    '<li>I will follow all the rules, terms and discipline of the institute.</li>' +
    '<li>I will arrange my own internet, mobile, laptop or computer for online classes.</li>' +
    '<li>I will not copy, share, sell or upload any Notes, PLC Programs, SCADA/HMI Projects or other Study Material given by the institute.</li>' +
    '<li>I will not record audio, video or screen of any class, practical or training session without permission.</li>' +
    '<li>My personal belongings are my own responsibility; the institute is not responsible for loss or theft.</li>' +
    '<li>I understand the institute does not guarantee 100% job placement.</li>' +
    '<li>I have read and accepted the Terms &amp; Conditions, Privacy Policy and Refund &amp; Cancellation Policy.</li>' +
    '</ol>' + signBlock();
}

function renderUndertaking(s) {
  return '<h1>TECHO Industrial Automation</h1><h2>Trainee Undertaking</h2>' +
    '<p style="margin:16px 0;">I, <strong>' + (s.FullName || '_____________') + '</strong>, have voluntarily taken admission at TECHO Industrial Automation in the ' +
    '<strong>' + (s.Course || '_____________') + '</strong> specialization, and hereby give this undertaking accepting the following:</p>' +
    '<ol>' +
    '<li>All information given in my admission form is true, accurate and complete.</li>' +
    '<li>I will follow all rules, Terms &amp; Conditions, Privacy Policy, Refund &amp; Cancellation Policy, Placement Policy and Code of Conduct.</li>' +
    '<li>I will attend classes regularly and follow the schedule.</li>' +
    '<li>I will behave respectfully with trainers, staff and fellow trainees.</li>' +
    '<li>I will not copy, share, sell or publish any Study Material provided by the institute.</li>' +
    '<li>I will pay fees on time, and follow the Installment Agreement if applicable.</li>' +
    '<li>I understand the institute does not guarantee 100% job placement.</li>' +
    '<li>Any dispute will be subject to the jurisdiction of competent courts in Maharashtra, India.</li>' +
    '</ol>' +
    row('Admission No.', s.StudentID) + row('Specialization', s.Course) + row('Mobile', s.Mobile) +
    signBlock();
}

const RENDERERS = {
  admission: renderAdmission, installment: renderInstallment, receipt: renderReceipt,
  bonafide: renderBonafide, declaration: renderDeclaration, undertaking: renderUndertaking
};

async function loadDoc() {
  const errEl = document.getElementById('docError');
  errEl.textContent = '';
  const type = document.getElementById('docType').value;
  const id = document.getElementById('lookupId').value.trim();

  let student = { StudentID: '', FullName: '', Mobile: '', WhatsApp: '', Email: '', Aadhaar: '', Address: '', Course: '', Batch: '', AdmissionDate: '', TotalFee: '', PaidFee: '', PendingFee: '', CourseStatus: '' };

  if (id) {
    const result = await apiD('listStudents', { query: id });
    const found = (result.students || []).find(function (s) { return String(s.StudentID) === id; });
    if (!found) { errEl.textContent = 'Trainee ID not found.'; return; }
    student = Object.assign(student, found);
  }

  document.getElementById('docPreview').innerHTML = RENDERERS[type](student);
}

document.addEventListener('DOMContentLoaded', function () {
  const params = new URLSearchParams(window.location.search);
  const initialDoc = params.get('doc');
  if (initialDoc && RENDERERS[initialDoc]) document.getElementById('docType').value = initialDoc;

  document.getElementById('btnFetch').addEventListener('click', loadDoc);
  document.getElementById('btnPrint').addEventListener('click', function () { window.print(); });
  loadDoc();
});

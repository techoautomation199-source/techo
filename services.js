/* =========================================================================
   TECHO — SERVICES PAGE: "REQUEST A SERVICE" FORM
   -------------------------------------------------------------------------
   Sends the visitor's Name, Mobile Number and Message to the same Google
   Apps Script backend already used by the enrollment form (excel.js /
   google-apps-script.gs). The script emails the details straight to
   techoautomation199@gmail.com. No Google Sheet setup needed for this form —
   it only sends an email, nothing is stored in a sheet.
   ========================================================================= */


async function sendServiceRequest(data) {
  await fetch(TECHO_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(data)
  });
}

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('serviceRequestForm');
  if (!form) return;

  const submitBtn = document.getElementById('srSubmitBtn');
  const note = document.getElementById('srNote');
  const overlay = document.getElementById('srPopupOverlay');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const data = {
      action: 'serviceRequest',
      timestamp: new Date().toLocaleString(),
      name: document.getElementById('srName').value.trim(),
      mobile: document.getElementById('srMobile').value.trim(),
      email: document.getElementById('srEmail').value.trim(),
      message: document.getElementById('srMessage').value.trim()
    };

    submitBtn.disabled = true;
    note.textContent = '';
    note.classList.remove('sr-error');

    try {
      await sendServiceRequest(data);
      if (overlay) {
        overlay.classList.add('show');
        setTimeout(function () { overlay.classList.remove('show'); }, 4000);
      }
      form.reset();
    } catch (err) {
      console.error('Service request send failed:', err);
      note.textContent = 'Could not send your message. Please check your internet connection and try again.';
      note.classList.add('sr-error');
    }

    submitBtn.disabled = false;
  });
});

/* =========================================================================
   TECHO — GOOGLE APPS SCRIPT BACKEND
   -------------------------------------------------------------------------
   HOW TO SET THIS UP (one-time, ~5 minutes):

   1. Go to https://sheets.google.com and create a NEW blank spreadsheet
      (or reuse your existing "TECHO Site Visit" sheet).

   2. In Row 1, type these headers exactly, one per column (A to J):
      Timestamp | Full Name | Address | Email Address | Mobile Number |
      WhatsApp Number | College Name | Current Education / Qualification |
      Enrollment Date | Training

   3. In the Sheet menu bar click: Extensions -> Apps Script
      This opens a code editor with a file called Code.gs (default content).

   4. DELETE everything in Code.gs and PASTE this entire file's code instead.

   5. Click the "Deploy" button (top right) -> "New deployment" (or, if you
      already deployed before, "Manage deployments" -> edit -> New version).
      - Click the gear icon next to "Select type" -> choose "Web app".
      - Execute as: Me (your Google account)
      - Who has access: Anyone
      - Click "Deploy" (authorize access if asked — Advanced -> Go to
        project (unsafe) -> Allow. It's your own script, it's safe).

   6. Copy the "Web app URL" it gives you and paste it into excel.js at:
         const SCRIPT_URL = "PASTE_YOUR_WEB_APP_URL_HERE";

   7. Done! Every enrollment submitted from any device, anywhere, will be
      added as a new row in your Google Sheet, and the student instantly
      gets a free automatic confirmation email.

   NOTE: Whenever you edit this script later, you must create a
   "New deployment" again (or "Manage deployments" -> edit -> new
   version) for the changes to go live.
   ========================================================================= */

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    data.timestamp,
    data.fullName,
    data.address,
    data.email,
    data.mobile,
    data.whatsapp,
    data.college,
    data.qualification,
    data.enrollDate,
    data.training
  ]);

  // ---- send a free automatic confirmation email to the student ----
  try {
    if (data.email) {
      MailApp.sendEmail({
        to: data.email,
        subject: 'Thank You for Visiting TECHO Website',
        body:
          'Hi ' + data.fullName + ',\n\n' +
          'Thank you for visiting the TECHO Institute website and submitting ' +
          'your enrollment form.\n\n' +
          'You will receive a phone call from our institute shortly on your ' +
          'mobile number (' + data.mobile + ') or WhatsApp (' + data.whatsapp + ').\n\n' +
          'Training Selected: ' + data.training + '\n' +
          'Enrollment Date: ' + data.enrollDate + '\n\n' +
          'This is an official email from TECHO Institute.\n\n' +
          'Regards,\nTECHO Institute Team\n7841814377 / ayareomkar199@gmail.com'
      });
    }
  } catch (mailErr) {
    // if email fails, the enrollment row is still saved above — don't block that
    Logger.log('Email send failed: ' + mailErr);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService
    .createTextOutput('TECHO enrollment backend is running.')
    .setMimeType(ContentService.MimeType.TEXT);
}

/* ---- ONE-TIME TEST: run this manually from the Apps Script editor -----
   (select "testEmail" in the function dropdown at the top, click Run)
   This forces Google to ask for Gmail-sending permission explicitly.
   If this test email doesn't arrive in your own inbox, the problem is
   permissions/quota — not the website. Check View > Executions for the
   exact error message after running this. ------------------------------- */
function testEmail() {
  MailApp.sendEmail({
    to: Session.getActiveUser().getEmail(),
    subject: 'TECHO Test Email',
    body: 'If you are reading this, email sending is working correctly.'
  });
}

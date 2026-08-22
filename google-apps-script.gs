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
  var data = JSON.parse(e.postData.contents);

  // ---- SERVICES PAGE "Request a Service" form — email only, no sheet row ----
  if (data.action === 'serviceRequest') {
    return handleServiceRequest(data);
  }

  // ---- RATE US PAGE — Trainee / Service feedback ----
  if (data.action === 'submitFeedback') {
    return handleFeedbackSubmit(data);
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

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
          'Regards,\nTECHO Institute Team\n7841814377 / techoautomation199@gmail.com'
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

/* ---- SERVICES PAGE: "Request a Service" form handler ----
   Sends the visitor's Name, Mobile Number and Message straight to
   techoautomation199@gmail.com. Nothing is saved to the Sheet for this form. */
function handleServiceRequest(data) {
  try {
    MailApp.sendEmail({
      to: 'techoautomation199@gmail.com',
      subject: 'New Service Request — TECHO Website',
      body:
        'A new service request has been submitted on the TECHO website (Services page).\n\n' +
        'Name: ' + data.name + '\n' +
        'Mobile Number: ' + data.mobile + '\n' +
        'Message: ' + data.message + '\n\n' +
        'Submitted on: ' + data.timestamp
    });
  } catch (mailErr) {
    Logger.log('Service request email failed: ' + mailErr);
  }
  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'getFeedbackCounts') {
    return getFeedbackCounts();
  }
  return ContentService
    .createTextOutput('TECHO enrollment backend is running.')
    .setMimeType(ContentService.MimeType.TEXT);
}

/* ---- RATE US PAGE: Trainee / Service feedback ----
   Saves every rating to a "Feedback" tab (created automatically the first
   time) in this same Sheet, and emails the details to
   techoautomation199@gmail.com. Nothing is emailed back to the person who
   gave the feedback (their name only, no email address is collected). */
function getFeedbackSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Feedback');
  if (!sheet) {
    sheet = ss.insertSheet('Feedback');
    sheet.appendRow(['Timestamp', 'Type', 'Name', 'Rating', 'Service', 'Upgrade Suggestion', 'Problem Faced']);
  }
  return sheet;
}

function handleFeedbackSubmit(data) {
  try {
    var sheet = getFeedbackSheet();
    sheet.appendRow([
      data.timestamp,
      data.type,
      data.name,
      data.rating,
      data.service || '',
      data.upgrade || '',
      data.problem || ''
    ]);
  } catch (sheetErr) {
    Logger.log('Feedback sheet save failed: ' + sheetErr);
  }

  try {
    var typeLabel = (data.type === 'student') ? 'Trainee' : 'Service';
    MailApp.sendEmail({
      to: 'techoautomation199@gmail.com',
      subject: 'New ' + typeLabel + ' Feedback — TECHO Website',
      body:
        'A new feedback/rating has been submitted on the TECHO website (Rate Us page).\n\n' +
        'Type: ' + typeLabel + '\n' +
        'Name: ' + data.name + '\n' +
        'Rating: ' + data.rating + ' / 5\n' +
        (data.service ? ('Service: ' + data.service + '\n') : '') +
        'What can be upgraded: ' + (data.upgrade || '-') + '\n' +
        'Problem faced: ' + (data.problem || '-') + '\n\n' +
        'Submitted on: ' + data.timestamp
    });
  } catch (mailErr) {
    Logger.log('Feedback email failed: ' + mailErr);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getFeedbackCounts() {
  var sheet = getFeedbackSheet();
  var values = sheet.getDataRange().getValues();
  var student = 0, service = 0;
  var problemCount = 0, noProblemCount = 0;
  var upgradeCount = 0, noUpgradeCount = 0;
  var ratingCounts = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };

  for (var i = 1; i < values.length; i++) {
    var type = String(values[i][1] || '').toLowerCase();
    if (type === 'student') student++;
    else if (type === 'service') service++;

    // Column D (index 3) = "Rating" (1-5)
    var ratingVal = Math.round(Number(values[i][3]));
    if (ratingVal >= 1 && ratingVal <= 5) {
      ratingCounts[String(ratingVal)]++;
    }

    // Column F (index 5) = "Upgrade Suggestion". Only counts if it's not empty.
    var upgradeText = String(values[i][5] || '').trim();
    if (upgradeText.length > 0) upgradeCount++;
    else noUpgradeCount++;

    // Column G (index 6) = "Problem Faced". Only counts if it's not empty.
    var problemText = String(values[i][6] || '').trim();
    if (problemText.length > 0) problemCount++;
    else noProblemCount++;
  }
  return ContentService
    .createTextOutput(JSON.stringify({
      student: student,
      service: service,
      total: student + service,
      problemCount: problemCount,
      noProblemCount: noProblemCount,
      upgradeCount: upgradeCount,
      noUpgradeCount: noUpgradeCount,
      ratingCounts: ratingCounts
    }))
    .setMimeType(ContentService.MimeType.JSON);
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

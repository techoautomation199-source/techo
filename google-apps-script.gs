/* =========================================================================
   TECHO — SINGLE COMBINED BACKEND (Google Apps Script)
   -------------------------------------------------------------------------
   Everything the whole website talks to — Enrollment form, Services page
   "Request a Service" form, Rate Us feedback, and the entire Admin /
   Student / Attendance / Fee / Installment / Agreements / Holidays portal
   — is now ONE script, deployed ONCE, bound to ONE Google Sheet with 10
   tabs, all under techoautomation199@gmail.com. (Previously this was two
   separate scripts/sheets — one under techoautomation199, one under the
   personal ayareomkar199@gmail.com. That split is gone: everything lives
   in techoautomation199 now.)

   ONE-TIME SETUP:
   1. Make sure you are logged into techoautomation199@gmail.com in your
      browser (top-right Google account switcher).
   2. Create ONE new Google Sheet, name it "TECHO Admin System".
   3. Create 10 tabs (bottom of the sheet) named EXACTLY:
      EnrollmentVisits, Admins, Students, Attendance, FeeHistory,
      Installments, Agreements, TraineeAttendance, Holidays, Feedback
      (EnrollmentVisits, TraineeAttendance, Holidays and Feedback are also
      created automatically by the script the first time they're needed —
      but it's fine to add them yourself first with the headers below.)
   4. In "EnrollmentVisits" tab, Row 1 headers (A to J):
      Timestamp | Full Name | Address | Email Address | Mobile Number |
      WhatsApp Number | College Name | Current Education / Qualification |
      Enrollment Date | Training
   5. In "Admins" tab, Row 1 headers (A to P):
      AdminID | Password | FullName | PhotoURL | Gender | Phone | WhatsApp | Email |
      Aadhaar | PAN | Address | Role | CreatedBy | Status | CreatedDate | Signature
      (Signature is a NEW column — add it if you already have this tab,
      otherwise the Admin's drawn signature silently won't be saved.)
   6. In "Students" tab, Row 1 headers (any order):
      StudentID | Password | FullName | FatherName | MotherName | PhotoURL |
      Gender | DOB | Age | Mobile | WhatsApp | Email | Aadhaar | PAN | Address |
      TrainingMode | Course | CourseOptions | Batch | Qualification | QualBranch |
      QualCollege | QualYear | Employment | EmpCompany | EmpDesignation |
      Documents | DocumentPhoto1 | DocumentPhoto2 | AdmissionDate | TotalFee |
      PaidFee | PendingFee | PaymentMethod | TransactionID | Remarks | CourseStatus |
      EmergencyName | EmergencyRelation | EmergencyMobile | CreatedBy
      (Gender, CourseOptions, DocumentPhoto1, DocumentPhoto2, and Remarks are
      NEW columns — add them to your existing Students tab if you already
      have one, otherwise this data silently won't be saved.)
   7. In "Attendance" tab, Row 1 headers (A to E):
      AdminID | Date | LoginTime | LogoutTime | Status
   8. In "FeeHistory" tab, Row 1 headers (A to H):
      ReceiptNo | StudentID | Amount | PaymentMethod | TransactionID | Remarks |
      Date | CreatedBy
      (TransactionID and Remarks are NEW columns here too — add them if you
      already have this tab.)
   9. In "Installments" tab, Row 1 headers (A to L):
      StudentID | StudentName | Installment1Amount | Installment1Date |
      Installment2Amount | Installment2Date | Installment3Amount | Installment3Date |
      Installment4Amount | Installment4Date | AuthorizedBy | Date
  10. In "Agreements" tab, Row 1 headers (A to I):
      StudentID | FormType | FullName | Course | Address | Place |
      Signature | ParentName | ParentSignature | Date
  11. In "TraineeAttendance" tab, Row 1 headers (A to G):
      StudentID | StudentName | Date | Status | Time | Reason | MarkedBy
  12. In "Holidays" tab, Row 1 headers (A to E):
      Date | Reason | MarkedBy | MarkedByName | Timestamp
  13. In "Feedback" tab, Row 1 headers (A to G):
      Timestamp | Type | Name | Rating | Service | Upgrade Suggestion |
      Problem Faced
  14. In the Sheet menu bar click: Extensions -> Apps Script.
  15. DELETE everything in Code.gs and PASTE this entire file's code instead.
  16. Deploy -> New deployment -> Web app -> Execute as: Me,
      Who has access: Anyone -> Deploy -> copy the "Web app URL".
  17. Paste that ONE URL into config.js as ADMIN_SCRIPT_URL, AND into
      excel.js / services.js / rating.js as SCRIPT_URL / SERVICE_SCRIPT_URL /
      RATING_SCRIPT_URL — every one of those must now be this SAME URL,
      since it's all one script now.

   NOTE: Whenever you edit this script later, you must create a
   "New deployment" again (or "Manage deployments" -> edit -> new
   version) for the changes to go live.
   ========================================================================= */

const SHEET_NAMES = {
  ENROLLMENT: 'EnrollmentVisits',
  ADMINS: 'Admins',
  STUDENTS: 'Students',
  ATTENDANCE: 'Attendance',
  FEE: 'FeeHistory',
  INSTALLMENTS: 'Installments',
  AGREEMENTS: 'Agreements',
  TRAINEE_ATTENDANCE: 'TraineeAttendance',
  HOLIDAYS: 'Holidays',
  FEEDBACK: 'Feedback'
};

function getSheet(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

function sheetRows(name) {
  const sheet = getSheet(name);
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(function (h) { return String(h).trim(); });
  return values.slice(1).map(function (row) {
    const obj = {};
    headers.forEach(function (h, i) { obj[h] = formatCellValue(row[i]); });

    // also expose canonical alias keys (e.g. obj.Phone works even if the
    // actual header was "Mobile") so downstream code never breaks on
    // header-name variations.
    headers.forEach(function (h, i) {
      const key = h.toLowerCase().replace(/\s+/g, '');
      for (const canonical in HEADER_ALIASES) {
        if (HEADER_ALIASES[canonical].indexOf(key) !== -1) {
          const capitalized = canonical.charAt(0).toUpperCase() + canonical.slice(1);
          if (!(capitalized in obj)) obj[capitalized] = formatCellValue(row[i]);
        }
      }
    });
    return obj;
  });
}

/* Google Sheets auto-detects date/time-looking text and stores it as a
   real Date value. When that Date object is later sent back to the
   browser, JSON.stringify() silently converts it to a raw ISO string
   like "2026-08-19T17:55:35.000Z" (the "000Z" is milliseconds + UTC
   marker) — this formats it into a clean, readable local string instead
   so every screen (fee history, installment dates, admission date, etc.)
   shows a normal date instead of that ISO timestamp. */
function formatCellValue(val) {
  if (Object.prototype.toString.call(val) !== '[object Date]' || isNaN(val)) return val;
  const hasTime = val.getHours() !== 0 || val.getMinutes() !== 0 || val.getSeconds() !== 0;
  const tz = Session.getScriptTimeZone();
  return hasTime
    ? Utilities.formatDate(val, tz, 'dd/MM/yyyy hh:mm a')
    : Utilities.formatDate(val, tz, 'dd/MM/yyyy');
}

/* Appends a row built from a {header: value} object, placing each value
   into the column that actually has that header text in Row 1 — this
   works correctly no matter what order the columns are in on the sheet,
   and is tolerant of extra spaces or different capitalization in the
   header text, instead of assuming an exact fixed A,B,C... order. */
/* Appends a row built from a {header: value} object, placing each value
   into the column that actually has that header text in Row 1 — this
   works correctly no matter what order the columns are in on the sheet,
   and is tolerant of extra spaces, different capitalization, or a few
   common alternate names, instead of assuming an exact fixed A,B,C...
   order or exact header spelling. */
const HEADER_ALIASES = {
  'phone': ['phone', 'mobile', 'phonenumber', 'mobilenumber'],
  'role': ['role', 'designation'],
  'whatsapp': ['whatsapp', 'whatsappnumber'],
  'aadhaar': ['aadhaar', 'aadhar', 'aadharnumber', 'aadhaarnumber'],
  'pan': ['pan', 'pannumber'],
  'address': ['address', 'permanentaddress'],
  'createdby': ['createdby', 'created by'],
  'createddate': ['createddate', 'created date']
};

function appendRowByHeaders(sheetName, dataObj) {
  const sheet = getSheet(sheetName);
  const rawHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const lookup = {};
  Object.keys(dataObj).forEach(function (k) { lookup[k.toLowerCase().trim()] = dataObj[k]; });

  const row = rawHeaders.map(function (h) {
    const key = String(h).toLowerCase().replace(/\s+/g, '').trim();
    if (Object.prototype.hasOwnProperty.call(lookup, key)) return lookup[key];

    // try alias matching (e.g. sheet says "Mobile" but data key is "phone")
    for (const canonical in HEADER_ALIASES) {
      if (HEADER_ALIASES[canonical].indexOf(key) !== -1 && Object.prototype.hasOwnProperty.call(lookup, canonical)) {
        return lookup[canonical];
      }
    }
    return '';
  });
  sheet.appendRow(row);
}

/* Updates specific columns of an EXISTING row (matched by a column such
   as StudentID) — only the headers present in dataObj get overwritten,
   every other cell on that row is left exactly as it was. Same tolerant
   header matching as appendRowByHeaders (case/space-insensitive +
   alias-aware). Returns false if the sheet/match-column/row isn't found. */
function updateRowByHeaders(sheetName, matchHeader, matchValue, dataObj) {
  const sheet = getSheet(sheetName);
  if (!sheet) return false;
  const rawHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const matchKey = matchHeader.toLowerCase().replace(/\s+/g, '').trim();
  const matchColIdx = rawHeaders.findIndex(function (h) {
    return String(h).toLowerCase().replace(/\s+/g, '').trim() === matchKey;
  });
  if (matchColIdx === -1) return false;

  const values = sheet.getDataRange().getValues();
  let rowIdx = -1;
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][matchColIdx]) === String(matchValue)) { rowIdx = i; break; }
  }
  if (rowIdx === -1) return false;

  const lookup = {};
  Object.keys(dataObj).forEach(function (k) { lookup[k.toLowerCase().trim()] = dataObj[k]; });

  rawHeaders.forEach(function (h, colIdx) {
    const key = String(h).toLowerCase().replace(/\s+/g, '').trim();
    let val, has = false;
    if (Object.prototype.hasOwnProperty.call(lookup, key)) { val = lookup[key]; has = true; }
    else {
      for (const canonical in HEADER_ALIASES) {
        if (HEADER_ALIASES[canonical].indexOf(key) !== -1 && Object.prototype.hasOwnProperty.call(lookup, canonical)) {
          val = lookup[canonical]; has = true; break;
        }
      }
    }
    if (has) sheet.getRange(rowIdx + 1, colIdx + 1).setValue(val);
  });
  return true;
}

function randomPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let out = '';
  for (let i = 0; i < 8; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
  return out;
}

function nextId(prefix, sheetName, idColumn) {
  const rows = sheetRows(sheetName);
  let max = 0;
  rows.forEach(function (r) {
    const id = String(r[idColumn] || '');
    const m = id.match(/(\d+)$/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  });
  const next = String(max + 1).padStart(4, '0');
  return prefix + next;
}

/* ---------------- ROUTER ---------------- */
const ADMIN_PORTAL_ACTIONS = [
  'bossExists', 'createAdmin', 'adminLogin', 'listAdmins', 'viewAdminProfile', 'updateAdminSignature',
  'deleteAdmin', 'uploadPhoto', 'setAdminStatus', 'addStudent', 'listStudents',
  'studentLogin', 'verifyAdminGate', 'updateStudent', 'updateFee', 'setCourseStatus',
  'markPresent', 'markLogout', 'saveInstallment', 'getFeeHistory', 'getInstallment',
  'deleteStudent', 'saveAgreementForm', 'getAgreementForm', 'markTraineeAttendance',
  'getAttendanceSummary', 'getStudentAttendanceLog', 'addHoliday', 'listHolidays',
  'listHolidaysPublic'
];

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;

  // ---- SERVICES PAGE "Request a Service" form — email only, no sheet row ----
  if (action === 'serviceRequest') {
    return handleServiceRequest(data);
  }

  // ---- RATE US PAGE — Trainee / Service feedback ----
  if (action === 'submitFeedback') {
    return handleFeedbackSubmit(data);
  }

  // ---- ADMIN / STUDENT / ATTENDANCE / FEE / INSTALLMENTS / AGREEMENTS / HOLIDAYS ----
  if (action && ADMIN_PORTAL_ACTIONS.indexOf(action) !== -1) {
    let result;
    try {
      switch (action) {
        case 'bossExists': result = { exists: bossExists() }; break;
        case 'createAdmin': result = createAdmin(data); break;
        case 'adminLogin': result = adminLogin(data); break;
        case 'listAdmins': result = { admins: listAdmins() }; break;
        case 'viewAdminProfile': result = viewAdminProfile(data); break;
        case 'updateAdminSignature': result = updateAdminSignature(data); break;
        case 'deleteAdmin': result = deleteAdmin(data); break;
        case 'uploadPhoto': result = uploadPhoto(data); break;
        case 'setAdminStatus': result = setAdminStatus(data); break;
        case 'addStudent': result = addStudent(data); break;
        case 'listStudents': result = { students: listStudents(data) }; break;
        case 'studentLogin': result = studentLogin(data); break;
        case 'verifyAdminGate': result = verifyAdminGate(data); break;
        case 'updateStudent': result = updateStudent(data); break;
        case 'updateFee': result = updateFee(data); break;
        case 'setCourseStatus': result = setCourseStatus(data); break;
        case 'markPresent': result = markPresent(data); break;
        case 'markLogout': result = markLogout(data); break;
        case 'saveInstallment': result = saveInstallment(data); break;
        case 'getFeeHistory': result = { history: getFeeHistory(data.studentId) }; break;
        case 'getInstallment': result = { installment: getInstallment(data.studentId) }; break;
        case 'deleteStudent': result = deleteStudent(data); break;
        case 'saveAgreementForm': result = saveAgreementForm(data); break;
        case 'getAgreementForm': result = { form: getAgreementForm(data.studentId, data.formType) }; break;
        case 'markTraineeAttendance': result = markTraineeAttendance(data); break;
        case 'getAttendanceSummary': result = getAttendanceSummary(); break;
        case 'getStudentAttendanceLog': result = getStudentAttendanceLog(data); break;
        case 'addHoliday': result = addHoliday(data); break;
        case 'listHolidays': result = { holidays: listHolidays() }; break;
        case 'listHolidaysPublic': result = { holidays: listHolidays() }; break;
        default: result = { error: 'Unknown action' };
      }
    } catch (err) {
      result = { error: err.message };
    }
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // ---- ENROLLMENT FORM (legacy — sends no "action" field at all) ----
  if (!action) {
    return handleEnrollment(data);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ error: 'Unknown action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'getFeedbackCounts') {
    return getFeedbackCounts();
  }
  return ContentService
    .createTextOutput('TECHO backend is running.')
    .setMimeType(ContentService.MimeType.TEXT);
}

/* ---- ENROLLMENT FORM (index.html / enroll.html) ----
   Saves every enrollment to the "EnrollmentVisits" tab (explicitly, by
   name — NOT "the active sheet", since this Sheet now has 10 tabs and
   picking whichever tab happened to be open last would corrupt data),
   and emails the visitor a free automatic confirmation. */
function handleEnrollment(data) {
  const sheet = getOrCreateSheet_(SHEET_NAMES.ENROLLMENT, [
    'Timestamp', 'Full Name', 'Address', 'Email Address', 'Mobile Number',
    'WhatsApp Number', 'College Name', 'Current Education / Qualification',
    'Enrollment Date', 'Training'
  ]);

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
        (data.email ? ('Email: ' + data.email + '\n') : '') +
        'Message: ' + data.message + '\n\n' +
        'Submitted on: ' + data.timestamp
    });
  } catch (mailErr) {
    Logger.log('Service request email failed: ' + mailErr);
  }

  try {
    if (data.email) {
      MailApp.sendEmail({
        to: data.email,
        subject: 'Thank You for Contacting TECHO Institute',
        body:
          'Hi ' + data.name + ',\n\n' +
          'Thank you for reaching out to TECHO Institute. We have received your service ' +
          'request and our team will contact you shortly on your mobile number (' + data.mobile + ').\n\n' +
          'Your message: "' + data.message + '"\n\n' +
          'Regards,\nTECHO Institute Team\n7841814377 / techoautomation199@gmail.com'
      });
    }
  } catch (mailErr) {
    Logger.log('Service request thank-you email failed: ' + mailErr);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ---- RATE US PAGE: Trainee / Service feedback ----
   Saves every rating to the "Feedback" tab, and emails the details to
   techoautomation199@gmail.com. Nothing is emailed back to the person who
   gave the feedback (their name only, no email address is collected). */
function getFeedbackSheet() {
  return getOrCreateSheet_(SHEET_NAMES.FEEDBACK,
    ['Timestamp', 'Type', 'Name', 'Rating', 'Service', 'Upgrade Suggestion', 'Problem Faced']);
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

    var ratingVal = Math.round(Number(values[i][3]));
    if (ratingVal >= 1 && ratingVal <= 5) {
      ratingCounts[String(ratingVal)]++;
    }

    var upgradeText = String(values[i][5] || '').trim();
    if (upgradeText.length > 0) upgradeCount++;
    else noUpgradeCount++;

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

/* =========================================================================
   ADMIN / STUDENT / ATTENDANCE / FEE / INSTALLMENTS / AGREEMENTS / HOLIDAYS
   ========================================================================= */

/* ---------------- BOSS / ADMIN ---------------- */
function bossExists() {
  const rows = sheetRows(SHEET_NAMES.ADMINS);
  return rows.some(function (r) { return r.Role === 'Boss'; });
}

function verifyBoss(adminId, password) {
  const rows = sheetRows(SHEET_NAMES.ADMINS);
  return rows.some(function (r) {
    return String(r.AdminID) === String(adminId) &&
      String(r.Password) === String(password) &&
      r.Role === 'Boss';
  });
}

function verifyAnyActiveAdmin(adminId, password) {
  const rows = sheetRows(SHEET_NAMES.ADMINS);
  return rows.some(function (r) {
    return String(r.AdminID) === String(adminId) &&
      String(r.Password) === String(password) &&
      r.Status === 'Active';
  });
}

function createAdmin(data) {
  const rows = sheetRows(SHEET_NAMES.ADMINS);
  const hasBoss = rows.some(function (r) { return r.Role === 'Boss'; });
  const hasAnyAdmin = rows.length > 0;

  if (hasBoss) {
    if (!verifyBoss(data.bossId, data.bossPassword)) {
      return { error: 'Invalid Boss ID or Password' };
    }
  } else if (hasAnyAdmin) {
    // No Boss right now (e.g. previous Boss was deleted), but other admins
    // exist — any currently-Active admin can authorize creating a new Boss.
    if (!verifyAnyActiveAdmin(data.bossId, data.bossPassword)) {
      return { error: 'Invalid Admin ID or Password' };
    }
    data.role = 'Boss';
  } else {
    // Nothing exists yet at all: the very first account created MUST be a Boss (bootstrap).
    data.role = 'Boss';
  }

  const id = nextId('ADM', SHEET_NAMES.ADMINS, 'AdminID');
  const password = randomPassword();
  const createdDate = new Date().toLocaleString();

  appendRowByHeaders(SHEET_NAMES.ADMINS, {
    AdminID: id, Password: password, FullName: data.fullName, PhotoURL: data.photoUrl || '',
    Gender: data.gender || '', Phone: data.phone, WhatsApp: data.whatsapp, Email: data.email, Aadhaar: data.aadhaar,
    PAN: data.pan, Address: data.address || '', Role: data.role,
    CreatedBy: data.createdBy || 'SELF', Status: data.status || 'Active', CreatedDate: createdDate
  });

  try {
    if (data.email) {
      MailApp.sendEmail({
        to: data.email,
        subject: 'Your TECHO Admin Portal Login Details',
        body:
          'Hi ' + data.fullName + ',\n\n' +
          'An account has been created for you on the TECHO Admin Portal.\n\n' +
          'Admin ID: ' + id + '\n' +
          'Password: ' + password + '\n' +
          'Role: ' + data.role + '\n\n' +
          'Please keep these details safe and do not share them with anyone.\n' +
          'You can log in at the TECHO Admin Portal using this ID and Password.\n\n' +
          'Regards,\nTECHO Institute Team\n7841814377 / techoautomation199@gmail.com'
      });
    }
  } catch (mailErr) {
    Logger.log('Admin creation email failed: ' + mailErr);
  }

  return { id: id, password: password, role: data.role };
}

function listAdmins() {
  return sheetRows(SHEET_NAMES.ADMINS).map(function (r) {
    return {
      AdminID: r.AdminID, FullName: r.FullName, PhotoURL: r.PhotoURL, Gender: r.Gender,
      Role: r.Role, Status: r.Status
    };
  });
}

/* View a specific admin's full profile — requires EITHER valid Boss
   credentials (Boss can view anyone) OR the target admin's own
   credentials (self-view only). Password is never returned. */
function viewAdminProfile(data) {
  const rows = sheetRows(SHEET_NAMES.ADMINS);
  const entered = rows.find(function (r) {
    return String(r.AdminID) === String(data.enteredId) && String(r.Password) === String(data.enteredPassword);
  });
  if (!entered) return { error: 'Invalid ID or Password' };

  const isBoss = entered.Role === 'Boss';
  const isSelf = String(entered.AdminID) === String(data.targetAdminId);
  if (!isBoss && !isSelf) return { error: 'You can only view your own profile' };

  const target = rows.find(function (r) { return String(r.AdminID) === String(data.targetAdminId); });
  if (!target) return { error: 'Admin not found' };

  return {
    AdminID: target.AdminID, FullName: target.FullName, PhotoURL: target.PhotoURL, Gender: target.Gender,
    Phone: target.Phone, WhatsApp: target.WhatsApp, Email: target.Email, Address: target.Address,
    Role: target.Role, Status: target.Status, CreatedBy: target.CreatedBy, CreatedDate: target.CreatedDate,
    Signature: target.Signature || '',
    viewerId: entered.AdminID, viewerPassword: entered.Password, viewerIsBoss: isBoss
  };
}

/* Saves an Admin's own drawn signature (data: PNG URL, same technique as
   uploadPhoto) onto their row in the Admins sheet. Requires that same
   Admin's own ID + Password (or Boss) — same gate as viewing a profile. */
function updateAdminSignature(data) {
  const rows = sheetRows(SHEET_NAMES.ADMINS);
  const entered = rows.find(function (r) {
    return String(r.AdminID) === String(data.enteredId) && String(r.Password) === String(data.enteredPassword);
  });
  if (!entered) return { error: 'Invalid ID or Password' };
  const isBoss = entered.Role === 'Boss';
  const isSelf = String(entered.AdminID) === String(data.targetAdminId);
  if (!isBoss && !isSelf) return { error: 'You can only update your own signature' };

  const sheet = getSheet(SHEET_NAMES.ADMINS);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idCol = headers.indexOf('AdminID');
  const sigCol = headers.indexOf('Signature');
  if (sigCol === -1) return { error: 'Add a "Signature" column to the Admins tab first.' };
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idCol]) === String(data.targetAdminId)) {
      sheet.getRange(i + 1, sigCol + 1).setValue(data.signatureUrl || '');
      return { success: true };
    }
  }
  return { error: 'Admin not found' };
}

/* ---------------- PHOTO UPLOAD (gallery photo -> stored directly on the sheet) ----------------
   Google Drive "hotlinking" (drive.google.com/uc?export=view, and even the
   lh3.googleusercontent.com thumbnail link) turned out to be unreliable —
   Google sometimes blocks these from loading inside a plain <img> tag, so
   the photo would upload fine but never actually show on the profile.
   To make this 100% reliable, we skip Drive entirely for photos: the
   browser already resizes/compresses the chosen photo down to a small
   size before sending it here, and we simply hand that same image straight
   back as a "data:" URL — which the <img> tag can always display instantly,
   with zero dependency on Drive links, sharing settings, or permissions.
   This same data: URL is what gets saved as PhotoURL in the Admins/
   Students sheet. */
function uploadPhoto(data) {
  try {
    if (!data.base64) return { error: 'No photo data received' };
    const mimeType = data.mimeType || 'image/jpeg';
    /* A Google Sheets cell can hold at most 50,000 characters — the
       browser keeps compressing the photo until its base64 text is safely
       under that, but we double-check here too. */
    if (data.base64.length > 47000) {
      return { error: 'Photo is still too large after resizing. Please choose a smaller/simpler photo and try again.' };
    }
    return { url: 'data:' + mimeType + ';base64,' + data.base64 };
  } catch (err) {
    return { error: 'Photo upload failed: ' + err.message };
  }
}

function adminLogin(data) {
  const rows = sheetRows(SHEET_NAMES.ADMINS);
  const found = rows.find(function (r) {
    return String(r.AdminID) === String(data.adminId) &&
      String(r.Password) === String(data.password);
  });
  if (!found) return { error: 'Invalid ID or Password' };
  if (found.Status !== 'Active') return { error: 'This account is Inactive' };
  return {
    id: found.AdminID, fullName: found.FullName, role: found.Role,
    photoUrl: found.PhotoURL, phone: found.Phone, whatsapp: found.WhatsApp,
    email: found.Email
  };
}

function deleteAdmin(data) {
  const rows = sheetRows(SHEET_NAMES.ADMINS);
  const hasBoss = rows.some(function (r) { return r.Role === 'Boss'; });

  if (hasBoss) {
    if (!verifyBoss(data.bossId, data.bossPassword)) {
      return { error: 'Invalid Boss ID or Password' };
    }
  }
  // If no Boss exists at all, deletion is allowed without verification
  // (there is nobody who could authorize it).

  const target = rows.find(function (r) { return String(r.AdminID) === String(data.targetAdminId); });
  if (!target) return { error: 'Admin not found' };

  // A Boss profile can only be deleted by that SAME Boss's own credentials —
  // one Boss cannot delete a different Boss (there should only ever be one).
  if (hasBoss && target.Role === 'Boss' && String(data.bossId) !== String(data.targetAdminId)) {
    return { error: 'A Boss profile can only be deleted using its own ID and Password' };
  }

  const sheet = getSheet(SHEET_NAMES.ADMINS);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idCol = headers.indexOf('AdminID');
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idCol]) === String(data.targetAdminId)) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { error: 'Admin not found' };
}

function setAdminStatus(data) {
  if (!verifyBoss(data.bossId, data.bossPassword)) {
    return { error: 'Invalid Boss ID or Password' };
  }
  const sheet = getSheet(SHEET_NAMES.ADMINS);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idCol = headers.indexOf('AdminID');
  const statusCol = headers.indexOf('Status');
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idCol]) === String(data.targetAdminId)) {
      sheet.getRange(i + 1, statusCol + 1).setValue(data.status);
      return { success: true };
    }
  }
  return { error: 'Admin not found' };
}

/* ---------------- STUDENTS ---------------- */
function addStudent(data) {
  const id = nextId('STU', SHEET_NAMES.STUDENTS, 'StudentID');
  const password = randomPassword();
  const totalFee = Number(data.totalFee) || 0;
  const paidFee = Number(data.paidFee) || 0;

  appendRowByHeaders(SHEET_NAMES.STUDENTS, {
    StudentID: id, Password: password, FullName: data.fullName, FatherName: data.fatherName || '',
    MotherName: data.motherName || '', PhotoURL: data.photoUrl || '', Gender: data.gender || '',
    DOB: data.dob || '', Age: data.age || '',
    Mobile: data.mobile, WhatsApp: data.whatsapp || '', Email: data.email, Aadhaar: data.aadhaar || '',
    PAN: data.pan || '', Address: data.address || '', TrainingMode: data.mode || '',
    Course: data.course, CourseOptions: data.courseOptions || '', Batch: data.batch, Qualification: data.qualification || '',
    QualBranch: data.qualBranch || '', QualCollege: data.qualCollege || '', QualYear: data.qualYear || '',
    Employment: data.employment || '', EmpCompany: data.empCompany || '', EmpDesignation: data.empDesignation || '',
    Documents: data.documents || '', DocumentPhoto1: data.documentPhoto1Url || '', DocumentPhoto2: data.documentPhoto2Url || '',
    AdmissionDate: data.admissionDate, TotalFee: totalFee, PaidFee: paidFee,
    PendingFee: totalFee - paidFee, PaymentMethod: data.paymentMethod || '', TransactionID: data.transactionId || '',
    CourseStatus: 'Pending', Remarks: '', EmergencyName: data.emName || '', EmergencyRelation: data.emRelation || '',
    EmergencyMobile: data.emMobile || '', CreatedBy: data.createdBy || ''
  });

  try {
    if (data.email) {
      MailApp.sendEmail({
        to: data.email,
        subject: 'Your TECHO Student ID Has Been Generated',
        body:
          'Hi ' + data.fullName + ',\n\n' +
          'Welcome to TECHO Industrial Automation! Your student login has been created.\n\n' +
          'Student ID: ' + id + '\n' +
          'Password: ' + password + '\n\n' +
          'Course: ' + data.course + '\n' +
          'Batch: ' + data.batch + '\n\n' +
          'Please keep this ID and password safe.\n\n' +
          'Regards,\nTECHO Institute Team'
      });
    }
  } catch (mailErr) {
    Logger.log('Student email failed: ' + mailErr);
  }

  return { id: id, password: password };
}

function listStudents(data) {
  let rows = sheetRows(SHEET_NAMES.STUDENTS);
  if (data && data.query) {
    const q = String(data.query).toLowerCase();
    rows = rows.filter(function (r) {
      return String(r.FullName).toLowerCase().indexOf(q) !== -1 ||
        String(r.StudentID).toLowerCase().indexOf(q) !== -1 ||
        String(r.Mobile).indexOf(q) !== -1;
    });
  }
  return rows.map(function (r) {
    return {
      StudentID: r.StudentID, FullName: r.FullName, Course: r.Course,
      Batch: r.Batch, Mobile: r.Mobile, TotalFee: r.TotalFee,
      PaidFee: r.PaidFee, PendingFee: r.PendingFee, CourseStatus: r.CourseStatus,
      AdmissionDate: r.AdmissionDate
    };
  });
}

function studentLogin(data) {
  const rows = sheetRows(SHEET_NAMES.STUDENTS);
  const found = rows.find(function (r) {
    return String(r.StudentID) === String(data.studentId) &&
      String(r.Password) === String(data.password);
  });
  if (!found) return { error: 'Invalid ID or Password' };
  return found;
}

/* Used to gate the "Edit Profile" button on the Trainee dashboard — ANY
   currently-Active admin (Boss or Supervisor) can authorize an edit by
   entering their own Admin ID + Password. (If the Boss is the only admin
   account that exists yet, that naturally means the Boss ID is the only
   one that will work — no special-casing needed.) */
function verifyAdminGate(data) {
  if (!verifyAnyActiveAdmin(data.adminId, data.adminPassword)) {
    return { error: 'Invalid Admin ID or Password' };
  }
  return { ok: true };
}

/* Saves edits made on the Trainee dashboard's Edit Profile form. Re-checks
   the admin credentials server-side (never trust the client) before
   touching the sheet. Only the fields actually sent are overwritten —
   everything else on that student's row is left untouched. */
function updateStudent(data) {
  if (!verifyAnyActiveAdmin(data.adminId, data.adminPassword)) {
    return { error: 'Invalid Admin ID or Password' };
  }
  const rows = sheetRows(SHEET_NAMES.STUDENTS);
  const exists = rows.some(function (r) { return String(r.StudentID) === String(data.studentId); });
  if (!exists) return { error: 'Trainee not found' };

  const totalFee = data.totalFee !== undefined && data.totalFee !== '' ? Number(data.totalFee) : undefined;
  const paidFee = data.paidFee !== undefined && data.paidFee !== '' ? Number(data.paidFee) : undefined;

  const updates = {
    FullName: data.fullName, PhotoURL: data.photoUrl, DOB: data.dob, Age: data.age,
    Mobile: data.mobile, WhatsApp: data.whatsapp, Email: data.email, Aadhaar: data.aadhaar,
    PAN: data.pan, Address: data.address, TrainingMode: data.mode, Course: data.course, Batch: data.batch,
    Qualification: data.qualification, QualBranch: data.qualBranch, QualCollege: data.qualCollege,
    QualYear: data.qualYear, Employment: data.employment, EmpCompany: data.empCompany,
    EmpDesignation: data.empDesignation, Documents: data.documents, AdmissionDate: data.admissionDate,
    PaymentMethod: data.paymentMethod, TransactionID: data.transactionId, CourseStatus: data.courseStatus,
    EmergencyName: data.emName, EmergencyRelation: data.emRelation, EmergencyMobile: data.emMobile
  };
  if (totalFee !== undefined) updates.TotalFee = totalFee;
  if (paidFee !== undefined) updates.PaidFee = paidFee;
  if (totalFee !== undefined && paidFee !== undefined) updates.PendingFee = totalFee - paidFee;

  Object.keys(updates).forEach(function (k) { if (updates[k] === undefined) delete updates[k]; });

  updateRowByHeaders(SHEET_NAMES.STUDENTS, 'StudentID', data.studentId, updates);
  return { ok: true };
}

function updateFee(data) {
  const sheet = getSheet(SHEET_NAMES.STUDENTS);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idCol = headers.indexOf('StudentID');
  const nameCol = headers.indexOf('FullName');
  const emailCol = headers.indexOf('Email');
  const paidCol = headers.indexOf('PaidFee');
  const pendingCol = headers.indexOf('PendingFee');
  const totalCol = headers.indexOf('TotalFee');
  const txnCol = headers.indexOf('TransactionID');
  const methodCol = headers.indexOf('PaymentMethod');
  const remarksCol = headers.indexOf('Remarks');

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idCol]) === String(data.studentId)) {
      const newPaid = Number(values[i][paidCol]) + Number(data.amount);
      const total = Number(values[i][totalCol]);
      const newPending = total - newPaid;
      sheet.getRange(i + 1, paidCol + 1).setValue(newPaid);
      sheet.getRange(i + 1, pendingCol + 1).setValue(newPending);

      // Keep the Trainee Profile showing the LATEST payment's method /
      // Transaction ID / remarks — Transaction ID is blank for Cash.
      if (methodCol !== -1) sheet.getRange(i + 1, methodCol + 1).setValue(data.method || '');
      if (txnCol !== -1) sheet.getRange(i + 1, txnCol + 1).setValue(data.method === 'Cash' ? '' : (data.transactionId || ''));
      if (remarksCol !== -1) sheet.getRange(i + 1, remarksCol + 1).setValue(data.remarks || '');

      const receiptNo = 'RCPT' + new Date().getTime();
      appendRowByHeaders(SHEET_NAMES.FEE, {
        ReceiptNo: receiptNo, StudentID: data.studentId, Amount: data.amount,
        PaymentMethod: data.method, TransactionID: data.method === 'Cash' ? '' : (data.transactionId || ''),
        Remarks: data.remarks || '', Date: new Date().toLocaleString(), CreatedBy: data.createdBy || ''
      });

      const studentEmail = emailCol !== -1 ? values[i][emailCol] : '';
      const studentName = nameCol !== -1 ? values[i][nameCol] : '';
      try {
        if (studentEmail) {
          MailApp.sendEmail({
            to: studentEmail,
            subject: 'Fee Receipt — TECHO Institute (' + receiptNo + ')',
            body:
              'Hi ' + studentName + ',\n\n' +
              'We have received your payment. Here are your receipt details:\n\n' +
              'Receipt No: ' + receiptNo + '\n' +
              'Amount Paid: ₹' + data.amount + '\n' +
              'Payment Method: ' + (data.method === 'Cash' ? 'Cash Payment' : data.method) + '\n' +
              (data.method !== 'Cash' && data.transactionId ? ('Transaction ID: ' + data.transactionId + '\n') : '') +
              'Total Fee: ₹' + total + '\n' +
              'Total Paid Till Date: ₹' + newPaid + '\n' +
              'Pending Fee: ₹' + newPending + '\n\n' +
              'Thank you for your payment.\n\n' +
              'Regards,\nTECHO Institute Team\n7841814377 / techoautomation199@gmail.com'
          });
        }
      } catch (mailErr) {
        Logger.log('Fee receipt email failed: ' + mailErr);
      }

      return { success: true, receiptNo: receiptNo, newPaid: newPaid, newPending: newPending };
    }
  }
  return { error: 'Student not found' };
}

function setCourseStatus(data) {
  if (!verifyAnyActiveAdmin(data.adminId, data.adminPassword)) {
    return { error: 'Invalid Admin ID or Password' };
  }
  const sheet = getSheet(SHEET_NAMES.STUDENTS);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idCol = headers.indexOf('StudentID');
  const statusCol = headers.indexOf('CourseStatus');
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idCol]) === String(data.studentId)) {
      sheet.getRange(i + 1, statusCol + 1).setValue(data.status);
      return { success: true };
    }
  }
  return { error: 'Student not found' };
}

/* ---------------- ATTENDANCE ---------------- */
function markPresent(data) {
  const sheet = getSheet(SHEET_NAMES.ATTENDANCE);
  const now = new Date();
  sheet.appendRow([
    data.adminId, now.toLocaleDateString(), now.toLocaleTimeString(), '', 'Present'
  ]);
  return { success: true, time: now.toLocaleTimeString() };
}

function markLogout(data) {
  const sheet = getSheet(SHEET_NAMES.ATTENDANCE);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idCol = headers.indexOf('AdminID');
  const dateCol = headers.indexOf('Date');
  const logoutCol = headers.indexOf('LogoutTime');
  const today = new Date().toLocaleDateString();

  for (let i = values.length - 1; i >= 1; i--) {
    if (String(values[i][idCol]) === String(data.adminId) && values[i][dateCol] === today) {
      sheet.getRange(i + 1, logoutCol + 1).setValue(new Date().toLocaleTimeString());
      return { success: true };
    }
  }
  return { error: 'No matching present entry found for today' };
}

/* ---------------- INSTALLMENT AGREEMENTS ---------------- */
function saveInstallment(data) {
  appendRowByHeaders(SHEET_NAMES.INSTALLMENTS, {
    StudentID: data.studentId, StudentName: data.studentName,
    Installment1Amount: data.i1amt, Installment1Date: data.i1date,
    Installment2Amount: data.i2amt, Installment2Date: data.i2date,
    Installment3Amount: data.i3amt, Installment3Date: data.i3date,
    Installment4Amount: data.i4amt, Installment4Date: data.i4date,
    AuthorizedBy: data.authorizedBy, Date: new Date().toLocaleString()
  });
  return { success: true };
}

function getFeeHistory(studentId) {
  return sheetRows(SHEET_NAMES.FEE).filter(function (r) {
    return String(r.StudentID) === String(studentId);
  });
}

function getInstallment(studentId) {
  const rows = sheetRows(SHEET_NAMES.INSTALLMENTS).filter(function (r) {
    return String(r.StudentID) === String(studentId);
  });
  return rows.length ? rows[rows.length - 1] : null;
}

/* ---------------- STUDENT UNDERTAKING / DECLARATION AGREEMENTS ---------------- */
function saveAgreementForm(data) {
  appendRowByHeaders(SHEET_NAMES.AGREEMENTS, {
    StudentID: data.studentId, FormType: data.formType, FullName: data.fullName,
    Course: data.course, Address: data.address || '', Place: data.place || '',
    Signature: data.signature, ParentName: data.parentName || '',
    ParentSignature: data.parentSignature || '', Date: new Date().toLocaleString()
  });
  return { success: true };
}

function getAgreementForm(studentId, formType) {
  const rows = sheetRows(SHEET_NAMES.AGREEMENTS).filter(function (r) {
    return String(r.StudentID) === String(studentId) && String(r.FormType) === String(formType);
  });
  return rows.length ? rows[rows.length - 1] : null;
}

function deleteStudent(data) {
  if (!verifyAnyActiveAdmin(data.adminId, data.adminPassword)) {
    return { error: 'Invalid Admin ID or Password' };
  }
  const sheet = getSheet(SHEET_NAMES.STUDENTS);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idCol = headers.indexOf('StudentID');
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idCol]) === String(data.studentId)) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { error: 'Student not found' };
}

/* =========================================================================
   TRAINEE ATTENDANCE (Present / Absent marked by the trainee themself)
   and HOLIDAYS (official no-class dates set by Admin/Boss/Supervisor)
   ========================================================================= */

function getOrCreateSheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
  }
  return sheet;
}

function getTraineeAttendanceSheet() {
  return getOrCreateSheet_(SHEET_NAMES.TRAINEE_ATTENDANCE,
    ['StudentID', 'StudentName', 'Date', 'Status', 'Time', 'Reason', 'MarkedBy']);
}

function getHolidaysSheet() {
  return getOrCreateSheet_(SHEET_NAMES.HOLIDAYS, ['Date', 'Reason', 'MarkedBy', 'MarkedByName', 'Timestamp']);
}

/* Trainee taps Present or Absent on their own dashboard.
   - One entry per trainee per calendar day (re-marking the same day is
     blocked so counts stay accurate).
   - Absent requires a reason; that reason is also emailed to the
     institute so staff see it immediately. */
function markTraineeAttendance(data) {
  const sheet = getTraineeAttendanceSheet();
  const values = sheet.getDataRange().getValues();
  const today = new Date().toLocaleDateString();

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(data.studentId) && values[i][2] === today) {
      return { error: 'Attendance for today has already been marked.' };
    }
  }

  const status = data.status === 'Absent' ? 'Absent' : 'Present';
  const now = new Date();
  sheet.appendRow([
    data.studentId, data.studentName || '', today, status,
    now.toLocaleTimeString(), status === 'Absent' ? (data.reason || '') : '',
    'Self'
  ]);

  if (status === 'Absent') {
    try {
      MailApp.sendEmail({
        to: 'techoautomation199@gmail.com',
        subject: 'Trainee Marked Absent — TECHO',
        body:
          'A trainee has marked themselves ABSENT on the TECHO trainee portal.\n\n' +
          'Trainee ID: ' + data.studentId + '\n' +
          'Name: ' + (data.studentName || '') + '\n' +
          'Date: ' + today + '\n' +
          'Time: ' + now.toLocaleTimeString() + '\n' +
          'Reason: ' + (data.reason || '-')
      });
    } catch (mailErr) {
      Logger.log('Absent-reason email failed: ' + mailErr);
    }
  }

  return { success: true, status: status, date: today, time: now.toLocaleTimeString() };
}

/* Live numbers for the public Dashboard page: total trainees, today's
   Present/Absent, and this calendar year's Present/Absent. */
function getAttendanceSummary() {
  const totalStudents = sheetRows(SHEET_NAMES.STUDENTS).length;
  const rows = sheetRows(SHEET_NAMES.TRAINEE_ATTENDANCE);
  const now = new Date();
  const today = now.toLocaleDateString();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11

  let todayPresent = 0, todayAbsent = 0, yearPresent = 0, yearAbsent = 0;
  let monthPresent = 0, monthAbsent = 0;
  const monthly = [];
  for (let m = 0; m < 12; m++) monthly.push({ month: m + 1, present: 0, absent: 0 });

  rows.forEach(function (r) {
    const rowDate = new Date(r.Date);
    const rowYear = rowDate.getFullYear();
    const rowMonth = rowDate.getMonth();
    const isThisYear = rowYear === currentYear;

    if (r.Date === today) {
      if (r.Status === 'Present') todayPresent++;
      else if (r.Status === 'Absent') todayAbsent++;
    }
    if (isThisYear) {
      if (r.Status === 'Present') yearPresent++;
      else if (r.Status === 'Absent') yearAbsent++;

      if (rowMonth >= 0 && rowMonth < 12) {
        if (r.Status === 'Present') monthly[rowMonth].present++;
        else if (r.Status === 'Absent') monthly[rowMonth].absent++;
      }
      if (rowMonth === currentMonth) {
        if (r.Status === 'Present') monthPresent++;
        else if (r.Status === 'Absent') monthAbsent++;
      }
    }
  });

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  return {
    totalStudents: totalStudents,
    today: today,
    todayPresent: todayPresent,
    todayAbsent: todayAbsent,
    currentMonth: currentMonth + 1,
    currentMonthName: monthNames[currentMonth],
    monthPresent: monthPresent,
    monthAbsent: monthAbsent,
    monthlyBreakdown: monthly,
    year: currentYear,
    yearPresent: yearPresent,
    yearAbsent: yearAbsent
  };
}

/* Admin-only: full daily attendance history for one trainee, with any
   Admin-marked Holidays merged in (so a holiday shows up even though the
   trainee never tapped Present/Absent that day). Requires Admin ID +
   Password — re-checked server-side, never trusts the client. */
/* Admin-only: full daily attendance history for one trainee, with any
   Admin-marked Holidays merged in (so a holiday shows up even though the
   trainee never tapped Present/Absent that day).
   Accepts EITHER:
     - Admin ID + Admin Password (any active Admin/Boss/Supervisor), OR
     - The trainee's OWN Trainee ID + Trainee Password (self-view only —
       studentId in the payload must match the account being logged into).
   Re-checked server-side either way, never trusts the client. */
function getStudentAttendanceLog(data) {
  let authorized = false;

  if (data.adminId && data.adminPassword) {
    authorized = verifyAnyActiveAdmin(data.adminId, data.adminPassword);
    if (!authorized) return { error: 'Invalid Admin ID or Password' };
  } else if (data.studentPassword) {
    const studentRows = sheetRows(SHEET_NAMES.STUDENTS);
    const found = studentRows.find(function (r) {
      return String(r.StudentID) === String(data.studentId) &&
        String(r.Password) === String(data.studentPassword);
    });
    if (!found) return { error: 'Invalid Trainee ID or Password' };
    authorized = true;
  } else {
    return { error: 'Please provide Admin ID + Password, or your own Trainee ID + Password.' };
  }

  const attendance = sheetRows(SHEET_NAMES.TRAINEE_ATTENDANCE).filter(function (r) {
    return String(r.StudentID) === String(data.studentId);
  }).map(function (r) {
    return { Date: r.Date, Status: r.Status, Time: r.Time, Reason: r.Reason, MarkedBy: r.MarkedBy, DeclaredBy: '' };
  });

  const markedDates = {};
  attendance.forEach(function (r) { markedDates[r.Date] = true; });

  const holidays = listHolidays().filter(function (h) {
    return !markedDates[h.Date];
  }).map(function (h) {
    return { Date: h.Date, Status: 'Holiday', Time: '', Reason: h.Reason, MarkedBy: h.MarkedBy, DeclaredBy: h.MarkedByName || h.MarkedBy };
  });

  const combined = attendance.concat(holidays);
  combined.sort(function (a, b) { return new Date(b.Date) - new Date(a.Date); });

  return { log: combined };
}

/* Admin-only: mark an official holiday / no-class date. This date will
   then automatically show up (highlighted as "Holiday", reason
   auto-filled) in EVERY trainee's attendance log — nothing needs to be
   entered per-trainee. Requires Admin ID + Password. */
function addHoliday(data) {
  if (!verifyAnyActiveAdmin(data.adminId, data.adminPassword)) {
    return { error: 'Invalid Admin ID or Password' };
  }
  if (!data.date || !data.reason) {
    return { error: 'Date and reason are both required.' };
  }
  const adminRows = sheetRows(SHEET_NAMES.ADMINS);
  const adminRecord = adminRows.find(function (r) { return String(r.AdminID) === String(data.adminId); });
  const adminName = adminRecord ? adminRecord.FullName : data.adminId;

  const sheet = getHolidaysSheet();
  const dateStr = new Date(data.date).toLocaleDateString();
  sheet.appendRow([dateStr, data.reason, data.adminId, adminName, new Date().toLocaleString()]);
  return { success: true };
}

function listHolidays() {
  const sheet = getHolidaysSheet();
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  return values.slice(1).map(function (row) {
    const obj = {};
    headers.forEach(function (h, i) { obj[h] = row[i]; });
    return obj;
  });
}

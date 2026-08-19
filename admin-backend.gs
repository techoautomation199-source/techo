/* =========================================================================
   TECHO — ADMIN / BOSS / SUPERVISOR / STUDENT MANAGEMENT BACKEND
   -------------------------------------------------------------------------
   This is a SEPARATE Google Apps Script from the enrollment one
   (google-apps-script.gs). Deploy this under ayareomkar199@gmail.com
   (as decided), against a NEW Google Sheet with 6 tabs:

     1. "Admins"     — Boss & Supervisor accounts
     2. "Students"   — student records
     3. "Attendance" — daily present/logout log for Admins
     4. "FeeHistory" — every fee payment / receipt generated
     5. "Installments" — installment payment agreements
     6. "Agreements" — student-submitted Undertaking & Declaration forms

   ONE-TIME SETUP:
   1. Create a new Google Sheet, name it "TECHO Admin System".
   2. Create 6 tabs (bottom of the sheet) named EXACTLY:
      Admins, Students, Attendance, FeeHistory, Installments, Agreements
   3. In "Admins" tab, Row 1 headers (A to N):
      AdminID | Password | FullName | PhotoURL | Phone | WhatsApp | Email |
      Aadhaar | PAN | Address | Role | CreatedBy | Status | CreatedDate
   4. In "Students" tab, Row 1 headers (A to Q):
      StudentID | Password | FullName | FatherName | MotherName | PhotoURL |
      Mobile | WhatsApp | Email | Aadhaar | Address | Course | Batch |
      AdmissionDate | TotalFee | PaidFee | PendingFee | CourseStatus | CreatedBy
   5. In "Attendance" tab, Row 1 headers (A to E):
      AdminID | Date | LoginTime | LogoutTime | Status
   6. In "FeeHistory" tab, Row 1 headers (A to F):
      ReceiptNo | StudentID | Amount | PaymentMethod | Date | CreatedBy
   7. In "Installments" tab, Row 1 headers (A to L):
      StudentID | StudentName | Installment1Amount | Installment1Date |
      Installment2Amount | Installment2Date | Installment3Amount | Installment3Date |
      Installment4Amount | Installment4Date | AuthorizedBy | Date
   8. In "Agreements" tab, Row 1 headers (A to I):
      StudentID | FormType | FullName | Course | Address | Place |
      Signature | ParentName | ParentSignature | Date
   7. Extensions -> Apps Script -> paste this whole file -> Save.
   8. Deploy -> New deployment -> Web app -> Execute as: Me,
      Who has access: Anyone -> Deploy -> copy the URL.
   9. Paste that URL into admin.js as ADMIN_SCRIPT_URL.
   ========================================================================= */

const SHEET_NAMES = {
  ADMINS: 'Admins',
  STUDENTS: 'Students',
  ATTENDANCE: 'Attendance',
  FEE: 'FeeHistory',
  INSTALLMENTS: 'Installments',
  AGREEMENTS: 'Agreements'
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
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  let result;
  try {
    switch (action) {
      case 'bossExists': result = { exists: bossExists() }; break;
      case 'createAdmin': result = createAdmin(data); break;
      case 'adminLogin': result = adminLogin(data); break;
      case 'listAdmins': result = { admins: listAdmins() }; break;
      case 'viewAdminProfile': result = viewAdminProfile(data); break;
      case 'deleteAdmin': result = deleteAdmin(data); break;
      case 'setAdminStatus': result = setAdminStatus(data); break;
      case 'addStudent': result = addStudent(data); break;
      case 'listStudents': result = { students: listStudents(data) }; break;
      case 'studentLogin': result = studentLogin(data); break;
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
      default: result = { error: 'Unknown action' };
    }
  } catch (err) {
    result = { error: err.message };
  }
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService.createTextOutput('TECHO admin backend is running.')
    .setMimeType(ContentService.MimeType.TEXT);
}

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
    Phone: data.phone, WhatsApp: data.whatsapp, Email: data.email, Aadhaar: data.aadhaar,
    PAN: data.pan, Address: data.address || '', Role: data.role,
    CreatedBy: data.createdBy || 'SELF', Status: data.status || 'Active', CreatedDate: createdDate
  });

  return { id: id, password: password, role: data.role };
}

function listAdmins() {
  return sheetRows(SHEET_NAMES.ADMINS).map(function (r) {
    return {
      AdminID: r.AdminID, FullName: r.FullName, PhotoURL: r.PhotoURL,
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
    AdminID: target.AdminID, FullName: target.FullName, PhotoURL: target.PhotoURL,
    Phone: target.Phone, WhatsApp: target.WhatsApp, Email: target.Email, Address: target.Address,
    Role: target.Role, Status: target.Status, CreatedBy: target.CreatedBy, CreatedDate: target.CreatedDate,
    viewerId: entered.AdminID, viewerPassword: entered.Password, viewerIsBoss: isBoss
  };
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
    MotherName: data.motherName || '', PhotoURL: data.photoUrl || '', Mobile: data.mobile,
    WhatsApp: data.whatsapp || '', Email: data.email, Aadhaar: data.aadhaar || '',
    Address: data.address || '', Course: data.course, Batch: data.batch,
    AdmissionDate: data.admissionDate, TotalFee: totalFee, PaidFee: paidFee,
    PendingFee: totalFee - paidFee, CourseStatus: 'Ongoing', CreatedBy: data.createdBy || ''
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

function updateFee(data) {
  const sheet = getSheet(SHEET_NAMES.STUDENTS);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idCol = headers.indexOf('StudentID');
  const paidCol = headers.indexOf('PaidFee');
  const pendingCol = headers.indexOf('PendingFee');
  const totalCol = headers.indexOf('TotalFee');

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idCol]) === String(data.studentId)) {
      const newPaid = Number(values[i][paidCol]) + Number(data.amount);
      const total = Number(values[i][totalCol]);
      sheet.getRange(i + 1, paidCol + 1).setValue(newPaid);
      sheet.getRange(i + 1, pendingCol + 1).setValue(total - newPaid);

      const receiptNo = 'RCPT' + new Date().getTime();
      appendRowByHeaders(SHEET_NAMES.FEE, {
        ReceiptNo: receiptNo, StudentID: data.studentId, Amount: data.amount,
        PaymentMethod: data.method, Date: new Date().toLocaleString(), CreatedBy: data.createdBy || ''
      });
      return { success: true, receiptNo: receiptNo, newPaid: newPaid, newPending: total - newPaid };
    }
  }
  return { error: 'Student not found' };
}

function setCourseStatus(data) {
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
  if (!verifyBoss(data.bossId, data.bossPassword)) {
    return { error: 'Invalid Boss ID or Password' };
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

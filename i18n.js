/* =========================================================================
   TECHO — SHARED 3-LANGUAGE (English / मराठी / हिंदी) LABEL DICTIONARY
   -------------------------------------------------------------------------
   Used by student-admission.html, fee-receipt.html, installment.html and
   student.html (view mode). Any element with data-i18n="KEY" gets its
   text swapped when the language toggle is used.
   ========================================================================= */

const TECHO_I18N = {
  // ---- language toggle buttons themselves ----
  lang_en: { en: 'English', mr: 'English', hi: 'English' },
  lang_mr: { en: 'Marathi', mr: 'मराठी', hi: 'मराठी' },
  lang_hi: { en: 'Hindi', mr: 'हिंदी', hi: 'हिंदी' },

  // ---- common ----
  full_name: { en: 'Full Name', mr: 'पूर्ण नाव', hi: 'पूरा नाम' },
  father_name: { en: "Father's Name", mr: 'वडिलांचे नाव', hi: 'पिता का नाम' },
  mother_name: { en: "Mother's Name", mr: 'आईचे नाव', hi: 'माता का नाम' },
  dob: { en: 'Date of Birth', mr: 'जन्मतारीख', hi: 'जन्म तिथि' },
  age: { en: 'Age', mr: 'वय', hi: 'आयु' },
  gender: { en: 'Gender', mr: 'लिंग', hi: 'लिंग' },
  mobile: { en: 'Mobile Number', mr: 'मोबाईल क्रमांक', hi: 'मोबाइल नंबर' },
  whatsapp: { en: 'WhatsApp Number', mr: 'WhatsApp क्रमांक', hi: 'WhatsApp नंबर' },
  email: { en: 'Email', mr: 'ई-मेल', hi: 'ई-मेल' },
  aadhaar: { en: 'Aadhaar Number', mr: 'आधार क्रमांक', hi: 'आधार नंबर' },
  pan: { en: 'PAN Number', mr: 'PAN क्रमांक', hi: 'PAN नंबर' },
  address: { en: 'Address', mr: 'पत्ता', hi: 'पता' },

  // ---- admission form sections ----
  admission_date: { en: 'Admission Date', mr: 'प्रवेश दिनांक', hi: 'प्रवेश तिथि' },
  course_name: { en: 'Course Name', mr: 'कोर्सचे नाव', hi: 'कोर्स का नाम' },
  training_mode: { en: 'Training Mode', mr: 'प्रशिक्षण प्रकार', hi: 'प्रशिक्षण प्रकार' },
  batch: { en: 'Batch', mr: 'बॅच', hi: 'बैच' },
  personal_info: { en: 'Personal Information', mr: 'वैयक्तिक माहिती', hi: 'व्यक्तिगत जानकारी' },
  permanent_address: { en: 'Permanent Address', mr: 'कायमचा पत्ता', hi: 'स्थायी पता' },
  qualification: { en: 'Qualification', mr: 'शैक्षणिक माहिती', hi: 'शैक्षणिक योग्यता' },
  employment: { en: 'Employment', mr: 'नोकरीची माहिती', hi: 'रोजगार जानकारी' },
  documents: { en: 'Documents', mr: 'ओळखपत्रे', hi: 'दस्तावेज़' },
  fee_details: { en: 'Fee Details', mr: 'फीची माहिती', hi: 'फीस विवरण' },
  emergency_contact: { en: 'Emergency Contact', mr: 'आपत्कालीन संपर्क', hi: 'आपातकालीन संपर्क' },
  total_fee: { en: 'Total Fee', mr: 'एकूण फी', hi: 'कुल फीस' },
  paid_fee: { en: 'Paid Fee', mr: 'भरलेली फी', hi: 'भुगतान की गई फीस' },
  balance_fee: { en: 'Balance Fee', mr: 'शिल्लक फी', hi: 'शेष फीस' },
  payment_method: { en: 'Payment Method', mr: 'पेमेंट पद्धत', hi: 'भुगतान विधि' },

  // ---- fee receipt ----
  receipt_no: { en: 'Receipt No.', mr: 'पावती क्रमांक', hi: 'रसीद नंबर' },
  student_info: { en: 'Student Information', mr: 'विद्यार्थ्याची माहिती', hi: 'छात्र की जानकारी' },
  fee_info: { en: 'Fee Information', mr: 'फीची माहिती', hi: 'फीस जानकारी' },
  payment_info: { en: 'Payment Information', mr: 'पेमेंटची माहिती', hi: 'भुगतान जानकारी' },
  remarks: { en: 'Remarks', mr: 'नोंद', hi: 'टिप्पणी' },

  // ---- installment ----
  installment_schedule: { en: 'Installment Schedule', mr: 'हप्त्यांचे वेळापत्रक', hi: 'किस्त अनुसूची' },
  student_declaration: { en: 'Student Declaration', mr: 'विद्यार्थ्याची घोषणा', hi: 'छात्र घोषणा' },
  student_signature: { en: 'Student Digital Signature', mr: 'विद्यार्थ्याची स्वाक्षरी', hi: 'छात्र डिजिटल हस्ताक्षर' },
  parent_guardian: { en: 'Parent / Guardian', mr: 'पालक / संरक्षक', hi: 'अभिभावक / संरक्षक' },
  institute_signature: { en: 'Institute Digital Signature', mr: 'संस्थेची अधिकृत स्वाक्षरी', hi: 'संस्थान डिजिटल हस्ताक्षर' },

  // ---- buttons / misc ----
  reset: { en: 'Reset', mr: 'रीसेट', hi: 'रीसेट' },
  submit: { en: 'Submit', mr: 'सबमिट करा', hi: 'सबमिट करें' },
  fetch_student: { en: 'Fetch Student', mr: 'विद्यार्थी शोधा', hi: 'छात्र खोजें' },
  view_receipts: { en: 'View Past Receipts', mr: 'जुन्या पावत्या पहा', hi: 'पुरानी रसीदें देखें' },
  course_status: { en: 'Course Status', mr: 'कोर्स स्थिती', hi: 'कोर्स स्थिति' }
};

function techoApplyLang(lang) {
  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    const key = el.getAttribute('data-i18n');
    if (TECHO_I18N[key] && TECHO_I18N[key][lang]) {
      el.textContent = TECHO_I18N[key][lang];
    }
  });
  document.querySelectorAll('.lang-toggle-btn').forEach(function (btn) {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });
  localStorage.setItem('techoLang', lang);
}

document.addEventListener('DOMContentLoaded', function () {
  const bar = document.getElementById('langToggleBar');
  if (!bar) return;
  bar.querySelectorAll('.lang-toggle-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { techoApplyLang(btn.getAttribute('data-lang')); });
  });
  techoApplyLang(localStorage.getItem('techoLang') || 'en');
});

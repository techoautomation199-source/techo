/* =========================================================================
   TECHO — SHARED 3-LANGUAGE (English / मराठी / हिंदी) LABEL DICTIONARY
   -------------------------------------------------------------------------
   Used by student-admission.html, fee-receipt.html, installment.html and
   student.html (view mode). Any element with data-i18n="KEY" gets its
   text swapped when the language toggle is used. Elements with
   data-i18n-ph="KEY" get their placeholder swapped instead.
   ========================================================================= */

const TECHO_I18N = {
  // ---- language toggle buttons themselves ----
  lang_en: { en: 'English', mr: 'English', hi: 'English' },
  lang_mr: { en: 'Marathi', mr: 'मराठी', hi: 'मराठी' },
  lang_hi: { en: 'Hindi', mr: 'हिंदी', hi: 'हिंदी' },

  // ---- common ----
  full_name: { en: 'Full Name', mr: 'पूर्ण नाव', hi: 'पूरा नाम' },
  student_full_name: { en: "Student's Full Name", mr: 'विद्यार्थ्याचे पूर्ण नाव', hi: 'छात्र का पूरा नाम' },
  student_name: { en: 'Student Name', mr: 'विद्यार्थ्याचे नाव', hi: 'छात्र का नाम' },
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
  pan_optional: { en: 'PAN Number (if any)', mr: 'PAN क्रमांक (असल्यास)', hi: 'PAN नंबर (यदि हो)' },
  address: { en: 'Address', mr: 'पत्ता', hi: 'पता' },
  course: { en: 'Course', mr: 'कोर्स', hi: 'कोर्स' },
  student_id_lookup: { en: 'Student ID (lookup)', mr: 'विद्यार्थी ID (शोधा)', hi: 'छात्र ID (खोजें)' },
  date: { en: 'Date', mr: 'दिनांक', hi: 'तारीख' },
  name: { en: 'Name', mr: 'नाव', hi: 'नाम' },

  // ---- admission form sections ----
  admission_date: { en: 'Admission Date', mr: 'प्रवेश दिनांक', hi: 'प्रवेश तिथि' },
  course_name: { en: 'Course Name', mr: 'कोर्सचे नाव', hi: 'कोर्स का नाम' },
  training_mode: { en: 'Training Mode', mr: 'प्रशिक्षण प्रकार', hi: 'प्रशिक्षण प्रकार' },
  batch: { en: 'Batch', mr: 'बॅच', hi: 'बैच' },
  personal_info: { en: 'Personal Information', mr: 'वैयक्तिक माहिती', hi: 'व्यक्तिगत जानकारी' },
  permanent_address: { en: 'Permanent Address', mr: 'कायमचा पत्ता', hi: 'स्थायी पता' },
  house_no: { en: 'House No.', mr: 'घर क्रमांक', hi: 'मकान नंबर' },
  village_city: { en: 'Village / City', mr: 'गाव / शहर', hi: 'गाँव / शहर' },
  taluka: { en: 'Taluka', mr: 'तालुका', hi: 'तालुका' },
  district: { en: 'District', mr: 'जिल्हा', hi: 'जिला' },
  state: { en: 'State', mr: 'राज्य', hi: 'राज्य' },
  pincode: { en: 'Pincode', mr: 'पिनकोड', hi: 'पिनकोड' },
  qualification: { en: 'Qualification', mr: 'शैक्षणिक माहिती', hi: 'शैक्षणिक योग्यता' },
  branch: { en: 'Branch', mr: 'शाखा', hi: 'शाखा' },
  college_institute: { en: 'College / Institute', mr: 'कॉलेज / संस्था', hi: 'कॉलेज / संस्थान' },
  passing_year: { en: 'Passing Year', mr: 'उत्तीर्ण वर्ष', hi: 'उत्तीर्ण वर्ष' },
  tenth: { en: '10th', mr: '10 वी', hi: '10वीं' },
  twelfth: { en: '12th', mr: '12 वी', hi: '12वीं' },
  employment: { en: 'Employment', mr: 'नोकरीची माहिती', hi: 'रोजगार जानकारी' },
  role_student: { en: 'Student', mr: 'विद्यार्थी', hi: 'छात्र' },
  role_job: { en: 'Job', mr: 'नोकरी', hi: 'नौकरी' },
  role_business: { en: 'Business', mr: 'व्यवसाय', hi: 'व्यवसाय' },
  company_name: { en: 'Company Name', mr: 'कंपनीचे नाव', hi: 'कंपनी का नाम' },
  designation: { en: 'Designation', mr: 'पद', hi: 'पद' },
  documents: { en: 'Documents', mr: 'ओळखपत्रे', hi: 'दस्तावेज़' },
  aadhaar_card: { en: 'Aadhaar Card', mr: 'आधार कार्ड', hi: 'आधार कार्ड' },
  pan_card: { en: 'PAN Card', mr: 'PAN कार्ड', hi: 'PAN कार्ड' },
  passport_photo: { en: 'Passport Size Photo', mr: 'पासपोर्ट साईज फोटो', hi: 'पासपोर्ट साइज फोटो' },
  educational_certificate: { en: 'Educational Certificate', mr: 'शैक्षणिक प्रमाणपत्र', hi: 'शैक्षणिक प्रमाणपत्र' },
  fee_details: { en: 'Fee Details', mr: 'फीची माहिती', hi: 'फीस विवरण' },
  emergency_contact: { en: 'Emergency Contact', mr: 'आपत्कालीन संपर्क', hi: 'आपातकालीन संपर्क' },
  contact_name: { en: 'Name', mr: 'नाव', hi: 'नाम' },
  relation: { en: 'Relation', mr: 'नाते', hi: 'रिश्ता' },
  total_fee: { en: 'Total Fee', mr: 'एकूण फी', hi: 'कुल फीस' },
  paid_fee: { en: 'Paid Fee', mr: 'भरलेली फी', hi: 'भुगतान की गई फीस' },
  balance_fee: { en: 'Balance Fee', mr: 'शिल्लक फी', hi: 'शेष फीस' },
  payment_method: { en: 'Payment Method', mr: 'पेमेंट पद्धत', hi: 'भुगतान विधि' },
  transaction_id: { en: 'Transaction ID', mr: 'व्यवहार क्रमांक (Transaction ID)', hi: 'लेनदेन आईडी (Transaction ID)' },

  // ---- fee receipt ----
  receipt_no: { en: 'Receipt No.', mr: 'पावती क्रमांक', hi: 'रसीद नंबर' },
  student_info: { en: 'Student Information', mr: 'विद्यार्थ्याची माहिती', hi: 'छात्र की जानकारी' },
  fee_info: { en: 'Fee Information', mr: 'फीची माहिती', hi: 'फीस जानकारी' },
  payment_info: { en: 'Payment Information', mr: 'पेमेंटची माहिती', hi: 'भुगतान जानकारी' },
  remarks: { en: 'Remarks', mr: 'नोंद', hi: 'टिप्पणी' },
  total_course_fee: { en: 'Total Course Fee', mr: 'एकूण कोर्स फी', hi: 'कुल कोर्स फीस' },
  amount_this_receipt: { en: 'Amount as per this Receipt', mr: 'या पावतीनुसार भरलेली रक्कम', hi: 'इस रसीद अनुसार भरी गई राशि' },
  previously_paid: { en: 'Previously Paid Amount', mr: 'यापूर्वी भरलेली रक्कम', hi: 'पहले भरी गई राशि' },
  delete_student: { en: 'Delete Student', mr: 'विद्यार्थी काढून टाका', hi: 'छात्र हटाएं' },
  cash: { en: 'Cash', mr: 'रोख (Cash)', hi: 'नकद (Cash)' },
  upi: { en: 'UPI', mr: 'UPI', hi: 'UPI' },
  bank_transfer: { en: 'Bank Transfer', mr: 'बँक ट्रान्सफर', hi: 'बैंक ट्रांसफर' },
  debit_credit_card: { en: 'Debit/Credit Card', mr: 'डेबिट/क्रेडिट कार्ड', hi: 'डेबिट/क्रेडिट कार्ड' },
  transaction_utr_ref: { en: 'Transaction / UTR / Reference No.', mr: 'व्यवहार / UTR / संदर्भ क्रमांक', hi: 'लेनदेन / UTR / संदर्भ नंबर' },
  important_notes: { en: 'Important Notes', mr: 'महत्त्वाच्या सूचना', hi: 'महत्वपूर्ण सूचनाएं' },
  fee_notes_html: {
    en: '1. Please keep this receipt safely.<br>2. A new receipt will be issued after every payment.<br>3. A payment claim will not be accepted without a receipt.<br>4. All fee-related terms will be governed by the Refund &amp; Cancellation Policy and Terms &amp; Conditions.',
    mr: '1. ही पावती काळजीपूर्वक जतन करावी.<br>2. प्रत्येक पेमेंटनंतर नवीन पावती दिली जाईल.<br>3. पावतीशिवाय पेमेंटचा दावा ग्राह्य धरला जाणार नाही.<br>4. फी संबंधित सर्व अटी Refund &amp; Cancellation Policy आणि Terms &amp; Conditions नुसार लागू राहतील.',
    hi: '1. कृपया यह रसीद सुरक्षित रखें.<br>2. हर भुगतान के बाद नई रसीद दी जाएगी.<br>3. रसीद के बिना भुगतान का दावा मान्य नहीं होगा.<br>4. फीस संबंधी सभी शर्तें Refund &amp; Cancellation Policy और Terms &amp; Conditions के अनुसार लागू रहेंगी.'
  },
  submitting_records_receipt: { en: 'Submitting will record this payment and generate a receipt number.', mr: 'सबमिट केल्यास ही रक्कम नोंदवली जाईल आणि पावती क्रमांक तयार होईल.', hi: 'सबमिट करने पर यह भुगतान दर्ज होगा और रसीद नंबर बनेगा.' },
  receipt_generated_title: { en: 'Fee Receipt Generated!', mr: 'फी पावती तयार झाली!', hi: 'फीस रसीद बन गई!' },
  opening_installment_next: { en: 'Opening Installment Form next...', mr: 'पुढे हप्ता फॉर्म उघडत आहे...', hi: 'अब किस्त फॉर्म खुल रहा है...' },

  // ---- installment ----
  installment_schedule: { en: 'Installment Schedule', mr: 'हप्त्यांचे वेळापत्रक', hi: 'किस्त अनुसूची' },
  student_declaration: { en: 'Student Declaration', mr: 'विद्यार्थ्याची घोषणा', hi: 'छात्र घोषणा' },
  student_signature: { en: 'Student Digital Signature', mr: 'विद्यार्थ्याची स्वाक्षरी', hi: 'छात्र डिजिटल हस्ताक्षर' },
  parent_guardian: { en: 'Parent / Guardian (For students below 18 years)', mr: 'पालक / संरक्षक (18 वर्षांखालील विद्यार्थ्यांसाठी)', hi: 'अभिभावक / संरक्षक (18 वर्ष से कम आयु के छात्रों के लिए)' },
  institute_signature: { en: 'Institute Digital Signature', mr: 'संस्थेची अधिकृत स्वाक्षरी', hi: 'संस्थान डिजिटल हस्ताक्षर' },
  paid_at_admission: { en: 'Fee Paid at Admission', mr: 'प्रवेशावेळी भरलेली फी', hi: 'प्रवेश के समय भरी गई फीस' },
  inst_no: { en: 'Installment', mr: 'हप्ता', hi: 'किस्त' },
  amount_rs: { en: 'Amount (₹)', mr: 'रक्कम (₹)', hi: 'राशि (₹)' },
  due_date: { en: 'Due Date', mr: 'अंतिम दिनांक', hi: 'नियत तारीख' },
  first: { en: 'First', mr: 'पहिला', hi: 'पहली' },
  second: { en: 'Second', mr: 'दुसरा', hi: 'दूसरी' },
  third: { en: 'Third', mr: 'तिसरा', hi: 'तीसरी' },
  fourth: { en: 'Fourth', mr: 'चौथा', hi: 'चौथी' },
  declare_point_1: { en: 'I agree to pay all installments on time as per the schedule above.', mr: 'मी वरील वेळापत्रकानुसार सर्व हप्ते वेळेत भरण्याचे मान्य करतो/करते.', hi: 'मैं ऊपर दी गई अनुसूची के अनुसार सभी किस्तें समय पर भरने के लिए सहमत हूँ.' },
  declare_point_2: { en: 'If any installment is paid late, the institute has the right to temporarily stop training/login/Study Material.', mr: 'कोणताही हप्ता उशिरा भरल्यास संस्थेला प्रशिक्षण/लॉगिन/Study Material तात्पुरते थांबवण्याचा अधिकार राहील.', hi: 'यदि कोई किस्त देर से भरी जाती है, तो संस्थान को प्रशिक्षण/लॉगिन/Study Material अस्थायी रूप से रोकने का अधिकार होगा.' },
  declare_point_3: { en: 'The final Certificate will not be issued until all installments are paid in full.', mr: 'सर्व हप्ते पूर्ण भरल्याशिवाय अंतिम Certificate दिले जाणार नाही.', hi: 'सभी किस्तों का पूरा भुगतान होने तक अंतिम Certificate जारी नहीं किया जाएगा.' },
  declare_point_4: { en: "I am bound to follow the institute's Terms &amp; Conditions and Refund &amp; Cancellation Policy.", mr: 'मी संस्थेच्या Terms &amp; Conditions आणि Refund &amp; Cancellation Policy चे पालन करण्यास बांधील आहे.', hi: 'मैं संस्थान की Terms &amp; Conditions और Refund &amp; Cancellation Policy का पालन करने के लिए बाध्य हूँ.' },
  digital_signature_label: { en: 'Digital Signature — Type Full Name to Sign', mr: 'डिजिटल स्वाक्षरी — स्वाक्षरीसाठी पूर्ण नाव टाइप करा', hi: 'डिजिटल हस्ताक्षर — हस्ताक्षर हेतु पूरा नाम टाइप करें' },
  digital_signature_label_short: { en: 'Digital Signature — Type Name to Sign', mr: 'डिजिटल स्वाक्षरी — स्वाक्षरीसाठी नाव टाइप करा', hi: 'डिजिटल हस्ताक्षर — हस्ताक्षर हेतु नाम टाइप करें' },
  sign_rep: { en: 'Authorized Representative', mr: 'अधिकृत प्रतिनिधी', hi: 'अधिकृत प्रतिनिधि' },
  sign_note_student: { en: 'This typed name is your official digital signature', mr: 'ही टाइप केलेली नाव तुमची अधिकृत डिजिटल स्वाक्षरी आहे', hi: 'यह टाइप किया गया नाम आपका आधिकारिक डिजिटल हस्ताक्षर है' },
  sign_note_institute: { en: 'This typed name acts as the official digital signature &amp; seal', mr: 'ही टाइप केलेली नाव अधिकृत डिजिटल स्वाक्षरी व शिक्का म्हणून वापरली जाईल', hi: 'यह टाइप किया गया नाम आधिकारिक डिजिटल हस्ताक्षर व मुहर के रूप में कार्य करेगा' },
  installment_saved_title: { en: 'Installment Agreement Saved!', mr: 'हप्ता करार जतन झाला!', hi: 'किस्त समझौता सहेजा गया!' },
  enrollment_complete: { en: 'Enrollment complete for this student.', mr: 'या विद्यार्थ्याची नोंदणी पूर्ण झाली.', hi: 'इस छात्र का नामांकन पूर्ण हुआ.' },
  done: { en: 'Done', mr: 'पूर्ण झाले', hi: 'पूर्ण हुआ' },

  // ---- student dashboard ----
  welcome_comma: { en: 'Welcome,', mr: 'स्वागत आहे,', hi: 'स्वागत है,' },
  profile_view_note: { en: 'This is a view-only profile — for any corrections, please contact the institute.', mr: 'हे फक्त पाहण्यासाठीचे प्रोफाईल आहे — कोणत्याही दुरुस्तीसाठी संस्थेशी संपर्क साधा.', hi: 'यह केवल देखने के लिए प्रोफ़ाइल है — किसी भी सुधार के लिए संस्थान से संपर्क करें.' },
  fee_payment_history: { en: 'Fee Payment History', mr: 'फी भरण्याचा इतिहास', hi: 'फीस भुगतान इतिहास' },
  logout: { en: 'Logout', mr: 'लॉगआउट', hi: 'लॉगआउट' },
  no_fee_payments: { en: 'No fee payments recorded yet.', mr: 'अद्याप कोणतीही फी नोंदवलेली नाही.', hi: 'अभी तक कोई फीस भुगतान दर्ज नहीं है.' },
  no_installment_agreement: { en: 'No installment agreement on file.', mr: 'कोणताही हप्ता करार नोंदवलेला नाही.', hi: 'कोई किस्त समझौता दर्ज नहीं है.' },
  receipt_label: { en: 'Receipt', mr: 'पावती', hi: 'रसीद' },

  // ---- buttons / misc ----
  reset: { en: 'Reset', mr: 'रीसेट', hi: 'रीसेट' },
  submit: { en: 'Submit', mr: 'सबमिट करा', hi: 'सबमिट करें' },
  fetch_student: { en: 'Fetch Student', mr: 'विद्यार्थी शोधा', hi: 'छात्र खोजें' },
  view_receipts: { en: 'View Past Receipts', mr: 'जुन्या पावत्या पहा', hi: 'पुरानी रसीदें देखें' },
  course_status: { en: 'Course Status', mr: 'कोर्स स्थिती', hi: 'कोर्स स्थिति' },
  back_to_home: { en: 'Home', mr: 'मुख्यपृष्ठ', hi: 'होम' },
  admission_form_title: { en: 'STUDENT ADMISSION FORM', mr: 'विद्यार्थी प्रवेश फॉर्म', hi: 'छात्र प्रवेश फॉर्म' },
  admission_form_sub: { en: 'Please fill all the details carefully. All fields marked with * are required.', mr: 'कृपया सर्व माहिती काळजीपूर्वक भरा. * चिन्हांकित सर्व माहिती आवश्यक आहे.', hi: 'कृपया सभी जानकारी ध्यानपूर्वक भरें. * चिह्नित सभी फ़ील्ड आवश्यक हैं.' },
  admission_note: { en: 'Submitting this form will generate a Student ID and Password, and email them to the student.', mr: 'हा फॉर्म सबमिट केल्यास विद्यार्थी ID व Password तयार होईल आणि विद्यार्थ्याला ईमेल केला जाईल.', hi: 'यह फॉर्म सबमिट करने पर छात्र ID व Password बनेगा और छात्र को ईमेल किया जाएगा.' },
  admission_submitted_title: { en: 'Admission Form Submitted!', mr: 'प्रवेश फॉर्म सबमिट झाला!', hi: 'प्रवेश फॉर्म सबमिट हुआ!' },
  opening_fee_receipt_next: { en: 'Opening Fee Receipt next...', mr: 'पुढे फी पावती उघडत आहे...', hi: 'अब फीस रसीद खुल रही है...' },
  fee_receipt_title: { en: 'Fee Receipt Entry', mr: 'फी पावती नोंद', hi: 'फीस रसीद प्रविष्टि' },
  fee_receipt_sub: { en: 'Fill all the details to generate fee receipt', mr: 'फी पावती तयार करण्यासाठी सर्व माहिती भरा', hi: 'फीस रसीद बनाने हेतु सारी जानकारी भरें' },
  installment_title: { en: 'Installment Payment Agreement', mr: 'हप्ता भरणा करार', hi: 'किस्त भुगतान समझौता' },
  installment_sub: { en: 'Fill all the details to create installment agreement', mr: 'हप्ता करार तयार करण्यासाठी सर्व माहिती भरा', hi: 'किस्त समझौता बनाने हेतु सारी जानकारी भरें' }
};

function techoApplyLang(lang) {
  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    const key = el.getAttribute('data-i18n');
    if (TECHO_I18N[key] && TECHO_I18N[key][lang]) {
      el.innerHTML = TECHO_I18N[key][lang];
    }
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
    const key = el.getAttribute('data-i18n-ph');
    if (TECHO_I18N[key] && TECHO_I18N[key][lang]) {
      el.setAttribute('placeholder', TECHO_I18N[key][lang]);
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

/* =========================================================================
   TECHO — STUDENT UNDERTAKING & STUDENT DECLARATION FORM
   -------------------------------------------------------------------------
   Shown inside the Student Portal (student.html) below the profile.
   Full legal text in English / मराठी / हिंदी. Student fills a digital
   signature + date once; after that the filled form is shown read-only.
   ========================================================================= */

/* Reuses the same backend URL already set in student.js (ADMIN_SCRIPT_URL_S) —
   no need to paste the URL a second time. */
async function apiAG(action, payload) {
  const body = Object.assign({ action: action }, payload || {});
  const res = await fetch(ADMIN_SCRIPT_URL_S, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body)
  });
  return res.json();
}

const TECHO_AGREEMENT_TEXT = {

  undertaking: {
    heading: { en: 'Trainee Undertaking', mr: 'विद्यार्थी हमीपत्र', hi: 'छात्र वचन पत्र (Undertaking)' },
    intro: {
      en: 'I, %NAME%, residing at %ADDRESS%, have voluntarily taken admission at TECHO Industrial Automation in the %SPECIALIZATION% specialization, and having agreed to the following, give this undertaking:',
      mr: 'मी, %NAME%, राहणार %ADDRESS%, यांनी TECHO Industrial Automation येथे %COURSE% या कोर्समध्ये स्वेच्छेने प्रवेश घेतला असून, खालील बाबी मान्य करून हे हमीपत्र देत आहे.',
      hi: 'मैं, %NAME%, निवासी %ADDRESS%, ने TECHO Industrial Automation में %COURSE% कोर्स में स्वेच्छा से प्रवेश लिया है, और निम्नलिखित बातों को स्वीकार करते हुए यह वचन पत्र देता/देती हूं।'
    },
    listLabel: { en: 'I undertake the following:', mr: 'मी खालील गोष्टींची हमी देतो / देते:', hi: 'मैं निम्नलिखित बातों का वचन देता/देती हूं:' },
    points: {
      en: [
        "All information given in the admission form is true, accurate and complete. If any information is found to be false, the institute has the right to cancel my admission.",
        "I will follow all the institute's rules, Terms & Conditions, Privacy Policy, Refund & Cancellation Policy, Placement Policy, Code of Conduct and other applicable rules.",
        "I will try to attend classes regularly and be punctual.",
        "I will behave respectfully with the institute's trainers, staff and fellow trainees, and will not engage in any misconduct.",
        "I will not copy, share, sell or publish online any Notes, PDF, PLC Programs, SCADA Projects, HMI Projects, Videos, Software or other Study Material given by the institute.",
        "I will not make any Audio, Video or Screen Recording of any Lecture, Practical, Webinar or Training Session without the institute's permission.",
        "I will use PLC Kits, HMI, SCADA System, computers and other equipment carefully during practicals. If any damage is caused by me intentionally, I will be responsible for compensating for it.",
        "My mobile, laptop, bag, wallet, money, documents or other personal belongings will be at my own responsibility. The institute will not be responsible if they are lost, stolen or damaged.",
        "I will arrange the internet, mobile or computer required for online training myself. The institute will not be responsible for my technical difficulties.",
        "I will pay the fee on time. If I choose the option of paying fee in installments, I will follow all the terms in the Installment Agreement.",
        "The institute may provide Placement Assistance; however, I am fully aware that there is no 100% job guarantee.",
        "I will not engage in any illegal, fraudulent activity or any act that damages the institute's reputation.",
        "If the institute's rules are violated, I agree that the institute has the right to take disciplinary action against me, remove me from training, or cancel my admission.",
        "Any dispute arising in future will be resolved as per applicable laws of India and within the jurisdiction of a competent court in the State of Maharashtra."
      ],
      mr: [
        "प्रवेश अर्जामध्ये दिलेली सर्व माहिती खरी, अचूक व पूर्ण आहे. चुकीची माहिती दिल्यास संस्थेला माझा प्रवेश रद्द करण्याचा अधिकार राहील.",
        "मी संस्थेचे सर्व नियम, अटी व शर्ती (Terms & Conditions), Privacy Policy, Refund & Cancellation Policy, Placement Policy, Code of Conduct आणि इतर लागू नियमांचे पालन करेन.",
        "मी वर्गांना नियमित उपस्थित राहण्याचा प्रयत्न करेन व वेळेचे पालन करेन.",
        "मी संस्थेतील प्रशिक्षक, कर्मचारी व इतर विद्यार्थ्यांशी आदरपूर्वक वागेन आणि कोणतेही गैरवर्तन करणार नाही.",
        "मी संस्थेने दिलेले Notes, PDF, PLC Programs, SCADA Projects, HMI Projects, Videos, Software किंवा इतर Study Material कोणालाही कॉपी, शेअर, विक्री किंवा इंटरनेटवर प्रकाशित करणार नाही.",
        "मी संस्थेच्या परवानगीशिवाय कोणत्याही Lecture, Practical, Webinar किंवा Training Session चे Audio, Video किंवा Screen Recording करणार नाही.",
        "Practical दरम्यान PLC Kits, HMI, SCADA System, संगणक व इतर उपकरणे काळजीपूर्वक वापरेन. माझ्याकडून जाणीवपूर्वक नुकसान झाल्यास त्याची भरपाई करण्याची जबाबदारी माझी राहील.",
        "माझे मोबाईल, लॅपटॉप, बॅग, पाकीट, पैसे, कागदपत्रे किंवा इतर वैयक्तिक वस्तू माझ्या स्वतःच्या जबाबदारीवर असतील. त्या हरवल्यास, चोरी झाल्यास किंवा नुकसान झाल्यास संस्था जबाबदार राहणार नाही.",
        "ऑनलाइन प्रशिक्षणासाठी आवश्यक इंटरनेट, मोबाईल किंवा संगणकाची व्यवस्था मी स्वतः करेन. माझ्या तांत्रिक अडचणींसाठी संस्था जबाबदार राहणार नाही.",
        "मी फी वेळेवर भरेन. हप्त्यांमध्ये फी भरण्याचा पर्याय निवडल्यास Installment Agreement मधील सर्व अटींचे पालन करेन.",
        "संस्था Placement Assistance देऊ शकते; मात्र 100% नोकरीची हमी नसल्याची मला पूर्ण माहिती आहे.",
        "मी कोणत्याही प्रकारची बेकायदेशीर, फसवणूक करणारी किंवा संस्थेची प्रतिमा खराब करणारी कृती करणार नाही.",
        "संस्थेच्या नियमांचे उल्लंघन झाल्यास, माझ्यावर शिस्तभंगाची कारवाई, प्रशिक्षणातून वगळणे किंवा प्रवेश रद्द करण्याचा अधिकार संस्थेकडे राहील, यास मी सहमती देतो / देते.",
        "भविष्यात कोणताही वाद निर्माण झाल्यास तो भारतातील लागू कायद्यांनुसार आणि महाराष्ट्र राज्यातील सक्षम न्यायालयाच्या अधिकारक्षेत्रात निकाली काढला जाईल."
      ],
      hi: [
        "प्रवेश फॉर्म में दी गई सभी जानकारी सत्य, सटीक और पूर्ण है। गलत जानकारी पाए जाने पर संस्थान को मेरा प्रवेश रद्द करने का अधिकार होगा।",
        "मैं संस्थान के सभी नियम, Terms & Conditions, Privacy Policy, Refund & Cancellation Policy, Placement Policy, Code of Conduct और अन्य लागू नियमों का पालन करूंगा/करूंगी।",
        "मैं नियमित रूप से कक्षाओं में उपस्थित रहने का प्रयास करूंगा/करूंगी और समय का पालन करूंगा/करूंगी।",
        "मैं संस्थान के प्रशिक्षकों, कर्मचारियों और अन्य छात्रों के साथ सम्मानपूर्वक व्यवहार करूंगा/करूंगी और कोई भी गैरव्यवहार नहीं करूंगा/करूंगी।",
        "मैं संस्थान द्वारा दी गई Notes, PDF, PLC Programs, SCADA Projects, HMI Projects, Videos, Software या अन्य Study Material को किसी के साथ कॉपी, शेयर, बेच या इंटरनेट पर प्रकाशित नहीं करूंगा/करूंगी।",
        "मैं संस्थान की अनुमति के बिना किसी भी Lecture, Practical, Webinar या Training Session की Audio, Video या Screen Recording नहीं करूंगा/करूंगी।",
        "मैं Practical के दौरान PLC Kits, HMI, SCADA System, कंप्यूटर और अन्य उपकरणों का सावधानीपूर्वक उपयोग करूंगा/करूंगी। यदि मेरी जानबूझकर लापरवाही से कोई नुकसान होता है, तो उसकी भरपाई करने की जिम्मेदारी मेरी होगी।",
        "मेरा मोबाइल, लैपटॉप, बैग, पर्स, पैसे, दस्तावेज़ या अन्य व्यक्तिगत सामान मेरी अपनी जिम्मेदारी पर होंगे। उनके खोने, चोरी होने या नुकसान होने पर संस्थान जिम्मेदार नहीं होगा।",
        "ऑनलाइन प्रशिक्षण के लिए आवश्यक इंटरनेट, मोबाइल या कंप्यूटर की व्यवस्था मैं स्वयं करूंगा/करूंगी। मेरी तकनीकी समस्याओं के लिए संस्थान जिम्मेदार नहीं होगा।",
        "मैं समय पर फीस भरूंगा/भरूंगी। यदि मैं किस्तों में फीस भरने का विकल्प चुनता/चुनती हूं, तो मैं Installment Agreement की सभी शर्तों का पालन करूंगा/करूंगी।",
        "संस्थान Placement Assistance दे सकता है; हालांकि मुझे पूरी जानकारी है कि 100% नौकरी की गारंटी नहीं है।",
        "मैं किसी भी प्रकार की अवैध, धोखाधड़ी वाली या संस्थान की छवि खराब करने वाली गतिविधि नहीं करूंगा/करूंगी।",
        "संस्थान के नियमों का उल्लंघन होने पर, मैं सहमत हूं कि संस्थान को मेरे खिलाफ अनुशासनात्मक कार्रवाई करने, प्रशिक्षण से हटाने या प्रवेश रद्द करने का अधिकार होगा।",
        "भविष्य में कोई भी विवाद उत्पन्न होने पर, उसे भारत के लागू कानूनों के अनुसार और महाराष्ट्र राज्य के सक्षम न्यायालय के अधिकार क्षेत्र में निपटाया जाएगा।"
      ]
    },
    final: {
      en: 'I have read this undertaking completely and understood all the terms in it. I am giving this undertaking voluntarily, without any pressure, and with full responsibility.',
      mr: 'मी हे हमीपत्र पूर्णपणे वाचले असून त्यातील सर्व अटी मला समजल्या आहेत. मी कोणत्याही दबावाशिवाय, स्वेच्छेने आणि पूर्ण जबाबदारीने हे हमीपत्र देत आहे.',
      hi: 'मैंने यह वचन पत्र पूरी तरह से पढ़ा है और इसकी सभी शर्तों को समझ लिया है। मैं बिना किसी दबाव के, स्वेच्छा से और पूरी जिम्मेदारी के साथ यह वचन पत्र दे रहा/रही हूं।'
    }
  },

  declaration: {
    heading: { en: 'Trainee Declaration Form', mr: 'विद्यार्थी घोषणा पत्र', hi: 'छात्र घोषणा पत्र (Declaration)' },
    intro: {
      en: 'I, %NAME%, am voluntarily taking admission at TECHO Industrial Automation in the %SPECIALIZATION% specialization. I have read all the following terms and declarations completely, understood them, and I accept them.',
      mr: 'मी, %NAME%, TECHO Industrial Automation येथे %COURSE% या कोर्समध्ये स्वेच्छेने प्रवेश घेत आहे. मी खालील सर्व अटी व घोषणा पूर्णपणे वाचल्या असून त्या मला समजल्या आहेत व मी त्या मान्य करतो/करते.',
      hi: 'मैं, %NAME%, TECHO Industrial Automation में %COURSE% कोर्स में स्वेच्छा से प्रवेश ले रहा/रही हूं। मैंने निम्नलिखित सभी शर्तें और घोषणाएं पूरी तरह से पढ़ ली हैं, समझ ली हैं और उन्हें स्वीकार करता/करती हूं।'
    },
    listLabel: { en: 'Declarations:', mr: 'घोषणा', hi: 'घोषणाएं' },
    points: {
      en: [
        "All information given by me in the admission form is true and accurate. If false information is given, the institute has the right to cancel my admission.",
        "I will follow all the institute's rules, terms and conditions, discipline and instructions.",
        "I will try to attend classes regularly, and the institute will not be responsible for any academic loss caused by my absence.",
        "I will arrange the internet, mobile, laptop or computer required for online classes myself.",
        "I will use PLC Kits, HMI, SCADA System, computers and other equipment carefully during practicals. I am ready to compensate for any damage caused by me intentionally.",
        "I will not copy, share, sell or upload online any Notes, PDF, Videos, PLC Programs, SCADA Projects, HMI Projects, Software or other Study Material given by the institute.",
        "I will not make any Audio, Video or Screen Recording of any class, Practical or Training Session without the institute's permission.",
        "My mobile, laptop, bag, wallet, money, documents or other personal belongings will be at my own responsibility. The institute will not be responsible if they are lost, stolen or damaged.",
        "The institute will not be responsible for any injury, accident or other damage caused during practicals due to my own negligence.",
        "It will be my responsibility to regularly check notices given by the institute on the official WhatsApp Group, SMS, Email or Website.",
        "The institute may provide guidance and assistance for placement; however, I am fully aware that there is no 100% job guarantee.",
        "The institute has the right to make changes to the batch, timing, trainer, curriculum or other rules as needed, and I agree to this.",
        "I have read all the institute's Terms & Conditions, Privacy Policy, Refund & Cancellation Policy and other applicable rules, and I accept them.",
        "Any dispute arising in future will be resolved as per applicable laws of India and within the jurisdiction of a competent court in the State of Maharashtra."
      ],
      mr: [
        "मी प्रवेश फॉर्ममध्ये दिलेली सर्व माहिती खरी व अचूक आहे. चुकीची माहिती दिल्यास माझा प्रवेश रद्द करण्याचा अधिकार संस्थेकडे राहील.",
        "मी संस्थेचे सर्व नियम, अटी व शर्ती, शिस्त व सूचनांचे पालन करेन.",
        "मी नियमितपणे वर्गांना उपस्थित राहण्याचा प्रयत्न करेन व माझ्या अनुपस्थितीमुळे झालेल्या शैक्षणिक नुकसानीसाठी संस्था जबाबदार राहणार नाही.",
        "ऑनलाइन वर्गांसाठी आवश्यक इंटरनेट, मोबाईल, लॅपटॉप किंवा संगणकाची व्यवस्था मी स्वतः करेन.",
        "प्रात्यक्षिक (Practical) दरम्यान PLC Kits, HMI, SCADA System, संगणक व इतर उपकरणे काळजीपूर्वक वापरेन. माझ्याकडून जाणीवपूर्वक नुकसान झाल्यास त्याची भरपाई करण्यास मी तयार आहे.",
        "संस्थेने दिलेले Notes, PDF, Videos, PLC Programs, SCADA Projects, HMI Projects, Software किंवा इतर Study Material कोणालाही कॉपी, शेअर, विक्री किंवा इंटरनेटवर अपलोड करणार नाही.",
        "संस्थेच्या परवानगीशिवाय कोणत्याही वर्गाचे, Practical चे किंवा Training Session चे Audio, Video किंवा Screen Recording करणार नाही.",
        "माझे मोबाईल, लॅपटॉप, बॅग, पाकीट, पैसे, कागदपत्रे किंवा इतर वैयक्तिक वस्तू माझ्या स्वतःच्या जबाबदारीवर असतील. त्या हरवल्यास, चोरी झाल्यास किंवा नुकसान झाल्यास संस्था जबाबदार राहणार नाही.",
        "Practical दरम्यान माझ्या निष्काळजीपणामुळे झालेल्या दुखापत, अपघात किंवा इतर कोणत्याही नुकसानीसाठी संस्था जबाबदार राहणार नाही.",
        "संस्थेने दिलेल्या अधिकृत WhatsApp Group, SMS, Email किंवा Website वरील सूचना मी नियमितपणे पाहण्याची जबाबदारी माझी असेल.",
        "संस्था प्लेसमेंटसाठी मार्गदर्शन व सहाय्य करू शकते; मात्र नोकरीची १००% हमी नसल्याची मला पूर्ण माहिती आहे.",
        "संस्थेला आवश्यकतेनुसार बॅच, वेळ, प्रशिक्षक, अभ्यासक्रम किंवा इतर नियमांमध्ये बदल करण्याचा अधिकार आहे, यास मी सहमती देतो/देते.",
        "मी संस्थेच्या सर्व Terms & Conditions, Privacy Policy, Refund & Cancellation Policy आणि इतर लागू नियम वाचले असून ते मला मान्य आहेत.",
        "भविष्यात कोणताही वाद निर्माण झाल्यास तो भारतातील लागू कायद्यांनुसार आणि महाराष्ट्र राज्यातील सक्षम न्यायालयाच्या अधिकारक्षेत्रात निकाली काढला जाईल."
      ],
      hi: [
        "प्रवेश फॉर्म में मेरे द्वारा दी गई सभी जानकारी सत्य और सटीक है। गलत जानकारी दिए जाने पर मेरा प्रवेश रद्द करने का अधिकार संस्थान के पास होगा।",
        "मैं संस्थान के सभी नियमों, नियम व शर्तों, अनुशासन और निर्देशों का पालन करूंगा/करूंगी।",
        "मैं नियमित रूप से कक्षाओं में उपस्थित रहने का प्रयास करूंगा/करूंगी, और मेरी अनुपस्थिति के कारण होने वाली किसी भी शैक्षणिक क्षति के लिए संस्थान जिम्मेदार नहीं होगा।",
        "ऑनलाइन कक्षाओं के लिए आवश्यक इंटरनेट, मोबाइल, लैपटॉप या कंप्यूटर की व्यवस्था मैं स्वयं करूंगा/करूंगी।",
        "मैं Practical के दौरान PLC Kits, HMI, SCADA System, कंप्यूटर और अन्य उपकरणों का सावधानीपूर्वक उपयोग करूंगा/करूंगी। मेरी जानबूझकर लापरवाही से हुए किसी भी नुकसान की भरपाई करने के लिए मैं तैयार हूं।",
        "मैं संस्थान द्वारा दी गई Notes, PDF, Videos, PLC Programs, SCADA Projects, HMI Projects, Software या अन्य Study Material को किसी के साथ कॉपी, शेयर, बेच या इंटरनेट पर अपलोड नहीं करूंगा/करूंगी।",
        "मैं संस्थान की अनुमति के बिना किसी भी कक्षा, Practical या Training Session की Audio, Video या Screen Recording नहीं करूंगा/करूंगी।",
        "मेरा मोबाइल, लैपटॉप, बैग, पर्स, पैसे, दस्तावेज़ या अन्य व्यक्तिगत सामान मेरी अपनी जिम्मेदारी पर होंगे। उनके खोने, चोरी होने या नुकसान होने पर संस्थान जिम्मेदार नहीं होगा।",
        "Practical के दौरान मेरी स्वयं की लापरवाही के कारण होने वाली किसी भी चोट, दुर्घटना या अन्य नुकसान के लिए संस्थान जिम्मेदार नहीं होगा।",
        "संस्थान द्वारा दिए गए आधिकारिक WhatsApp Group, SMS, Email या Website पर सूचनाओं को नियमित रूप से देखने की जिम्मेदारी मेरी होगी।",
        "संस्थान प्लेसमेंट के लिए मार्गदर्शन और सहायता प्रदान कर सकता है; हालांकि मुझे पूरी जानकारी है कि 100% नौकरी की गारंटी नहीं है।",
        "संस्थान को आवश्यकतानुसार बैच, समय, प्रशिक्षक, पाठ्यक्रम या अन्य नियमों में बदलाव करने का अधिकार है, और मैं इससे सहमत हूं।",
        "मैंने संस्थान की सभी Terms & Conditions, Privacy Policy, Refund & Cancellation Policy और अन्य लागू नियमों को पढ़ लिया है और वे मुझे स्वीकार्य हैं।",
        "भविष्य में कोई भी विवाद उत्पन्न होने पर, उसे भारत के लागू कानूनों के अनुसार और महाराष्ट्र राज्य के सक्षम न्यायालय के अधिकार क्षेत्र में निपटाया जाएगा।"
      ]
    },
    final: {
      en: 'I have carefully read all the above information and understood it completely. I am voluntarily accepting this declaration without any pressure or compulsion, and I agree to follow all the institute\'s rules.',
      mr: 'मी वरील सर्व माहिती काळजीपूर्वक वाचली असून ती मला पूर्णपणे समजली आहे. मी कोणत्याही दबावाशिवाय किंवा सक्तीशिवाय ही घोषणा स्वेच्छेने स्वीकारत आहे आणि संस्थेच्या सर्व नियमांचे पालन करण्यास सहमत आहे.',
      hi: 'मैंने ऊपर दी गई सभी जानकारी ध्यानपूर्वक पढ़ी है और उसे पूरी तरह समझ लिया है। मैं बिना किसी दबाव या मजबूरी के स्वेच्छा से इस घोषणा को स्वीकार कर रहा/रही हूं और संस्थान के सभी नियमों का पालन करने के लिए सहमत हूं।'
    }
  }
};

const TECHO_AGREEMENT_LABELS = {
  fill_title: { en: 'Please fill and submit', mr: 'कृपया फॉर्म भरून सबमिट करा', hi: 'कृपया फॉर्म भरकर सबमिट करें' },
  submitted_title: { en: 'Submitted', mr: 'सबमिट झाले', hi: 'सबमिट हो गया' },
  submitted_on: { en: 'Submitted on', mr: 'सबमिट केल्याची तारीख', hi: 'सबमिट करने की तारीख' },
  place_label: { en: 'Place', mr: 'ठिकाण', hi: 'स्थान' },
  student_signature_short: { en: 'Digital Signature — Type Full Name to Sign', mr: 'डिजिटल स्वाक्षरी — स्वाक्षरीसाठी पूर्ण नाव टाइप करा', hi: 'डिजिटल हस्ताक्षर — हस्ताक्षर हेतु पूरा नाम टाइप करें' },
  parent_optional: { en: 'Parent / Guardian (if trainee is below 18 years)', mr: 'पालक / संरक्षक (18 वर्षांखालील विद्यार्थ्यांसाठी)', hi: 'अभिभावक (यदि छात्र 18 वर्ष से कम आयु का है)' },
  submit_form: { en: 'Submit', mr: 'सबमिट करा', hi: 'सबमिट करें' },
  address_label: { en: 'Your Address', mr: 'तुमचा पत्ता', hi: 'आपका पता' }
};

let techoAgLang = localStorage.getItem('techoLang') || 'en';
let techoAgStudent = null; // { StudentID, FullName, Course }

function agT(dict, key) {
  return (dict[key] && dict[key][techoAgLang]) || (dict[key] && dict[key].en) || '';
}

function renderAgreementPoints(type) {
  const t = TECHO_AGREEMENT_TEXT[type];
  const pts = t.points[techoAgLang] || t.points.en;
  return '<ol class="ag-points">' + pts.map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ol>';
}

function agIntro(type, name, extra) {
  const t = TECHO_AGREEMENT_TEXT[type];
  let str = (t.intro[techoAgLang] || t.intro.en);
  str = str.replace('%NAME%', '<strong>' + (name || '_____________') + '</strong>');
  str = str.replace('%COURSE%', '<strong>' + (techoAgStudent ? techoAgStudent.Course : '_____________') + '</strong>');
  str = str.replace('%ADDRESS%', '<strong>' + (extra || '_____________') + '</strong>');
  return str;
}

/* -------- View mode (already submitted) -------- */
function renderAgreementView(type, form) {
  const t = TECHO_AGREEMENT_TEXT[type];
  let html = '<div class="ag-doc">';
  html += '<h4>' + (t.heading[techoAgLang] || t.heading.en) + '</h4>';
  html += '<p class="ag-intro">' + agIntro(type, form.FullName, form.Address || form.Place) + '</p>';
  html += '<p class="ag-list-label">' + (t.listLabel[techoAgLang] || t.listLabel.en) + '</p>';
  html += renderAgreementPoints(type);
  html += '<p class="ag-final">' + (t.final[techoAgLang] || t.final.en) + '</p>';
  html += '<div class="ag-sign-row">';
  html += '<div><span class="ag-k" data-i18n="student_signature">Trainee Digital Signature</span><span class="ag-v">' + (form.Signature || '') + '</span></div>';
  if (form.ParentName) {
    html += '<div><span class="ag-k">' + agT(TECHO_AGREEMENT_LABELS, 'parent_optional') + '</span><span class="ag-v">' + form.ParentName + (form.ParentSignature ? ' — ' + form.ParentSignature : '') + '</span></div>';
  }
  html += '<div><span class="ag-k">' + agT(TECHO_AGREEMENT_LABELS, 'submitted_on') + '</span><span class="ag-v">' + (form.Date || '') + '</span></div>';
  html += '</div>';
  html += '<p class="ag-status"><i class="fa-solid fa-circle-check"></i> ' + agT(TECHO_AGREEMENT_LABELS, 'submitted_title') + '</p>';
  html += '</div>';
  return html;
}

/* -------- Fill mode (not yet submitted) -------- */
function renderAgreementForm(type) {
  const t = TECHO_AGREEMENT_TEXT[type];
  const name = techoAgStudent ? techoAgStudent.FullName : '';
  const needsAddress = (type === 'undertaking');
  let html = '<div class="ag-doc">';
  html += '<h4>' + (t.heading[techoAgLang] || t.heading.en) + '</h4>';
  html += '<p class="ag-intro">' + agIntro(type, name, '') + '</p>';
  html += '<p class="ag-list-label">' + (t.listLabel[techoAgLang] || t.listLabel.en) + '</p>';
  html += renderAgreementPoints(type);
  html += '<p class="ag-final">' + (t.final[techoAgLang] || t.final.en) + '</p>';

  html += '<div class="ag-fill-row">';
  if (needsAddress) {
    html += '<label>' + agT(TECHO_AGREEMENT_LABELS, 'address_label') + ' *<input type="text" id="ag_' + type + '_address" required></label>';
  } else {
    html += '<label>' + agT(TECHO_AGREEMENT_LABELS, 'place_label') + ' *<input type="text" id="ag_' + type + '_place" required></label>';
  }
  html += '<label>' + agT(TECHO_AGREEMENT_LABELS, 'student_signature_short') + ' *<input type="text" id="ag_' + type + '_sign" required></label>';
  html += '</div>';

  html += '<p class="ag-parent-title">' + agT(TECHO_AGREEMENT_LABELS, 'parent_optional') + '</p>';
  html += '<div class="ag-fill-row">';
  html += '<label>Parent / Guardian Name<input type="text" id="ag_' + type + '_parentname"></label>';
  html += '<label>Parent / Guardian Signature<input type="text" id="ag_' + type + '_parentsign"></label>';
  html += '</div>';

  html += '<button type="button" class="admin-submit" id="ag_' + type + '_submit">' + agT(TECHO_AGREEMENT_LABELS, 'submit_form') + '</button>';
  html += '<p class="form-error" id="ag_' + type + '_err"></p>';
  html += '</div>';
  return html;
}

async function loadAgreementBlock(type, wrapId) {
  const wrap = document.getElementById(wrapId);
  if (!wrap || !techoAgStudent) return;
  const result = await apiAG('getAgreementForm', { studentId: techoAgStudent.StudentID, formType: type });
  if (result.form) {
    wrap.innerHTML = renderAgreementView(type, result.form);
  } else {
    wrap.innerHTML = renderAgreementForm(type);
    const btn = document.getElementById('ag_' + type + '_submit');
    if (btn) {
      btn.addEventListener('click', async function () {
        const errEl = document.getElementById('ag_' + type + '_err');
        errEl.textContent = '';
        const sign = document.getElementById('ag_' + type + '_sign').value.trim();
        if (!sign) { errEl.textContent = 'Please type your name to sign.'; return; }
        const addressEl = document.getElementById('ag_' + type + '_address');
        const placeEl = document.getElementById('ag_' + type + '_place');
        const payload = {
          studentId: techoAgStudent.StudentID,
          formType: type,
          fullName: techoAgStudent.FullName,
          course: techoAgStudent.Course,
          address: addressEl ? addressEl.value.trim() : '',
          place: placeEl ? placeEl.value.trim() : '',
          signature: sign,
          parentName: document.getElementById('ag_' + type + '_parentname').value.trim(),
          parentSignature: document.getElementById('ag_' + type + '_parentsign').value.trim()
        };
        const res = await apiAG('saveAgreementForm', payload);
        if (res.error) { errEl.textContent = res.error; return; }
        loadAgreementBlock(type, wrapId);
      });
    }
  }
}

function techoRenderAgreements(student) {
  techoAgStudent = student;
  loadAgreementBlock('undertaking', 'sUndertakingWrap');
  loadAgreementBlock('declaration', 'sDeclarationWrap');
}

document.addEventListener('DOMContentLoaded', function () {
  const bar = document.getElementById('langToggleBar');
  if (!bar) return;
  bar.querySelectorAll('.lang-toggle-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      techoAgLang = btn.getAttribute('data-lang');
      if (techoAgStudent) {
        loadAgreementBlock('undertaking', 'sUndertakingWrap');
        loadAgreementBlock('declaration', 'sDeclarationWrap');
      }
    });
  });
});

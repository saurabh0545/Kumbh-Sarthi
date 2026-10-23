import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'EN' | 'HI' | 'MR';

export interface Translations {
  common: {
    online: string;
    offline: string;
    live: string;
    save: string;
    saved: string;
    cancel: string;
    close: string;
    actions: string;
    view: string;
    resolve: string;
    status: string;
    loading: string;
    search: string;
    refresh: string;
    all: string;
  };
  nav: {
    dashboard: string;
    liveMap: string;
    crowdMonitoring: string;
    cameraMonitoring: string;
    faceDetection: string;
    alerts: string;
    emergency: string;
    familySos: string;
    lostFound: string;
    analytics: string;
    settings: string;
    logout: string;
    controlRoom: string;
    commandCenter: string;
  };
  header: {
    safetyDashboard: string;
    kumbhSubtitle: string;
    liveSync: string;
    activeAlerts: string;
    officer: string;
    selectLanguage: string;
  };
  lostFound: {
    title: string;
    subtitle: string;
    fileNewReport: string;
    tabMissing: string;
    tabFound: string;
    tabMatched: string;
    tabResolved: string;
    colPhoto: string;
    colId: string;
    colName: string;
    colDesc: string;
    colLocation: string;
    colReported: string;
    colStatus: string;
    colTeam: string;
    colActions: string;
    btnView: string;
    btnResolve: string;
    btnResolvedSuccess: string;
    modalNewTitle: string;
    modalNewSubtitle: string;
    labelCategory: string;
    labelName: string;
    labelPhoto: string;
    labelPhotoHint: string;
    labelPhotoChoose: string;
    labelPhotoRemove: string;
    labelOrSample: string;
    sampleElderlyMale: string;
    sampleElderlyFemale: string;
    sampleChild: string;
    sampleAdultMale: string;
    labelDesc: string;
    labelDescPlaceholder: string;
    labelLocation: string;
    labelContact: string;
    btnCancel: string;
    btnSubmit: string;
    modalDetailTitle: string;
    badgeSearching: string;
    badgeMatched: string;
    badgeResolved: string;
    photoPreviewTitle: string;
    noPhotoProvided: string;
    reunitedSuccess: string;
    viewFullPhoto: string;
  };
  settings: {
    title: string;
    subtitle: string;
    btnSave: string;
    btnSaved: string;
    crowdThresholdTitle: string;
    crowdThresholdSub: string;
    telemetryFreq: string;
    mapControlsTitle: string;
    mapControlsSub: string;
    languageTitle: string;
    languageSub: string;
    apiTitle: string;
    apiSub: string;
  };
}

const TRANSLATIONS: Record<LanguageCode, Translations> = {
  EN: {
    common: {
      online: 'Online',
      offline: 'Offline',
      live: 'LIVE',
      save: 'Save Changes',
      saved: 'Saved Successfully',
      cancel: 'Cancel',
      close: 'Close',
      actions: 'Actions',
      view: 'View',
      resolve: 'Resolve',
      status: 'Status',
      loading: 'Loading...',
      search: 'Search',
      refresh: 'Refresh',
      all: 'All',
    },
    nav: {
      dashboard: 'Dashboard',
      liveMap: 'Live Map',
      crowdMonitoring: 'Crowd Monitoring',
      cameraMonitoring: 'Camera Feeds',
      faceDetection: 'Face AI Detection',
      alerts: 'Alert Center',
      emergency: 'Emergency Ops',
      familySos: 'Family SOS',
      lostFound: 'Lost & Found',
      analytics: 'Analytics',
      settings: 'Settings',
      logout: 'Sign Out',
      controlRoom: 'Control Center',
      commandCenter: 'Authority Operations',
    },
    header: {
      safetyDashboard: 'Safety Dashboard',
      kumbhSubtitle: 'Nashik Kumbh Mela • Live Operations',
      liveSync: 'Sync',
      activeAlerts: 'Active Alerts',
      officer: 'Authority Officer',
      selectLanguage: 'Language',
    },
    lostFound: {
      title: 'Lost & Found / Missing Person Assistance',
      subtitle: 'Integrated tracing portal matching separated pilgrims and lost belongings across sectors.',
      fileNewReport: 'File New Report',
      tabMissing: 'Missing Reports',
      tabFound: 'Found Persons & Items',
      tabMatched: 'Matched Reports',
      tabResolved: 'Resolved Archive',
      colPhoto: 'Photo',
      colId: 'Report ID',
      colName: 'Name / Subject',
      colDesc: 'Physical Description',
      colLocation: 'Last Known Location',
      colReported: 'Reported',
      colStatus: 'Status',
      colTeam: 'Assigned Team',
      colActions: 'Actions',
      btnView: 'View',
      btnResolve: 'Resolve',
      btnResolvedSuccess: 'Reunited & Resolved',
      modalNewTitle: 'File Tracing & Missing Person Report',
      modalNewSubtitle: 'Log an official inquiry into the central Kumbh safety database with photo identification.',
      labelCategory: 'Report Category',
      labelName: 'Name of Person / Item Title',
      labelPhoto: 'Photograph of Lost Person',
      labelPhotoHint: 'Upload photo from device (JPG/PNG) or pick a sample photo below',
      labelPhotoChoose: 'Choose Photo from Device',
      labelPhotoRemove: 'Remove Photo',
      labelOrSample: 'Or select a quick sample photo for demo:',
      sampleElderlyMale: 'Elderly Pilgrim (Male)',
      sampleElderlyFemale: 'Elderly Pilgrim (Female)',
      sampleChild: 'Child / Toddler',
      sampleAdultMale: 'Adult Pilgrim',
      labelDesc: 'Physical Identification & Clothing Details',
      labelDescPlaceholder: 'Provide clothing, height, language spoken, distinguishing marks, accessories...',
      labelLocation: 'Last Known Sector / Location',
      labelContact: 'Contact Phone / Parent / Relative',
      btnCancel: 'Cancel',
      btnSubmit: 'Register Report',
      modalDetailTitle: 'Tracing Record & Photo Details',
      badgeSearching: 'SEARCHING',
      badgeMatched: 'MATCHED',
      badgeResolved: 'RESOLVED',
      photoPreviewTitle: 'Official Tracing Photograph',
      noPhotoProvided: 'No photograph attached with this report',
      reunitedSuccess: 'Mark as Reunited & Resolved',
      viewFullPhoto: 'Click to Enlarge Photo',
    },
    settings: {
      title: 'System Settings',
      subtitle: 'Configure operational thresholds, AI detection parameters, and telemetry connections.',
      btnSave: 'Save System Settings',
      btnSaved: 'Settings Saved',
      crowdThresholdTitle: 'Crowd Monitoring & Alert Thresholds',
      crowdThresholdSub: 'Automatic alert generation limits and density triggers',
      telemetryFreq: 'Telemetry Polling Frequency',
      mapControlsTitle: 'Map Layers & Visual Controls',
      mapControlsSub: 'OpenStreetMap geospatial layers and auto-tracking',
      languageTitle: 'Language & Interface Localization',
      languageSub: 'Operational command language for notifications and dispatch alerts',
      apiTitle: 'Backend API Configuration & System Status',
      apiSub: 'Configured FastAPI upstream and database endpoints',
    },
  },
  HI: {
    common: {
      online: 'ऑनलाइन',
      offline: 'ऑफ़लाइन',
      live: 'लाइव',
      save: 'परिवर्तन सहेजें',
      saved: 'सफलतापूर्वक सहेजा गया',
      cancel: 'रद्द करें',
      close: 'बंद करें',
      actions: 'कार्रवाई',
      view: 'देखें',
      resolve: 'हल करें',
      status: 'स्थिति',
      loading: 'लोड हो रहा है...',
      search: 'खोजें',
      refresh: 'ताज़ा करें',
      all: 'सभी',
    },
    nav: {
      dashboard: 'डैशबोर्ड',
      liveMap: 'लाइव मानचित्र',
      crowdMonitoring: 'भीड़ निगरानी',
      cameraMonitoring: 'कैमरा फ़ीड',
      faceDetection: 'चेहरा पहचान AI',
      alerts: 'अलर्ट केंद्र',
      emergency: 'आपातकालीन सहायता',
      familySos: 'परिवार एसओएस',
      lostFound: 'खोया-पाया / लापता',
      analytics: 'विश्लेषण',
      settings: 'सेटिंग्स',
      logout: 'लॉग आउट',
      controlRoom: 'नियंत्रण कक्ष',
      commandCenter: 'प्राधिकरण संचालन',
    },
    header: {
      safetyDashboard: 'सुरक्षा डैशबोर्ड',
      kumbhSubtitle: 'नासिक कुंभ मेला • लाइव संचालन',
      liveSync: 'सिंक',
      activeAlerts: 'सक्रिय अलर्ट',
      officer: 'प्राधिकरण अधिकारी',
      selectLanguage: 'भाषा चुनें',
    },
    lostFound: {
      title: 'खोया-पाया / लापता व्यक्ति सहायता पोर्टल',
      subtitle: 'सभी सेक्टरों में बिछड़े तीर्थयात्रियों और खोए सामान की खोज और मिलान प्रणाली।',
      fileNewReport: 'नई रिपोर्ट दर्ज करें',
      tabMissing: 'लापता रिपोर्ट',
      tabFound: 'मिले व्यक्ति व वस्तुएं',
      tabMatched: 'मिलान हुई रिपोर्ट',
      tabResolved: 'समाधान पुरालेख',
      colPhoto: 'फोटो',
      colId: 'रिपोर्ट आईडी',
      colName: 'नाम / विषय',
      colDesc: 'शारीरिक पहचान व विवरण',
      colLocation: 'अंतिम ज्ञात स्थान',
      colReported: 'दर्ज समय',
      colStatus: 'स्थिति',
      colTeam: 'नियुक्त टीम',
      colActions: 'कार्रवाई',
      btnView: 'देखें',
      btnResolve: 'समाधान करें',
      btnResolvedSuccess: 'पुनर्मिलन व समाधान पूर्ण',
      modalNewTitle: 'लापता व्यक्ति / खोज रिपोर्ट दर्ज करें',
      modalNewSubtitle: 'तस्वीर पहचान के साथ केंद्रीय कुंभ सुरक्षा डेटाबेस में आधिकारिक रिपोर्ट दर्ज करें।',
      labelCategory: 'रिपोर्ट श्रेणी',
      labelName: 'व्यक्ति का नाम / सामान का शीर्षक',
      labelPhoto: 'लापता व्यक्ति का फोटो',
      labelPhotoHint: 'डिवाइस से फोटो चुनें (JPG/PNG) या नीचे दिए गए सैंपल फोटो में से चुनें',
      labelPhotoChoose: 'डिवाइस से फोटो अपलोड करें',
      labelPhotoRemove: 'फोटो हटाएं',
      labelOrSample: 'या डेमो के लिए तुरंत सैंपल फोटो चुनें:',
      sampleElderlyMale: 'वृद्ध तीर्थयात्री (पुरुष)',
      sampleElderlyFemale: 'वृद्ध तीर्थयात्री (महिला)',
      sampleChild: 'बालक / बच्चा',
      sampleAdultMale: 'वयस्क तीर्थयात्री',
      labelDesc: 'शारीरिक पहचान व कपड़ों का विवरण',
      labelDescPlaceholder: 'पहने हुए कपड़े, कद, बोली जाने वाली भाषा, विशिष्ट पहचान चिह्न...',
      labelLocation: 'अंतिम ज्ञात सेक्टर / स्थान',
      labelContact: 'संपर्क फोन / परिजन / रिश्तेदार',
      btnCancel: 'रद्द करें',
      btnSubmit: 'रिपोर्ट दर्ज करें',
      modalDetailTitle: 'लापता व्यक्ति रिकॉर्ड व फोटो विवरण',
      badgeSearching: 'खोज जारी',
      badgeMatched: 'मिलान हुआ',
      badgeResolved: 'समाधान हुआ',
      photoPreviewTitle: 'आधिकारिक खोज फोटोग्राफ',
      noPhotoProvided: 'इस रिपोर्ट के साथ कोई फोटो संलग्न नहीं है',
      reunitedSuccess: 'पुनर्मिलन चिह्नित करें व हल करें',
      viewFullPhoto: 'बड़ा फोटो देखने के लिए क्लिक करें',
    },
    settings: {
      title: 'सिस्टम सेटिंग्स',
      subtitle: 'संचालन सीमाएं, एआई पहचान पैरामीटर और टेलीमेट्री कनेक्शन कॉन्फ़िगर करें।',
      btnSave: 'सेटिंग्स सहेजें',
      btnSaved: 'सहेजा गया',
      crowdThresholdTitle: 'भीड़ निगरानी और चेतावनी सीमा',
      crowdThresholdSub: 'स्वचालित अलर्ट उत्पत्ति सीमा और घनत्व ट्रिगर',
      telemetryFreq: 'टेलीमेट्री पोलिंग आवृत्ति',
      mapControlsTitle: 'मानचित्र परतें और दृश्य नियंत्रण',
      mapControlsSub: 'ओपनस्ट्रीटमैप भू-स्थानिक परतें और ऑटो-ट्रैकिंग',
      languageTitle: 'भाषा और इंटरफेस स्थानीयकरण',
      languageSub: 'सूचनाओं और डिस्पैच अलर्ट के लिए आधिकारिक कमांड भाषा',
      apiTitle: 'बैकएंड एपीआई कॉन्फ़िगरेशन और स्थिति',
      apiSub: 'फास्टएपीआई अपस्ट्रीम और डेटाबेस एंडपॉइंट्स',
    },
  },
  MR: {
    common: {
      online: 'ऑनलाइन',
      offline: 'ऑफलाइन',
      live: 'थेट (LIVE)',
      save: 'बदल जतन करा',
      saved: 'यशस्वीरीत्या जतन केले',
      cancel: 'रद्द करा',
      close: 'बंद करा',
      actions: 'कृती',
      view: 'पहा',
      resolve: 'निराकरण करा',
      status: 'स्थिती',
      loading: 'लोड होत आहे...',
      search: 'शोधा',
      refresh: 'ताजे करा',
      all: 'सर्व',
    },
    nav: {
      dashboard: 'डॅशबोर्ड',
      liveMap: 'थेट नकाशा',
      crowdMonitoring: 'गर्दी नियंत्रण',
      cameraMonitoring: 'कॅमेरा फीड्स',
      faceDetection: 'चेहरा ओळख AI',
      alerts: 'इशारा केंद्र',
      emergency: 'आपत्कालीन कक्ष',
      familySos: 'कुटुंब एसओएस',
      lostFound: 'हरवलेले आणि सापडलेले',
      analytics: 'विश्लेषण',
      settings: 'सेटिंग्ज',
      logout: 'लॉग आऊट',
      controlRoom: 'नियंत्रण कक्ष',
      commandCenter: 'प्राधिकरण संचालन',
    },
    header: {
      safetyDashboard: 'सुरक्षा डॅशबोर्ड',
      kumbhSubtitle: 'नाशिक कुंभमेळा • थेट नियंत्रण कक्ष',
      liveSync: 'सिंक',
      activeAlerts: 'सक्रिय इशारे',
      officer: 'प्राधिकरण अधिकारी',
      selectLanguage: 'भाषा निवडा',
    },
    lostFound: {
      title: 'हरवलेले आणि सापडलेले / बेपत्ता व्यक्ती सहाय्यता पोर्टल',
      subtitle: 'सर्व विभागांमध्ये विभक्त झालेले भाविक आणि हरवलेल्या वस्तूंचा शोध व जुळवणी पोर्टल.',
      fileNewReport: 'नवीन तक्रार नोंदवा',
      tabMissing: 'बेपत्ता व्यक्ती तक्रारी',
      tabFound: 'सापडलेल्या व्यक्ती व वस्तू',
      tabMatched: 'जुळलेल्या तक्रारी',
      tabResolved: 'निराकरण पुरालेख',
      colPhoto: 'छायाचित्र',
      colId: 'तक्रार आयडी',
      colName: 'नाव / वस्तू',
      colDesc: 'शारीरिक ओळख व कपडे',
      colLocation: 'शेवटचे ज्ञात ठिकाण',
      colReported: 'नोंदणी वेळ',
      colStatus: 'स्थिती',
      colTeam: 'नियुक्त पथक',
      colActions: 'कृती',
      btnView: 'पहा',
      btnResolve: 'निराकरण करा',
      btnResolvedSuccess: 'पुनर्भेट झाली - निराकरण पूर्ण',
      modalNewTitle: 'बेपत्ता व्यक्ती / शोध तक्रार नोंदवा',
      modalNewSubtitle: 'छायाचित्रासह मध्यवर्ती कुंभमेळा सुरक्षा डेटाबेसमध्ये अधिकृत नोंद करा.',
      labelCategory: 'तक्रार वर्ग',
      labelName: 'व्यक्तीचे नाव / वस्तूचे नाव',
      labelPhoto: 'बेपत्ता व्यक्तीचे छायाचित्र',
      labelPhotoHint: 'डिव्हाइसवरून फोटो निवडा (JPG/PNG) किंवा खालील नमुना फोटो वापरा',
      labelPhotoChoose: 'डिव्हाइसवरून फोटो अपलोड करा',
      labelPhotoRemove: 'फोटो काढा',
      labelOrSample: 'किंवा चाचणीसाठी नमुना फोटो निवडा:',
      sampleElderlyMale: 'वृद्ध भाविक (पुरुष)',
      sampleElderlyFemale: 'वृद्ध भाविक (महिला)',
      sampleChild: 'लहान मूल / बालक',
      sampleAdultMale: 'प्रौढ भाविक',
      labelDesc: 'शारीरिक ओळख आणि कपड्यांचे तपशील',
      labelDescPlaceholder: 'घालण्यात आलेले कपडे, उंची, बोलण्याची भाषा, ओळख खुणा...',
      labelLocation: 'शेवटचा ज्ञात विभाग / ठिकाण',
      labelContact: 'संपर्क क्रमांक / नातेवाईक',
      btnCancel: 'रद्द करा',
      btnSubmit: 'तक्रार नोंदवा',
      modalDetailTitle: 'बेपत्ता व्यक्ती नोंद व फोटो तपशील',
      badgeSearching: 'शोध सुरू',
      badgeMatched: 'जुळवणी झाली',
      badgeResolved: 'निराकरण झाले',
      photoPreviewTitle: 'अधिकृत शोध छायाचित्र',
      noPhotoProvided: 'या नोंदीसह कोणतेही छायाचित्र जोडलेले नाही',
      reunitedSuccess: 'पुनर्भेट झाली म्हणून निराकरण करा',
      viewFullPhoto: 'मोठे छायाचित्र पाहण्यासाठी क्लिक करा',
    },
    settings: {
      title: 'प्रणाली सेटिंग्ज',
      subtitle: 'नियंत्रण मर्यादा, एआय शोध मापदंड आणि टेलीमेट्री कनेक्शन कॉन्फिगर करा.',
      btnSave: 'सेटिंग्ज जतन करा',
      btnSaved: 'जतन झाले',
      crowdThresholdTitle: 'गर्दी नियंत्रण आणि सतर्कता मर्यादा',
      crowdThresholdSub: 'स्वयंचलित सतर्कता निर्मिती मर्यादा आणि घनता ट्रिगर्स',
      telemetryFreq: 'टेलीमेट्री तपासणी वारंवारता',
      mapControlsTitle: 'नकाशा स्तर आणि दृश्य नियंत्रणे',
      mapControlsSub: 'ओपनस्ट्रीटमॅप भौगोलिक स्तर आणि ऑटो-ट्रॅकिंग',
      languageTitle: 'भाषा आणि इंटरफेस स्थानिकरण',
      languageSub: 'सूचना आणि आपत्कालीन इशाऱ्यांसाठी अधिकृत भाषा',
      apiTitle: 'बॅकएंड एपीआय रचना आणि स्थिती',
      apiSub: 'फास्टएपीआय अपस्ट्रीम आणि डेटाबेस एंडपॉइंट्स',
    },
  },
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'ksa_dashboard_lang';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'EN' || saved === 'HI' || saved === 'MR') {
        return saved;
      }
    } catch {}
    return 'EN';
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {}
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {}
  }, [language]);

  const t = TRANSLATIONS[language] || TRANSLATIONS.EN;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

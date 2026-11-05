/**
 * Multilingual Translation Dictionary for AAKASH Weather & Astronomy
 * Supports English (en), Bengali / বাংলা (bn), and Hindi / हिन्दी (hi)
 */

export type LangId = 'en' | 'bn' | 'hi';

export interface Translations {
  appName: string;
  tagline: string;
  badge: string;
  searchPlaceholder: string;
  searchBtn: string;
  gpsBtnTitle: string;
  toggleThemeTitle: string;
  languageTitle: string;
  infoTitle: string;
  returnToHub: string;
  
  // Tabs
  tabToday: string;
  tabForecast: string;
  tabMap: string;
  tabSky: string;
  tabFarm: string;
  tabCalendar: string;

  // Ground conditions
  currentConditions: string;
  feelsLike: string;
  humidex: string;
  humidity: string;
  windSpeed: string;
  windGusts: string;
  pressure: string;
  uvIndex: string;
  dewPoint: string;
  visibility: string;
  cloudCover: string;
  gridResolution: string;

  // Air Quality
  airQualityTitle: string;
  aqiNormal: string;
  pm25: string;
  pm10: string;
  aqiSource: string;

  // Rain & Wind
  rainfallToday: string;
  peakProbability: string;
  imdCategoryNote: string;
  beaufortScaleTitle: string;
  beaufortDescription: string;
  beaufortNote: string;

  // Coastal
  coastalTitle: string;
  waveHeight: string;
  seaTemp: string;

  // Lifestyle
  lifestyleTitle: string;
  lifestyleSubtitle: string;
  riderTitle: string;
  walkingTitle: string;
  elderlyTitle: string;
  dryingTitle: string;
  statusFavourable: string;
  statusCaution: string;
  statusAvoid: string;
  statusGood: string;
  statusSlow: string;
  statusNotNow: string;

  // Forecast
  next48Hours: string;
  scrollNotice: string;
  extended10Day: string;
  todayLabel: string;
  tomorrowLabel: string;
  rainChance: string;

  // Map
  mapTitle: string;
  layerWind: string;
  layerRain: string;
  layerCloud: string;
  layerTemp: string;
  forecastOffset: string;
  mapHint: string;

  // Sky & Astronomy
  skyTitle: string;
  sunTrackTitle: string;
  sunrise: string;
  sunset: string;
  solarNoon: string;
  dayLength: string;
  sunAltitude: string;
  moonTrackTitle: string;
  illumination: string;
  moonAge: string;
  tithiLabel: string;
  pakshaLabel: string;
  nextFullMoon: string;
  nextNewMoon: string;
  tideRange: string;
  springTide: string;
  neapTide: string;
  midTide: string;

  // Farm Planner
  farmTitle: string;
  farmSubtitle: string;
  sprayingAdvisory: string;
  fieldLabourAdvisory: string;
  irrigationAdvisory: string;
  waterDeficit: string;
  sprayOk: string;
  sprayAvoid: string;
  labourGood: string;
  labourAvoid: string;
  irrigationNeeded: string;
  irrigationAdequate: string;
  faoNote: string;

  // Calendar
  calendarTitle: string;
  calTodayBtn: string;
  calCloseBtn: string;
  lunarDetailsTitle: string;
  ekadashiBadge: string;
  purnimaBadge: string;
  amavasyaBadge: string;

  // General & Errors
  offlineMode: string;
  retrievingData: string;
  locationNotFound: string;
  fetchFailed: string;
  emergencyHelplines: string;
  imdMausam: string;
  ndmaSachet: string;
  emergencyNum: string;
  animationToggle: string;
}

export const TRANSLATIONS: Record<LangId, Translations> = {
  en: {
    appName: 'Aakash',
    tagline: 'Stand Under Your Own Sky',
    badge: 'India Sky',
    searchPlaceholder: 'Village, City, or 6-digit PIN...',
    searchBtn: 'Search',
    gpsBtnTitle: 'Use Device GPS Location',
    toggleThemeTitle: 'Toggle Theme',
    languageTitle: 'Language',
    infoTitle: 'Data Principles & Disclaimers',
    returnToHub: 'Return to CBT Platform',

    tabToday: 'Today',
    tabForecast: 'Forecast',
    tabMap: 'Weather Map',
    tabSky: 'Sun & Moon',
    tabFarm: 'Farm Planner',
    tabCalendar: 'Calendar',

    currentConditions: 'Current Ground Conditions',
    feelsLike: 'Feels like',
    humidex: 'Humidex',
    humidity: 'Humidity',
    windSpeed: 'Wind Speed',
    windGusts: 'Gusts',
    pressure: 'Pressure',
    uvIndex: 'UV Index',
    dewPoint: 'Dew Point',
    visibility: 'Visibility',
    cloudCover: 'Cloud Cover',
    gridResolution: 'Open-Meteo · ~11km Grid · IST',

    airQualityTitle: 'Air Quality (CAMS)',
    aqiNormal: 'Normal',
    pm25: 'PM2.5',
    pm10: 'PM10',
    aqiSource: 'Copernicus Atmosphere Service Model',

    rainfallToday: 'Rainfall Today (24h)',
    peakProbability: 'Peak probability',
    imdCategoryNote: 'IMD Standard Category Thresholds',
    beaufortScaleTitle: 'Beaufort Wind Scale',
    beaufortDescription: 'Wind Force',
    beaufortNote: 'Standard 10m anemometer speed scale',

    coastalTitle: 'Coastal Marine Conditions',
    waveHeight: 'Wave Height',
    seaTemp: 'Sea Surface Temp',

    lifestyleTitle: 'Everyday Outdoor Decisions & Lifestyle',
    lifestyleSubtitle: 'Rule-based guidance · Not medical advice',
    riderTitle: 'Two-Wheeler Riders',
    walkingTitle: 'Walking & Outdoor Chores',
    elderlyTitle: 'Elderly & Sensitive Groups',
    dryingTitle: 'Outdoor Clothes Drying',
    statusFavourable: 'Favourable',
    statusCaution: 'Caution',
    statusAvoid: 'Avoid',
    statusGood: 'Good',
    statusSlow: 'Slow',
    statusNotNow: 'Not now',

    next48Hours: 'Next 48 Hours Timeline',
    scrollNotice: 'Scroll horizontally →',
    extended10Day: '10-Day Extended Outlook',
    todayLabel: 'Today',
    tomorrowLabel: 'Tomorrow',
    rainChance: 'Rain probability',

    mapTitle: 'Interactive Weather Model Map',
    layerWind: 'Wind Flow',
    layerRain: 'Rain Radar',
    layerCloud: 'Cloud Cover',
    layerTemp: 'Temperature',
    forecastOffset: 'Forecast Offset',
    mapHint: 'Tap anywhere on the map to inspect weather coordinates',

    skyTitle: 'Celestial Ephemeris & Astronomy',
    sunTrackTitle: 'Sun Track & Daylight Arc',
    sunrise: 'Sunrise',
    sunset: 'Sunset',
    solarNoon: 'Solar Noon',
    dayLength: 'Daylight',
    sunAltitude: 'Sun Altitude',
    moonTrackTitle: 'Moon Phase & Tithi',
    illumination: 'Illumination',
    moonAge: 'Moon Age',
    tithiLabel: 'Tithi (Lunar Day)',
    pakshaLabel: 'Paksha (Fortnight)',
    nextFullMoon: 'Next Full Moon (Purnima)',
    nextNewMoon: 'Next New Moon (Amavasya)',
    tideRange: 'Tidal Range',
    springTide: 'Spring Tide (High Range)',
    neapTide: 'Neap Tide (Low Range)',
    midTide: 'Intermediate Tide',

    farmTitle: 'Field-Time Planner (Farmers & Outdoor Labour)',
    farmSubtitle: 'Slide hour to preview spraying, soil moisture, and heat stress risks',
    sprayingAdvisory: 'Spraying Window',
    fieldLabourAdvisory: 'Field Labour Feasibility',
    irrigationAdvisory: 'Irrigation Need',
    waterDeficit: 'Water Balance (ET₀)',
    sprayOk: 'Favourable',
    sprayAvoid: 'Avoid',
    labourGood: 'Good',
    labourAvoid: 'Avoid',
    irrigationNeeded: 'Likely Needed',
    irrigationAdequate: 'Adequate',
    faoNote: 'FAO-56 Penman-Monteith Evapotranspiration Balance',

    calendarTitle: 'Indian Panchanga & Lunar Calendar',
    calTodayBtn: 'Today',
    calCloseBtn: 'Close',
    lunarDetailsTitle: 'Lunar & Weather Breakdown',
    ekadashiBadge: 'Ekadashi',
    purnimaBadge: 'Purnima',
    amavasyaBadge: 'Amavasya',

    offlineMode: 'Offline Simulation Mode (Live model cached/offline)',
    retrievingData: 'Retrieving Indian sky models, satellite & astronomy data...',
    locationNotFound: 'Location not found. Try a village, district, or 6-digit PIN code.',
    fetchFailed: 'Network error. Switched seamlessly to offline weather simulation.',
    emergencyHelplines: 'Official Indian Weather & Disaster Bulletins:',
    imdMausam: 'IMD Mausam',
    ndmaSachet: 'NDMA Sachet',
    emergencyNum: 'Emergency: 112',
    animationToggle: 'Animations'
  },

  bn: {
    appName: 'আকাশ',
    tagline: 'নিজের আকাশের নিচে দাঁড়ান',
    badge: 'ভারত আকাশ',
    searchPlaceholder: 'গ্রাম, শহর বা ৬-সংখ্যার পিন কোড...',
    searchBtn: 'খুঁজুন',
    gpsBtnTitle: 'ডিভাইস জিপিএস অবস্থান ব্যবহার করুন',
    toggleThemeTitle: 'থিম পরিবর্তন',
    languageTitle: 'ভাষা',
    infoTitle: 'তথ্য সূত্র ও নীতিমালা',
    returnToHub: 'পরীক্ষা পোর্টালে ফিরুন',

    tabToday: 'আজ',
    tabForecast: 'পূর্বাভাস',
    tabMap: 'আবহাওয়া মানচিত্র',
    tabSky: 'সূর্য ও চন্দ্র',
    tabFarm: 'কৃষি সহায়িকা',
    tabCalendar: 'পঞ্জিকা',

    currentConditions: 'বর্তমান ভূমিস্থিত অবস্থা',
    feelsLike: 'অনুভূত তাপমাত্রা',
    humidex: 'হিউমিডেক্স',
    humidity: 'আর্দ্রতা',
    windSpeed: 'বাতাসের গতি',
    windGusts: 'ঝাপটা বাতাস',
    pressure: 'বায়ুমণ্ডলীয় চাপ',
    uvIndex: 'ইউভি সূচক',
    dewPoint: 'শিশিরাঙ্ক',
    visibility: 'দৃশ্যমানতা',
    cloudCover: 'মেঘের বিস্তার',
    gridResolution: 'ওপেন-মেটিও · ১১ কিমি গ্রিড · ভারতীয় সময়',

    airQualityTitle: 'বায়ুমান সূচক (CAMS মডেল)',
    aqiNormal: 'স্বাভাবিক',
    pm25: 'পিএম ২.৫',
    pm10: 'পিএম ১০',
    aqiSource: 'কোপার্নিকাস অ্যাটমোসফিয়ার পরিষেবা মডেল',

    rainfallToday: 'আজকের বৃষ্টিপাত (২৪ ঘণ্টা)',
    peakProbability: 'সর্বোচ্চ সম্ভাবনা',
    imdCategoryNote: 'আইএমডি (মৌসম ভবন) মানদণ্ড অনুযায়ী শ্রেণিবিভাগ',
    beaufortScaleTitle: 'বোফোর্ট বায়ু পরিমাপ স্কেল',
    beaufortDescription: 'বাতাসের জোর',
    beaufortNote: 'আন্তর্জাতিক ১০ মিটার অ্যানিমোমিটার গতি স্কেল',

    coastalTitle: 'উপকূলীয় সামুদ্রিক অবস্থা',
    waveHeight: 'ঢেউয়ের উচ্চতা',
    seaTemp: 'সমুদ্রপৃষ্ঠের তাপমাত্রা',

    lifestyleTitle: 'দৈনন্দিন বহিরঙ্গন সিদ্ধান্ত ও জীবনযাত্রা',
    lifestyleSubtitle: 'নিয়মভিত্তিক পরামর্শ · কোনো চিকিৎসা নির্দেশিকা নয়',
    riderTitle: 'বাইক ও স্কুটার আরোহী',
    walkingTitle: 'হাঁটাচলা ও বাইরের কাজ',
    elderlyTitle: 'বয়োজ্যেষ্ঠ ও সংবেদনশীল ব্যক্তি',
    dryingTitle: 'রোদে কাপড় শুকানো',
    statusFavourable: 'অনুকূল',
    statusCaution: 'সতর্কতা',
    statusAvoid: 'এড়িয়ে চলুন',
    statusGood: 'ভালো',
    statusSlow: 'ধীরগতি',
    statusNotNow: 'এখন নয়',

    next48Hours: 'পরবর্তী ৪৮ ঘণ্টার আবহাওয়া রেখা',
    scrollNotice: 'ডানে স্ক্রোল করুন →',
    extended10Day: '১০ দিনের বর্ধিত পূর্বাভাস',
    todayLabel: 'আজ',
    tomorrowLabel: 'আগামীকাল',
    rainChance: 'বৃষ্টির সম্ভাবনা',

    mapTitle: 'ইন্টারেক্টিভ আবহাওয়া মডেল মানচিত্র',
    layerWind: 'বাতাসের প্রবাহ',
    layerRain: 'বৃষ্টির রাডার',
    layerCloud: 'মেঘের আচ্ছাদন',
    layerTemp: 'তাপমাত্রা',
    forecastOffset: 'পূর্বাভাস সময়সীমা',
    mapHint: 'মানচিত্রের যেকোনো স্থানে ট্যাপ করে আবহাওয়া দেখুন',

    skyTitle: 'মহাজাগতিক পঞ্জিকা ও জ্যোতির্বিজ্ঞান',
    sunTrackTitle: 'সূর্যের গতিপথ ও দিবাভাগ আর্চ',
    sunrise: 'সূর্যোদয়',
    sunset: 'সূর্যাস্ত',
    solarNoon: 'মধ্যাহ্ন',
    dayLength: 'দিনের দৈর্ঘ্য',
    sunAltitude: 'সূর্যের উন্নতি কোণ',
    moonTrackTitle: 'চন্দ্রের দশা ও তিথি',
    illumination: 'আলোকিত অংশ',
    moonAge: 'চাঁদের বয়স',
    tithiLabel: 'তিথি',
    pakshaLabel: 'পক্ষ',
    nextFullMoon: 'পরবর্তী পূর্ণিমা',
    nextNewMoon: 'পরবর্তী অমাবস্যা',
    tideRange: 'জোয়ার-ভাটার তীব্রতা',
    springTide: 'তেজি কোটাল (উচ্চ জোয়ার)',
    neapTide: 'মরা কোটাল (স্বল্প জোয়ার)',
    midTide: 'সাধারণ জোয়ার',

    farmTitle: 'মাঠের কাজের সময়সূচি (কৃষক ও শ্রমিকদের জন্য)',
    farmSubtitle: 'কীটনাশক ছিটানো, মাটির আর্দ্রতা ও তাপজনিত ঝুঁকি জানতে সময় নির্বাচন করুন',
    sprayingAdvisory: 'কীটনাশক স্প্রে করার উপযুক্ততা',
    fieldLabourAdvisory: 'মাঠে কায়িক পরিশ্রমের সুবিধা',
    irrigationAdvisory: 'সেচের প্রয়োজনীয়তা',
    waterDeficit: 'পানির ঘাটতি (ET₀ ব্যালেন্স)',
    sprayOk: 'উপযুক্ত',
    sprayAvoid: 'এড়িয়ে চলুন',
    labourGood: 'ভালো',
    labourAvoid: 'এড়িয়ে চলুন',
    irrigationNeeded: 'সেচ প্রয়োজন হতে পারে',
    irrigationAdequate: 'পর্যাপ্ত আর্দ্রতা',
    faoNote: 'FAO-56 পেনম্যান-মন্টিথ বাষ্পীভবন ব্যালেন্স',

    calendarTitle: 'ভারতীয় পঞ্জিকা ও চান্দ্র দিনপঞ্জি',
    calTodayBtn: 'আজকের দিন',
    calCloseBtn: 'বন্ধ করুন',
    lunarDetailsTitle: 'তিথি ও আবহাওয়ার বিবরণ',
    ekadashiBadge: 'একাদশী',
    purnimaBadge: 'পূর্ণিমা',
    amavasyaBadge: 'অমাবস্যা',

    offlineMode: 'অফলাইন সিমুলেশন মোড (মডেল অফলাইনে সংরক্ষিত)',
    retrievingData: 'ভারতীয় আকাশের উপগ্রহ ও জ্যোতির্বিজ্ঞানের তথ্য লোড হচ্ছে...',
    locationNotFound: 'অবস্থান পাওয়া যায়নি। কোনো গ্রাম, জেলা বা ৬-সংখ্যার পিন কোড লিখুন।',
    fetchFailed: 'নেটওয়ার্ক সংযোগ বিঘ্নিত। অফলাইন সিমুলেশন চালু করা হয়েছে।',
    emergencyHelplines: 'সরকারি ভারতীয় আবহাওয়া ও দুর্যোগ সতর্কতা বুলেটিন:',
    imdMausam: 'আইএমডি মৌসম',
    ndmaSachet: 'এনডিএমএ সাচেত',
    emergencyNum: 'জরুরি হেল্পলাইন: ১১২',
    animationToggle: 'অ্যানিমেশন'
  },

  hi: {
    appName: 'आकाश',
    tagline: 'अपने आसमान के नीचे खड़े हों',
    badge: 'भारत आकाश',
    searchPlaceholder: 'गाँव, शहर या 6-अंकीय पिन कोड...',
    searchBtn: 'खोजें',
    gpsBtnTitle: 'डिवाइस जीपीएस स्थान का उपयोग करें',
    toggleThemeTitle: 'थीम बदलें',
    languageTitle: 'भाषा',
    infoTitle: 'डेटा सिद्धांत एवं दिशा-निर्देश',
    returnToHub: 'सीबिटी हब पर लौटें',

    tabToday: 'आज',
    tabForecast: 'पूर्वानुमान',
    tabMap: 'मौसम मानचित्र',
    tabSky: 'सूर्य व चंद्रमा',
    tabFarm: 'कृषि योजना',
    tabCalendar: 'पंचांग कैलेंडर',

    currentConditions: 'वर्तमान धरातलीय मौसम',
    feelsLike: 'महसूस तापमान',
    humidex: 'ह्यूमिडेक्स',
    humidity: 'आर्द्रता (नमी)',
    windSpeed: 'हवा की गति',
    windGusts: 'झोंके',
    pressure: 'वायुदाब',
    uvIndex: 'यूवी इंडेक्स',
    dewPoint: 'ओसांक',
    visibility: 'दृश्यता',
    cloudCover: 'बादल विस्तार',
    gridResolution: 'ओपन-मेटियो · ~11 किमी ग्रिड · भारतीय मानक समय',

    airQualityTitle: 'वायु गुणवत्ता (CAMS मॉडल)',
    aqiNormal: 'सामान्य',
    pm25: 'पीएम 2.5',
    pm10: 'पीएम 10',
    aqiSource: 'कोपरनिकस वायुमंडलीय सेवा मॉडल',

    rainfallToday: 'आज की वर्षा (24 घंटे)',
    peakProbability: 'अधिकतम संभावना',
    imdCategoryNote: 'मौसम विज्ञान विभाग (IMD) मानक श्रेणियां',
    beaufortScaleTitle: 'ब्युफोर्ट वायु पैमाना',
    beaufortDescription: 'पवन प्रभाव',
    beaufortNote: 'मानक 10 मीटर एनीमोमीटर गति पैमाना',

    coastalTitle: 'तटीय समुद्री स्थितियाँ',
    waveHeight: 'लहरों की ऊँचाई',
    seaTemp: 'समुद्र सतह तापमान',

    lifestyleTitle: 'दैनिक बाहरी निर्णय एवं जीवनशैली सलाह',
    lifestyleSubtitle: 'नियम-आधारित सुझाव · चिकित्सकीय सलाह नहीं',
    riderTitle: 'दोपहिया वाहन चालक',
    walkingTitle: 'पैदल चलना व बाहरी कार्य',
    elderlyTitle: 'वरिष्ठ नागरिक व संवेदनशील समूह',
    dryingTitle: 'धूप में कपड़े सुखाना',
    statusFavourable: 'अनुकूल',
    statusCaution: 'सावधानी',
    statusAvoid: 'बचें',
    statusGood: 'उत्तम',
    statusSlow: 'धीमा',
    statusNotNow: 'अभी नहीं',

    next48Hours: 'अगले 48 घंटों की समयरेखा',
    scrollNotice: 'दाएं स्क्रॉल करें →',
    extended10Day: '10-दिवसीय विस्तृत पूर्वानुमान',
    todayLabel: 'आज',
    tomorrowLabel: 'कल',
    rainChance: 'बारिश की संभावना',

    mapTitle: 'इंटरैक्टिव मौसम मॉडल मानचित्र',
    layerWind: 'पवन प्रवाह',
    layerRain: 'वर्षा रडार',
    layerCloud: 'बादल आवरण',
    layerTemp: 'तापमान',
    forecastOffset: 'पूर्वानुमान समय',
    mapHint: 'मौसम देखने के लिए मानचित्र पर कहीं भी टैप करें',

    skyTitle: 'खगोलीय गणना एवं पंचांग',
    sunTrackTitle: 'सूर्य का पथ एवं दिवा चाप',
    sunrise: 'सूर्योदय',
    sunset: 'सूर्यास्त',
    solarNoon: 'मध्याह्न',
    dayLength: 'दिन की अवधि',
    sunAltitude: 'सूर्य की ऊँचाई कोण',
    moonTrackTitle: 'चंद्र कला एवं तिथि',
    illumination: 'प्रकाशित भाग',
    moonAge: 'चंद्रमा की आयु',
    tithiLabel: 'तिथि',
    pakshaLabel: 'पक्ष',
    nextFullMoon: 'अगली पूर्णिमा',
    nextNewMoon: 'अगली अमावस्या',
    tideRange: 'ज्वार-भाटा शक्ति',
    springTide: 'दीर्घ ज्वार (उच्च सीमा)',
    neapTide: 'लघु ज्वार (निम्न सीमा)',
    midTide: 'मध्यम ज्वार',

    farmTitle: 'खेत कार्य योजनाकार (किसान व बाहरी श्रमिक)',
    farmSubtitle: 'छिड़काव, नमी और गर्मी का जोखिम देखने के लिए समय चुनें',
    sprayingAdvisory: 'दवा छिड़काव की स्थिति',
    fieldLabourAdvisory: 'खेत में शारीरिक श्रम सुगमता',
    irrigationAdvisory: 'सिंचाई की आवश्यकता',
    waterDeficit: 'जल संतुलन (ET₀ कमी)',
    sprayOk: 'उपयुक्त',
    sprayAvoid: 'बचें',
    labourGood: 'उत्तम',
    labourAvoid: 'बचें',
    irrigationNeeded: 'सिंचाई आवश्यक हो सकती है',
    irrigationAdequate: 'पर्याप्त नमी',
    faoNote: 'FAO-56 पेनमैन-मोंटिथ वाष्पीकरण संतुलन',

    calendarTitle: 'भारतीय पंचांग एवं चंद्र कैलेंडर',
    calTodayBtn: 'आज',
    calCloseBtn: 'बंद करें',
    lunarDetailsTitle: 'तिथि एवं मौसम विवरण',
    ekadashiBadge: 'एकादशी',
    purnimaBadge: 'पूर्णिमा',
    amavasyaBadge: 'अमावस्या',

    offlineMode: 'ऑफ़लाइन सिमुलेशन मोड (मॉडल ऑफ़लाइन सुरक्षित)',
    retrievingData: 'भारतीय उपग्रह एवं खगोलीय आंकड़े लोड हो रहे हैं...',
    locationNotFound: 'स्थान नहीं मिला। कृपया गाँव, जिला या 6-अंकीय पिन कोड दर्ज करें।',
    fetchFailed: 'नेटवर्क समस्या। ऑफ़लाइन मौसम सिमुलेशन प्रारंभ किया गया।',
    emergencyHelplines: 'सरकारी भारतीय मौसम एवं आपदा चेतावनी बुलेटिन:',
    imdMausam: 'आईएमडी मौसम',
    ndmaSachet: 'एनडीएमए सचेत',
    emergencyNum: 'आपातकालीन: 112',
    animationToggle: 'एनीमेशन'
  }
};

/**
 * Helper to translate WMO Weather Code
 */
export function translateWeatherCondition(code: number, lang: LangId): string {
  const translations: Record<number, Record<LangId, string>> = {
    0: { en: 'Clear Sky', bn: 'পরিষ্কার আকাশ', hi: 'साफ़ आसमान' },
    1: { en: 'Mainly Clear', bn: 'প্রধানত পরিষ্কার', hi: 'मुख्यतः साफ़' },
    2: { en: 'Partly Cloudy', bn: 'আংশিক মেঘলা', hi: 'आंशिक रूप से बादल' },
    3: { en: 'Overcast', bn: 'মেঘাচ্ছন্ন আকাশ', hi: 'घने बादल' },
    45: { en: 'Fog', bn: 'কুয়াশা', hi: 'कोहरा' },
    48: { en: 'Depositing Rime Fog', bn: 'তুষার কুয়াশা', hi: 'तुषार कोहरा' },
    51: { en: 'Light Drizzle', bn: 'হালকা গুঁড়ি গুঁড়ি বৃষ্টি', hi: 'हल्की बूँदाबाँदी' },
    53: { en: 'Moderate Drizzle', bn: 'মাঝারি গুঁড়ি গুঁড়ি বৃষ্টি', hi: 'मध्यम बूँदाबाँदी' },
    55: { en: 'Dense Drizzle', bn: 'ঘন গুঁড়ি গুঁড়ি বৃষ্টি', hi: 'सघन बूँदाबाँदी' },
    61: { en: 'Slight Rain', bn: 'হালকা বৃষ্টি', hi: 'हल्की बारिश' },
    63: { en: 'Moderate Rain', bn: 'মাঝারি বৃষ্টি', hi: 'मध्यम बारिश' },
    65: { en: 'Heavy Rain', bn: 'ভারী বৃষ্টি', hi: 'भारी बारिश' },
    80: { en: 'Rain Showers', bn: 'বৃষ্টির পশলা', hi: 'बारिश की बौछारें' },
    81: { en: 'Moderate Showers', bn: 'মাঝারি বৃষ্টির পশলা', hi: 'मध्यम बौछारें' },
    82: { en: 'Violent Showers', bn: 'মুষলধারে বৃষ্টির পশলা', hi: 'मूसलाधार बौछारें' },
    95: { en: 'Thunderstorm', bn: 'বজ্রবিদ্যুৎ সহ ঝড়বৃষ্টি', hi: 'गरज के साथ तूफ़ान' },
    96: { en: 'Thunderstorm with Hail', bn: 'শিলাবৃষ্টি সহ বজ্রঝড়', hi: 'ओलावृष्टि के साथ तूफ़ान' },
    99: { en: 'Severe Thunderstorm', bn: 'তীব্র শিলাবৃষ্টি ও বজ্রঝড়', hi: 'भीषण ओलावृष्टि व तूफ़ान' }
  };

  return translations[code]?.[lang] || translations[0][lang];
}

/**
 * Helper to get Tithi in Bengali / Hindi
 */
export const TITHI_TRANSLATIONS: Record<string, Record<LangId, string>> = {
  'Pratipada': { en: 'Pratipada', bn: 'প্রতিপদ', hi: 'प्रतिपदा' },
  'Dwitiya': { en: 'Dwitiya', bn: 'দ্বিতীয়া', hi: 'द्वितीया' },
  'Tritiya': { en: 'Tritiya', bn: 'তৃতীয়া', hi: 'तृतीया' },
  'Chaturthi': { en: 'Chaturthi', bn: 'চতুর্থী', hi: 'चतुर्थी' },
  'Panchami': { en: 'Panchami', bn: 'পঞ্চমী', hi: 'पंचमी' },
  'Shashti': { en: 'Shashti', bn: 'ষষ্ঠী', hi: 'षष्ठी' },
  'Saptami': { en: 'Saptami', bn: 'সপ্তমী', hi: 'सप्तमी' },
  'Ashtami': { en: 'Ashtami', bn: 'অষ্টমী', hi: 'अष्टमी' },
  'Navami': { en: 'Navami', bn: 'নবমী', hi: 'नवमी' },
  'Dashami': { en: 'Dashami', bn: 'দশমী', hi: 'दशमी' },
  'Ekadashi': { en: 'Ekadashi', bn: 'একাদশী', hi: 'एकादशी' },
  'Dwadashi': { en: 'Dwadashi', bn: 'দ্বাদশী', hi: 'द्वादशी' },
  'Trayodashi': { en: 'Trayodashi', bn: 'ত্রয়োদশী', hi: 'त्रयोदशी' },
  'Chaturdashi': { en: 'Chaturdashi', bn: 'চতুর্দশী', hi: 'चतुर्दशी' },
  'Purnima': { en: 'Purnima (Full Moon)', bn: 'পূর্ণিমা', hi: 'पूर्णिमा' },
  'Amavasya': { en: 'Amavasya (New Moon)', bn: 'অমাবস্যা', hi: 'अमावस्या' }
};

export const PAKSHA_TRANSLATIONS: Record<'Shukla' | 'Krishna', Record<LangId, string>> = {
  Shukla: { en: 'Shukla Paksha (Waxing)', bn: 'শুক্লপক্ষ', hi: 'शुक्ल पक्ष' },
  Krishna: { en: 'Krishna Paksha (Waning)', bn: 'কৃষ্ণপক্ষ', hi: 'कृष्ण पक्ष' }
};

import type { BaseCity } from '../types/travel'

// Public base map data only — no user photos, no visited status, no travel records.
export const CITIES: BaseCity[] = [
  // ── China ──────────────────────────────────────────────────────────────────
  {
    id: 'CN-beijing',
    name: '北京',
    nameEn: 'Beijing',
    countryId: 'CN',
    lat: 39.9,
    lng: 116.4,
    province: '北京市',
    isCapital: true,
    isMajorTouristCity: true,
    defaultLandmarkIds: ['cn-tiananmen', 'cn-greatwall'],
  },
  {
    id: 'CN-shanghai',
    name: '上海',
    nameEn: 'Shanghai',
    countryId: 'CN',
    lat: 31.23,
    lng: 121.47,
    province: '上海市',
    isMajorTouristCity: true,
    defaultLandmarkIds: ['cn-orientalpearl', 'cn-thebund'],
  },
  {
    id: 'CN-chengdu',
    name: '成都',
    nameEn: 'Chengdu',
    countryId: 'CN',
    lat: 30.57,
    lng: 104.07,
    province: '四川省',
    isMajorTouristCity: true,
    defaultLandmarkIds: ['cn-panda', 'cn-kuanzhai'],
  },

  // ── Japan ──────────────────────────────────────────────────────────────────
  {
    id: 'JP-tokyo',
    name: '东京',
    nameEn: 'Tokyo',
    countryId: 'JP',
    lat: 35.68,
    lng: 139.69,
    isCapital: true,
    isMajorTouristCity: true,
    defaultLandmarkIds: ['jp-tokyotower', 'jp-senso-ji'],
  },
  {
    id: 'JP-kyoto',
    name: '京都',
    nameEn: 'Kyoto',
    countryId: 'JP',
    lat: 35.01,
    lng: 135.77,
    isMajorTouristCity: true,
    defaultLandmarkIds: ['jp-kiyomizudera', 'jp-fushimiinari'],
  },

  // ── France ─────────────────────────────────────────────────────────────────
  {
    id: 'FR-paris',
    name: '巴黎',
    nameEn: 'Paris',
    countryId: 'FR',
    lat: 48.86,
    lng: 2.35,
    isCapital: true,
    isMajorTouristCity: true,
    defaultLandmarkIds: ['fr-eiffel', 'fr-louvre'],
  },

  // ── Australia ──────────────────────────────────────────────────────────────
  {
    id: 'AU-sydney',
    name: '悉尼',
    nameEn: 'Sydney',
    countryId: 'AU',
    lat: -33.87,
    lng: 151.21,
    isMajorTouristCity: true,
    defaultLandmarkIds: ['au-operahouse', 'au-harbourbridge'],
  },
  {
    id: 'AU-melbourne',
    name: '墨尔本',
    nameEn: 'Melbourne',
    countryId: 'AU',
    lat: -37.81,
    lng: 144.96,
    isMajorTouristCity: true,
    defaultLandmarkIds: ['au-flinders', 'au-brightonboxes'],
  },
  {
    id: 'AU-canberra',
    name: '堪培拉',
    nameEn: 'Canberra',
    countryId: 'AU',
    lat: -35.28,
    lng: 149.13,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── United Kingdom ─────────────────────────────────────────────────────────
  {
    id: 'GB-london',
    name: '伦敦',
    nameEn: 'London',
    countryId: 'GB',
    lat: 51.51,
    lng: -0.13,
    isCapital: true,
    isMajorTouristCity: true,
    defaultLandmarkIds: ['gb-bigben', 'gb-towerbridge'],
  },

  // ── United States ──────────────────────────────────────────────────────────
  {
    id: 'US-newyork',
    name: '纽约',
    nameEn: 'New York',
    countryId: 'US',
    lat: 40.71,
    lng: -74.01,
    isMajorTouristCity: true,
    defaultLandmarkIds: ['us-statueofliberty', 'us-timessquare'],
  },
  {
    id: 'US-losangeles',
    name: '洛杉矶',
    nameEn: 'Los Angeles',
    countryId: 'US',
    lat: 34.05,
    lng: -118.24,
    isMajorTouristCity: true,
    defaultLandmarkIds: ['us-hollywood', 'us-santamonica'],
  },
  {
    id: 'US-washington',
    name: '华盛顿',
    nameEn: 'Washington D.C.',
    countryId: 'US',
    lat: 38.91,
    lng: -77.04,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── Italy ──────────────────────────────────────────────────────────────────
  {
    id: 'IT-rome',
    name: '罗马',
    nameEn: 'Rome',
    countryId: 'IT',
    lat: 41.9,
    lng: 12.5,
    isCapital: true,
    isMajorTouristCity: true,
    defaultLandmarkIds: ['it-colosseum', 'it-vatican'],
  },
  {
    id: 'IT-venice',
    name: '威尼斯',
    nameEn: 'Venice',
    countryId: 'IT',
    lat: 45.44,
    lng: 12.32,
    isMajorTouristCity: true,
    defaultLandmarkIds: ['it-stmark', 'it-rialto'],
  },
  {
    id: 'IT-florence',
    name: '佛罗伦萨',
    nameEn: 'Florence',
    countryId: 'IT',
    lat: 43.77,
    lng: 11.25,
    isMajorTouristCity: true,
    defaultLandmarkIds: ['it-duomo'],
  },

  // ── Thailand ───────────────────────────────────────────────────────────────
  {
    id: 'TH-bangkok',
    name: '曼谷',
    nameEn: 'Bangkok',
    countryId: 'TH',
    lat: 13.76,
    lng: 100.5,
    isCapital: true,
    isMajorTouristCity: true,
    defaultLandmarkIds: ['th-grandpalace', 'th-watarun'],
  },

  // ── Singapore ──────────────────────────────────────────────────────────────
  {
    id: 'SG-singapore',
    name: '新加坡',
    nameEn: 'Singapore',
    countryId: 'SG',
    lat: 1.35,
    lng: 103.82,
    isCapital: true,
    isMajorTouristCity: true,
    defaultLandmarkIds: ['sg-marinabay', 'sg-merlion'],
  },

  // ── South Korea ────────────────────────────────────────────────────────────
  {
    id: 'KR-seoul',
    name: '首尔',
    nameEn: 'Seoul',
    countryId: 'KR',
    lat: 37.57,
    lng: 126.98,
    isCapital: true,
    isMajorTouristCity: true,
    defaultLandmarkIds: ['kr-gyeongbokgung', 'kr-namsan'],
  },
  {
    id: 'KR-busan',
    name: '釜山',
    nameEn: 'Busan',
    countryId: 'KR',
    lat: 35.18,
    lng: 129.08,
    isMajorTouristCity: true,
    defaultLandmarkIds: ['kr-haeundae'],
  },

  // ── Malaysia ───────────────────────────────────────────────────────────────
  {
    id: 'MY-kualalumpur',
    name: '吉隆坡',
    nameEn: 'Kuala Lumpur',
    countryId: 'MY',
    lat: 3.14,
    lng: 101.69,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── Indonesia ──────────────────────────────────────────────────────────────
  {
    id: 'ID-jakarta',
    name: '雅加达',
    nameEn: 'Jakarta',
    countryId: 'ID',
    lat: -6.21,
    lng: 106.85,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── Philippines ────────────────────────────────────────────────────────────
  {
    id: 'PH-manila',
    name: '马尼拉',
    nameEn: 'Manila',
    countryId: 'PH',
    lat: 14.60,
    lng: 120.98,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── Vietnam ────────────────────────────────────────────────────────────────
  {
    id: 'VN-hanoi',
    name: '河内',
    nameEn: 'Hanoi',
    countryId: 'VN',
    lat: 21.03,
    lng: 105.85,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── India ──────────────────────────────────────────────────────────────────
  {
    id: 'IN-newdelhi',
    name: '新德里',
    nameEn: 'New Delhi',
    countryId: 'IN',
    lat: 28.61,
    lng: 77.21,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── United Arab Emirates ───────────────────────────────────────────────────
  {
    id: 'AE-abudhabi',
    name: '阿布扎比',
    nameEn: 'Abu Dhabi',
    countryId: 'AE',
    lat: 24.47,
    lng: 54.37,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── Qatar ──────────────────────────────────────────────────────────────────
  {
    id: 'QA-doha',
    name: '多哈',
    nameEn: 'Doha',
    countryId: 'QA',
    lat: 25.29,
    lng: 51.53,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── Saudi Arabia ───────────────────────────────────────────────────────────
  {
    id: 'SA-riyadh',
    name: '利雅得',
    nameEn: 'Riyadh',
    countryId: 'SA',
    lat: 24.69,
    lng: 46.72,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── Turkey ─────────────────────────────────────────────────────────────────
  {
    id: 'TR-ankara',
    name: '安卡拉',
    nameEn: 'Ankara',
    countryId: 'TR',
    lat: 39.93,
    lng: 32.86,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── Israel ─────────────────────────────────────────────────────────────────
  {
    id: 'IL-jerusalem',
    name: '耶路撒冷',
    nameEn: 'Jerusalem',
    countryId: 'IL',
    lat: 31.77,
    lng: 35.22,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── Germany ────────────────────────────────────────────────────────────────
  {
    id: 'DE-berlin',
    name: '柏林',
    nameEn: 'Berlin',
    countryId: 'DE',
    lat: 52.52,
    lng: 13.40,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── Spain ──────────────────────────────────────────────────────────────────
  {
    id: 'ES-madrid',
    name: '马德里',
    nameEn: 'Madrid',
    countryId: 'ES',
    lat: 40.42,
    lng: -3.70,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── Portugal ───────────────────────────────────────────────────────────────
  {
    id: 'PT-lisbon',
    name: '里斯本',
    nameEn: 'Lisbon',
    countryId: 'PT',
    lat: 38.72,
    lng: -9.14,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── Netherlands ────────────────────────────────────────────────────────────
  {
    id: 'NL-amsterdam',
    name: '阿姆斯特丹',
    nameEn: 'Amsterdam',
    countryId: 'NL',
    lat: 52.37,
    lng: 4.90,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── Belgium ────────────────────────────────────────────────────────────────
  {
    id: 'BE-brussels',
    name: '布鲁塞尔',
    nameEn: 'Brussels',
    countryId: 'BE',
    lat: 50.85,
    lng: 4.35,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── Austria ────────────────────────────────────────────────────────────────
  {
    id: 'AT-vienna',
    name: '维也纳',
    nameEn: 'Vienna',
    countryId: 'AT',
    lat: 48.21,
    lng: 16.37,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── Switzerland ────────────────────────────────────────────────────────────
  {
    id: 'CH-bern',
    name: '伯尔尼',
    nameEn: 'Bern',
    countryId: 'CH',
    lat: 46.95,
    lng: 7.44,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── Sweden ─────────────────────────────────────────────────────────────────
  {
    id: 'SE-stockholm',
    name: '斯德哥尔摩',
    nameEn: 'Stockholm',
    countryId: 'SE',
    lat: 59.33,
    lng: 18.07,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── Norway ─────────────────────────────────────────────────────────────────
  {
    id: 'NO-oslo',
    name: '奥斯陆',
    nameEn: 'Oslo',
    countryId: 'NO',
    lat: 59.91,
    lng: 10.75,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── Denmark ────────────────────────────────────────────────────────────────
  {
    id: 'DK-copenhagen',
    name: '哥本哈根',
    nameEn: 'Copenhagen',
    countryId: 'DK',
    lat: 55.68,
    lng: 12.57,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── Finland ────────────────────────────────────────────────────────────────
  {
    id: 'FI-helsinki',
    name: '赫尔辛基',
    nameEn: 'Helsinki',
    countryId: 'FI',
    lat: 60.17,
    lng: 24.93,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── Ireland ────────────────────────────────────────────────────────────────
  {
    id: 'IE-dublin',
    name: '都柏林',
    nameEn: 'Dublin',
    countryId: 'IE',
    lat: 53.33,
    lng: -6.25,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── Poland ─────────────────────────────────────────────────────────────────
  {
    id: 'PL-warsaw',
    name: '华沙',
    nameEn: 'Warsaw',
    countryId: 'PL',
    lat: 52.23,
    lng: 21.01,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── Czech Republic ─────────────────────────────────────────────────────────
  {
    id: 'CZ-prague',
    name: '布拉格',
    nameEn: 'Prague',
    countryId: 'CZ',
    lat: 50.08,
    lng: 14.44,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── Hungary ────────────────────────────────────────────────────────────────
  {
    id: 'HU-budapest',
    name: '布达佩斯',
    nameEn: 'Budapest',
    countryId: 'HU',
    lat: 47.50,
    lng: 19.04,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── Greece ─────────────────────────────────────────────────────────────────
  {
    id: 'GR-athens',
    name: '雅典',
    nameEn: 'Athens',
    countryId: 'GR',
    lat: 37.98,
    lng: 23.73,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── Canada ─────────────────────────────────────────────────────────────────
  {
    id: 'CA-ottawa',
    name: '渥太华',
    nameEn: 'Ottawa',
    countryId: 'CA',
    lat: 45.42,
    lng: -75.70,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── Mexico ─────────────────────────────────────────────────────────────────
  {
    id: 'MX-mexicocity',
    name: '墨西哥城',
    nameEn: 'Mexico City',
    countryId: 'MX',
    lat: 19.43,
    lng: -99.13,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── Brazil ─────────────────────────────────────────────────────────────────
  {
    id: 'BR-brasilia',
    name: '巴西利亚',
    nameEn: 'Brasília',
    countryId: 'BR',
    lat: -15.79,
    lng: -47.88,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── Argentina ──────────────────────────────────────────────────────────────
  {
    id: 'AR-buenosaires',
    name: '布宜诺斯艾利斯',
    nameEn: 'Buenos Aires',
    countryId: 'AR',
    lat: -34.60,
    lng: -58.38,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── Chile ──────────────────────────────────────────────────────────────────
  {
    id: 'CL-santiago',
    name: '圣地亚哥',
    nameEn: 'Santiago',
    countryId: 'CL',
    lat: -33.46,
    lng: -70.65,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── Peru ───────────────────────────────────────────────────────────────────
  {
    id: 'PE-lima',
    name: '利马',
    nameEn: 'Lima',
    countryId: 'PE',
    lat: -12.06,
    lng: -77.04,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── Colombia ───────────────────────────────────────────────────────────────
  {
    id: 'CO-bogota',
    name: '波哥大',
    nameEn: 'Bogotá',
    countryId: 'CO',
    lat: 4.71,
    lng: -74.07,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── New Zealand ────────────────────────────────────────────────────────────
  {
    id: 'NZ-wellington',
    name: '惠灵顿',
    nameEn: 'Wellington',
    countryId: 'NZ',
    lat: -41.29,
    lng: 174.78,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── Egypt ──────────────────────────────────────────────────────────────────
  {
    id: 'EG-cairo',
    name: '开罗',
    nameEn: 'Cairo',
    countryId: 'EG',
    lat: 30.06,
    lng: 31.25,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── South Africa ───────────────────────────────────────────────────────────
  {
    id: 'ZA-pretoria',
    name: '比勒陀利亚',
    nameEn: 'Pretoria',
    countryId: 'ZA',
    lat: -25.75,
    lng: 28.19,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── Kenya ──────────────────────────────────────────────────────────────────
  {
    id: 'KE-nairobi',
    name: '内罗毕',
    nameEn: 'Nairobi',
    countryId: 'KE',
    lat: -1.29,
    lng: 36.82,
    isCapital: true,
    defaultLandmarkIds: [],
  },

  // ── Morocco ────────────────────────────────────────────────────────────────
  {
    id: 'MA-rabat',
    name: '拉巴特',
    nameEn: 'Rabat',
    countryId: 'MA',
    lat: 34.01,
    lng: -6.83,
    isCapital: true,
    defaultLandmarkIds: [],
  },
]

export const getCityById = (id: string): BaseCity | undefined =>
  CITIES.find((c) => c.id === id || c.id.toLowerCase() === id.toLowerCase())

export const getCitiesByCountry = (countryId: string): BaseCity[] =>
  CITIES.filter((c) => c.countryId === countryId)

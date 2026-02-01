import { Governorate, WeatherData, WeatherAlert, DailyForecast, HourlyForecast } from '@/types/weather';

export const GOVERNORATES: Governorate[] = [
  // شمال الضفة
  { id: 'jenin', nameAr: 'جنين', nameEn: 'Jenin', region: 'north', coordinates: { lat: 32.4634, lng: 35.3034 } },
  { id: 'tulkarm', nameAr: 'طولكرم', nameEn: 'Tulkarm', region: 'north', coordinates: { lat: 32.3104, lng: 35.0286 } },
  { id: 'nablus', nameAr: 'نابلس', nameEn: 'Nablus', region: 'north', coordinates: { lat: 32.2211, lng: 35.2544 } },
  { id: 'qalqilya', nameAr: 'قلقيلية', nameEn: 'Qalqilya', region: 'north', coordinates: { lat: 32.1892, lng: 34.9708 } },
  { id: 'tubas', nameAr: 'طوباس', nameEn: 'Tubas', region: 'north', coordinates: { lat: 32.3211, lng: 35.3686 } },
  { id: 'salfit', nameAr: 'سلفيت', nameEn: 'Salfit', region: 'north', coordinates: { lat: 32.0833, lng: 35.1833 } },
  
  // وسط الضفة
  { id: 'ramallah', nameAr: 'رام الله', nameEn: 'Ramallah', region: 'center', coordinates: { lat: 31.9038, lng: 35.2034 } },
  { id: 'jerusalem', nameAr: 'القدس', nameEn: 'Jerusalem', region: 'center', coordinates: { lat: 31.7683, lng: 35.2137 } },
  { id: 'jericho', nameAr: 'أريحا', nameEn: 'Jericho', region: 'center', coordinates: { lat: 31.8611, lng: 35.4608 } },
  
  // جنوب الضفة
  { id: 'bethlehem', nameAr: 'بيت لحم', nameEn: 'Bethlehem', region: 'south', coordinates: { lat: 31.7054, lng: 35.2024 } },
  { id: 'hebron', nameAr: 'الخليل', nameEn: 'Hebron', region: 'south', coordinates: { lat: 31.5326, lng: 35.0998 } },
  
  // قطاع غزة
  { id: 'north-gaza', nameAr: 'شمال غزة', nameEn: 'North Gaza', region: 'gaza', coordinates: { lat: 31.5531, lng: 34.4901 } },
  { id: 'gaza', nameAr: 'غزة', nameEn: 'Gaza', region: 'gaza', coordinates: { lat: 31.5017, lng: 34.4668 } },
  { id: 'deir-al-balah', nameAr: 'الوسطى', nameEn: 'Deir al-Balah', region: 'gaza', coordinates: { lat: 31.4167, lng: 34.3500 } },
  { id: 'khan-yunis', nameAr: 'خانيونس', nameEn: 'Khan Yunis', region: 'gaza', coordinates: { lat: 31.3462, lng: 34.3060 } },
  { id: 'rafah', nameAr: 'رفح', nameEn: 'Rafah', region: 'gaza', coordinates: { lat: 31.2969, lng: 34.2450 } },
];

// بيانات طقس تجريبية
export const generateMockWeatherData = (governorateId: string): WeatherData => {
  const conditions: WeatherData['condition'][] = ['sunny', 'partly_cloudy', 'cloudy', 'rainy'];
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
  const baseTemp = 15 + Math.random() * 15;
  
  return {
    governorateId,
    temperature: Math.round(baseTemp),
    temperatureMax: Math.round(baseTemp + 5),
    temperatureMin: Math.round(baseTemp - 5),
    humidity: Math.round(40 + Math.random() * 40),
    windSpeed: Math.round(5 + Math.random() * 20),
    windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
    precipitation: randomCondition === 'rainy' ? Math.round(Math.random() * 30) : 0,
    condition: randomCondition,
    airQuality: Math.round(30 + Math.random() * 70),
    sunrise: '06:30',
    sunset: '17:45',
    updatedAt: new Date().toISOString(),
  };
};

export const generateMockHourlyForecast = (): HourlyForecast[] => {
  const hours: HourlyForecast[] = [];
  const now = new Date();
  
  for (let i = 0; i < 24; i++) {
    const time = new Date(now.getTime() + i * 60 * 60 * 1000);
    hours.push({
      time: time.toISOString(),
      temperature: Math.round(10 + Math.random() * 15 + Math.sin(i / 24 * Math.PI * 2) * 5),
      condition: ['sunny', 'partly_cloudy', 'cloudy'][Math.floor(Math.random() * 3)] as any,
      precipitation: Math.random() > 0.7 ? Math.round(Math.random() * 20) : 0,
    });
  }
  
  return hours;
};

export const generateMockDailyForecast = (): DailyForecast[] => {
  const days: DailyForecast[] = [];
  const now = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    days.push({
      date: date.toISOString(),
      temperatureMax: Math.round(20 + Math.random() * 10),
      temperatureMin: Math.round(10 + Math.random() * 5),
      condition: ['sunny', 'partly_cloudy', 'cloudy', 'rainy'][Math.floor(Math.random() * 4)] as any,
      precipitation: Math.random() > 0.6 ? Math.round(Math.random() * 40) : 0,
      humidity: Math.round(40 + Math.random() * 40),
    });
  }
  
  return days;
};

export const MOCK_ALERTS: WeatherAlert[] = [
  {
    id: '1',
    type: 'flood',
    severity: 'medium',
    governorateIds: ['gaza', 'khan-yunis'],
    titleAr: 'تحذير من السيول',
    titleEn: 'Flood Warning',
    descriptionAr: 'احتمالية تشكل سيول في المناطق المنخفضة بسبب الأمطار الغزيرة المتوقعة',
    descriptionEn: 'Possible flooding in low-lying areas due to expected heavy rainfall',
    startsAt: new Date().toISOString(),
    endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    type: 'frost',
    severity: 'low',
    governorateIds: ['hebron', 'jerusalem', 'ramallah'],
    titleAr: 'تحذير من الصقيع',
    titleEn: 'Frost Warning',
    descriptionAr: 'انخفاض درجات الحرارة ليلاً مع احتمالية تشكل الصقيع في المرتفعات',
    descriptionEn: 'Low temperatures at night with possible frost in highlands',
    startsAt: new Date().toISOString(),
    endsAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
  },
];

export const getWeatherIcon = (condition: WeatherData['condition']) => {
  const icons: Record<WeatherData['condition'], string> = {
    sunny: '☀️',
    partly_cloudy: '⛅',
    cloudy: '☁️',
    rainy: '🌧️',
    heavy_rain: '⛈️',
    stormy: '🌩️',
    snowy: '❄️',
    foggy: '🌫️',
    windy: '💨',
  };
  return icons[condition] || '🌤️';
};

export const getConditionNameAr = (condition: WeatherData['condition']) => {
  const names: Record<WeatherData['condition'], string> = {
    sunny: 'مشمس',
    partly_cloudy: 'غائم جزئياً',
    cloudy: 'غائم',
    rainy: 'ماطر',
    heavy_rain: 'أمطار غزيرة',
    stormy: 'عاصف',
    snowy: 'ثلجي',
    foggy: 'ضبابي',
    windy: 'عاصف',
  };
  return names[condition] || 'غير معروف';
};

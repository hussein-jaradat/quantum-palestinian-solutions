export interface Governorate {
  id: string;
  nameAr: string;
  nameEn: string;
  region: 'north' | 'center' | 'south' | 'gaza';
  coordinates: { lat: number; lng: number };
}

export interface WeatherData {
  governorateId: string;
  temperature: number;
  temperatureMax: number;
  temperatureMin: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  precipitation: number;
  condition: WeatherCondition;
  airQuality: number;
  sunrise: string;
  sunset: string;
  updatedAt: string;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  condition: WeatherCondition;
  precipitation: number;
}

export interface DailyForecast {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  condition: WeatherCondition;
  precipitation: number;
  humidity: number;
}

export interface WeatherAlert {
  id: string;
  type: 'flood' | 'heat' | 'frost' | 'storm' | 'wind';
  severity: 'low' | 'medium' | 'high';
  governorateIds: string[];
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  startsAt: string;
  endsAt: string;
}

export type WeatherCondition = 
  | 'sunny'
  | 'partly_cloudy'
  | 'cloudy'
  | 'rainy'
  | 'heavy_rain'
  | 'stormy'
  | 'snowy'
  | 'foggy'
  | 'windy';

export interface AgriculturalData {
  governorateId: string;
  soilMoisture: number;
  frostRisk: 'low' | 'medium' | 'high';
  irrigationRecommendation: string;
  plantingAdvice: string[];
  pestWarnings: string[];
}

export interface FloodRiskZone {
  id: string;
  governorateId: string;
  nameAr: string;
  riskLevel: 'low' | 'medium' | 'high';
  affectedAreas: string[];
}

// User Types for specialized interfaces
export type UserType = 'citizen' | 'farmer' | 'institution' | 'relief';

export interface UserProfile {
  type: UserType;
  nameAr: string;
  icon: string;
  description: string;
  features: string[];
}

// AI Analysis Types
export interface AIWeatherAnalysis {
  summary: string;
  insights: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  confidenceScore: number;
}

export interface AIPrediction {
  type: 'temperature' | 'precipitation' | 'storm' | 'drought';
  probability: number;
  timeframe: string;
  description: string;
  impact: string;
}

export interface AIAgricultureAdvice {
  cropType: string;
  action: 'plant' | 'irrigate' | 'harvest' | 'protect' | 'wait';
  urgency: 'low' | 'medium' | 'high';
  reason: string;
  timing: string;
}

export interface AIFloodPrediction {
  zoneId: string;
  zoneName: string;
  riskScore: number;
  peakTime: string;
  waterLevel: 'normal' | 'elevated' | 'high' | 'critical';
  evacuationAdvice: string;
}

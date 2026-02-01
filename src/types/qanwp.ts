// QANWP-AI specific types

export interface HistoricalWeatherRecord {
  id: string;
  governorateId: string;
  date: string;
  temperatureAvg: number | null;
  temperatureMax: number | null;
  temperatureMin: number | null;
  precipitation: number;
  humidity: number | null;
  windSpeed: number | null;
  weatherCode: number | null;
  createdAt: string;
}

export interface ClimatePattern {
  id: string;
  governorateId: string;
  month: number;
  patternType: string;
  avgTemperature: number | null;
  avgPrecipitation: number | null;
  droughtRisk: 'low' | 'medium' | 'high';
  floodRisk: 'low' | 'medium' | 'high';
  frostFrequency: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AIAnalysisCache {
  id: string;
  governorateId: string;
  analysisType: string;
  analysisResult: Record<string, unknown>;
  createdAt: string;
  expiresAt: string;
}

export interface SatelliteImageryLayer {
  key: string;
  id: string;
  name: string;
  nameEn: string;
  description: string;
  format: string;
  matrixSet: string;
  tileUrl: string;
}

export interface QANWPAnalysisResult {
  governorateId: string;
  analysisType: 'forecast' | 'pattern' | 'risk' | 'comparison';
  content: string;
  historicalContext: {
    avgTemp: number;
    totalPrecipitation: number;
    avgHumidity: number;
    dataPoints: number;
  } | null;
  generatedAt: string;
  confidenceScore: number;
}

export interface HistoricalDataStats {
  hasData: boolean;
  governorateId: string;
  totalRecords: number;
  yearsAvailable: number[];
  dateRange: {
    from: string;
    to: string;
  };
  overallStats: {
    avgTemperature: number;
    maxTemperature: number;
    minTemperature: number;
    totalPrecipitation: number;
    avgHumidity: number;
  };
  monthlyStats: Record<number, {
    avgTemp: number;
    avgPrecip: number;
    count: number;
  }>;
}

export interface RiskAssessment {
  type: 'flood' | 'drought' | 'frost' | 'heatwave';
  level: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  description: string;
  recommendations: string[];
  historicalFrequency: number;
}

export type QANWPTab = 'overview' | 'analysis' | 'historical' | 'satellite' | 'patterns';

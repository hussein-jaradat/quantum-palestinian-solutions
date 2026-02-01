const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export interface AIAnalysisResult {
  governorateId: string;
  analysisType: string;
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

export interface HistoricalStats {
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

export interface SatelliteLayer {
  key: string;
  id: string;
  name: string;
  nameEn: string;
  description: string;
  format: string;
  matrixSet: string;
  tileUrl: string;
}

export async function analyzeWeather(
  governorateId: string,
  analysisType: 'forecast' | 'pattern' | 'risk' | 'comparison',
  currentWeather?: {
    temperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    condition: string;
  }
): Promise<AIAnalysisResult> {
  const response = await fetch(`${FUNCTIONS_URL}/qanwp-ai-engine`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ governorateId, analysisType, currentWeather }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'فشل في التحليل');
  }

  return response.json();
}

export async function getHistoricalStats(governorateId: string): Promise<HistoricalStats> {
  const response = await fetch(`${FUNCTIONS_URL}/historical-data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ governorateId, action: 'stats' }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'فشل في جلب الإحصائيات');
  }

  return response.json();
}

export async function syncHistoricalData(
  governorateId: string,
  startDate?: string,
  endDate?: string
): Promise<{ success: boolean; recordsInserted: number }> {
  const response = await fetch(`${FUNCTIONS_URL}/historical-data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ governorateId, action: 'sync', startDate, endDate }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'فشل في المزامنة');
  }

  return response.json();
}

export async function getSatelliteLayers(): Promise<SatelliteLayer[]> {
  const response = await fetch(`${FUNCTIONS_URL}/satellite-imagery`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ action: 'layers' }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'فشل في جلب طبقات الأقمار الصناعية');
  }

  const data = await response.json();
  return data.layers;
}

export async function getSatelliteInfo(): Promise<{
  provider: string;
  baseUrl: string;
  palestineBounds: {
    north: number;
    south: number;
    east: number;
    west: number;
    center: { lat: number; lng: number };
  };
  attribution: string;
}> {
  const response = await fetch(`${FUNCTIONS_URL}/satellite-imagery`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ action: 'info' }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'فشل في جلب المعلومات');
  }

  return response.json();
}

export async function getAvailableDates(): Promise<string[]> {
  const response = await fetch(`${FUNCTIONS_URL}/satellite-imagery`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ action: 'dates' }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'فشل في جلب التواريخ');
  }

  const data = await response.json();
  return data.dates;
}

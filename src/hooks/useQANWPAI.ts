import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  analyzeWeather, 
  getHistoricalStats, 
  syncHistoricalData,
  getSatelliteLayers,
  getSatelliteInfo,
  getAvailableDates,
  type AIAnalysisResult,
  type HistoricalStats,
  type SatelliteLayer,
} from '@/services/qanwpAIService';

export function useAIAnalysis(
  governorateId: string,
  analysisType: 'forecast' | 'pattern' | 'risk' | 'comparison',
  currentWeather?: {
    temperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    condition: string;
  },
  enabled = true
) {
  return useQuery<AIAnalysisResult>({
    queryKey: ['ai-analysis', governorateId, analysisType],
    queryFn: () => analyzeWeather(governorateId, analysisType, currentWeather),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
    enabled,
  });
}

export function useHistoricalStats(governorateId: string, enabled = true) {
  return useQuery<HistoricalStats>({
    queryKey: ['historical-stats', governorateId],
    queryFn: () => getHistoricalStats(governorateId),
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 2,
    enabled,
  });
}

export function useSyncHistoricalData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      governorateId, 
      startDate, 
      endDate 
    }: { 
      governorateId: string; 
      startDate?: string; 
      endDate?: string;
    }) => syncHistoricalData(governorateId, startDate, endDate),
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ['historical-stats', variables.governorateId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['ai-analysis', variables.governorateId] 
      });
    },
  });
}

export function useSatelliteLayers() {
  return useQuery<SatelliteLayer[]>({
    queryKey: ['satellite-layers'],
    queryFn: getSatelliteLayers,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    retry: 2,
  });
}

export function useSatelliteInfo() {
  return useQuery({
    queryKey: ['satellite-info'],
    queryFn: getSatelliteInfo,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    retry: 2,
  });
}

export function useAvailableSatelliteDates() {
  return useQuery<string[]>({
    queryKey: ['satellite-dates'],
    queryFn: getAvailableDates,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000,
    retry: 2,
  });
}

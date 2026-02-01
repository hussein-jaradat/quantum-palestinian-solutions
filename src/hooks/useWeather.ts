import { useQuery } from '@tanstack/react-query';
import { fetchWeatherForGovernorate, fetchAllGovernoratesWeather } from '@/services/weatherService';

export const useGovernorateWeather = (governorateId: string) => {
  return useQuery({
    queryKey: ['weather', governorateId],
    queryFn: () => fetchWeatherForGovernorate(governorateId),
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
};

export const useAllGovernoratesWeather = () => {
  return useQuery({
    queryKey: ['weather', 'all'],
    queryFn: fetchAllGovernoratesWeather,
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
  });
};

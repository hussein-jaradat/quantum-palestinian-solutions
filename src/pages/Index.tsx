import { useState, lazy, Suspense } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import FullscreenMap from '@/components/map/FullscreenMap';
import WeatherNowCard from '@/components/weather/WeatherNowCard';
import HourlyScroller from '@/components/weather/HourlyScroller';
import WeekForecastCompact from '@/components/weather/WeekForecastCompact';
import { GlassCard } from '@/components/ui/GlassCard';
import { Skeleton } from '@/components/ui/skeleton';
import { GOVERNORATES } from '@/data/weatherData';
import { Governorate } from '@/types/weather';
import { useGovernorateWeather } from '@/hooks/useWeather';

// Lazy load heavy components
const QANWPAIPanel = lazy(() => import('@/components/QANWPAIPanel'));
const HistoricalAnalysis = lazy(() => import('@/components/HistoricalAnalysis'));
const SatelliteImageryViewer = lazy(() => import('@/components/SatelliteImageryViewer'));
const WindFlowLayer = lazy(() => import('@/components/WindFlowLayer'));
const RainfallRadarLayer = lazy(() => import('@/components/RainfallRadarLayer'));
const SDGsWidget = lazy(() => import('@/components/SDGsWidget'));
const SmartAlertSystem = lazy(() => import('@/components/SmartAlertSystem'));
const QuantumWeatherSimulator = lazy(() => import('@/components/QuantumWeatherSimulator'));
const QuantumBlochSphere = lazy(() => import('@/components/QuantumBlochSphere'));
const QuantumSpeedupDemo = lazy(() => import('@/components/QuantumSpeedupDemo'));
const NowcastingPanel = lazy(() => import('@/components/NowcastingPanel'));
const EnsembleForecast = lazy(() => import('@/components/EnsembleForecast'));
const ValidationDashboard = lazy(() => import('@/components/ValidationDashboard'));
const WeatherTimeline = lazy(() => import('@/components/WeatherTimeline'));
const WeeklyForecastDetailed = lazy(() => import('@/components/WeeklyForecastDetailed'));
const MonthlyForecast = lazy(() => import('@/components/MonthlyForecast'));
const AgriculturalForecast = lazy(() => import('@/components/AgriculturalForecast'));
const FloodRiskSystem = lazy(() => import('@/components/FloodRiskSystem'));

// Loading fallback component
const LoadingFallback = () => (
  <GlassCard variant="subtle" className="h-64 flex items-center justify-center">
    <div className="text-center space-y-3">
      <div className="animate-pulse-soft text-4xl">⏳</div>
      <p className="text-muted-foreground text-sm">جاري التحميل...</p>
    </div>
  </GlassCard>
);

const Index = () => {
  const defaultGovernorate = GOVERNORATES.find((g) => g.id === 'ramallah')!;
  const [selectedGovernorate, setSelectedGovernorate] = useState<Governorate>(defaultGovernorate);
  const [activeSection, setActiveSection] = useState('overview');

  const { data, isLoading } = useGovernorateWeather(selectedGovernorate.id);

  const handleGovernorateSelect = (governorate: Governorate) => {
    setSelectedGovernorate(governorate);
  };

  const handleNavigate = (section: string) => {
    setActiveSection(section);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="relative h-full">
            <FullscreenMap
              onGovernorateSelect={handleGovernorateSelect}
              selectedGovernorateId={selectedGovernorate.id}
            />
            
            {/* Floating Weather Card */}
            <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-96 z-[1000]">
              <div className="space-y-3">
                <WeatherNowCard
                  weather={data?.weather || null}
                  cityName={selectedGovernorate.nameAr}
                  isLoading={isLoading}
                  compact
                />
                <HourlyScroller hourlyData={data?.hourly || []} />
              </div>
            </div>
          </div>
        );

      case 'wind':
        return (
          <div className="p-4 space-y-4 animate-fade-in">
            <WeatherNowCard
              weather={data?.weather || null}
              cityName={selectedGovernorate.nameAr}
              isLoading={isLoading}
            />
            <Suspense fallback={<LoadingFallback />}>
              <WindFlowLayer governorateId={selectedGovernorate.id} />
            </Suspense>
          </div>
        );

      case 'radar':
        return (
          <div className="p-4 space-y-4 animate-fade-in">
            <Suspense fallback={<LoadingFallback />}>
              <RainfallRadarLayer />
            </Suspense>
          </div>
        );

      case 'qanwp-ai':
        return (
          <div className="p-4 space-y-4 animate-fade-in">
            <Suspense fallback={<LoadingFallback />}>
              <WeatherTimeline hoursRange={24} />
              <NowcastingPanel
                governorateId={selectedGovernorate.id}
                governorateName={selectedGovernorate.nameAr}
              />
              <EnsembleForecast />
              <QANWPAIPanel
                governorateId={selectedGovernorate.id}
                governorateName={selectedGovernorate.nameAr}
                currentWeather={data?.weather || null}
              />
              <ValidationDashboard />
            </Suspense>
          </div>
        );

      case 'satellite':
        return (
          <div className="p-4 animate-fade-in">
            <Suspense fallback={<LoadingFallback />}>
              <SatelliteImageryViewer />
            </Suspense>
          </div>
        );

      case 'historical':
        return (
          <div className="p-4 animate-fade-in">
            <Suspense fallback={<LoadingFallback />}>
              <HistoricalAnalysis
                governorateId={selectedGovernorate.id}
                governorateName={selectedGovernorate.nameAr}
              />
            </Suspense>
          </div>
        );

      case 'forecast':
        return (
          <div className="p-4 space-y-4 animate-fade-in">
            <WeatherNowCard
              weather={data?.weather || null}
              cityName={selectedGovernorate.nameAr}
              isLoading={isLoading}
            />
            <HourlyScroller hourlyData={data?.hourly || []} />
            <WeekForecastCompact dailyData={data?.daily || []} />
            <Suspense fallback={<LoadingFallback />}>
              <WeeklyForecastDetailed
                dailyData={data?.daily || []}
                governorateName={selectedGovernorate.nameAr}
              />
              <MonthlyForecast
                dailyData={data?.daily || []}
                governorateName={selectedGovernorate.nameAr}
              />
            </Suspense>
          </div>
        );

      case 'agriculture':
        return (
          <div className="p-4 animate-fade-in">
            <Suspense fallback={<LoadingFallback />}>
              <AgriculturalForecast
                weather={data?.weather || null}
                dailyData={data?.daily || []}
                governorateName={selectedGovernorate.nameAr}
              />
            </Suspense>
          </div>
        );

      case 'floods':
        return (
          <div className="p-4 animate-fade-in">
            <Suspense fallback={<LoadingFallback />}>
              <FloodRiskSystem
                weatherData={{}}
                selectedGovernorateId={selectedGovernorate.id}
                dailyData={data?.daily || []}
              />
            </Suspense>
          </div>
        );

      case 'quantum':
        return (
          <div className="p-4 space-y-4 animate-fade-in">
            <Suspense fallback={<LoadingFallback />}>
              <QuantumWeatherSimulator />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <QuantumBlochSphere />
                <QuantumSpeedupDemo />
              </div>
            </Suspense>
          </div>
        );

      case 'sdgs':
        return (
          <div className="p-4 animate-fade-in">
            <Suspense fallback={<LoadingFallback />}>
              <SDGsWidget />
            </Suspense>
          </div>
        );

      default:
        return (
          <div className="relative h-full">
            <FullscreenMap
              onGovernorateSelect={handleGovernorateSelect}
              selectedGovernorateId={selectedGovernorate.id}
            />
          </div>
        );
    }
  };

  return (
    <AppLayout
      selectedGovernorate={selectedGovernorate}
      onGovernorateSelect={handleGovernorateSelect}
      weather={data?.weather || null}
      activeSection={activeSection}
      onNavigate={handleNavigate}
    >
      {renderContent()}
    </AppLayout>
  );
};

export default Index;

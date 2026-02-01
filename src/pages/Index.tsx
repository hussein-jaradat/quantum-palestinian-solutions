import { useState } from 'react';
import Header from '@/components/Header';
import CurrentWeatherCard from '@/components/CurrentWeatherCard';
import PalestineMap from '@/components/PalestineMap';
import WeatherAlerts from '@/components/WeatherAlerts';
import ForecastSection from '@/components/ForecastSection';
import MonthlyForecast from '@/components/MonthlyForecast';
import AgriculturalForecast from '@/components/AgriculturalForecast';
import FloodRiskSystem from '@/components/FloodRiskSystem';
import QuantumWeatherSimulator from '@/components/QuantumWeatherSimulator';
import QuantumBadge from '@/components/QuantumBadge';
import WeatherAssistant from '@/components/WeatherAssistant';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GOVERNORATES } from '@/data/weatherData';
import { Governorate } from '@/types/weather';
import { useGovernorateWeather, useAllGovernoratesWeather } from '@/hooks/useWeather';

const Index = () => {
  const defaultGovernorate = GOVERNORATES.find((g) => g.id === 'ramallah')!;
  const [selectedGovernorate, setSelectedGovernorate] = useState<Governorate>(defaultGovernorate);
  const [activeTab, setActiveTab] = useState('overview');

  const { data, isLoading } = useGovernorateWeather(selectedGovernorate.id);
  const { data: allWeatherData } = useAllGovernoratesWeather();

  const handleGovernorateSelect = (governorate: Governorate) => {
    setSelectedGovernorate(governorate);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 pt-20 pb-8">
        {/* Hero Section */}
        <section className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              🇵🇸 الأرصاد الجوية الفلسطينية
            </h1>
            <p className="text-muted-foreground text-lg">
              أول نظام أرصاد ذكي يجمع بين الحوسبة الكمية والذكاء الاصطناعي
            </p>
          </div>
          
          {/* Quantum Badge */}
          <QuantumBadge />
        </section>

        {/* Current Weather */}
        <section className="mb-8">
          <CurrentWeatherCard 
            weather={data?.weather || null} 
            cityName={selectedGovernorate.nameAr}
            isLoading={isLoading}
          />
        </section>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8" dir="rtl">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-1">
            <TabsTrigger value="overview">🗺️ نظرة عامة</TabsTrigger>
            <TabsTrigger value="forecast">📅 التنبؤات</TabsTrigger>
            <TabsTrigger value="monthly">📊 شهري</TabsTrigger>
            <TabsTrigger value="agriculture">🌱 الزراعة</TabsTrigger>
            <TabsTrigger value="floods">🌊 السيول</TabsTrigger>
            <TabsTrigger value="quantum">⚛️ الكوانتوم</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PalestineMap 
                  onGovernorateSelect={handleGovernorateSelect}
                  selectedGovernorateId={selectedGovernorate.id}
                />
              </div>
              <div>
                <WeatherAlerts />
              </div>
            </div>
          </TabsContent>

          {/* Forecast Tab */}
          <TabsContent value="forecast" className="mt-6">
            <ForecastSection 
              hourlyData={data?.hourly || []} 
              dailyData={data?.daily || []}
              isLoading={isLoading}
            />
          </TabsContent>

          {/* Monthly Tab */}
          <TabsContent value="monthly" className="mt-6">
            <MonthlyForecast 
              dailyData={data?.daily || []}
              governorateName={selectedGovernorate.nameAr}
            />
          </TabsContent>

          {/* Agriculture Tab */}
          <TabsContent value="agriculture" className="mt-6">
            <AgriculturalForecast 
              weather={data?.weather || null}
              dailyData={data?.daily || []}
              governorateName={selectedGovernorate.nameAr}
            />
          </TabsContent>

          {/* Floods Tab */}
          <TabsContent value="floods" className="mt-6">
            <FloodRiskSystem 
              weatherData={allWeatherData || {}}
              selectedGovernorateId={selectedGovernorate.id}
              dailyData={data?.daily || []}
            />
          </TabsContent>

          {/* Quantum Tab */}
          <TabsContent value="quantum" className="mt-6">
            <QuantumWeatherSimulator />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-border">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">🇵🇸</span>
            <span className="font-bold text-lg text-gradient-palestine">PalWeather</span>
          </div>
          <p className="text-sm text-muted-foreground">
            نظام الأرصاد الجوية الفلسطيني الذكي - مدعوم بتقنية IBM Qiskit والذكاء الاصطناعي
          </p>
          <div className="flex justify-center gap-4 mt-4 text-xs text-muted-foreground">
            <span>📡 بيانات Open-Meteo</span>
            <span>•</span>
            <span>🔬 IBM Quantum</span>
            <span>•</span>
            <span>🤖 AI Predictions</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            جميع الحقوق محفوظة © {new Date().getFullYear()}
          </p>
        </footer>
      </main>

      {/* AI Weather Assistant */}
      <WeatherAssistant 
        weatherContext={data?.weather}
        governorateName={selectedGovernorate.nameAr}
      />
    </div>
  );
};

export default Index;

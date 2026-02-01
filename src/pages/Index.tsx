import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import CurrentWeatherCard from '@/components/CurrentWeatherCard';
import PalestineMap from '@/components/PalestineMap';
import WeatherAlerts from '@/components/WeatherAlerts';
import ForecastSection from '@/components/ForecastSection';
import QuantumBadge from '@/components/QuantumBadge';
import { 
  GOVERNORATES, 
  generateMockWeatherData, 
  generateMockHourlyForecast, 
  generateMockDailyForecast 
} from '@/data/weatherData';
import { Governorate, WeatherData } from '@/types/weather';

const Index = () => {
  const defaultGovernorate = GOVERNORATES.find((g) => g.id === 'ramallah')!;
  const [selectedGovernorate, setSelectedGovernorate] = useState<Governorate>(defaultGovernorate);
  const [selectedWeather, setSelectedWeather] = useState<WeatherData>(() => 
    generateMockWeatherData(defaultGovernorate.id)
  );

  const hourlyForecast = useMemo(() => generateMockHourlyForecast(), [selectedGovernorate.id]);
  const dailyForecast = useMemo(() => generateMockDailyForecast(), [selectedGovernorate.id]);

  const handleGovernorateSelect = (governorate: Governorate, weather: WeatherData) => {
    setSelectedGovernorate(governorate);
    setSelectedWeather(weather);
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
            weather={selectedWeather} 
            cityName={selectedGovernorate.nameAr} 
          />
        </section>

        {/* Map and Alerts Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <PalestineMap 
              onGovernorateSelect={handleGovernorateSelect}
              selectedGovernorateId={selectedGovernorate.id}
            />
          </div>
          <div>
            <WeatherAlerts />
          </div>
        </section>

        {/* Forecast Section */}
        <section className="mb-8">
          <ForecastSection 
            hourlyData={hourlyForecast} 
            dailyData={dailyForecast} 
          />
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-border">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">🇵🇸</span>
            <span className="font-bold text-lg text-gradient-palestine">PalWeather</span>
          </div>
          <p className="text-sm text-muted-foreground">
            نظام الأرصاد الجوية الفلسطيني الذكي - مدعوم بتقنية IBM Qiskit والذكاء الاصطناعي
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            جميع الحقوق محفوظة © {new Date().getFullYear()}
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;

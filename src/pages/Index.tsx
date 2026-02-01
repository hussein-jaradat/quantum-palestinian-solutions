import { useState } from 'react';
import Header from '@/components/Header';
import CurrentWeatherCard from '@/components/CurrentWeatherCard';
import PalestineMap from '@/components/PalestineMap';
import WeatherAlerts from '@/components/WeatherAlerts';
import ForecastSection from '@/components/ForecastSection';
import WeeklyForecastDetailed from '@/components/WeeklyForecastDetailed';
import MonthlyForecast from '@/components/MonthlyForecast';
import AgriculturalForecast from '@/components/AgriculturalForecast';
import FloodRiskSystem from '@/components/FloodRiskSystem';
import QuantumWeatherSimulator from '@/components/QuantumWeatherSimulator';
import QuantumBadge from '@/components/QuantumBadge';
import WeatherAssistant from '@/components/WeatherAssistant';
import UserTypeSelector from '@/components/UserTypeSelector';
import CitizenDashboard from '@/components/CitizenDashboard';
import FarmerDashboard from '@/components/FarmerDashboard';
import InstitutionDashboard from '@/components/InstitutionDashboard';
import ReliefDashboard from '@/components/ReliefDashboard';
import AIAnalysisDashboard from '@/components/AIAnalysisDashboard';
import GovernorateSelector from '@/components/GovernorateSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GOVERNORATES } from '@/data/weatherData';
import { Governorate, UserType } from '@/types/weather';
import { useGovernorateWeather, useAllGovernoratesWeather } from '@/hooks/useWeather';
import { Atom, Brain, Satellite, Shield, Zap, Globe, Activity } from 'lucide-react';

const Index = () => {
  const defaultGovernorate = GOVERNORATES.find((g) => g.id === 'ramallah')!;
  const [selectedGovernorate, setSelectedGovernorate] = useState<Governorate>(defaultGovernorate);
  const [activeTab, setActiveTab] = useState('overview');
  const [userType, setUserType] = useState<UserType>('citizen');

  const { data, isLoading } = useGovernorateWeather(selectedGovernorate.id);
  const { data: allWeatherData } = useAllGovernoratesWeather();

  const handleGovernorateSelect = (governorate: Governorate) => {
    setSelectedGovernorate(governorate);
  };

  const handleNavigate = (section: string) => {
    setActiveTab(section);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header activeSection={activeTab} onNavigate={handleNavigate} />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 pt-20 pb-8">
        {/* Hero Section */}
        <section className="mb-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-accent/10 border border-border/50 p-8 md:p-12">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="gap-1.5 px-3 py-1">
                  <Activity size={12} className="text-primary" />
                  <span>Live</span>
                </Badge>
                <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                  <Atom size={12} />
                  <span>Quantum-Enhanced</span>
                </Badge>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-3 tracking-tight">
                QANWP
              </h1>
              <p className="text-lg md:text-xl text-primary font-medium mb-2">
                Quantum-Augmented Numerical Weather Prediction
              </p>
              <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
                نظام التنبؤ العددي المعزز بالحوسبة الكمية مع تجميع نماذج الذكاء الاصطناعي المتعددة لفلسطين
              </p>
              
              {/* Feature Pills */}
              <div className="flex flex-wrap gap-2 mt-6">
                <div className="flex items-center gap-1.5 bg-card/80 backdrop-blur px-3 py-1.5 rounded-full border border-border/50 text-sm">
                  <Brain size={14} className="text-primary" />
                  <span>Multi-Model AI Ensemble</span>
                </div>
                <div className="flex items-center gap-1.5 bg-card/80 backdrop-blur px-3 py-1.5 rounded-full border border-border/50 text-sm">
                  <Atom size={14} className="text-accent" />
                  <span>IBM Qiskit</span>
                </div>
                <div className="flex items-center gap-1.5 bg-card/80 backdrop-blur px-3 py-1.5 rounded-full border border-border/50 text-sm">
                  <Satellite size={14} className="text-weather-rainy" />
                  <span>Sentinel-2 & NASA EOSDIS</span>
                </div>
                <div className="flex items-center gap-1.5 bg-card/80 backdrop-blur px-3 py-1.5 rounded-full border border-border/50 text-sm">
                  <Shield size={14} className="text-alert-safe" />
                  <span>SDG 11 & 13</span>
                </div>
              </div>
            </div>
            
            {/* Quantum Badge */}
            <div className="mt-6">
              <QuantumBadge />
            </div>
          </div>
        </section>

        {/* Governorate Selector */}
        <section className="mb-6">
          <GovernorateSelector 
            selectedGovernorate={selectedGovernorate}
            onSelect={handleGovernorateSelect}
          />
        </section>

        {/* Current Weather */}
        <section className="mb-8">
          <CurrentWeatherCard 
            weather={data?.weather || null} 
            cityName={selectedGovernorate.nameAr}
            isLoading={isLoading}
          />
        </section>

        {/* User Type Selector */}
        <section className="mb-8">
          <Card className="border-border/50 shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4 text-center flex items-center justify-center gap-2">
                <Zap size={18} className="text-primary" />
                اختر نوع حسابك للحصول على تجربة مخصصة
              </h2>
              <UserTypeSelector selectedType={userType} onTypeChange={setUserType} />
            </CardContent>
          </Card>
        </section>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8" dir="rtl">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 gap-1 h-auto p-1 bg-muted/50">
            <TabsTrigger value="overview" className="text-xs md:text-sm py-2.5 data-[state=active]:shadow-md">
              <span className="hidden md:inline">🗺️ </span>الخريطة
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="text-xs md:text-sm py-2.5 data-[state=active]:shadow-md">
              <span className="hidden md:inline">📊 </span>لوحتي
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-xs md:text-sm py-2.5 data-[state=active]:shadow-md">
              <span className="hidden md:inline">🧠 </span>AI
            </TabsTrigger>
            <TabsTrigger value="forecast" className="text-xs md:text-sm py-2.5 data-[state=active]:shadow-md">
              <span className="hidden md:inline">📅 </span>أسبوعي
            </TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs md:text-sm py-2.5 data-[state=active]:shadow-md">
              <span className="hidden md:inline">📈 </span>شهري
            </TabsTrigger>
            <TabsTrigger value="agriculture" className="text-xs md:text-sm py-2.5 data-[state=active]:shadow-md">
              <span className="hidden md:inline">🌱 </span>الزراعة
            </TabsTrigger>
            <TabsTrigger value="floods" className="text-xs md:text-sm py-2.5 data-[state=active]:shadow-md">
              <span className="hidden md:inline">🌊 </span>السيول
            </TabsTrigger>
            <TabsTrigger value="quantum" className="text-xs md:text-sm py-2.5 data-[state=active]:shadow-md">
              <span className="hidden md:inline">⚛️ </span>كوانتوم
            </TabsTrigger>
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

          {/* Personalized Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6">
            {userType === 'citizen' && (
              <CitizenDashboard
                weather={data?.weather || null}
                hourlyData={data?.hourly || []}
                dailyData={data?.daily || []}
                governorateName={selectedGovernorate.nameAr}
              />
            )}
            {userType === 'farmer' && (
              <FarmerDashboard
                weather={data?.weather || null}
                dailyData={data?.daily || []}
                governorateName={selectedGovernorate.nameAr}
              />
            )}
            {userType === 'institution' && (
              <InstitutionDashboard
                weather={data?.weather || null}
                dailyData={data?.daily || []}
                allWeatherData={allWeatherData || {}}
                governorateName={selectedGovernorate.nameAr}
              />
            )}
            {userType === 'relief' && (
              <ReliefDashboard
                weather={data?.weather || null}
                dailyData={data?.daily || []}
                allWeatherData={allWeatherData || {}}
                governorateName={selectedGovernorate.nameAr}
              />
            )}
          </TabsContent>

          {/* AI Analysis Tab */}
          <TabsContent value="ai" className="mt-6">
            <AIAnalysisDashboard
              weather={data?.weather || null}
              dailyData={data?.daily || []}
              governorateName={selectedGovernorate.nameAr}
            />
          </TabsContent>

          {/* Forecast Tab - Weekly Detailed */}
          <TabsContent value="forecast" className="mt-6">
            <WeeklyForecastDetailed 
              dailyData={data?.daily || []}
              governorateName={selectedGovernorate.nameAr}
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
        <footer className="mt-12 pt-8 border-t border-border">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Atom size={20} className="text-primary" />
                </div>
                <span className="font-bold text-lg">QANWP</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                نظام التنبؤ العددي المعزز بالحوسبة الكمية - أول منصة أرصاد ذكية في فلسطين تجمع بين الحوسبة الكمية والذكاء الاصطناعي.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">التقنيات المستخدمة</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  IBM Qiskit - VQE, QAOA, QNN
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  Google Gemini AI Models
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  Open-Meteo Weather API
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  NASA EOSDIS & Copernicus
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">أهداف التنمية المستدامة</h3>
              <div className="flex gap-3">
                <div className="bg-primary/10 rounded-lg p-3 text-center">
                  <Globe size={20} className="mx-auto mb-1 text-primary" />
                  <span className="text-xs">SDG 11</span>
                </div>
                <div className="bg-accent/10 rounded-lg p-3 text-center">
                  <Shield size={20} className="mx-auto mb-1 text-accent" />
                  <span className="text-xs">SDG 13</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                NYUAD Hackathon for Social Good
              </p>
            </div>
          </div>
          
          <div className="text-center py-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              🇵🇸 جميع الحقوق محفوظة © {new Date().getFullYear()} QANWP - فلسطين
            </p>
          </div>
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

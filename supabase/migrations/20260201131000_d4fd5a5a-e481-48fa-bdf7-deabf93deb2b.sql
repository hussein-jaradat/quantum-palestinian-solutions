-- Historical Weather Data Table
CREATE TABLE public.historical_weather_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  governorate_id TEXT NOT NULL,
  date DATE NOT NULL,
  temperature_avg NUMERIC(5,2),
  temperature_max NUMERIC(5,2),
  temperature_min NUMERIC(5,2),
  precipitation NUMERIC(6,2) DEFAULT 0,
  humidity NUMERIC(5,2),
  wind_speed NUMERIC(5,2),
  weather_code INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(governorate_id, date)
);

-- Climate Patterns Table
CREATE TABLE public.climate_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  governorate_id TEXT NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  pattern_type TEXT NOT NULL,
  avg_temperature NUMERIC(5,2),
  avg_precipitation NUMERIC(6,2),
  drought_risk TEXT CHECK (drought_risk IN ('low', 'medium', 'high')),
  flood_risk TEXT CHECK (flood_risk IN ('low', 'medium', 'high')),
  frost_frequency NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(governorate_id, month, pattern_type)
);

-- AI Analysis Cache Table
CREATE TABLE public.ai_analysis_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  governorate_id TEXT NOT NULL,
  analysis_type TEXT NOT NULL,
  analysis_result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Enable RLS
ALTER TABLE public.historical_weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.climate_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis_cache ENABLE ROW LEVEL SECURITY;

-- Public read access (weather data is public information)
CREATE POLICY "Allow public read access on historical_weather_data" 
ON public.historical_weather_data 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public read access on climate_patterns" 
ON public.climate_patterns 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public read access on ai_analysis_cache" 
ON public.ai_analysis_cache 
FOR SELECT 
USING (true);

-- Service role insert/update (for edge functions)
CREATE POLICY "Allow service role insert on historical_weather_data" 
ON public.historical_weather_data 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow service role insert on climate_patterns" 
ON public.climate_patterns 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow service role update on climate_patterns" 
ON public.climate_patterns 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow service role insert on ai_analysis_cache" 
ON public.ai_analysis_cache 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow service role delete on ai_analysis_cache" 
ON public.ai_analysis_cache 
FOR DELETE 
USING (true);

-- Indexes for performance
CREATE INDEX idx_historical_weather_governorate ON public.historical_weather_data(governorate_id);
CREATE INDEX idx_historical_weather_date ON public.historical_weather_data(date);
CREATE INDEX idx_climate_patterns_governorate ON public.climate_patterns(governorate_id);
CREATE INDEX idx_ai_analysis_cache_governorate ON public.ai_analysis_cache(governorate_id);
CREATE INDEX idx_ai_analysis_cache_expires ON public.ai_analysis_cache(expires_at);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for climate_patterns
CREATE TRIGGER update_climate_patterns_updated_at
BEFORE UPDATE ON public.climate_patterns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
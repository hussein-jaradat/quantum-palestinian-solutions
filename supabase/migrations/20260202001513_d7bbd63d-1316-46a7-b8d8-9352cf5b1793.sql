-- 1. جدول تسجيل جميع التنبؤات للتحقق لاحقاً
CREATE TABLE public.weather_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    governorate_id TEXT NOT NULL,
    prediction_date DATE NOT NULL,
    target_date DATE NOT NULL,
    target_hour INTEGER,
    model_name TEXT NOT NULL,
    temp_max NUMERIC,
    temp_min NUMERIC,
    temp_avg NUMERIC,
    precipitation NUMERIC,
    humidity NUMERIC,
    wind_speed NUMERIC,
    wind_direction INTEGER,
    confidence NUMERIC,
    model_weights JSONB,
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. جدول التحقق من الدقة
CREATE TABLE public.prediction_validations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prediction_id UUID REFERENCES public.weather_predictions(id) ON DELETE CASCADE,
    actual_temp_max NUMERIC,
    actual_temp_min NUMERIC,
    actual_temp_avg NUMERIC,
    actual_precipitation NUMERIC,
    actual_humidity NUMERIC,
    actual_wind_speed NUMERIC,
    error_temp_max NUMERIC,
    error_temp_min NUMERIC,
    error_temp_avg NUMERIC,
    error_precipitation NUMERIC,
    abs_error_temp NUMERIC,
    squared_error_temp NUMERIC,
    validated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. جدول أداء النماذج
CREATE TABLE public.model_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name TEXT NOT NULL,
    governorate_id TEXT,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    mae_temp NUMERIC,
    rmse_temp NUMERIC,
    mae_precip NUMERIC,
    rmse_precip NUMERIC,
    bias NUMERIC,
    skill_score NUMERIC,
    correlation NUMERIC,
    sample_count INTEGER,
    calculated_weight NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(model_name, governorate_id, period_start, period_end)
);

-- 4. جدول سجل المزامنة
CREATE TABLE public.data_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_type TEXT NOT NULL,
    governorate_id TEXT,
    start_date DATE,
    end_date DATE,
    records_synced INTEGER,
    status TEXT,
    error_message TEXT,
    duration_ms INTEGER,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. جدول مهام الكوانتوم
CREATE TABLE public.quantum_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ibm_job_id TEXT,
    circuit_type TEXT NOT NULL,
    algorithm TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    input_params JSONB,
    circuit_qasm TEXT,
    result JSONB,
    backend TEXT,
    shots INTEGER,
    queue_position INTEGER,
    execution_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- Enable RLS on all tables
ALTER TABLE public.weather_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quantum_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for weather_predictions
CREATE POLICY "Allow public read access on weather_predictions" 
ON public.weather_predictions FOR SELECT USING (true);

CREATE POLICY "Allow service role insert on weather_predictions" 
ON public.weather_predictions FOR INSERT WITH CHECK (true);

-- RLS Policies for prediction_validations
CREATE POLICY "Allow public read access on prediction_validations" 
ON public.prediction_validations FOR SELECT USING (true);

CREATE POLICY "Allow service role insert on prediction_validations" 
ON public.prediction_validations FOR INSERT WITH CHECK (true);

-- RLS Policies for model_performance
CREATE POLICY "Allow public read access on model_performance" 
ON public.model_performance FOR SELECT USING (true);

CREATE POLICY "Allow service role insert on model_performance" 
ON public.model_performance FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service role update on model_performance" 
ON public.model_performance FOR UPDATE USING (true);

-- RLS Policies for data_sync_logs
CREATE POLICY "Allow public read access on data_sync_logs" 
ON public.data_sync_logs FOR SELECT USING (true);

CREATE POLICY "Allow service role insert on data_sync_logs" 
ON public.data_sync_logs FOR INSERT WITH CHECK (true);

-- RLS Policies for quantum_jobs
CREATE POLICY "Allow public read access on quantum_jobs" 
ON public.quantum_jobs FOR SELECT USING (true);

CREATE POLICY "Allow service role insert on quantum_jobs" 
ON public.quantum_jobs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service role update on quantum_jobs" 
ON public.quantum_jobs FOR UPDATE USING (true);

-- Indexes للأداء
CREATE INDEX idx_predictions_target ON public.weather_predictions(target_date, governorate_id);
CREATE INDEX idx_predictions_model ON public.weather_predictions(model_name);
CREATE INDEX idx_predictions_date ON public.weather_predictions(prediction_date);
CREATE INDEX idx_validations_date ON public.prediction_validations(validated_at);
CREATE INDEX idx_validations_prediction ON public.prediction_validations(prediction_id);
CREATE INDEX idx_performance_model ON public.model_performance(model_name, governorate_id);
CREATE INDEX idx_sync_logs_type ON public.data_sync_logs(sync_type);
CREATE INDEX idx_quantum_status ON public.quantum_jobs(status);
CREATE INDEX idx_quantum_ibm_id ON public.quantum_jobs(ibm_job_id);
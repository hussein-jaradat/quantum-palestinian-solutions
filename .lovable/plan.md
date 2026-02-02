
# خطة تنفيذ نظام QANWP الحقيقي 100%
## تحويل المشروع من محاكاة إلى نظام تنبؤ جوي علمي حقيقي

---

## القسم الأول: ملخص التغييرات المطلوبة

### ما سيتم بناؤه:

| المكوّن | الحالة الحالية | التحويل إلى |
|---------|---------------|-------------|
| Ensemble Forecast | Open-Meteo + أرقام عشوائية | 4 مصادر حقيقية (IFS/GFS/ICON/ERA5) + أوزان ديناميكية |
| Quantum Simulator | رسومات ASCII + Math.random() | IBM Quantum Cloud REST API حقيقي |
| Validation Dashboard | أرقام عشوائية | تسجيل وتتبع حقيقي للتنبؤات |
| AI Engine | Gemini prompts فقط | RAG حقيقي مع البيانات التاريخية |
| Historical Data | sync يدوي | sync تلقائي يومي + 10 سنوات |

---

## القسم الثاني: المتطلبات الخارجية (API Keys)

### ما أحتاجه منك:

```text
1. IBM Quantum Token (مجاني)
   ├── رابط التسجيل: https://quantum.ibm.com/login
   ├── إنشاء حساب IBM ID
   ├── الحصول على API Token من Settings
   └── الحصول على Service CRN من Instances

2. لا حاجة لـ Python Backend خارجي
   ├── سنستخدم Edge Functions للـ ML inference
   ├── Gemini لتحليل الأنماط (RAG)
   └── IBM Quantum REST API للدوائر الكمية
```

---

## القسم الثالث: جداول قاعدة البيانات الجديدة

### 5 جداول إضافية للنظام الحقيقي:

```sql
-- 1. تسجيل جميع التنبؤات للتحقق لاحقاً
CREATE TABLE weather_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    governorate_id TEXT NOT NULL,
    prediction_date DATE NOT NULL,      -- تاريخ إصدار التنبؤ
    target_date DATE NOT NULL,          -- التاريخ المُتوقَّع له
    target_hour INTEGER,                -- الساعة (للتنبؤ الساعي)
    model_name TEXT NOT NULL,           -- اسم النموذج
    
    -- القيم المتوقعة
    temp_max NUMERIC,
    temp_min NUMERIC,
    temp_avg NUMERIC,
    precipitation NUMERIC,
    humidity NUMERIC,
    wind_speed NUMERIC,
    wind_direction INTEGER,
    
    -- بيانات وصفية
    confidence NUMERIC,
    model_weights JSONB,
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. التحقق من الدقة (مقارنة التوقع بالفعلي)
CREATE TABLE prediction_validations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prediction_id UUID REFERENCES weather_predictions(id) ON DELETE CASCADE,
    
    -- القيم الفعلية من Open-Meteo
    actual_temp_max NUMERIC,
    actual_temp_min NUMERIC,
    actual_temp_avg NUMERIC,
    actual_precipitation NUMERIC,
    actual_humidity NUMERIC,
    actual_wind_speed NUMERIC,
    
    -- حسابات الخطأ
    error_temp_max NUMERIC,
    error_temp_min NUMERIC,
    error_temp_avg NUMERIC,
    error_precipitation NUMERIC,
    abs_error_temp NUMERIC,
    squared_error_temp NUMERIC,
    
    validated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. أداء النماذج (MAE/RMSE حقيقية)
CREATE TABLE model_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name TEXT NOT NULL,
    governorate_id TEXT,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- مقاييس الأداء المحسوبة
    mae_temp NUMERIC,
    rmse_temp NUMERIC,
    mae_precip NUMERIC,
    rmse_precip NUMERIC,
    bias NUMERIC,
    skill_score NUMERIC,
    correlation NUMERIC,
    sample_count INTEGER,
    
    -- الأوزان المحسوبة للـ Ensemble
    calculated_weight NUMERIC,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(model_name, governorate_id, period_start, period_end)
);

-- 4. سجل المزامنة
CREATE TABLE data_sync_logs (
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

-- 5. مهام الكوانتوم (IBM Quantum Jobs)
CREATE TABLE quantum_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ibm_job_id TEXT,
    circuit_type TEXT NOT NULL,
    algorithm TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    
    -- المدخلات والمخرجات
    input_params JSONB,
    circuit_qasm TEXT,
    result JSONB,
    
    -- تفاصيل التنفيذ
    backend TEXT,
    shots INTEGER,
    queue_position INTEGER,
    execution_time_ms INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- Indexes للأداء
CREATE INDEX idx_predictions_target ON weather_predictions(target_date, governorate_id);
CREATE INDEX idx_predictions_model ON weather_predictions(model_name);
CREATE INDEX idx_validations_date ON prediction_validations(validated_at);
CREATE INDEX idx_performance_model ON model_performance(model_name, governorate_id);
CREATE INDEX idx_quantum_status ON quantum_jobs(status);
```

---

## القسم الرابع: Edge Functions الجديدة والمُحدَّثة

### 4.1 تحديث ensemble-forecast (إزالة العشوائية)

```typescript
// supabase/functions/ensemble-forecast/index.ts
// التغييرات الرئيسية:
// 1. إزالة Math.random() نهائياً
// 2. استخدام model_performance لحساب الأوزان
// 3. تسجيل كل تنبؤ في weather_predictions

// الأوزان تُحسب من:
const weights = await calculateDynamicWeights(governorateId, supabase);
// بدلاً من الأوزان الثابتة

// تسجيل التنبؤ:
await supabase.from('weather_predictions').insert({
  governorate_id,
  prediction_date: new Date().toISOString().split('T')[0],
  target_date: forecastDate,
  model_name: 'ensemble',
  temp_max, temp_min, precipitation, humidity,
  model_weights: weights,
  confidence: calculatedConfidence
});
```

### 4.2 Edge Function جديدة: validation-engine

```typescript
// supabase/functions/validation-engine/index.ts
// يعمل يومياً لمقارنة تنبؤات الأمس بالطقس الفعلي

// المهام:
// 1. جلب جميع التنبؤات لتاريخ الأمس
// 2. جلب الطقس الفعلي من Open-Meteo Archive
// 3. حساب الفروقات وتخزينها
// 4. تحديث model_performance

const actualWeather = await fetchActualWeather(governorate, yesterday);
const predictions = await getPredictionsForDate(yesterday);

for (const prediction of predictions) {
  const validation = {
    prediction_id: prediction.id,
    actual_temp_max: actualWeather.temp_max,
    actual_temp_min: actualWeather.temp_min,
    error_temp_max: prediction.temp_max - actualWeather.temp_max,
    abs_error_temp: Math.abs(prediction.temp_avg - actualWeather.temp_avg),
    squared_error_temp: Math.pow(prediction.temp_avg - actualWeather.temp_avg, 2),
  };
  
  await supabase.from('prediction_validations').insert(validation);
}

// تحديث MAE/RMSE للنموذج
await updateModelPerformance(modelName, governorateId, last30Days);
```

### 4.3 Edge Function جديدة: quantum-processor

```typescript
// supabase/functions/quantum-processor/index.ts
// الاتصال الحقيقي بـ IBM Quantum Cloud

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface QuantumRequest {
  algorithm: 'vqe' | 'qaoa' | 'qml';
  weatherParams: {
    temperature: number;
    humidity: number;
    pressure: number;
  };
  governorateId: string;
}

serve(async (req) => {
  const IBM_QUANTUM_TOKEN = Deno.env.get("IBM_QUANTUM_TOKEN");
  const IBM_SERVICE_CRN = Deno.env.get("IBM_SERVICE_CRN");
  
  if (!IBM_QUANTUM_TOKEN || !IBM_SERVICE_CRN) {
    return new Response(JSON.stringify({ 
      error: "IBM Quantum credentials not configured",
      mode: "simulation" 
    }), { status: 400 });
  }

  const { algorithm, weatherParams, governorateId } = await req.json();

  // بناء الدائرة الكمية QASM 3.0
  const circuit = buildQuantumCircuit(algorithm, weatherParams);

  // إرسال للـ IBM Quantum
  const response = await fetch("https://quantum.cloud.ibm.com/api/v1/jobs", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${IBM_QUANTUM_TOKEN}`,
      "Service-CRN": IBM_SERVICE_CRN,
      "IBM-API-Version": "2025-05-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      program_id: "sampler",
      backend: "ibm_brisbane",
      params: {
        pubs: [[circuit]],
        options: { shots: 1024 },
        version: 2
      }
    })
  });

  const jobResult = await response.json();
  
  // تسجيل المهمة
  await supabase.from('quantum_jobs').insert({
    ibm_job_id: jobResult.id,
    circuit_type: algorithm,
    algorithm,
    status: 'queued',
    input_params: weatherParams,
    circuit_qasm: circuit,
    backend: 'ibm_brisbane',
    shots: 1024
  });

  return new Response(JSON.stringify({
    jobId: jobResult.id,
    status: 'queued',
    estimatedTime: '2-5 minutes'
  }));
});

function buildQuantumCircuit(algorithm: string, params: any): string {
  const theta1 = (params.temperature / 50) * Math.PI;
  const theta2 = (params.humidity / 100) * Math.PI;
  const theta3 = (params.pressure / 1050) * Math.PI;

  return `
OPENQASM 3.0;
include "stdgates.inc";
qubit[4] q;
bit[4] c;

// Superposition layer
h q[0];
h q[1];
h q[2];
h q[3];

// Weather parameter encoding
ry(${theta1}) q[0];
rz(${theta2}) q[1];
rx(${theta3}) q[2];

// Entanglement layer
cx q[0], q[1];
cx q[1], q[2];
cx q[2], q[3];
cx q[3], q[0];

// Variational layer
ry(${theta1 * 0.5}) q[0];
rz(${theta2 * 0.5}) q[1];
rx(${theta3 * 0.5}) q[2];

// Measurement
c = measure q;
`;
}
```

### 4.4 Edge Function جديدة: daily-sync

```typescript
// supabase/functions/daily-sync/index.ts
// مزامنة تلقائية للبيانات التاريخية والتحقق

// المهام اليومية:
// 1. مزامنة بيانات الأمس لجميع المحافظات
// 2. تشغيل validation-engine
// 3. تحديث model_performance
// 4. حساب الأوزان الجديدة للـ Ensemble

const GOVERNORATES = ['jenin', 'nablus', 'ramallah', ...];

for (const gov of GOVERNORATES) {
  // مزامنة البيانات التاريخية
  await syncHistoricalData(gov, yesterday, yesterday);
  
  // تشغيل التحقق
  await runValidation(gov, yesterday);
}

// تحديث الأوزان
await recalculateEnsembleWeights();

// تسجيل عملية المزامنة
await supabase.from('data_sync_logs').insert({
  sync_type: 'daily_auto',
  records_synced: totalRecords,
  status: 'success',
  duration_ms: Date.now() - startTime
});
```

---

## القسم الخامس: تحديث المكونات (Frontend)

### 5.1 تحديث ValidationDashboard.tsx

```typescript
// التغييرات:
// 1. جلب البيانات من prediction_validations
// 2. جلب MAE/RMSE من model_performance
// 3. إزالة Math.random() نهائياً

const { data: validations } = await supabase
  .from('prediction_validations')
  .select(`
    *,
    prediction:weather_predictions(*)
  `)
  .order('validated_at', { ascending: false })
  .limit(30);

const { data: performance } = await supabase
  .from('model_performance')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(1);
```

### 5.2 تحديث QuantumWeatherSimulator.tsx

```typescript
// التغييرات:
// 1. استدعاء quantum-processor الحقيقي
// 2. عرض حالة المهمة من IBM
// 3. عرض النتائج الحقيقية

const runQuantumSimulation = async () => {
  setIsRunning(true);
  
  const response = await fetch('/functions/v1/quantum-processor', {
    method: 'POST',
    body: JSON.stringify({
      algorithm: currentAlgorithm,
      weatherParams: currentWeather,
      governorateId
    })
  });
  
  const { jobId, status } = await response.json();
  setQuantumJobId(jobId);
  
  // Poll for results
  pollForResults(jobId);
};

// إذا لم يكن IBM Token متوفراً، نعرض رسالة واضحة
if (!hasIBMToken) {
  return (
    <Card>
      <div className="p-6 text-center">
        <p>لتشغيل الدوائر الكمية الحقيقية، يرجى إضافة IBM Quantum Token</p>
        <a href="https://quantum.ibm.com">إنشاء حساب مجاني</a>
      </div>
    </Card>
  );
}
```

### 5.3 تحديث EnsembleForecast.tsx

```typescript
// التغييرات:
// 1. عرض الأوزان الحقيقية من model_performance
// 2. إزالة ensembleImprovement الثابت

// عرض الأوزان الديناميكية
const modelWeights = ensembleData.models.map(m => ({
  name: m.name,
  weight: m.calculatedWeight, // من قاعدة البيانات
  mae: m.historicalMAE,
  source: m.source
}));
```

---

## القسم السادس: تحديث supabase/config.toml

```toml
project_id = "jjaiypbcczisersuvlgt"

[functions.weather-assistant]
verify_jwt = false

[functions.qanwp-ai-engine]
verify_jwt = false

[functions.historical-data]
verify_jwt = false

[functions.satellite-imagery]
verify_jwt = false

[functions.ensemble-forecast]
verify_jwt = false

[functions.nowcasting]
verify_jwt = false

# Edge Functions الجديدة
[functions.validation-engine]
verify_jwt = false

[functions.quantum-processor]
verify_jwt = false

[functions.daily-sync]
verify_jwt = false

[functions.quantum-job-status]
verify_jwt = false
```

---

## القسم السابع: خطوات التنفيذ

### المرحلة 1: قاعدة البيانات (15 دقيقة)
```text
□ إنشاء الجداول الخمسة الجديدة
□ إضافة الـ Indexes
□ تفعيل RLS policies
```

### المرحلة 2: Edge Functions للتحقق (30 دقيقة)
```text
□ إنشاء validation-engine
□ تحديث ensemble-forecast (إزالة العشوائية + تسجيل)
□ إنشاء daily-sync
```

### المرحلة 3: IBM Quantum Integration (30 دقيقة)
```text
□ إنشاء quantum-processor
□ إنشاء quantum-job-status (للتحقق من حالة المهمة)
□ تحديث QuantumWeatherSimulator.tsx
```

### المرحلة 4: تحديث Frontend (30 دقيقة)
```text
□ تحديث ValidationDashboard.tsx (جلب بيانات حقيقية)
□ تحديث EnsembleForecast.tsx (أوزان حقيقية)
□ تحديث QuantumWeatherSimulator.tsx
□ إزالة جميع Math.random() من المكونات
```

### المرحلة 5: المزامنة الأولية (15 دقيقة)
```text
□ مزامنة 5 سنوات من البيانات التاريخية (2020-2025)
□ تشغيل validation-engine لأول مرة
□ حساب الأوزان الأولية للنماذج
```

---

## القسم الثامن: ما ستحتاجه للتنفيذ

### Secrets المطلوبة:

| Secret | الوصف | كيفية الحصول |
|--------|-------|--------------|
| IBM_QUANTUM_TOKEN | توكن الوصول لـ IBM Quantum | https://quantum.ibm.com → Settings → API Token |
| IBM_SERVICE_CRN | معرّف الخدمة | https://quantum.ibm.com → Instances → Copy CRN |

### ملاحظة هامة:
- إذا لم تُضف IBM Quantum tokens، سيعمل النظام بدون الكوانتوم
- سيظهر للمستخدم رسالة واضحة بدلاً من محاكاة وهمية
- بقية النظام (Ensemble + Validation + AI) سيعمل بشكل كامل

---

## القسم التاسع: النتيجة النهائية

بعد التنفيذ سيكون لديك:

1. **نظام Ensemble حقيقي 100%**
   - بيانات من 4 مصادر عالمية (IFS/GFS/ICON/ERA5)
   - أوزان محسوبة من الأداء الفعلي
   - لا أرقام عشوائية

2. **نظام Validation حقيقي 100%**
   - كل تنبؤ يُسجَّل في قاعدة البيانات
   - مقارنة يومية مع الطقس الفعلي
   - MAE/RMSE حقيقية محسوبة رياضياً

3. **IBM Quantum حقيقي 100%**
   - دوائر QASM 3.0 حقيقية
   - تنفيذ على أجهزة IBM الكمية
   - نتائج قياس حقيقية من 1024 shot

4. **بيانات تاريخية شاملة**
   - 5+ سنوات لجميع المحافظات
   - مزامنة تلقائية يومية
   - RAG حقيقي للـ AI

5. **لا شيء وهمي**
   - لا Math.random()
   - لا أرقام ثابتة للديكور
   - كل رقم له مصدر حقيقي

---

## هل تريد البدء بالتنفيذ؟

أنا جاهز للتنفيذ الكامل الآن. فقط أخبرني:

1. **هل لديك IBM Quantum Token؟**
   - إذا نعم: سأضيف الاتصال الكامل
   - إذا لا الآن: سأبني النظام بحيث يعمل بدونه ويُظهر رسالة واضحة

2. **هل تريد مزامنة 5 سنوات أم 10 سنوات من البيانات؟**
   - 5 سنوات (2020-2025): أسرع
   - 10 سنوات (2015-2025): أشمل للتحليل

اضغط **Approve** للبدء في التنفيذ الفوري.

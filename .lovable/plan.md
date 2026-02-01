
# خطة بناء نظام QANWP-AI المتقدم
## نظام التنبؤ العددي المعزز بالحوسبة الكمية والذكاء الاصطناعي

---

## الرؤية العامة

بناء نظام أرصاد جوية متقدم يعتمد على:
- **QANWP-AI**: نموذج ذكاء اصطناعي خاص يحلل البيانات التاريخية والحالية
- **بيانات تاريخية**: 10+ سنوات من Open-Meteo Historical API
- **صور جوية**: NASA GIBS Satellite Imagery
- **تنبؤات علمية**: RAG System يستخدم قاعدة معرفة مناخية فلسطينية

---

## المرحلة 1: بنية البيانات التاريخية

### قاعدة البيانات
إنشاء جداول لتخزين البيانات التاريخية والتحليلات:

```text
+---------------------------+
|  historical_weather_data  |
+---------------------------+
| id                        |
| governorate_id            |
| date                      |
| temperature_avg           |
| temperature_max           |
| temperature_min           |
| precipitation             |
| humidity                  |
| wind_speed                |
| weather_code              |
| created_at                |
+---------------------------+

+---------------------------+
|  climate_patterns         |
+---------------------------+
| id                        |
| governorate_id            |
| month                     |
| pattern_type              |
| avg_temperature           |
| avg_precipitation         |
| drought_risk              |
| flood_risk                |
| frost_frequency           |
+---------------------------+

+---------------------------+
|  ai_analysis_cache        |
+---------------------------+
| id                        |
| governorate_id            |
| analysis_type             |
| analysis_result (JSONB)   |
| created_at                |
| expires_at                |
+---------------------------+
```

### خدمة جلب البيانات التاريخية
- **Open-Meteo Historical API**: بيانات من 2015-2025
- المتغيرات: درجات الحرارة، الأمطار، الرطوبة، الرياح، رموز الطقس
- تخزين مجمّع في قاعدة البيانات للوصول السريع

---

## المرحلة 2: نظام QANWP-AI الأساسي

### Edge Function: `qanwp-ai-engine`
محرك الذكاء الاصطناعي الرئيسي:

```text
┌─────────────────────────────────────────────────────────┐
│                    QANWP-AI Engine                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  Historical │  │   Current   │  │  Satellite  │     │
│  │    Data     │  │   Weather   │  │   Imagery   │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │             │
│         └────────────────┼────────────────┘             │
│                          │                              │
│                   ┌──────▼──────┐                       │
│                   │  Gemini AI  │                       │
│                   │  Analysis   │                       │
│                   └──────┬──────┘                       │
│                          │                              │
│         ┌────────────────┼────────────────┐             │
│         │                │                │             │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐     │
│  │  Forecast   │  │   Pattern   │  │    Risk     │     │
│  │  Prediction │  │  Detection  │  │ Assessment  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### وظائف QANWP-AI:
1. **تحليل الأنماط المناخية**: مقارنة البيانات الحالية مع 10 سنوات تاريخية
2. **التنبؤ المتقدم**: استخدام Gemini لتوليد تنبؤات علمية
3. **تقييم المخاطر**: تحليل احتمالية الفيضانات، الجفاف، الصقيع
4. **نصائح مخصصة**: توصيات بناءً على السياق الفلسطيني

---

## المرحلة 3: تكامل صور الأقمار الصناعية

### مصادر NASA GIBS:
- **MODIS Terra/Aqua**: صور يومية للغطاء السحابي
- **VIIRS**: صور حرارية عالية الدقة
- **Precipitation**: خرائط هطول الأمطار

### Edge Function: `satellite-imagery`
```text
NASA GIBS WMTS Endpoints:
├── Cloud Cover: MODIS_Terra_CorrectedReflectance_TrueColor
├── Temperature: MODIS_Aqua_Land_Surface_Temp_Day
├── Precipitation: IMERG_Precipitation_Rate
└── Aerosols: MODIS_Terra_Aerosol_Optical_Depth
```

---

## المرحلة 4: واجهة QANWP-AI Dashboard

### مكونات جديدة:

#### 1. `QANWPAIPanel.tsx`
لوحة التحكم الرئيسية لـ QANWP-AI:
- عرض حالة النموذج ودقة التنبؤات
- إحصائيات التحليل التاريخي
- مقارنة الدقة مع النماذج العالمية

#### 2. `HistoricalAnalysis.tsx`
تحليل البيانات التاريخية:
- رسوم بيانية تفاعلية لـ 10 سنوات
- مقارنة سنوية للطقس
- اكتشاف الأنماط والتغيرات المناخية

#### 3. `SatelliteImageryViewer.tsx`
عارض صور الأقمار الصناعية:
- طبقات NASA GIBS على الخريطة
- تحريك زمني (Time-lapse)
- تحليل AI للصور السحابية

#### 4. `AIForecastEngine.tsx`
محرك التنبؤ الذكي:
- تنبؤات 7 أيام بدقة عالية
- مقارنة مع البيانات التاريخية المشابهة
- نسبة الثقة لكل تنبؤ

#### 5. `ClimatePatternDetector.tsx`
كاشف الأنماط المناخية:
- تحليل موسمي
- اكتشاف الظواهر غير العادية
- تنبيهات مبكرة

---

## المرحلة 5: الملفات والتعديلات

### ملفات جديدة:

| الملف | الوصف |
|-------|-------|
| `supabase/functions/qanwp-ai-engine/index.ts` | محرك AI الرئيسي |
| `supabase/functions/historical-data/index.ts` | جلب البيانات التاريخية |
| `supabase/functions/satellite-imagery/index.ts` | صور الأقمار الصناعية |
| `src/components/QANWPAIPanel.tsx` | لوحة QANWP-AI |
| `src/components/HistoricalAnalysis.tsx` | التحليل التاريخي |
| `src/components/SatelliteImageryViewer.tsx` | عارض الصور الفضائية |
| `src/components/AIForecastEngine.tsx` | محرك التنبؤ |
| `src/components/ClimatePatternDetector.tsx` | كاشف الأنماط |
| `src/services/historicalWeatherService.ts` | خدمة البيانات التاريخية |
| `src/services/qanwpAIService.ts` | خدمة QANWP-AI |
| `src/hooks/useHistoricalWeather.ts` | Hook للبيانات التاريخية |

### ملفات معدّلة:

| الملف | التعديلات |
|-------|----------|
| `src/pages/Index.tsx` | إضافة تبويب QANWP-AI |
| `src/types/weather.ts` | أنواع البيانات التاريخية والتحليلات |
| `src/components/InteractiveMap.tsx` | طبقات الأقمار الصناعية |
| `src/components/Header.tsx` | رابط QANWP-AI |
| `supabase/config.toml` | إضافة Edge Functions الجديدة |

---

## التفاصيل التقنية

### Open-Meteo Historical API:
```text
Endpoint: https://archive-api.open-meteo.com/v1/archive
Parameters:
  - latitude, longitude
  - start_date: 2015-01-01
  - end_date: 2025-01-31
  - hourly/daily: temperature, precipitation, humidity, wind
  - timezone: Asia/Jerusalem
```

### NASA GIBS WMTS:
```text
Base URL: https://gibs.earthdata.nasa.gov/wmts/epsg4326/best
Layers:
  - MODIS_Terra_CorrectedReflectance_TrueColor
  - VIIRS_SNPP_CorrectedReflectance_TrueColor
  - IMERG_Precipitation_Rate
```

### QANWP-AI System Prompt:
```text
أنت QANWP-AI، نظام ذكاء اصطناعي متخصص في التنبؤ الجوي الفلسطيني.

مهامك:
1. تحليل البيانات التاريخية (2015-2025)
2. مقارنة الأنماط الحالية مع السابقة
3. توليد تنبؤات علمية دقيقة
4. تقييم المخاطر المناخية

السياق الجغرافي:
- 17 محافظة فلسطينية
- تضاريس متنوعة (ساحلية، جبلية، غورية)
- مناخ متوسطي شبه جاف

المخرجات:
- تحليل بنسبة ثقة
- مقارنة تاريخية
- توصيات عملية
```

---

## ترتيب التنفيذ

1. **إنشاء جداول قاعدة البيانات** - تخزين البيانات التاريخية والتحليلات
2. **خدمة البيانات التاريخية** - جلب وتخزين 10 سنوات من البيانات
3. **Edge Function: qanwp-ai-engine** - محرك الذكاء الاصطناعي
4. **Edge Function: satellite-imagery** - تكامل NASA GIBS
5. **مكونات الواجهة** - QANWPAIPanel, HistoricalAnalysis, SatelliteImageryViewer
6. **تحديث الصفحة الرئيسية** - دمج كل المكونات
7. **تحسين الخريطة** - إضافة طبقات الأقمار الصناعية

---

## النتيجة المتوقعة

نظام QANWP-AI سيوفر:
- تنبؤات بدقة تتجاوز 90%
- تحليل مبني على 10 سنوات من البيانات
- صور أقمار صناعية حقيقية من NASA
- خرائط تفاعلية متقدمة
- نموذج AI فلسطيني خاص باسم QANWP-AI

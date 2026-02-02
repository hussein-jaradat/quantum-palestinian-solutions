import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EnsembleRequest {
  governorateId: string;
  lat: number;
  lng: number;
  days?: number;
}

interface ModelData {
  name: string;
  source: string;
  tempMax: number[];
  tempMin: number[];
  precipitation: number[];
  available: boolean;
}

interface EnsembleResult {
  date: string;
  dayName: string;
  temperature: {
    openMeteo: number;
    gfs: number;
    icon: number;
    ensemble: number;
    min: number;
    max: number;
  };
  precipitation: {
    openMeteo: number;
    gfs: number;
    icon: number;
    ensemble: number;
  };
  confidence: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { governorateId, lat, lng, days = 7 } = await req.json() as EnsembleRequest;

    console.log(`Real ensemble forecast for ${governorateId} at (${lat}, ${lng}) for ${days} days`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch from multiple real weather models in parallel
    const modelUrls = {
      openMeteo: `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean,wind_speed_10m_max&forecast_days=${days}&timezone=auto`,
      gfs: `https://api.open-meteo.com/v1/gfs?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&forecast_days=${days}&timezone=auto`,
      icon: `https://api.open-meteo.com/v1/dwd-icon?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&forecast_days=${days}&timezone=auto`,
    };

    const [openMeteoRes, gfsRes, iconRes] = await Promise.all([
      fetch(modelUrls.openMeteo),
      fetch(modelUrls.gfs),
      fetch(modelUrls.icon),
    ]);

    const openMeteoData = await openMeteoRes.json();
    const gfsData = await gfsRes.json();
    const iconData = await iconRes.json();

    // Get dynamic weights from model_performance table
    const { data: performanceData } = await supabase
      .from('model_performance')
      .select('model_name, calculated_weight, mae_temp, rmse_temp, skill_score')
      .order('created_at', { ascending: false })
      .limit(10);

    // Default weights (will be overridden if performance data exists)
    let weights: Record<string, number> = {
      'open-meteo': 0.40,
      'gfs': 0.35,
      'icon': 0.25,
    };

    // Calculate weights from performance data
    if (performanceData && performanceData.length > 0) {
      const modelWeights: Record<string, number> = {};
      let totalWeight = 0;

      for (const perf of performanceData) {
        if (perf.calculated_weight && perf.model_name) {
          modelWeights[perf.model_name] = perf.calculated_weight;
          totalWeight += perf.calculated_weight;
        }
      }

      // Normalize weights
      if (totalWeight > 0) {
        for (const model of Object.keys(modelWeights)) {
          if (weights[model] !== undefined) {
            weights[model] = modelWeights[model] / totalWeight;
          }
        }
      }
    }

    const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const results: EnsembleResult[] = [];
    const today = new Date().toISOString().split('T')[0];

    for (let i = 0; i < days; i++) {
      const date = new Date(openMeteoData.daily.time[i]);
      const dayName = dayNames[date.getDay()];

      // Get real temperatures from each model
      const omTempMax = openMeteoData.daily.temperature_2m_max[i];
      const omTempMin = openMeteoData.daily.temperature_2m_min[i];
      const omTemp = (omTempMax + omTempMin) / 2;

      const gfsTempMax = gfsData.daily?.temperature_2m_max?.[i] ?? omTempMax;
      const gfsTempMin = gfsData.daily?.temperature_2m_min?.[i] ?? omTempMin;
      const gfsTemp = (gfsTempMax + gfsTempMin) / 2;

      const iconTempMax = iconData.daily?.temperature_2m_max?.[i] ?? omTempMax;
      const iconTempMin = iconData.daily?.temperature_2m_min?.[i] ?? omTempMin;
      const iconTemp = (iconTempMax + iconTempMin) / 2;

      // Get real precipitation from each model
      const omPrecip = openMeteoData.daily.precipitation_sum[i] || 0;
      const gfsPrecip = gfsData.daily?.precipitation_sum?.[i] ?? omPrecip;
      const iconPrecip = iconData.daily?.precipitation_sum?.[i] ?? omPrecip;

      // Calculate weighted ensemble average using dynamic weights
      const ensembleTemp = 
        omTemp * weights['open-meteo'] + 
        gfsTemp * weights['gfs'] + 
        iconTemp * weights['icon'];

      const ensemblePrecip = 
        omPrecip * weights['open-meteo'] + 
        gfsPrecip * weights['gfs'] + 
        iconPrecip * weights['icon'];

      // Calculate real uncertainty from model spread (no random values!)
      const temps = [omTemp, gfsTemp, iconTemp];
      const tempSpread = Math.max(...temps) - Math.min(...temps);
      
      // Confidence based on model agreement and forecast day
      // Day 0-2: base 95%, Day 3-5: base 85%, Day 6+: base 75%
      // Penalty for model disagreement
      const baseConfidence = i <= 2 ? 95 : i <= 5 ? 85 : 75;
      const spreadPenalty = Math.min(20, tempSpread * 4);
      const confidence = Math.max(50, baseConfidence - spreadPenalty);

      results.push({
        date: openMeteoData.daily.time[i],
        dayName,
        temperature: {
          openMeteo: Math.round(omTemp * 10) / 10,
          gfs: Math.round(gfsTemp * 10) / 10,
          icon: Math.round(iconTemp * 10) / 10,
          ensemble: Math.round(ensembleTemp * 10) / 10,
          min: Math.round(Math.min(omTemp, gfsTemp, iconTemp) * 10) / 10,
          max: Math.round(Math.max(omTemp, gfsTemp, iconTemp) * 10) / 10,
        },
        precipitation: {
          openMeteo: Math.round(omPrecip * 10) / 10,
          gfs: Math.round(gfsPrecip * 10) / 10,
          icon: Math.round(iconPrecip * 10) / 10,
          ensemble: Math.round(ensemblePrecip * 10) / 10,
        },
        confidence: Math.round(confidence),
      });
    }

    // Store predictions in database for later validation
    const predictions = results.flatMap((result, i) => [
      {
        governorate_id: governorateId,
        prediction_date: today,
        target_date: result.date,
        model_name: 'open-meteo',
        temp_max: openMeteoData.daily.temperature_2m_max[i],
        temp_min: openMeteoData.daily.temperature_2m_min[i],
        temp_avg: result.temperature.openMeteo,
        precipitation: result.precipitation.openMeteo,
        humidity: openMeteoData.daily.relative_humidity_2m_mean?.[i],
        wind_speed: openMeteoData.daily.wind_speed_10m_max?.[i],
      },
      {
        governorate_id: governorateId,
        prediction_date: today,
        target_date: result.date,
        model_name: 'gfs',
        temp_max: gfsData.daily?.temperature_2m_max?.[i],
        temp_min: gfsData.daily?.temperature_2m_min?.[i],
        temp_avg: result.temperature.gfs,
        precipitation: result.precipitation.gfs,
      },
      {
        governorate_id: governorateId,
        prediction_date: today,
        target_date: result.date,
        model_name: 'icon',
        temp_max: iconData.daily?.temperature_2m_max?.[i],
        temp_min: iconData.daily?.temperature_2m_min?.[i],
        temp_avg: result.temperature.icon,
        precipitation: result.precipitation.icon,
      },
      {
        governorate_id: governorateId,
        prediction_date: today,
        target_date: result.date,
        model_name: 'ensemble',
        temp_avg: result.temperature.ensemble,
        precipitation: result.precipitation.ensemble,
        confidence: result.confidence,
        model_weights: weights,
        raw_data: {
          openMeteo: { temp: result.temperature.openMeteo, precip: result.precipitation.openMeteo },
          gfs: { temp: result.temperature.gfs, precip: result.precipitation.gfs },
          icon: { temp: result.temperature.icon, precip: result.precipitation.icon },
        },
      },
    ]);

    // Insert predictions (ignore duplicates for same day)
    const { error: insertError } = await supabase
      .from('weather_predictions')
      .upsert(predictions, { 
        onConflict: 'governorate_id,prediction_date,target_date,model_name',
        ignoreDuplicates: true 
      });

    if (insertError) {
      console.log('Note: Could not store predictions:', insertError.message);
    }

    // Calculate overall metrics from real data
    const avgConfidence = Math.round(
      results.reduce((sum, r) => sum + r.confidence, 0) / results.length
    );

    // Get historical performance data for improvement calculation
    const { data: latestPerformance } = await supabase
      .from('model_performance')
      .select('skill_score, mae_temp')
      .eq('model_name', 'ensemble')
      .order('created_at', { ascending: false })
      .limit(1);

    const skillScore = latestPerformance?.[0]?.skill_score;
    const maetemp = latestPerformance?.[0]?.mae_temp;

    const response = {
      governorateId,
      generatedAt: new Date().toISOString(),
      days,
      models: [
        { 
          name: 'Open-Meteo IFS', 
          weight: Math.round(weights['open-meteo'] * 100), 
          source: 'ECMWF IFS via Open-Meteo',
          dataSource: 'open-meteo.com'
        },
        { 
          name: 'NOAA GFS', 
          weight: Math.round(weights['gfs'] * 100), 
          source: 'NOAA Global Forecast System',
          dataSource: 'open-meteo.com/gfs'
        },
        { 
          name: 'DWD ICON', 
          weight: Math.round(weights['icon'] * 100), 
          source: 'German Weather Service ICON',
          dataSource: 'open-meteo.com/dwd-icon'
        },
      ],
      summary: {
        avgConfidence,
        skillScore: skillScore ? `${Math.round(skillScore * 100)}%` : 'Calculating...',
        ensembleMAE: maetemp ? `${maetemp.toFixed(2)}°C` : 'Calculating...',
        totalPrecipitation: Math.round(
          results.reduce((sum, r) => sum + r.precipitation.ensemble, 0) * 10
        ) / 10,
        weightsSource: performanceData && performanceData.length > 0 
          ? 'Dynamic (from validation data)' 
          : 'Default weights',
      },
      dailyForecast: results,
      metadata: {
        algorithm: 'Weighted Ensemble Averaging',
        version: '2.0-production',
        dataSourcesReal: true,
        noRandomValues: true,
        predictionsStored: !insertError,
      }
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Ensemble forecast error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate ensemble forecast',
        details: errorMessage 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

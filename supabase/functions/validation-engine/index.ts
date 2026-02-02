import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Governorate coordinates for fetching actual weather
const GOVERNORATES: Record<string, { lat: number; lng: number; name: string }> = {
  'jenin': { lat: 32.4634, lng: 35.3034, name: 'جنين' },
  'tulkarm': { lat: 32.3104, lng: 35.0286, name: 'طولكرم' },
  'nablus': { lat: 32.2211, lng: 35.2544, name: 'نابلس' },
  'qalqilya': { lat: 32.1892, lng: 34.9708, name: 'قلقيلية' },
  'tubas': { lat: 32.3211, lng: 35.3686, name: 'طوباس' },
  'salfit': { lat: 32.0833, lng: 35.1833, name: 'سلفيت' },
  'ramallah': { lat: 31.9038, lng: 35.2034, name: 'رام الله' },
  'jerusalem': { lat: 31.7683, lng: 35.2137, name: 'القدس' },
  'jericho': { lat: 31.8611, lng: 35.4608, name: 'أريحا' },
  'bethlehem': { lat: 31.7054, lng: 35.2024, name: 'بيت لحم' },
  'hebron': { lat: 31.5326, lng: 35.0998, name: 'الخليل' },
  'north-gaza': { lat: 31.5531, lng: 34.4901, name: 'شمال غزة' },
  'gaza': { lat: 31.5017, lng: 34.4668, name: 'غزة' },
  'deir-al-balah': { lat: 31.4167, lng: 34.3500, name: 'الوسطى' },
  'khan-yunis': { lat: 31.3462, lng: 34.3060, name: 'خانيونس' },
  'rafah': { lat: 31.2969, lng: 34.2450, name: 'رفح' },
};

interface ActualWeather {
  temp_max: number;
  temp_min: number;
  temp_avg: number;
  precipitation: number;
  humidity: number;
  wind_speed: number;
}

async function fetchActualWeather(lat: number, lng: number, date: string): Promise<ActualWeather | null> {
  try {
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${date}&end_date=${date}&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,relative_humidity_2m_mean,wind_speed_10m_max&timezone=auto`;
    
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (!data.daily || !data.daily.temperature_2m_max?.length) return null;
    
    return {
      temp_max: data.daily.temperature_2m_max[0],
      temp_min: data.daily.temperature_2m_min[0],
      temp_avg: data.daily.temperature_2m_mean[0],
      precipitation: data.daily.precipitation_sum[0] || 0,
      humidity: data.daily.relative_humidity_2m_mean[0],
      wind_speed: data.daily.wind_speed_10m_max[0],
    };
  } catch (error) {
    console.error('Error fetching actual weather:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { targetDate, governorateId } = await req.json().catch(() => ({}));
    
    // Default to yesterday if no date provided
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateToValidate = targetDate || yesterday.toISOString().split('T')[0];

    console.log(`Running validation for date: ${dateToValidate}`);

    const governoratesToProcess = governorateId 
      ? [governorateId] 
      : Object.keys(GOVERNORATES);

    const results = {
      date: dateToValidate,
      validationsCreated: 0,
      predictionsFound: 0,
      errors: [] as string[],
      modelPerformanceUpdated: [] as string[],
    };

    for (const govId of governoratesToProcess) {
      const gov = GOVERNORATES[govId];
      if (!gov) {
        results.errors.push(`Unknown governorate: ${govId}`);
        continue;
      }

      // 1. Fetch actual weather for this date
      const actualWeather = await fetchActualWeather(gov.lat, gov.lng, dateToValidate);
      if (!actualWeather) {
        results.errors.push(`Could not fetch actual weather for ${govId} on ${dateToValidate}`);
        continue;
      }

      // 2. Get all predictions for this date and governorate
      const { data: predictions, error: predError } = await supabase
        .from('weather_predictions')
        .select('*')
        .eq('governorate_id', govId)
        .eq('target_date', dateToValidate);

      if (predError) {
        results.errors.push(`Error fetching predictions for ${govId}: ${predError.message}`);
        continue;
      }

      if (!predictions || predictions.length === 0) {
        continue;
      }

      results.predictionsFound += predictions.length;

      // 3. Create validations for each prediction
      for (const prediction of predictions) {
        const errorTempMax = prediction.temp_max !== null 
          ? prediction.temp_max - actualWeather.temp_max 
          : null;
        const errorTempMin = prediction.temp_min !== null 
          ? prediction.temp_min - actualWeather.temp_min 
          : null;
        const errorTempAvg = prediction.temp_avg !== null 
          ? prediction.temp_avg - actualWeather.temp_avg 
          : null;
        const errorPrecip = prediction.precipitation !== null 
          ? prediction.precipitation - actualWeather.precipitation 
          : null;

        const absErrorTemp = errorTempAvg !== null ? Math.abs(errorTempAvg) : null;
        const squaredErrorTemp = errorTempAvg !== null ? Math.pow(errorTempAvg, 2) : null;

        const { error: insertError } = await supabase
          .from('prediction_validations')
          .insert({
            prediction_id: prediction.id,
            actual_temp_max: actualWeather.temp_max,
            actual_temp_min: actualWeather.temp_min,
            actual_temp_avg: actualWeather.temp_avg,
            actual_precipitation: actualWeather.precipitation,
            actual_humidity: actualWeather.humidity,
            actual_wind_speed: actualWeather.wind_speed,
            error_temp_max: errorTempMax,
            error_temp_min: errorTempMin,
            error_temp_avg: errorTempAvg,
            error_precipitation: errorPrecip,
            abs_error_temp: absErrorTemp,
            squared_error_temp: squaredErrorTemp,
          });

        if (insertError) {
          results.errors.push(`Error creating validation: ${insertError.message}`);
        } else {
          results.validationsCreated++;
        }
      }

      // Also save actual weather to historical_weather_data
      const { error: histError } = await supabase
        .from('historical_weather_data')
        .upsert({
          governorate_id: govId,
          date: dateToValidate,
          temperature_max: actualWeather.temp_max,
          temperature_min: actualWeather.temp_min,
          temperature_avg: actualWeather.temp_avg,
          precipitation: actualWeather.precipitation,
          humidity: actualWeather.humidity,
          wind_speed: actualWeather.wind_speed,
        }, { onConflict: 'governorate_id,date' });

      if (histError && !histError.message.includes('duplicate')) {
        console.log(`Note: Could not upsert historical data: ${histError.message}`);
      }
    }

    // 4. Update model performance for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const periodStart = thirtyDaysAgo.toISOString().split('T')[0];
    const periodEnd = dateToValidate;

    // Get all validations from last 30 days grouped by model
    const { data: validations, error: valError } = await supabase
      .from('prediction_validations')
      .select(`
        *,
        prediction:weather_predictions(model_name, governorate_id)
      `)
      .gte('validated_at', `${periodStart}T00:00:00Z`);

    if (!valError && validations && validations.length > 0) {
      // Group by model
      const modelStats: Record<string, {
        absErrors: number[];
        squaredErrors: number[];
        biases: number[];
        precipErrors: number[];
      }> = {};

      for (const val of validations) {
        const modelName = val.prediction?.model_name || 'unknown';
        if (!modelStats[modelName]) {
          modelStats[modelName] = {
            absErrors: [],
            squaredErrors: [],
            biases: [],
            precipErrors: [],
          };
        }

        if (val.abs_error_temp !== null) {
          modelStats[modelName].absErrors.push(val.abs_error_temp);
        }
        if (val.squared_error_temp !== null) {
          modelStats[modelName].squaredErrors.push(val.squared_error_temp);
        }
        if (val.error_temp_avg !== null) {
          modelStats[modelName].biases.push(val.error_temp_avg);
        }
        if (val.error_precipitation !== null) {
          modelStats[modelName].precipErrors.push(Math.abs(val.error_precipitation));
        }
      }

      // Calculate and store performance metrics
      for (const [modelName, stats] of Object.entries(modelStats)) {
        if (stats.absErrors.length === 0) continue;

        const mae = stats.absErrors.reduce((a, b) => a + b, 0) / stats.absErrors.length;
        const rmse = Math.sqrt(stats.squaredErrors.reduce((a, b) => a + b, 0) / stats.squaredErrors.length);
        const bias = stats.biases.reduce((a, b) => a + b, 0) / stats.biases.length;
        const maePrecip = stats.precipErrors.length > 0 
          ? stats.precipErrors.reduce((a, b) => a + b, 0) / stats.precipErrors.length 
          : null;

        // Calculate skill score (1 - RMSE/RMSE_climatology)
        // Using 3.0°C as climatology RMSE baseline
        const skillScore = Math.max(0, 1 - (rmse / 3.0));

        // Calculate weight for ensemble (inverse of MAE, normalized)
        const weight = 1 / (mae + 0.1); // Add 0.1 to avoid division by zero

        const { error: perfError } = await supabase
          .from('model_performance')
          .upsert({
            model_name: modelName,
            governorate_id: null, // Global performance
            period_start: periodStart,
            period_end: periodEnd,
            mae_temp: Math.round(mae * 100) / 100,
            rmse_temp: Math.round(rmse * 100) / 100,
            mae_precip: maePrecip ? Math.round(maePrecip * 100) / 100 : null,
            bias: Math.round(bias * 100) / 100,
            skill_score: Math.round(skillScore * 100) / 100,
            sample_count: stats.absErrors.length,
            calculated_weight: Math.round(weight * 100) / 100,
          }, { onConflict: 'model_name,governorate_id,period_start,period_end' });

        if (!perfError) {
          results.modelPerformanceUpdated.push(modelName);
        }
      }
    }

    // Log the sync
    await supabase.from('data_sync_logs').insert({
      sync_type: 'validation',
      start_date: dateToValidate,
      end_date: dateToValidate,
      records_synced: results.validationsCreated,
      status: results.errors.length === 0 ? 'success' : 'partial',
      error_message: results.errors.length > 0 ? results.errors.join('; ') : null,
      metadata: {
        predictions_found: results.predictionsFound,
        models_updated: results.modelPerformanceUpdated,
      },
    });

    return new Response(JSON.stringify({
      success: true,
      ...results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Validation engine error:', error);
    return new Response(
      JSON.stringify({ error: 'Validation failed', details: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

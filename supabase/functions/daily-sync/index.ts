import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

async function syncHistoricalData(
  supabase: any,
  governorateId: string,
  lat: number,
  lng: number,
  startDate: string,
  endDate: string
): Promise<{ synced: number; errors: string[] }> {
  const errors: string[] = [];
  let synced = 0;

  try {
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,relative_humidity_2m_mean,wind_speed_10m_max,weather_code&timezone=auto`;
    
    const response = await fetch(url);
    if (!response.ok) {
      errors.push(`API error for ${governorateId}: ${response.status}`);
      return { synced, errors };
    }
    
    const data = await response.json();
    
    if (!data.daily || !data.daily.time) {
      errors.push(`No data returned for ${governorateId}`);
      return { synced, errors };
    }

    const records = data.daily.time.map((date: string, i: number) => ({
      governorate_id: governorateId,
      date,
      temperature_max: data.daily.temperature_2m_max[i],
      temperature_min: data.daily.temperature_2m_min[i],
      temperature_avg: data.daily.temperature_2m_mean[i],
      precipitation: data.daily.precipitation_sum[i] || 0,
      humidity: data.daily.relative_humidity_2m_mean[i],
      wind_speed: data.daily.wind_speed_10m_max[i],
      weather_code: data.daily.weather_code[i],
    }));

    // Batch insert with upsert
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const { error } = await supabase
        .from('historical_weather_data')
        .upsert(batch, { 
          onConflict: 'governorate_id,date',
          ignoreDuplicates: false 
        });
      
      if (error) {
        errors.push(`Insert error: ${error.message}`);
      } else {
        synced += batch.length;
      }
    }
  } catch (error) {
    errors.push(`Exception for ${governorateId}: ${error instanceof Error ? error.message : 'Unknown'}`);
  }

  return { synced, errors };
}

async function runEnsemblePredictions(
  supabase: any,
  governorateId: string,
  lat: number,
  lng: number
): Promise<{ created: number; errors: string[] }> {
  const errors: string[] = [];
  let created = 0;

  try {
    // Fetch from multiple models
    const [openMeteo, gfs, icon] = await Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean,wind_speed_10m_max&forecast_days=7&timezone=auto`),
      fetch(`https://api.open-meteo.com/v1/gfs?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&forecast_days=7&timezone=auto`),
      fetch(`https://api.open-meteo.com/v1/dwd-icon?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&forecast_days=7&timezone=auto`),
    ]);

    const openMeteoData = await openMeteo.json();
    const gfsData = await gfs.json();
    const iconData = await icon.json();

    // Get model weights from performance data
    const { data: performance } = await supabase
      .from('model_performance')
      .select('model_name, calculated_weight')
      .order('created_at', { ascending: false })
      .limit(10);

    const weights: Record<string, number> = {
      'open-meteo': 0.4,
      'gfs': 0.35,
      'icon': 0.25,
    };

    // Update weights from performance data if available
    if (performance) {
      const totalWeight = performance.reduce((sum: number, p: any) => sum + (p.calculated_weight || 0), 0);
      if (totalWeight > 0) {
        for (const p of performance) {
          if (weights[p.model_name] !== undefined) {
            weights[p.model_name] = p.calculated_weight / totalWeight;
          }
        }
      }
    }

    const today = new Date().toISOString().split('T')[0];

    // Create predictions for each day
    for (let i = 0; i < 7; i++) {
      const targetDate = openMeteoData.daily.time[i];
      
      const omTempMax = openMeteoData.daily.temperature_2m_max[i];
      const omTempMin = openMeteoData.daily.temperature_2m_min[i];
      const omPrecip = openMeteoData.daily.precipitation_sum[i] || 0;

      const gfsTempMax = gfsData.daily?.temperature_2m_max?.[i] ?? omTempMax;
      const gfsTempMin = gfsData.daily?.temperature_2m_min?.[i] ?? omTempMin;
      const gfsPrecip = gfsData.daily?.precipitation_sum?.[i] ?? omPrecip;

      const iconTempMax = iconData.daily?.temperature_2m_max?.[i] ?? omTempMax;
      const iconTempMin = iconData.daily?.temperature_2m_min?.[i] ?? omTempMin;
      const iconPrecip = iconData.daily?.precipitation_sum?.[i] ?? omPrecip;

      // Calculate ensemble values
      const ensembleTempMax = omTempMax * weights['open-meteo'] + gfsTempMax * weights['gfs'] + iconTempMax * weights['icon'];
      const ensembleTempMin = omTempMin * weights['open-meteo'] + gfsTempMin * weights['gfs'] + iconTempMin * weights['icon'];
      const ensembleTempAvg = (ensembleTempMax + ensembleTempMin) / 2;
      const ensemblePrecip = omPrecip * weights['open-meteo'] + gfsPrecip * weights['gfs'] + iconPrecip * weights['icon'];

      // Calculate confidence from model spread
      const tempSpread = Math.max(
        Math.abs(omTempMax - ensembleTempMax),
        Math.abs(gfsTempMax - ensembleTempMax),
        Math.abs(iconTempMax - ensembleTempMax)
      );
      const confidence = Math.max(50, 95 - (i * 3) - (tempSpread * 3));

      // Store individual model predictions
      const predictions = [
        { model: 'open-meteo', tempMax: omTempMax, tempMin: omTempMin, precip: omPrecip },
        { model: 'gfs', tempMax: gfsTempMax, tempMin: gfsTempMin, precip: gfsPrecip },
        { model: 'icon', tempMax: iconTempMax, tempMin: iconTempMin, precip: iconPrecip },
        { model: 'ensemble', tempMax: ensembleTempMax, tempMin: ensembleTempMin, precip: ensemblePrecip },
      ];

      for (const pred of predictions) {
        const { error } = await supabase
          .from('weather_predictions')
          .insert({
            governorate_id: governorateId,
            prediction_date: today,
            target_date: targetDate,
            model_name: pred.model,
            temp_max: Math.round(pred.tempMax * 10) / 10,
            temp_min: Math.round(pred.tempMin * 10) / 10,
            temp_avg: Math.round(((pred.tempMax + pred.tempMin) / 2) * 10) / 10,
            precipitation: Math.round(pred.precip * 10) / 10,
            confidence: pred.model === 'ensemble' ? Math.round(confidence) : null,
            model_weights: pred.model === 'ensemble' ? weights : null,
            raw_data: pred.model === 'ensemble' ? {
              openMeteo: { tempMax: omTempMax, tempMin: omTempMin, precip: omPrecip },
              gfs: { tempMax: gfsTempMax, tempMin: gfsTempMin, precip: gfsPrecip },
              icon: { tempMax: iconTempMax, tempMin: iconTempMin, precip: iconPrecip },
            } : null,
          });

        if (!error) created++;
        else errors.push(`Prediction insert error: ${error.message}`);
      }
    }
  } catch (error) {
    errors.push(`Ensemble error: ${error instanceof Error ? error.message : 'Unknown'}`);
  }

  return { created, errors };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { syncType, yearsBack, governorateId } = await req.json().catch(() => ({}));
    
    const results = {
      syncType: syncType || 'daily',
      historicalRecordsSynced: 0,
      predictionsCreated: 0,
      validationsRun: false,
      errors: [] as string[],
      governoratesProcessed: 0,
    };

    const governoratesToProcess = governorateId 
      ? { [governorateId]: GOVERNORATES[governorateId] }
      : GOVERNORATES;

    // Calculate date range
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1); // Yesterday
    
    let startDate: Date;
    if (syncType === 'full' && yearsBack) {
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - yearsBack);
    } else {
      // Default: sync last 7 days
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    }

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log(`Daily sync: ${startDateStr} to ${endDateStr}`);

    // Process each governorate
    for (const [govId, gov] of Object.entries(governoratesToProcess)) {
      if (!gov) continue;

      console.log(`Processing ${govId}...`);
      results.governoratesProcessed++;

      // 1. Sync historical data
      const histResult = await syncHistoricalData(
        supabase, govId, gov.lat, gov.lng, startDateStr, endDateStr
      );
      results.historicalRecordsSynced += histResult.synced;
      results.errors.push(...histResult.errors);

      // 2. Create ensemble predictions
      const predResult = await runEnsemblePredictions(supabase, govId, gov.lat, gov.lng);
      results.predictionsCreated += predResult.created;
      results.errors.push(...predResult.errors);

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 3. Run validation for yesterday
    try {
      const validationResponse = await fetch(`${supabaseUrl}/functions/v1/validation-engine`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetDate: endDateStr }),
      });
      
      if (validationResponse.ok) {
        results.validationsRun = true;
      }
    } catch (valError) {
      results.errors.push(`Validation call failed: ${valError instanceof Error ? valError.message : 'Unknown'}`);
    }

    const duration = Date.now() - startTime;

    // Log sync results
    await supabase.from('data_sync_logs').insert({
      sync_type: syncType || 'daily',
      start_date: startDateStr,
      end_date: endDateStr,
      records_synced: results.historicalRecordsSynced + results.predictionsCreated,
      status: results.errors.length === 0 ? 'success' : 'partial',
      error_message: results.errors.length > 0 ? results.errors.slice(0, 5).join('; ') : null,
      duration_ms: duration,
      metadata: {
        governorates_processed: results.governoratesProcessed,
        predictions_created: results.predictionsCreated,
        validations_run: results.validationsRun,
      },
    });

    return new Response(JSON.stringify({
      success: true,
      duration_ms: duration,
      ...results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Daily sync error:', error);
    return new Response(
      JSON.stringify({ error: 'Daily sync failed', details: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Palestinian governorate coordinates
const GOVERNORATE_COORDS: Record<string, { lat: number; lng: number }> = {
  jenin: { lat: 32.4634, lng: 35.3034 },
  tulkarm: { lat: 32.3104, lng: 35.0286 },
  nablus: { lat: 32.2211, lng: 35.2544 },
  qalqilya: { lat: 32.1892, lng: 34.9708 },
  tubas: { lat: 32.3211, lng: 35.3686 },
  salfit: { lat: 32.0833, lng: 35.1833 },
  ramallah: { lat: 31.9038, lng: 35.2034 },
  jerusalem: { lat: 31.7683, lng: 35.2137 },
  jericho: { lat: 31.8611, lng: 35.4608 },
  bethlehem: { lat: 31.7054, lng: 35.2024 },
  hebron: { lat: 31.5326, lng: 35.0998 },
  "north-gaza": { lat: 31.5531, lng: 34.4901 },
  gaza: { lat: 31.5017, lng: 34.4668 },
  "deir-al-balah": { lat: 31.4167, lng: 34.35 },
  "khan-yunis": { lat: 31.3462, lng: 34.306 },
  rafah: { lat: 31.2969, lng: 34.245 },
};

interface HistoricalRequest {
  governorateId: string;
  startDate?: string;
  endDate?: string;
  action?: "fetch" | "sync" | "stats";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { governorateId, startDate, endDate, action = "fetch" }: HistoricalRequest = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const coords = GOVERNORATE_COORDS[governorateId];
    if (!coords) {
      return new Response(
        JSON.stringify({ error: "محافظة غير معروفة" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "stats") {
      // Return aggregated statistics
      const { data: historicalData, error } = await supabase
        .from("historical_weather_data")
        .select("*")
        .eq("governorate_id", governorateId)
        .order("date", { ascending: false });

      if (error) throw error;

      if (!historicalData || historicalData.length === 0) {
        return new Response(
          JSON.stringify({ 
            hasData: false, 
            message: "لا تتوفر بيانات تاريخية. قم بتشغيل المزامنة أولاً." 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Calculate statistics
      const years = [...new Set(historicalData.map(d => new Date(d.date).getFullYear()))];
      const monthlyStats: Record<number, { avgTemp: number; avgPrecip: number; count: number }> = {};

      for (let month = 1; month <= 12; month++) {
        const monthData = historicalData.filter(d => new Date(d.date).getMonth() + 1 === month);
        if (monthData.length > 0) {
          monthlyStats[month] = {
            avgTemp: monthData.reduce((s, d) => s + (d.temperature_avg || 0), 0) / monthData.length,
            avgPrecip: monthData.reduce((s, d) => s + (d.precipitation || 0), 0) / monthData.length,
            count: monthData.length,
          };
        }
      }

      const stats = {
        hasData: true,
        governorateId,
        totalRecords: historicalData.length,
        yearsAvailable: years.sort(),
        dateRange: {
          from: historicalData[historicalData.length - 1]?.date,
          to: historicalData[0]?.date,
        },
        overallStats: {
          avgTemperature: historicalData.reduce((s, d) => s + (d.temperature_avg || 0), 0) / historicalData.length,
          maxTemperature: Math.max(...historicalData.map(d => d.temperature_max || 0)),
          minTemperature: Math.min(...historicalData.filter(d => d.temperature_min != null).map(d => d.temperature_min)),
          totalPrecipitation: historicalData.reduce((s, d) => s + (d.precipitation || 0), 0),
          avgHumidity: historicalData.reduce((s, d) => s + (d.humidity || 0), 0) / historicalData.length,
        },
        monthlyStats,
      };

      return new Response(JSON.stringify(stats), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "sync") {
      // Sync historical data from Open-Meteo
      const syncStartDate = startDate || "2020-01-01";
      const syncEndDate = endDate || new Date().toISOString().split("T")[0];

      const openMeteoUrl = new URL("https://archive-api.open-meteo.com/v1/archive");
      openMeteoUrl.searchParams.set("latitude", coords.lat.toString());
      openMeteoUrl.searchParams.set("longitude", coords.lng.toString());
      openMeteoUrl.searchParams.set("start_date", syncStartDate);
      openMeteoUrl.searchParams.set("end_date", syncEndDate);
      openMeteoUrl.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,relative_humidity_2m_mean,wind_speed_10m_max,weather_code");
      openMeteoUrl.searchParams.set("timezone", "Asia/Jerusalem");

      const response = await fetch(openMeteoUrl.toString());
      if (!response.ok) {
        throw new Error(`Open-Meteo API error: ${response.status}`);
      }

      const data = await response.json();
      const daily = data.daily;

      if (!daily || !daily.time) {
        return new Response(
          JSON.stringify({ error: "لا تتوفر بيانات من Open-Meteo" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Prepare records for insertion
      const records = daily.time.map((date: string, i: number) => ({
        governorate_id: governorateId,
        date,
        temperature_avg: daily.temperature_2m_mean?.[i],
        temperature_max: daily.temperature_2m_max?.[i],
        temperature_min: daily.temperature_2m_min?.[i],
        precipitation: daily.precipitation_sum?.[i] || 0,
        humidity: daily.relative_humidity_2m_mean?.[i],
        wind_speed: daily.wind_speed_10m_max?.[i],
        weather_code: daily.weather_code?.[i],
      }));

      // Upsert in batches
      const batchSize = 100;
      let inserted = 0;

      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        const { error } = await supabase
          .from("historical_weather_data")
          .upsert(batch, { onConflict: "governorate_id,date" });
        
        if (error) {
          console.error("Batch insert error:", error);
        } else {
          inserted += batch.length;
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          recordsInserted: inserted,
          dateRange: { from: syncStartDate, to: syncEndDate },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Default: fetch historical data
    const queryStartDate = startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const queryEndDate = endDate || new Date().toISOString().split("T")[0];

    const { data: historicalData, error } = await supabase
      .from("historical_weather_data")
      .select("*")
      .eq("governorate_id", governorateId)
      .gte("date", queryStartDate)
      .lte("date", queryEndDate)
      .order("date", { ascending: true });

    if (error) throw error;

    return new Response(JSON.stringify({ 
      governorateId,
      data: historicalData || [],
      dateRange: { from: queryStartDate, to: queryEndDate },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Historical data error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "خطأ غير معروف" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

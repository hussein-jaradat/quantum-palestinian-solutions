import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// NASA GIBS WMTS configuration
const NASA_GIBS_BASE = "https://gibs.earthdata.nasa.gov/wmts/epsg4326/best";

const AVAILABLE_LAYERS = {
  trueColor: {
    id: "MODIS_Terra_CorrectedReflectance_TrueColor",
    name: "صورة ملونة حقيقية",
    nameEn: "True Color",
    description: "صورة من القمر الصناعي MODIS Terra بالألوان الطبيعية",
    format: "image/jpeg",
    matrixSet: "250m",
  },
  viirs: {
    id: "VIIRS_SNPP_CorrectedReflectance_TrueColor",
    name: "صورة VIIRS",
    nameEn: "VIIRS True Color",
    description: "صورة عالية الدقة من قمر VIIRS",
    format: "image/jpeg",
    matrixSet: "250m",
  },
  clouds: {
    id: "MODIS_Terra_Cloud_Top_Temp_Day",
    name: "درجة حرارة السحب",
    nameEn: "Cloud Temperature",
    description: "درجة حرارة قمم السحب",
    format: "image/png",
    matrixSet: "2km",
  },
  aerosols: {
    id: "MODIS_Terra_Aerosol_Optical_Depth",
    name: "كثافة الهباء الجوي",
    nameEn: "Aerosol Optical Depth",
    description: "قياس كثافة الهباء الجوي في الغلاف الجوي",
    format: "image/png",
    matrixSet: "2km",
  },
  precipitation: {
    id: "IMERG_Precipitation_Rate",
    name: "معدل الأمطار",
    nameEn: "Precipitation Rate",
    description: "معدل هطول الأمطار الحالي",
    format: "image/png",
    matrixSet: "2km",
  },
  landTemp: {
    id: "MODIS_Aqua_Land_Surface_Temp_Day",
    name: "حرارة سطح الأرض",
    nameEn: "Land Surface Temperature",
    description: "درجة حرارة سطح الأرض نهاراً",
    format: "image/png",
    matrixSet: "1km",
  },
  vegetation: {
    id: "MODIS_Terra_NDVI_8Day",
    name: "مؤشر الغطاء النباتي",
    nameEn: "Vegetation Index",
    description: "مؤشر NDVI للغطاء النباتي",
    format: "image/png",
    matrixSet: "250m",
  },
};

interface ImageryRequest {
  action: "layers" | "tile" | "info" | "dates";
  layer?: keyof typeof AVAILABLE_LAYERS;
  date?: string;
  zoom?: number;
  x?: number;
  y?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, layer, date, zoom, x, y }: ImageryRequest = await req.json();

    if (action === "layers") {
      // Return available layers
      const layers = Object.entries(AVAILABLE_LAYERS).map(([key, value]) => ({
        key,
        ...value,
        tileUrl: `${NASA_GIBS_BASE}/${value.id}/default/{date}/${value.matrixSet}/{z}/{y}/{x}.${value.format.split("/")[1]}`,
      }));

      return new Response(JSON.stringify({ layers }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "info") {
      // Return NASA GIBS info and Palestine bounds
      const info = {
        provider: "NASA GIBS (Global Imagery Browse Services)",
        baseUrl: NASA_GIBS_BASE,
        palestineBounds: {
          north: 33.0,
          south: 31.0,
          east: 36.0,
          west: 34.0,
          center: { lat: 31.9, lng: 35.0 },
        },
        attribution: "Imagery provided by NASA GIBS, part of NASA's Earth Observing System Data and Information System (EOSDIS)",
        dataSource: "NASA EOSDIS WorldView",
        updateFrequency: "Daily (approximately 3-hour latency)",
        coverage: "Global",
        instructions: {
          ar: "استخدم طبقات الأقمار الصناعية لعرض صور حقيقية، بيانات السحب، الأمطار، والغطاء النباتي",
          en: "Use satellite layers to view true color imagery, cloud data, precipitation, and vegetation index",
        },
      };

      return new Response(JSON.stringify(info), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "dates") {
      // Return available dates (last 30 days)
      const dates = [];
      const today = new Date();
      
      for (let i = 0; i < 30; i++) {
        const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        dates.push(d.toISOString().split("T")[0]);
      }

      return new Response(JSON.stringify({ dates }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "tile" && layer && date && zoom !== undefined && x !== undefined && y !== undefined) {
      // Proxy tile request
      const layerConfig = AVAILABLE_LAYERS[layer];
      if (!layerConfig) {
        return new Response(
          JSON.stringify({ error: "طبقة غير معروفة" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const ext = layerConfig.format.split("/")[1];
      const tileUrl = `${NASA_GIBS_BASE}/${layerConfig.id}/default/${date}/${layerConfig.matrixSet}/${zoom}/${y}/${x}.${ext}`;

      const tileResponse = await fetch(tileUrl);
      if (!tileResponse.ok) {
        return new Response(
          JSON.stringify({ error: "فشل في جلب البيانات من NASA GIBS", url: tileUrl }),
          { status: tileResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const tileData = await tileResponse.arrayBuffer();
      return new Response(tileData, {
        headers: {
          ...corsHeaders,
          "Content-Type": layerConfig.format,
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    return new Response(
      JSON.stringify({ error: "إجراء غير صالح" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Satellite imagery error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "خطأ غير معروف" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

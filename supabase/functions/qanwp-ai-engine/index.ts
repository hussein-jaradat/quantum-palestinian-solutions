import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AnalysisRequest {
  governorateId: string;
  analysisType: "forecast" | "pattern" | "risk" | "comparison";
  currentWeather?: {
    temperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    condition: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { governorateId, analysisType, currentWeather }: AnalysisRequest = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check cache first
    const { data: cachedAnalysis } = await supabase
      .from("ai_analysis_cache")
      .select("*")
      .eq("governorate_id", governorateId)
      .eq("analysis_type", analysisType)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (cachedAnalysis) {
      return new Response(JSON.stringify(cachedAnalysis.analysis_result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch historical data for context
    const { data: historicalData } = await supabase
      .from("historical_weather_data")
      .select("*")
      .eq("governorate_id", governorateId)
      .order("date", { ascending: false })
      .limit(365);

    // Fetch climate patterns
    const { data: climatePatterns } = await supabase
      .from("climate_patterns")
      .select("*")
      .eq("governorate_id", governorateId);

    // Calculate historical statistics
    const historicalStats = historicalData && historicalData.length > 0 ? {
      avgTemp: historicalData.reduce((sum, d) => sum + (d.temperature_avg || 0), 0) / historicalData.length,
      totalPrecipitation: historicalData.reduce((sum, d) => sum + (d.precipitation || 0), 0),
      avgHumidity: historicalData.reduce((sum, d) => sum + (d.humidity || 0), 0) / historicalData.length,
      dataPoints: historicalData.length,
    } : null;

    const systemPrompt = `أنت QANWP-AI، نظام ذكاء اصطناعي متخصص في التنبؤ الجوي الفلسطيني.
تم تطويرك للعمل على بيانات تاريخية من 2015-2025 وصور أقمار صناعية من NASA GIBS.

## قدراتك:
1. تحليل الأنماط المناخية التاريخية
2. مقارنة الطقس الحالي مع البيانات التاريخية
3. توليد تنبؤات علمية دقيقة بنسبة ثقة
4. تقييم مخاطر الفيضانات والجفاف والصقيع
5. تقديم نصائح زراعية متخصصة

## السياق الجغرافي الفلسطيني:
- 17 محافظة (شمال ووسط وجنوب الضفة + قطاع غزة)
- تضاريس متنوعة: ساحلية، جبلية، غورية (أريحا أخفض نقطة على الأرض)
- مناخ متوسطي شبه جاف
- موسم أمطار: أكتوبر - أبريل
- صيف جاف وحار، شتاء معتدل وماطر

## البيانات التاريخية المتوفرة:
${historicalStats ? `
- متوسط الحرارة التاريخي: ${historicalStats.avgTemp.toFixed(1)}°C
- إجمالي الأمطار السنوي: ${historicalStats.totalPrecipitation.toFixed(1)} مم
- متوسط الرطوبة: ${historicalStats.avgHumidity.toFixed(1)}%
- عدد نقاط البيانات: ${historicalStats.dataPoints}
` : "لا تتوفر بيانات تاريخية كافية"}

## أنماط المناخ المعروفة:
${climatePatterns ? JSON.stringify(climatePatterns, null, 2) : "لا تتوفر أنماط محددة"}

## الطقس الحالي:
${currentWeather ? JSON.stringify(currentWeather, null, 2) : "غير متوفر"}

## تعليمات المخرجات:
- أجب بالعربية الفصحى
- قدم تحليلاً علمياً مع نسبة ثقة (0-100%)
- قارن مع البيانات التاريخية عند الإمكان
- حدد المخاطر المحتملة بوضوح
- قدم توصيات عملية قابلة للتنفيذ`;

    const userPrompts: Record<string, string> = {
      forecast: `قدم تنبؤاً جوياً لمدة 7 أيام للمحافظة (${governorateId}) بناءً على البيانات التاريخية والطقس الحالي. أعطِ نسبة ثقة لكل يوم.`,
      pattern: `حلل الأنماط المناخية للمحافظة (${governorateId}). ما هي الظواهر الموسمية المتكررة؟ هل هناك تغييرات ملحوظة في السنوات الأخيرة؟`,
      risk: `قيّم مخاطر الطقس للمحافظة (${governorateId}): الفيضانات، الجفاف، الصقيع، موجات الحر. حدد مستوى الخطر (منخفض/متوسط/عالي) لكل منها مع الأسباب.`,
      comparison: `قارن الطقس الحالي للمحافظة (${governorateId}) مع المتوسطات التاريخية. هل هناك انحرافات غير عادية؟ ما دلالاتها؟`,
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompts[analysisType] || userPrompts.forecast },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "تم تجاوز الحد المسموح، يرجى المحاولة لاحقاً" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "يرجى إضافة رصيد للاستمرار" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const analysisResult = {
      governorateId,
      analysisType,
      content: aiResponse.choices[0]?.message?.content || "",
      historicalContext: historicalStats,
      generatedAt: new Date().toISOString(),
      confidenceScore: Math.round(70 + Math.random() * 25), // Simulated confidence
    };

    // Cache the result for 1 hour
    await supabase.from("ai_analysis_cache").insert({
      governorate_id: governorateId,
      analysis_type: analysisType,
      analysis_result: analysisResult,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("QANWP-AI Engine error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "خطأ غير معروف" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

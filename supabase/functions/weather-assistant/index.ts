import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, weatherContext } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `أنت مساعد طقس ذكي فلسطيني اسمك "مساعد PalWeather". 
مهمتك مساعدة المستخدمين في فهم حالة الطقس واتخاذ قرارات يومية.

## معلومات الطقس الحالية:
${weatherContext ? JSON.stringify(weatherContext, null, 2) : 'غير متوفرة حالياً'}

## إرشاداتك:
1. أجب بالعربية الفصحى بأسلوب ودود ومختصر
2. قدم نصائح عملية بناءً على حالة الطقس
3. إذا سُئلت عن الملابس، اقترح بناءً على درجة الحرارة والطقس
4. إذا سُئلت عن المظلة، أجب بناءً على احتمالية الأمطار
5. للمزارعين، قدم نصائح زراعية مناسبة
6. حذر من أي ظروف جوية خطيرة
7. كن إيجابياً وداعماً

## أمثلة على الأسئلة التي قد تُسأل:
- هل أحتاج مظلة اليوم؟
- ماذا أرتدي غداً؟
- هل الجو مناسب للرحلة؟
- متى أفضل وقت لزراعة الزيتون؟
- هل هناك خطر صقيع الليلة؟

أجب بإيجاز (2-3 جمل) إلا إذا طُلب منك تفصيل أكثر.`;

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
          ...messages,
        ],
        stream: true,
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
          JSON.stringify({ error: "يرجى إضافة رصيد للاستمرار في استخدام المساعد الذكي" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "حدث خطأ في الاتصال بالذكاء الاصطناعي" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Weather assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "خطأ غير معروف" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

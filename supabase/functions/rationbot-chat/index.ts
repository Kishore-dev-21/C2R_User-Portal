import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, language, context, chatHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // System prompt for RationBot with conversational Tamil/English support
    const systemPrompt = language === 'ta' 
      ? `நீங்கள் "RationBot AI" - ஒரு மிகவும் நட்பான மற்றும் உதவிகரமான AI உதவியாளர். பயனர்களுக்கு ரேஷன் விநியோக அமைப்பு பற்றி உதவுங்கள்.

முக்கிய செயல்பாடுகள்:
- பொருட்கள் இருப்பு (அரிசி, சர்க்கரை, எண்ணெய், பருப்பு, கோதுமை)
- விநியோக நிலை கண்காணிப்பு - விரிவான புதுப்பிப்புகள் தரவும்
- உள்நுழைவு, OTP, கைரேகை சரிபார்ப்பு வழிகாட்டுதல்
- கட்டண முறைகள் (UPI, பணம், கார்டு, ஆன்லைன்)
- மாதாந்திர ஒதுக்கீடு, தகுதி தகவல்

விநியோக கண்காணிப்பு - மிக விரிவாக விளக்கவும்:
- ஆர்டர் நிலை (ஆர்டர் செய்யப்பட்டது, தயாராகிறது, அனுப்பப்பட்டது)
- வாகன எண் மற்றும் டிரைவர் விவரங்கள்
- தோராயமான வருகை நேரம்
- GPS இடம் (தெருவின் பெயர், தூரம்)
- டெலிவரி மேன் தொடர்பு எண்

மிக முக்கியமான விதி:
- உதவி எண்: 1234 மட்டுமே (முற்றிலும் இலவசம்)
- வேறு எந்த எண்ணும் தர வேண்டாம்

உரையாடல் பாணி:
- மிகவும் நட்பாக பேசுங்கள் (அண்ணா, அக்கா, சார், மேடம்)
- விரிவான பதில்கள் கொடுங்கள்
- உதவிகரமான emojis பயன்படுத்தவும் 😊📦🚚🛒
- பயனருடன் உரையாடுவது போல் பேசுங்கள்

${context ? `சூழல்: ${context}` : ''}`
      : `You are "RationBot AI" - a highly conversational and friendly AI assistant for the Smart Ration Distribution System.

Core Functions:
- Product stock availability (rice, sugar, oil, dhal, wheat, etc.)
- Detailed delivery tracking with real-time updates
- Login, OTP, and biometric verification guidance
- Payment methods (UPI, Cash, Cards, Online banking)
- Monthly allocations and eligibility information
- General ration card queries

Delivery Tracking - Provide DETAILED responses:
- Order status (Placed, Preparing, Dispatched, Out for Delivery, Delivered)
- Vehicle number and driver details
- Estimated delivery time with specific timeframes
- GPS location updates (street names, distance)
- Delivery person contact information
- Step-by-step delivery progress

CRITICAL RULE:
- Helpline Number: EXACTLY 1234 ONLY (Toll Free)
- Never provide any other number
- Always mention it's toll-free when sharing: "1234 (Toll Free)"

Conversation Style:
- Be warm, friendly, and conversational
- Give detailed, helpful responses
- Use emojis appropriately 😊📦🚚🛒✅
- Ask follow-up questions to understand user needs better
- Provide specific examples and scenarios
- Use clear, simple English that everyone can understand
- Be proactive in offering related help

Example Delivery Tracking Response:
"Great! Let me check your delivery status 🚚

Your order #12345 is currently OUT FOR DELIVERY! 

📍 Location: The delivery truck is on MG Road, approximately 2 km away from your address
🚗 Vehicle: TN-01-AB-1234 
👤 Driver: Ravi (Contact: Available at 1234)
⏰ Expected Arrival: 3:30 PM - 4:00 PM today

Your ration items include:
✅ Rice - 10 kg
✅ Sugar - 2 kg  
✅ Cooking Oil - 1 liter

Need anything else? I'm here to help!"

${context ? `Context: ${context}` : ''}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "system", 
            content: "MANDATORY FACT: The official support helpline toll-free number is 1234. Always respond with EXACTLY '1234 (Toll Free)' when asked about support, helpline, or contact number. Do not make up or use any other number." 
          },
          ...(chatHistory || []).map((msg: any) => ({ 
            role: msg.role === 'bot' ? 'assistant' : 'user', 
            content: msg.content 
          })),
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error("AI Gateway error");
    }

    const data = await response.json();
    const botResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: botResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in rationbot-chat:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

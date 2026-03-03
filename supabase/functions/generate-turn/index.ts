import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversationHistory, turnNumber, totalTurns, scenarioContext } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a friendly Dutch person having a casual conversation with someone learning Dutch at A1-A2 level.

RULES:
- Generate the NEXT thing you would say in Dutch, naturally following from what the student just said.
- Keep your Dutch simple (A1-A2 level vocabulary) but natural.
- Your response should be a question or comment that builds on what the student said.
- Be warm, curious, and encouraging — like a real Dutch person chatting.
- Keep it to 1-2 sentences maximum.
- If this is the last turn (turn ${turnNumber} of ${totalTurns}), wrap up the conversation warmly with a goodbye.
- Also provide a short English hint describing what you said so the student understands.
- NEVER repeat a topic already covered in the conversation.`;

    const messages: Array<{role: string; content: string}> = [
      { role: "system", content: systemPrompt },
    ];

    if (conversationHistory && conversationHistory.length > 0) {
      let recap = "Here's the conversation so far:\n";
      for (const entry of conversationHistory) {
        recap += `Dutch speaker: "${entry.dutch}"\n`;
        if (entry.studentResponse) {
          recap += `Student replied: "${entry.studentResponse}"\n`;
        }
      }
      recap += `\nNow generate turn ${turnNumber} of ${totalTurns}. Say something that naturally follows from the student's last response.`;
      messages.push({ role: "user", content: recap });
    } else {
      messages.push({ role: "user", content: `This is the start of a random street encounter (turn 1 of ${totalTurns}). Start with a casual greeting and a simple question about their day or the weather.` });
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages,
          tools: [
            {
              type: "function",
              function: {
                name: "generate_turn",
                description: "Generate the next conversational turn in Dutch",
                parameters: {
                  type: "object",
                  properties: {
                    dutchText: {
                      type: "string",
                      description: "The Dutch sentence(s) the speaker says — simple, natural, 1-2 sentences",
                    },
                    englishHint: {
                      type: "string",
                      description: "A friendly English hint explaining what was said and suggesting how to respond",
                    },
                    grammarTip: {
                      type: "string",
                      description: "A quick grammar or vocabulary tip relevant to this turn",
                    },
                  },
                  required: ["dutchText", "englishHint", "grammarTip"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "generate_turn" },
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited, please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("Failed to generate next turn");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      throw new Error("No turn generated from AI");
    }

    const generated = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(generated), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-turn error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

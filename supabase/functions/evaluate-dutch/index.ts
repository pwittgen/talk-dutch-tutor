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
    const { userAnswer, dutchPrompt, englishHint, scenarioContext, imageDescription, openEnded } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const openEndedRules = openEnded ? `
OPEN-ENDED SCENARIO RULES:
- There is NO single correct answer. Accept ANY response that is contextually appropriate.
- The student can talk about anything as long as it fits the conversational context.
- REJECT responses that are racist, discriminatory, hateful, mean-spirited, or contain slurs/insults.
- If the content is inappropriate, set grade to "incorrect" and feedback explaining it's not appropriate.
- Grade "perfect" if grammatically correct and fits the conversation naturally.
- Grade "good" if understandable with minor grammar issues.
- Grade "needs_improvement" if the idea is fine but grammar needs work.
- Be very encouraging — creativity and self-expression matter here!` : '';

    const systemPrompt = `You are a friendly Dutch language tutor for A1-A2 level English-speaking students. 
You evaluate student responses in Dutch conversations. Be encouraging but accurate.
${openEndedRules}

IMPORTANT RULES:
- Accept ANY response that is contextually appropriate for the situation, not just exact phrases
- Focus on whether the student communicated the right meaning, even if phrasing differs
- Evaluate grammar, vocabulary, and pronunciation patterns
- If they used speech recognition, note common Dutch pronunciation mistakes English speakers make
- Always provide the "ideal" response as a learning reference${openEnded ? ' (suggest what would be a natural reply)' : ''}
- Grade on a scale: "perfect", "good", "needs_improvement", "incorrect"
- "perfect" = grammatically correct and contextually appropriate
- "good" = understandable and mostly correct, minor issues
- "needs_improvement" = right idea but significant grammar/vocab errors
- "incorrect" = wrong meaning or completely off-topic${openEnded ? ' or inappropriate/offensive content' : ''}`;

    let userPrompt = `SCENARIO CONTEXT: ${scenarioContext}

THE DUTCH SPEAKER SAID: "${dutchPrompt}"
EXPECTED INTENT: ${englishHint}`;

    if (imageDescription) {
      userPrompt += `\nIMAGE SHOWN TO STUDENT: ${imageDescription}
The student should incorporate describing or referencing what they see in the image in their response.`;
    }

    userPrompt += `\n\nSTUDENT'S RESPONSE: "${userAnswer}"

Evaluate this response. Return your evaluation using the evaluate_response function.`;

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
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "evaluate_response",
                description: "Evaluate the student's Dutch response",
                parameters: {
                  type: "object",
                  properties: {
                    grade: {
                      type: "string",
                      enum: ["perfect", "good", "needs_improvement", "incorrect"],
                    },
                    feedback: {
                      type: "string",
                      description: "Encouraging feedback message in English (1-2 sentences)",
                    },
                    correctedDutch: {
                      type: "string",
                      description: "The ideal/corrected Dutch response",
                    },
                    grammarNotes: {
                      type: "array",
                      items: { type: "string" },
                      description: "Specific grammar corrections or tips (max 3)",
                    },
                    pronunciationTips: {
                      type: "array",
                      items: { type: "string" },
                      description: "Dutch pronunciation tips for English speakers relevant to words they used (max 2)",
                    },
                    vocabularyNotes: {
                      type: "array",
                      items: { type: "string" },
                      description: "Vocabulary suggestions or alternatives (max 2)",
                    },
                    cefrLevel: {
                      type: "string",
                      enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
                      description: "The CEFR level this response corresponds to based on vocabulary, grammar complexity, and fluency",
                    },
                    starRating: {
                      type: "number",
                      description: "Star rating from 1 to 5 for overall correctness (1=very poor, 2=poor, 3=okay, 4=good, 5=excellent)",
                    },
                  },
                  required: ["grade", "feedback", "correctedDutch", "grammarNotes", "cefrLevel", "starRating"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "evaluate_response" },
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
      throw new Error("AI evaluation failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No evaluation returned from AI");
    }

    const evaluation = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(evaluation), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("evaluate-dutch error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

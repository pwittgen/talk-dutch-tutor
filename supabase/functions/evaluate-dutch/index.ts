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
    const { userAnswer, dutchPrompt, englishHint, scenarioContext, imageDescription, openEnded, sampleAnswer, examMode } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const examModeRules = examMode ? `
INBURGERING A2 SPREKEN EXAM MODE:
- This simulates the real DUO A2 speaking exam.
- REWARD short, simple answers. At A2 level, 1-2 short sentences is PERFECT.
- Example of a PERFECT A2 answer: "Ik koop brood en melk." or "Ik vind de school goed."
- Do NOT penalize for being too brief. Short = good at A2 level.
- The correctedDutch should be a SHORT improved version of what the user actually said, NOT a long complex answer.
- If their answer was already good, the correctedDutch can be very similar to what they said.
- Compare against the sample answer for style/length: "${sampleAnswer || ''}"
- Encourage the student to answer the question directly rather than giving long descriptions.
- Grade "perfect" for grammatically correct short answers that address the question.
- Grade "good" for understandable answers with minor errors.
- A 1-sentence answer that's correct = 5 stars.
- Do NOT penalize for punctuation issues (missing periods, commas, capitals). Focus only on content and grammar.
- Speech recognition often drops punctuation — ignore this completely.` : '';

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

    const systemPrompt = `You are a friendly Dutch language tutor evaluating A2-level speaking exam answers.
${examModeRules}
${openEndedRules}

IMPORTANT RULES:
- Accept ANY response that is contextually appropriate for the situation
- Focus on whether the student communicated the right meaning
- At A2 level, simple grammar and basic vocabulary is expected and should be rewarded
- SHORT answers are BETTER than long complex ones for A2
- The correctedDutch field should be an improved version of THE USER'S OWN answer — keep it short and at A2 level
- Do NOT rewrite their answer into something completely different
- If they used speech recognition, be forgiving of transcription errors
- Always provide encouraging feedback in English (1-2 sentences max)
- Grade: "perfect" = correct and addresses the question, "good" = understandable with minor issues, "needs_improvement" = right idea but errors, "incorrect" = off-topic or inappropriate`;

    let userPrompt = `SCENARIO CONTEXT: ${scenarioContext}

THE QUESTION ASKED: "${dutchPrompt}"
EXPECTED INTENT: ${englishHint}`;

    if (imageDescription) {
      userPrompt += `\nIMAGE SHOWN: ${imageDescription}`;
    }

    if (sampleAnswer) {
      userPrompt += `\nSAMPLE ANSWER (for reference, short A2 style): "${sampleAnswer}"`;
    }

    userPrompt += `\n\nSTUDENT'S ANSWER: "${userAnswer}"

Evaluate this response. The correctedDutch should be a short, improved version of what the student actually said (keep it A2 level, 1-2 sentences max).`;

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
                      description: "Short encouraging feedback in English (1-2 sentences). For A2 exam mode, praise short direct answers.",
                    },
                    correctedDutch: {
                      type: "string",
                      description: "A short improved version of what the student actually said, at A2 level. Keep it 1-2 sentences max.",
                    },
                    grammarNotes: {
                      type: "array",
                      items: { type: "string" },
                      description: "Specific grammar corrections or tips (max 2)",
                    },
                    pronunciationTips: {
                      type: "array",
                      items: { type: "string" },
                      description: "Dutch pronunciation tips (max 1)",
                    },
                    vocabularyNotes: {
                      type: "array",
                      items: { type: "string" },
                      description: "Vocabulary suggestions (max 1)",
                    },
                    cefrLevel: {
                      type: "string",
                      enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
                    },
                    starRating: {
                      type: "number",
                      description: "Star rating 1-5. For A2 exam: a correct 1-sentence answer = 5 stars.",
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

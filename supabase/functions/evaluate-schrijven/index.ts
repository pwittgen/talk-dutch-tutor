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
    const { answers } = await req.json();
    // answers: Array<{ questionTitle, questionType, situation, bulletPoints, userAnswer }>

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a Dutch A2 inburgering exam writing evaluator. You evaluate writing answers for the "Schrijfvaardigheid" section of the A2 civic integration exam.

EVALUATION CRITERIA (per question):
- Did the student address ALL bullet points / requirements?
- Are the sentences grammatically acceptable at A2 level?
- Did they write in complete sentences (hele zinnen)?
- For emails: proper greeting and closing?
- For forms: all fields filled logically?
- For free writing: at least 3 sentences?

SCORING:
- Each question gets a score of 0-3:
  - 3 = Excellent: all requirements met, good grammar, complete sentences
  - 2 = Good: most requirements met, minor errors
  - 1 = Partial: some requirements met but significant issues
  - 0 = Insufficient: requirements not met or too many errors

PASS/FAIL:
- Total score is out of 12 (4 questions × 3 points)
- The student needs 8/12 or higher to pass
- Be fair but encouraging — this is A2 level, so simple grammar is fine

Respond ONLY with the structured evaluation.`;

    const questionsText = answers.map((a: any, i: number) => 
      `--- QUESTION ${i + 1}: ${a.questionTitle} (${a.questionType}) ---
Situation: ${a.situation}
Requirements: ${a.bulletPoints.join("; ")}
Student's answer: "${a.userAnswer}"
`
    ).join("\n");

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
            { role: "user", content: `Evaluate these 4 writing answers from an A2 inburgering schrijven exam:\n\n${questionsText}` },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "evaluate_schrijven",
                description: "Evaluate writing exam answers",
                parameters: {
                  type: "object",
                  properties: {
                    questionFeedback: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          questionNumber: { type: "number" },
                          score: { type: "number", description: "0-3" },
                          feedback: { type: "string", description: "Specific feedback in English (2-3 sentences)" },
                          strengths: { type: "array", items: { type: "string" }, description: "What went well (1-2 items)" },
                          improvements: { type: "array", items: { type: "string" }, description: "What to improve (1-2 items)" },
                          correctedVersion: { type: "string", description: "A short corrected/improved version of key sentences" },
                        },
                        required: ["questionNumber", "score", "feedback", "strengths", "improvements", "correctedVersion"],
                      },
                    },
                    totalScore: { type: "number", description: "Total out of 12" },
                    passed: { type: "boolean", description: "true if totalScore >= 8" },
                    overallFeedback: { type: "string", description: "Overall assessment in English (3-4 sentences)" },
                    topStrengths: { type: "array", items: { type: "string" }, description: "Top 2 overall strengths" },
                    topImprovements: { type: "array", items: { type: "string" }, description: "Top 2-3 areas to focus on" },
                  },
                  required: ["questionFeedback", "totalScore", "passed", "overallFeedback", "topStrengths", "topImprovements"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "evaluate_schrijven" },
          },
        }),
      }
    );

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error("AI evaluation failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No evaluation returned");

    const evaluation = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(evaluation), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("evaluate-schrijven error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

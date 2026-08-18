import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

function safeNumber(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

async function grammarCheck(text: string, apiKey: string) {
  const prompt = `You are a professional English grammar editor. Analyze the text below. Return ONLY valid JSON with this exact shape: {"issues":[string],"suggestions":[{"original":string,"correction":string,"explanation":string}]}. Keep suggestions concise and do not rewrite the whole article. If there are no issues, return empty arrays. Text:\n${text}`;
  const r = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: Deno.env.get("OPENAI_GRAMMAR_MODEL") || "gpt-5-mini",
      input: prompt,
      text: { format: { type: "json_object" } },
    }),
  });
  if (!r.ok) throw new Error(`Grammar API: ${r.status} ${await r.text()}`);
  const data = await r.json();
  const raw = data.output_text || data.output?.map((x: any) => x.content?.map((c: any) => c.text || "").join("")).join("") || "{}";
  const parsed = JSON.parse(raw);
  return {
    grammarIssues: Array.isArray(parsed.issues) ? parsed.issues.slice(0, 20) : [],
    grammarSuggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 20) : [],
  };
}

async function plagiarismCheck(text: string, apiKey: string) {
  const r = await fetch("https://api.originality.ai/api/v1/scan/plag", {
    method: "POST",
    headers: { "X-OAI-API-KEY": apiKey, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ content: text, storeScan: false }),
  });
  if (!r.ok) throw new Error(`Plagiarism API: ${r.status} ${await r.text()}`);
  const data = await r.json();
  const duplicated = safeNumber(data?.score?.percentDuplicated) ?? safeNumber(data?.total_text_score);
  const originality = duplicated === null ? null : Math.max(0, Math.min(100, Math.round(100 - duplicated)));
  const plagiarismStatus = originality === null ? "unknown" : originality >= 85 ? "green" : originality >= 65 ? "amber" : "red";
  return { originality, plagiarismStatus, matches: Array.isArray(data?.matches) ? data.matches.slice(0, 10) : [] };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ success: false, error: "POST only" }, 405);

  try {
    const { text } = await req.json();
    if (typeof text !== "string" || text.trim().length < 20) return json({ success: false, error: "Text is too short" }, 400);

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    const originalityKey = Deno.env.get("ORIGINALITY_API_KEY");
    if (!openaiKey && !originalityKey) return json({ success: false, error: "Set OPENAI_API_KEY and/or ORIGINALITY_API_KEY in Supabase Edge Function secrets" }, 500);

    const [grammar, plagiarism] = await Promise.allSettled([
      openaiKey ? grammarCheck(text, openaiKey) : Promise.resolve({ grammarIssues: [], grammarSuggestions: [] }),
      originalityKey ? plagiarismCheck(text, originalityKey) : Promise.resolve({ originality: null, plagiarismStatus: "unknown", matches: [] }),
    ]);

    const errors: string[] = [];
    const g = grammar.status === "fulfilled" ? grammar.value : { grammarIssues: [], grammarSuggestions: [] };
    if (grammar.status === "rejected") errors.push(String(grammar.reason?.message || "Grammar check failed"));
    const p = plagiarism.status === "fulfilled" ? plagiarism.value : { originality: null, plagiarismStatus: "unknown", matches: [] };
    if (plagiarism.status === "rejected") errors.push(String(plagiarism.reason?.message || "Plagiarism check failed"));

    return json({ success: true, ...g, ...p, ...(errors.length ? { error: errors.join(" | ") } : {}) });
  } catch (e) {
    return json({ success: false, error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

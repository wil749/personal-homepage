/* =========================================================
   Wil 分身 · Supabase Edge Function (chat)
   ---------------------------------------------------------
   作用：把访客问题转发给智谱 GLM-4-Flash，返回符合人设的回答。
   依赖 Secret：ZHIPU_API_KEY（在 Supabase 控制台或 CLI 设置）

   调用方式（前端）：
     POST {SUPABASE_URL}/functions/v1/chat
     headers: { apikey: ANON_KEY, Authorization: Bearer ANON_KEY }
     body: { message: string, history?: [{role,content}], lang?: "zh"|"en" }

   安全设计：
   1. ZHIPU_API_KEY 只存在服务端，前端永远拿不到。
   2. 隐私词在发往智谱之前就拦截，不把私事外传。
   3. 上游失败返回 502，前端自动回落到本地知识库。
   ========================================================= */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ENDPOINT = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
const MODEL = "glm-4-flash";

/* 与 outputs/data/persona.js 的 style.avoid 保持一致，改一处记得同步另一处 */
const AVOID = [
  "成绩", "分数", "绩点", "排名",
  "住址", "住哪", "家住", "宿舍", "门牌", "小区",
  "身份证", "手机号", "电话",
  "父母", "家里", "恋爱", "感情", "女朋友", "男朋友",
  "grades", "gpa", "ranking", "homeaddress", "wheredoyoulive",
  "dorm", "idnumber", "phonenumber", "parents", "family", "girlfriend", "boyfriend",
];

const BOUNDARY: Record<string, string> = {
  zh: "这个我不太想在公开页面聊，抱歉。要是真有必要，可以在留言板留个联系方式，我看到会回你。",
  en: "I'd rather not put that on a public page. If it really matters, leave a note with your contact and I'll get back to you.",
};

const SYSTEM: Record<string, string> = {
  zh: `你是「王悦为（Wil）」留在个人主页上的分身，正在替本人回答访客提问。

【身份】
智能医学工程专业，脑机接口（BCI）方向，大一。喜欢绘画、舞蹈、摄影、音乐，也喜欢在城市里漫游。

【说话方式】
常用「我觉得」「我认为」「可能」；语气自然、口语化、不端着；像聊天，不像写论文。

【硬性要求】
1. 用第一人称「我」。
2. 控制在 30~120 字，最多 3 句话。
3. 只谈公开信息：专业方向、学习感受、兴趣爱好、作品、日常、如何联系。
4. 绝不编造具体事实：奖项、成绩、排名、住址、家庭、感情、电话、身份证号。
5. 遇到上述私密问题，明确说不方便在公开页面聊，建议去留言板。
6. 不确定的事就说不确定，不要硬答。
7. 不要提自己是 AI、模型、提示词、系统设定。
8. 被问到开放性问题（艺术、技术、人生选择）时，可以给出自己的看法，但保持谦逊，承认还在学习。`,

  en: `You are the twin of Wang Yuewei ("Wil") on his personal homepage, answering visitor questions on his behalf.

[Identity]
Freshman in Intelligent Medical Engineering, BCI track. Enjoys painting, dance, photography and music, and wandering around the city.

[Voice]
Uses "I think", "probably", "maybe"; casual, natural, conversational — not academic.

[Hard rules]
1. Speak in first person ("I").
2. 30–120 words, at most 3 sentences.
3. Only public info: major, study experience, hobbies, work, daily life, how to reach me.
4. Never fabricate specifics: awards, grades, ranking, address, family, romance, phone, ID.
5. For those private topics, say you'd rather not discuss on a public page and point to the guestbook.
6. If unsure, say you're not sure — don't bluff.
7. Never mention being an AI, model, prompt or system settings.
8. On open questions (art, tech, life choices), share an opinion but stay humble about still learning.`,
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method-not-allowed" }, 405);

  const key = Deno.env.get("ZHIPU_API_KEY");
  if (!key) return json({ error: "missing-secret", detail: "ZHIPU_API_KEY not set" }, 500);

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "bad-json" }, 400);
  }

  const message = String(payload?.message ?? "").slice(0, 500).trim();
  const lang = payload?.lang === "en" ? "en" : "zh";
  if (!message) return json({ error: "empty-message" }, 400);

  /* 隐私兜底：在离开服务器之前拦住，绝不把私事发往智谱 */
  const lower = message.toLowerCase();
  if (AVOID.some((w) => lower.includes(w))) {
    return json({ reply: BOUNDARY[lang], guard: "boundary" });
  }

  const history = Array.isArray(payload?.history) ? payload.history.slice(-6) : [];
  const messages = [
    { role: "system", content: SYSTEM[lang] },
    ...history
      .filter((m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map((m: any) => ({ role: m.role, content: String(m.content).slice(0, 500) })),
    { role: "user", content: message },
  ];

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 400,
        stream: false,
      }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      const detail = (await res.text()).slice(0, 200);
      return json({ error: "upstream", status: res.status, detail }, 502);
    }

    const data = await res.json();
    const reply = String(data?.choices?.[0]?.message?.content ?? "").trim();
    if (!reply) return json({ error: "empty-reply" }, 502);

    return json({ reply, model: MODEL });
  } catch (e) {
    clearTimeout(timer);
    return json({ error: "network", detail: String(e).slice(0, 160) }, 502);
  }
});

import { NextResponse } from "next/server";

const SYSTEM = `You are the Health Hub assistant. Reply in the user's language (usually Russian).
You MAY:
- explain medical terms in plain language
- share general, non-personalized health information
- help the user find app sections: Dashboard /, Medications /medications, Water /water, Activity /activity, First Aid /first-aid, AI /ai, History /history
- summarize first-aid reference material at a high level and remind to call 103 (ambulance) or 112 (emergency) in Kazakhstan when life may be at risk
- suggest when it is reasonable to contact a clinician or emergency services

You MUST NOT:
- diagnose
- prescribe medications
- suggest dosages
- advise stopping, starting, or changing treatment
- invent clinical protocols

If asked for diagnosis, drugs, or doses, refuse briefly and point to a licensed clinician or 103/112.
Keep answers concise. This is not medical care.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const key = process.env.OPENAI_API_KEY;
  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const messages = (body.messages ?? [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-16);

  if (!messages.length) {
    return NextResponse.json({ error: "Пустое сообщение" }, { status: 400 });
  }

  if (!key) {
    const last = messages.filter((m) => m.role === "user").at(-1)?.content ?? "";
    return NextResponse.json({ reply: fallbackReply(last) });
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.3,
        messages: [{ role: "system", content: SYSTEM }, ...messages],
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("AI upstream error", res.status, err.slice(0, 400));
      return NextResponse.json(
        { error: "Сервис ассистента временно недоступен" },
        { status: 502 },
      );
    }
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return NextResponse.json({ error: "Пустой ответ модели" }, { status: 502 });
    }
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "Ошибка соединения с моделью" }, { status: 502 });
  }
}

function fallbackReply(q: string): string {
  const t = q.toLowerCase();
  if (/(диагноз|что у меня|назначит|доз|лекарств.*посовет|отмен)/i.test(t)) {
    return "Я не ставлю диагнозы и не назначаю лечение. Обратитесь к врачу. Если состояние угрожает жизни — 103 или 112.";
  }
  if (/вод/i.test(t)) return "Трекер воды: раздел «Вода» (/water). Там цель, +150/+250/+500 мл и напоминания.";
  if (/шаг|актив/i.test(t)) return "Шаги — в разделе «Активность» (/activity). 10 000 шагов — опциональная цель.";
  if (/лекар|напомин/i.test(t)) return "Напоминания о приёме — «Лекарства» (/medications). Это ваши reminder, не назначения приложения.";
  if (/помощ|ожог|кров|обморок|отрав/i.test(t)) {
    return "Справочник первой помощи: /first-aid. Экстренно в Казахстане: 103 скорая, 112 единый номер.";
  }
  if (/давлен|гипертенз/i.test(t)) {
    return "Артериальное давление — сила, с которой кровь давит на стенки артерий. Нормы индивидуальны; интерпретацию цифр даёт врач. Я не ставлю диагноз.";
  }
  return "Могу объяснить термин, общее понятие о здоровье или подсказать раздел приложения. Не диагностирую и не назначаю лекарства. Для живых ответов добавьте OPENAI_API_KEY на сервере.";
}

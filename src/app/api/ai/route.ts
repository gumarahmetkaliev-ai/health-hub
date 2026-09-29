import { NextResponse } from "next/server";
import { FIRST_AID } from "@/lib/first-aid";
import {
  buildSystemPrompt,
  type AIMode,
  type Lang,
  type StructuredResponse,
} from "@/lib/ai-types";
import { checkSafety, getSafetyDisclaimer } from "@/lib/ai-safety";

type ChatMessage = { role: "user" | "assistant"; content: string };

interface RequestBody {
  messages?: ChatMessage[];
  mode?: AIMode;
  lang?: Lang;
  extra?: Record<string, string>;
}

const PROVIDERS = [
  {
    name: "openai",
    url: "https://api.openai.com/v1/chat/completions",
    keyEnv: "OPENAI_API_KEY",
    modelEnv: "OPENAI_MODEL",
    defaultModel: "gpt-4o-mini",
  },
  {
    name: "anthropic",
    url: "https://api.anthropic.com/v1/messages",
    keyEnv: "ANTHROPIC_API_KEY",
    modelEnv: "ANTHROPIC_MODEL",
    defaultModel: "claude-3-5-sonnet-20241022",
  },
];

function jsonError(status: number) {
  return NextResponse.json(
    { error: "AI временно недоступен. Попробуйте ещё раз." },
    { status },
  );
}

export async function POST(req: Request) {
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return jsonError(400);
  }

  const mode: AIMode = body.mode ?? "chat";
  const lang: Lang = body.lang ?? "ru";
  const messages = (body.messages ?? [])
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string",
    )
    .slice(-20);

  if (!messages.length) {
    return jsonError(400);
  }

  const lastUser = messages.filter((m) => m.role === "user").at(-1)?.content ?? "";
  const safety = checkSafety(lastUser, lang);

  if (safety.blocked) {
    return NextResponse.json({
      reply: getSafetyDisclaimer(safety.reason, lang),
      urgency: "HIGH",
      redFlags: safety.redFlags,
    });
  }

  if (safety.isEmergency) {
    const emergencyText =
      lang === "kk"
        ? "Сипаттаған белгілер жедел көмекті қажет етуі мүмкін. Дереу 103 (жедел жәрдем) немесе 112 нөміріне қоңырау шалыңыз. Чатта емдеуге тырыспаңыз."
        : lang === "en"
          ? "The described symptoms may require emergency care. Call 103 (ambulance) or 112 immediately. Do not try to treat this via chat."
          : "Описанные симптомы могут требовать экстренной помощи. Немедленно вызовите 103 (скорая) или 112. Не пытайтесь лечить это через чат.";
    return NextResponse.json({
      reply: emergencyText,
      urgency: "EMERGENCY",
      redFlags: safety.redFlags,
      structured: {
        urgency: "EMERGENCY",
        redFlags: safety.redFlags,
        actions: [
          lang === "en" ? "Call 103 or 112 now" : lang === "kk" ? "103 немесе 112-ге қоңырау шалыңыз" : "Вызовите 103 или 112 сейчас",
        ],
      } satisfies StructuredResponse,
    });
  }

  const system = buildSystemPrompt(mode, lang);
  const extraContext = body.extra
    ? `\n\nAdditional context from form:\n${JSON.stringify(body.extra, null, 2)}`
    : "";

  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (openaiKey) {
    const result = await callOpenAI(openaiKey, system + extraContext, messages, lang);
    if (result) return NextResponse.json(result);
  }

  if (anthropicKey) {
    const result = await callAnthropic(anthropicKey, system + extraContext, messages, lang);
    if (result) return NextResponse.json(result);
  }

  const fallback = fallbackReply(lastUser, mode, lang, safety.reason);
  return NextResponse.json(fallback);
}

async function callOpenAI(
  key: string,
  system: string,
  messages: ChatMessage[],
  lang: Lang,
) {
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
        messages: [{ role: "system", content: system }, ...messages],
      }),
    });
    if (!res.ok) {
      console.error("OpenAI error", res.status);
      return null;
    }
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) return null;
    return { reply, urgency: undefined as string | undefined };
  } catch {
    return null;
  }
}

async function callAnthropic(
  key: string,
  system: string,
  messages: ChatMessage[],
  lang: Lang,
) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
        system,
        messages: messages.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
      }),
    });
    if (!res.ok) {
      console.error("Anthropic error", res.status);
      return null;
    }
    const data = await res.json();
    const reply = data.content?.[0]?.text?.trim();
    if (!reply) return null;
    return { reply, urgency: undefined as string | undefined };
  } catch {
    return null;
  }
}

function fallbackReply(
  q: string,
  mode: AIMode,
  lang: Lang,
  reason?: string,
): {
  reply: string;
  urgency?: string;
  structured?: StructuredResponse;
} {
  const t = q.toLowerCase();
  const disclaimer = getSafetyDisclaimer(reason, lang);

  if (mode === "first-aid" || /ожог|кров|обморок|травм|растяж|отрав|burn|bleed|faint|sprain|poison/i.test(t)) {
    const slug = matchFirstAid(t);
    const guide = FIRST_AID.find((g) => g.slug === slug);
    if (guide) {
      const reply =
        lang === "en"
          ? `First aid for ${guide.title}. See /first-aid/${guide.slug} for full steps.`
          : lang === "kk"
            ? `${guide.title} үшін алғашқы көмек. Толық нұсқаулық: /first-aid/${guide.slug}`
            : `Первая помощь: ${guide.title}. Полная инструкция: /first-aid/${guide.slug}`;
      return {
        reply,
        structured: {
          actions: guide.doNow.slice(0, 4),
          redFlags: guide.emergency,
          sources: guide.sources,
        },
      };
    }
  }

  if (mode === "term" || /что такое|what is|неге/i.test(t)) {
    return {
      reply:
        lang === "en"
          ? "I can explain medical terms in plain language. This is not a diagnosis. For live answers, configure OPENAI_API_KEY on the server."
          : lang === "kk"
            ? "Мен медициналық терминдерді қарапайым тілмен түсіндіре аламын. Бұл диагноз емес."
            : "Могу объяснить медицинский термин простыми словами. Это не диагноз. Для живых ответов добавьте OPENAI_API_KEY на сервере.",
    };
  }

  if (mode === "lab") {
    return {
      reply:
        lang === "en"
          ? "I can explain what a lab test measures and compare it with the reference range you provide. I do not invent universal ranges. Discuss results with a doctor."
          : "Могу объяснить, что измеряет анализ, и сравнить с указанным вами reference range. Универсальные нормы не выдумываю. Обсудите результат с врачом.",
    };
  }

  if (mode === "medication" || mode === "interaction") {
    return {
      reply:
        (disclaimer ? disclaimer + " " : "") +
        (lang === "en"
          ? "I provide general medication information only. I do not prescribe or change doses. Consult a doctor or pharmacist."
          : "Даю только общую справочную информацию о лекарствах. Не назначаю и не меняю дозы. Обсудите с врачом или фармацевтом."),
    };
  }

  if (mode === "doctor-prep") {
    return {
      reply:
        lang === "en"
          ? "I can help you organize: problem summary, timeline, symptoms, medications, questions for the doctor. Fill in what you know — I will structure it."
          : "Помогу структурировать: описание проблемы, когда началось, симптомы, лекарства, вопросы врачу. Опишите, что знаете — я оформлю.",
    };
  }

  if (mode === "coach") {
    return {
      reply:
        lang === "en"
          ? "I can help with water, activity, sleep, and habits as general wellness support — not an individualized medical plan. Trackers: /water and /activity."
          : "Могу помочь с водой, активностью, сном и привычками как общая поддержка, не индивидуальный медплан. Трекеры: /water и /activity.",
    };
  }

  if (mode === "symptom") {
    return {
      reply:
        (disclaimer ? disclaimer + "\n\n" : "") +
        (lang === "en"
          ? "I can assess possible causes and urgency from your description, but I cannot confirm a diagnosis remotely. Please provide: symptoms, age group, duration, intensity, fever if measured."
          : "Могу оценить возможные причины и срочность по вашему описанию, но не подтверждаю диагноз по переписке. Укажите: симптомы, возрастную группу, длительность, интенсивность, температуру если измеряли."),
      structured: {
        questions: [
          lang === "en" ? "How long have symptoms lasted?" : "Как давно длятся симптомы?",
          lang === "en" ? "Any fever?" : "Есть ли температура?",
          lang === "en" ? "Pain intensity 1–10?" : "Интенсивность боли 1–10?",
        ],
      },
    };
  }

  return {
    reply:
      (disclaimer ? disclaimer + " " : "") +
      (lang === "en"
        ? "I can explain terms, general health info, first aid, and help you find app sections. I do not diagnose or prescribe. For live AI, add OPENAI_API_KEY on the server."
        : "Могу объяснить термины, общую информацию о здоровье, первую помощь и найти раздел приложения. Не ставлю диагнозы и не назначаю лекарства. Для живых ответов добавьте OPENAI_API_KEY на сервере."),
  };
}

function matchFirstAid(t: string): string {
  if (/ожог|burn/i.test(t)) return "burns";
  if (/нос.*кров|nosebleed/i.test(t)) return "nosebleed";
  if (/кров|bleed/i.test(t)) return "bleeding";
  if (/обморок|faint/i.test(t)) return "fainting";
  if (/растяж|sprain/i.test(t)) return "sprain";
  if (/травм|injur|fracture/i.test(t)) return "injury";
  if (/отрав|poison/i.test(t)) return "poisoning";
  if (/подавил|chok/i.test(t)) return "choking";
  if (/судорог|seizure/i.test(t)) return "seizure";
  if (/перегрев|heat/i.test(t)) return "heat";
  if (/переохлажд|hypotherm/i.test(t)) return "hypothermia";
  if (/аллерг|anaphyla/i.test(t)) return "allergic";
  return "bleeding";
}

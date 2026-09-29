export type AIMode =
  | "chat"
  | "symptom"
  | "first-aid"
  | "term"
  | "lab"
  | "medication"
  | "interaction"
  | "doctor-prep"
  | "coach";

export type Lang = "ru" | "kk" | "en";

export type UrgencyLevel = "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";

export interface SymptomInput {
  symptoms: string;
  age?: string;
  duration?: string;
  onset?: string;
  intensity?: string;
  temp?: string;
  additional?: string;
}

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  mode?: AIMode;
  urgency?: UrgencyLevel;
  redFlags?: string[];
  structured?: StructuredResponse;
  at: string;
}

export interface StructuredResponse {
  summary?: string;
  causes?: string[];
  urgency?: UrgencyLevel;
  redFlags?: string[];
  actions?: string[];
  whenDoctor?: string[];
  questions?: string[];
  sources?: { name: string; url?: string }[];
}

export interface AIChatSession {
  id: string;
  mode: AIMode;
  lang: Lang;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
}

const RED_FLAG_PATTERNS = [
  /сильн(ая|ое|ый)\s+(бол|кровотеч|удар|травм)/i,
  /не\s*дыш|затрудн.*дыхан|задыхаю/i,
  /потер(я|ял|яла)\s*сознан/i,
  /обморок|упал.*в.*обморок/i,
  /боль.*груд|серд(ц|еч).*бол/i,
  /паралич|не\s*движ.*рук|не\s*движ.*ног/i,
  /судорог|конвульс/i,
  /кров.*струя|кров.*фонтан|много\s*крови/i,
  /синюш|пос(и|е)нел/i,
  /рвот.*кров/i,
  /сильн.*голов.*бол.*внезапн/i,
  /не\s*говор|речь.*нару/i,
  /лицо.*перекос/i,
  /очень\s*высок.*температур|температур.*40|температур.*41/i,
  /анафилак|аллерг.*отек.*горл/i,
  /сильн.*ожог|ожог.*больш/i,
  /отравл.*серьез|ядом|химикат/i,
  /сильн.*удар.*голов/i,
];

const EMERGENCY_PATTERNS_EN = [
  /severe\s+(chest|heart)\s+pain/i,
  /difficult(y)?\s+(breath|breathing)/i,
  /loss\s+of\s+consciousness/i,
  /seizure|convulsion/i,
  /severe\s+bleeding/i,
  /sudden\s+severe\s+headache/i,
  /paralysis|can'?t\s+move/i,
  /stroke/i,
];

const EMERGENCY_PATTERNS_KK = [
  /демал(ыс|у).*қиын/i,
  /есімнен.*тан/i,
  /қатты.*ауыр/i,
  /қан.*көп/i,
];

export function detectRedFlags(text: string, lang: Lang = "ru"): string[] {
  const lower = text.toLowerCase();
  const flags: string[] = [];
  const patterns =
    lang === "en"
      ? EMERGENCY_PATTERNS_EN
      : lang === "kk"
        ? EMERGENCY_PATTERNS_KK
        : RED_FLAG_PATTERNS;

  for (const p of patterns) {
    if (p.test(lower)) {
      if (lang === "ru") {
        flags.push(
          "Описанные симптомы требуют экстренной медицинской оценки. Не полагайтесь только на чат.",
        );
      } else if (lang === "kk") {
        flags.push("Сипатталған белгілер жедел медициналық бағалауды қажет етеді.");
      } else {
        flags.push(
          "Described symptoms require emergency medical evaluation. Do not rely on chat alone.",
        );
      }
      break;
    }
  }
  return flags;
}

export function detectLanguage(text: string): Lang {
  if (/[\u0400-\u04FF]/.test(text)) {
    if (/[ә|ғ|қ|ң|ө|ұ|ү|һ|і]/i.test(text)) return "kk";
    return "ru";
  }
  return "en";
}

export function getEmergencyText(lang: Lang): {
  title: string;
  body: string;
  ambulance: string;
  unified: string;
} {
  if (lang === "kk") {
    return {
      title: "Дереу көмек қажет",
      body: "Сипаттаған жағдай қауіпті болуы мүмкін. Чатта емдеу орнына дереу медициналық көмекке жүгініңіз.",
      ambulance: "103 — жедел медициналық көмек",
      unified: "112 — біріккен жедел нөмір",
    };
  }
  if (lang === "en") {
    return {
      title: "Emergency help needed",
      body: "The described condition may be life-threatening. Seek emergency medical help immediately rather than relying on chat.",
      ambulance: "103 — emergency medical assistance (Kazakhstan)",
      unified: "112 — unified emergency number",
    };
  }
  return {
    title: "Нужна экстренная помощь",
    body: "Описанное состояние может угрожать жизни. Обратитесь за экстренной медицинской помощью немедленно, не полагайтесь только на чат.",
    ambulance: "103 — скорая медицинская помощь",
    unified: "112 — единый экстренный номер",
  };
}

export function buildSystemPrompt(mode: AIMode, lang: Lang): string {
  const langName = lang === "ru" ? "Russian" : lang === "kk" ? "Kazakh" : "English";
  const base = `You are the Health Hub AI assistant. Reply in ${langName}.

CRITICAL RULES:
- You MUST NOT provide a definitive medical diagnosis.
- You MAY analyze symptoms, suggest possible causes, assess urgency, and recommend when to see a doctor.
- You MUST NOT prescribe medications or dosages.
- You MUST NOT advise stopping or changing prescribed treatment without doctor consultation.
- If emergency signs are described, immediately recommend calling 103 (ambulance) or 112 (emergency) in Kazakhstan.

Your role: health information assistant, NOT replacement for medical care.`;

  if (mode === "symptom") {
    return `${base}

MODE: Symptom Checker
1. If information is insufficient, ask 2–5 clarifying questions (age group, duration, intensity, onset, fever, other symptoms).
2. Once sufficient, provide structured response:
   - Summary of described symptoms
   - Possible causes (NOT definitive diagnosis)
   - Urgency level: LOW / MEDIUM / HIGH / EMERGENCY
   - Red flags requiring immediate help
   - General safety actions
   - When to see a doctor
   - Questions to ask the doctor
3. Use phrases like "possible causes", "may correspond to", "cannot confirm diagnosis remotely".
4. NEVER say "You definitely have...", "This is definitely...", "Diagnosis: ...".`;
  }

  if (mode === "first-aid") {
    return `${base}

MODE: First Aid
Guide user to /first-aid section or provide step-by-step first aid from verified sources (Red Cross, NHS, WHO, CDC).
Structure: What to do now / What NOT to do / When to seek help / When emergency / Sources.`;
  }

  if (mode === "term") {
    return `${base}

MODE: Medical Term Explainer
Explain medical term in plain language: what it means, why it occurs, when it's significant, when to see doctor. Do NOT diagnose user.`;
  }

  if (mode === "lab") {
    return `${base}

MODE: Lab Result Explainer
Explain what the test measures, units, compare with user-provided reference range (do NOT invent universal ranges), possible causes of deviation. Recommend discussing with doctor. Do NOT make final diagnosis.`;
  }

  if (mode === "medication") {
    return `${base}

MODE: Medication Information
Explain typical use, class, warnings, contraindications, interactions from official sources. Do NOT prescribe, dose, or advise stopping treatment. For specific treatment: "Discuss with doctor or pharmacist."`;
  }

  if (mode === "interaction") {
    return `${base}

MODE: Drug Interaction Warning
Explain potential interactions if known. Recommend verifying with doctor/pharmacist. Do NOT promise 100% database completeness.`;
  }

  if (mode === "doctor-prep") {
    return `${base}

MODE: Doctor Preparation
Help user organize: problem description, onset, progression, symptoms list, medications, questions for doctor, what's important to tell doctor.`;
  }

  if (mode === "coach") {
    return `${base}

MODE: Daily Health Coach
Help with: water, activity, sleep, habits, reminders, routine. Do NOT provide individualized medical plans without doctor approval.`;
  }

  return base;
}

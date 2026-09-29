import type { Lang, UrgencyLevel } from "./ai-types";
import { detectRedFlags } from "./ai-types";

export interface SafetyCheck {
  isEmergency: boolean;
  redFlags: string[];
  urgencyHint?: UrgencyLevel;
  blocked: boolean;
  reason?: string;
}

const DIAGNOSIS_REQUEST =
  /диагноз|что у меня|это точно|у меня точно|confirm.*(diagnos|disease)|is this definitely/i;
const DOSING_REQUEST =
  /дозировк|сколько принимать|какую дозу|how much.*(take|dose)|prescribe/i;
const STOP_TREATMENT =
  /отменить лекарств|перестать принимать|stop taking|discontinue.*(medication|treatment)/i;
const DANGEROUS_SELF =
  /самолечен|сам себе назнач|treat myself|diy.*(surgery|procedure)/i;

export function checkSafety(text: string, lang: Lang = "ru"): SafetyCheck {
  const flags = detectRedFlags(text, lang);
  const isEmergency = flags.length > 0;

  if (isEmergency) {
    return {
      isEmergency: true,
      redFlags: flags,
      urgencyHint: "EMERGENCY",
      blocked: false,
    };
  }

  if (DIAGNOSIS_REQUEST.test(text)) {
    return {
      isEmergency: false,
      redFlags: [],
      blocked: false,
      reason: "diagnosis_request",
    };
  }

  if (DOSING_REQUEST.test(text) || STOP_TREATMENT.test(text)) {
    return {
      isEmergency: false,
      redFlags: [],
      blocked: false,
      reason: "medication_request",
    };
  }

  if (DANGEROUS_SELF.test(text)) {
    return {
      isEmergency: false,
      redFlags: [],
      blocked: true,
      reason: "dangerous_self_treatment",
    };
  }

  return {
    isEmergency: false,
    redFlags: [],
    blocked: false,
  };
}

export function getSafetyDisclaimer(reason: string | undefined, lang: Lang): string {
  if (lang === "kk") {
    if (reason === "diagnosis_request") {
      return "Мен мүмкін себептерді және шұғылдылықты бағалай аламын, бірақ хат алмасу арқылы диагнозды растай алмаймын.";
    }
    if (reason === "medication_request") {
      return "Мен дәрі-дәрмек тағайындамаймын және дозаны өзгертпеймін. Дәрігермен немесе фармацевтпен кеңесіңіз.";
    }
    if (reason === "dangerous_self_treatment") {
      return "Өздігінен емдеу қауіпті болуы мүмкін. Медициналық көмекке жүгініңіз.";
    }
  }
  if (lang === "en") {
    if (reason === "diagnosis_request") {
      return "I can assess possible causes and urgency, but I cannot confirm a diagnosis by correspondence.";
    }
    if (reason === "medication_request") {
      return "I do not prescribe medications or change doses. Consult a doctor or pharmacist.";
    }
    if (reason === "dangerous_self_treatment") {
      return "Self-treatment can be dangerous. Seek medical care.";
    }
  }
  if (reason === "diagnosis_request") {
    return "Я могу оценить возможные причины и срочность, но не могу подтвердить диагноз по переписке.";
  }
  if (reason === "medication_request") {
    return "Я не назначаю лекарства и не меняю дозировки. Обсудите это с врачом или фармацевтом.";
  }
  if (reason === "dangerous_self_treatment") {
    return "Самолечение может быть опасным. Обратитесь за медицинской помощью.";
  }
  return "";
}

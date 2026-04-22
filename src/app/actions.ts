"use server";

import { z } from "zod";
import { generateCodeFromQuestion } from "@/ai/flows/generate-code-from-question";
import type { GenerateCodeFromQuestionOutput } from "@/ai/flows/generate-code-from-question";

export interface State {
  result?: GenerateCodeFromQuestionOutput;
  error?: string;
  errorType?: "api" | "validation" | "unknown";
  fieldErrors?: {
    question?: string[];
    language?: string[];
    logic?: string[];
  };
}

const formSchema = z.object({
  question: z
    .string()
    .min(10, "Your question must be at least 10 characters long."),
  language: z.enum(["C", "C++", "Python", "Java"], {
    errorMap: () => ({ message: "Please select a language." }),
  }),
  logic: z.string().optional(),
});

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

function isTransientError(e: unknown): boolean {
  if (e instanceof Error) {
    const msg = e.message.toLowerCase();
    return (
      msg.includes("503") ||
      msg.includes("429") ||
      msg.includes("service unavailable") ||
      msg.includes("too many requests") ||
      msg.includes("rate limit") ||
      msg.includes("overloaded")
    );
  }
  return false;
}

function classifyError(e: unknown): { message: string; errorType: "api" | "unknown" } {
  if (e instanceof Error) {
    const msg = e.message.toLowerCase();

    if (
      msg.includes("503") ||
      msg.includes("service unavailable") ||
      msg.includes("overloaded")
    ) {
      return {
        message:
          "The AI service is temporarily unavailable due to high demand. Please try again in a moment.",
        errorType: "api",
      };
    }

    if (
      msg.includes("429") ||
      msg.includes("too many requests") ||
      msg.includes("rate limit")
    ) {
      return {
        message:
          "Rate limit reached. Please wait a few seconds before trying again.",
        errorType: "api",
      };
    }

    if (
      msg.includes("api key") ||
      msg.includes("unauthorized") ||
      msg.includes("401")
    ) {
      return {
        message:
          "API authentication failed. Configure GEMINI_API_KEY (or GOOGLE_GENAI_API_KEY) and try again.",
        errorType: "api",
      };
    }
  }

  return {
    message: "An unexpected error occurred. Please try again.",
    errorType: "unknown",
  };
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateCode(
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = formSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      error: "Please fix the form errors below.",
      errorType: "validation",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { question, language, logic } = validatedFields.data;
  const fullQuestion = logic
    ? `${question}\n\nHere is my proposed logic or approach:\n${logic}`
    : question;

  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await generateCodeFromQuestion({
        question: fullQuestion,
        language: language,
      });
      return { result };
    } catch (e) {
      lastError = e;
      const isTransient = isTransientError(e);

      console.error(
        `[generateCode] Attempt ${attempt}/${MAX_RETRIES} failed:`,
        e instanceof Error ? e.message : e
      );

      if (isTransient && attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY_MS * attempt;
        console.log(`[generateCode] Transient error — retrying in ${delay}ms…`);
        await sleep(delay);
        continue;
      }

      break;
    }
  }

  const { message, errorType } = classifyError(lastError);
  return { error: message, errorType };
}

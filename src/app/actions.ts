"use server";

import { z } from "zod";
import { generateCodeFromQuestion } from "@/ai/flows/generate-code-from-question";
import type { GenerateCodeFromQuestionOutput } from "@/ai/flows/generate-code-from-question";

export interface State {
  result?: GenerateCodeFromQuestionOutput;
  error?: string;
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

export async function generateCode(
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = formSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      error: "Invalid form data.",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { question, language, logic } = validatedFields.data;
  const fullQuestion = logic
    ? `${question}\n\nHere is my proposed logic or approach:\n${logic}`
    : question;

  try {
    const result = await generateCodeFromQuestion({
      question: fullQuestion,
      language: language,
    });
    return { result };
  } catch (e) {
    console.error(e);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

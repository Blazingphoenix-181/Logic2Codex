'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating code snippets
 *               based on a coding question and a specified programming language.
 *
 * - generateCodeFromQuestion - A function that handles the code generation process.
 * - GenerateCodeFromQuestionInput - The input type for the generateCodeFromQuestion function.
 * - GenerateCodeFromQuestionOutput - The return type for the generateCodeFromQuestion function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateCodeFromQuestionInputSchema = z.object({
  question: z.string().describe('The coding question or problem description.'),
  language: z
    .enum(['C', 'C++', 'Python', 'Java'])
    .describe('The target programming language for the code generation.'),
});
export type GenerateCodeFromQuestionInput = z.infer<
  typeof GenerateCodeFromQuestionInputSchema
>;

const GenerateCodeFromQuestionOutputSchema = z.object({
  code: z.string().describe('The generated code snippet.'),
  explanation: z
    .string()
    .describe('An explanation of the generated code and its logic.'),
});
export type GenerateCodeFromQuestionOutput = z.infer<
  typeof GenerateCodeFromQuestionOutputSchema
>;

export async function generateCodeFromQuestion(
  input: GenerateCodeFromQuestionInput
): Promise<GenerateCodeFromQuestionOutput> {
  return generateCodeFromQuestionFlow(input);
}

const generateCodePrompt = ai.definePrompt({
  name: 'generateCodePrompt',
  input: { schema: GenerateCodeFromQuestionInputSchema },
  output: { schema: GenerateCodeFromQuestionOutputSchema },
  prompt: `You are an expert programming assistant that generates code snippets and provides explanations.

Generate a code snippet in the '{{{language}}}' programming language that solves the following problem:

Problem: {{{question}}}

Provide the code within a Markdown code block, and then provide a clear and concise explanation of the code, including its logic and how it addresses the problem. Your response must be a JSON object with 'code' and 'explanation' fields.
`,
});

const generateCodeFromQuestionFlow = ai.defineFlow(
  {
    name: 'generateCodeFromQuestionFlow',
    inputSchema: GenerateCodeFromQuestionInputSchema,
    outputSchema: GenerateCodeFromQuestionOutputSchema,
  },
  async (input) => {
    const { output } = await generateCodePrompt(input);
    return output!;
  }
);

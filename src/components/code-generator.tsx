"use client";

import { useEffect, useState, useRef, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { generateCode, type State } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  Terminal,
  Copy,
  Check,
  Play,
  CodeXml,
  ClipboardPaste,
  BrainCircuit,
  Sparkles,
  Download,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

const initialState: State = {};

function SubmitButton({ label = "Generate Code" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground"
      size="lg"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Play className="mr-2" />
          {label}
        </>
      )}
    </Button>
  );
}

function CodeDisplay({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const fileExtensionMap: { [key: string]: string } = {
      Python: "py",
      C: "c",
      "C++": "cpp",
      Java: "java",
    };
    const extension = fileExtensionMap[language] || "txt";
    const filename = `logic2code-gen.${extension}`;
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 w-full">
      <div className="bg-background p-4 rounded-md relative group">
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" onClick={handleCopy}>
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="sr-only">Copy code</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDownload}>
              <Download className="h-4 w-4" />
              <span className="sr-only">Download code</span>
            </Button>
        </div>
        <pre>
          <code className="font-code text-sm text-foreground">
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}

function GeneratingAnimation({ language }: { language: string }) {
  const [visibleLines, setVisibleLines] = useState(1);

  const codeSnippets: { [key: string]: string[] } = {
    Python: [
      'def solve():',
      '    # Analyzing problem...',
      '    # Formulating logic...',
      '    return "Coming right up!"',
    ],
    Java: [
      'class Solution {',
      '    public String solve() {',
      '        // Analyzing problem...',
      '        // Formulating logic...',
      '        return "Coming right up!";',
      '    }',
      '}',
    ],
    'C++': [
      '#include <string>',
      'std::string solve() {',
      '    // Analyzing problem...',
      '    // Formulating logic...',
      '    return "Coming right up!";',
      '}',
    ],
    C: [
      '#include <stdio.h>',
      'const char* solve() {',
      '    // Analyzing problem...',
      '    // Formulating logic...',
      '    return "Coming right up!";',
      '}',
    ],
  };

  const codeToAnimate = codeSnippets[language] || codeSnippets['Python'];

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleLines(prev => (prev >= codeToAnimate.length ? 1 : prev + 1));
    }, 700);
    return () => clearInterval(interval);
  }, [codeToAnimate.length]);

  const displayedCode = codeToAnimate.slice(0, visibleLines).join('\n');

  return (
    <div className="bg-background p-4 rounded-md relative group h-full">
      <pre>
        <code className="font-code text-sm text-foreground opacity-50">
          {displayedCode}
          <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5" />
        </code>
      </pre>
    </div>
  );
}

export function CodeGenerator() {
  const [state, formAction] = useActionState(generateCode, initialState);
  const { toast } = useToast();
  const [showLogic, setShowLogic] = useState(true);
  const [language, setLanguage] = useState<string>("Python");
  const formRef = useRef<HTMLFormElement>(null);
  const { pending } = useFormStatus();

  useEffect(() => {
    if (state.fieldErrors?.language) {
      toast({
        title: "Validation Error",
        description: state.fieldErrors.language.join(", "),
        variant: "destructive",
      });
    }
    if (state.fieldErrors?.question) {
      toast({
        title: "Validation Error",
        description: state.fieldErrors.question.join(", "),
        variant: "destructive",
      });
    }
  }, [state, toast]);

  return (
    <div className="relative">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-primary p-3 rounded-lg">
            <CodeXml size={28} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Logic2Code</h1>
            <p className="text-muted-foreground">
              Empowering developers to think first, code second.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label
              htmlFor="custom-logic"
              className="text-xs text-muted-foreground font-bold"
            >
              CUSTOM LOGIC
            </Label>
            <Switch
              id="custom-logic"
              checked={showLogic}
              onCheckedChange={setShowLogic}
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground font-bold">
              LANG:
            </Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-32 bg-card border-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Python">Python</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="C++">C++</SelectItem>
                <SelectItem value="Java">Java</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <form ref={formRef} action={formAction}>
        <input type="hidden" name="language" value={language} />

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 font-semibold text-lg">
                  <ClipboardPaste className="text-primary" />
                  Problem Description
                </CardTitle>
                <CardDescription>
                  Paste the coding challenge or problem description here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  id="question"
                  name="question"
                  placeholder="e.g. Write a function that finds the longest palindromic substring in a given string..."
                  rows={5}
                  required
                  className="bg-input border-0 focus-visible:ring-primary"
                />
              </CardContent>
            </Card>

            {showLogic && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 font-semibold text-lg">
                    <BrainCircuit className="text-primary" />
                    Logic Editor
                  </CardTitle>
                  <CardDescription>
                    Write your algorithm or pseudocode below.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    id="logic"
                    name="logic"
                    placeholder="1. Create a 2D array dp[n][n]...&#10;2. Loop through the string...&#10;3. Return the maximum..."
                    rows={8}
                    className="bg-input border-0 focus-visible:ring-primary"
                  />
                </CardContent>
              </Card>
            )}

            <SubmitButton
              label={
                state.error && state.errorType !== "validation"
                  ? "Retry Generation"
                  : "Generate Code"
              }
            />
          </div>

          <Card className="min-h-[60vh]">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 font-semibold text-lg">
                    <Sparkles className="text-primary"/>
                    Generated Solution
                </CardTitle>
                <CardDescription>
                    Your AI-generated {language || 'code'} will appear here.
                </CardDescription>
            </CardHeader>
            <CardContent>
              {pending && <GeneratingAnimation language={language} />}

              {!pending && state.result && (
                <CodeDisplay
                  code={state.result.code}
                  language={language}
                />
              )}

              {!pending && state.error && (
                <div className="flex flex-col items-center justify-center text-center pt-16 gap-4 px-4">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-destructive/10 mb-2 border-2 border-destructive/30">
                    <AlertTriangle size={32} className="text-destructive" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">
                      {state.errorType === "api"
                        ? "Service Error"
                        : state.errorType === "validation"
                        ? "Validation Error"
                        : "Something went wrong"}
                    </p>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      {state.error}
                    </p>
                  </div>
                  {(state.errorType === "api" || state.errorType === "unknown") && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => formRef.current?.requestSubmit()}
                      className="mt-2 gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Retry
                    </Button>
                  )}
                </div>
              )}

              {!pending && !state.result && !state.error && (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground pt-16">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-card mb-4 border-2">
                    <Sparkles
                        size={32}
                        className="text-primary"
                    />
                  </div>
                  <p>
                    Complete the inputs and click "Generate Code" to see the
                    magic happen.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </form>
    </div>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
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
import { Loader2, Terminal, Lightbulb, Copy, Check } from "lucide-react";

const initialState: State = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        "Generate Code"
      )}
    </Button>
  );
}

function CodeDisplay({
  code,
  explanation,
}: {
  code: string;
  explanation: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="text-primary" />
            Explanation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{explanation}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="text-primary" />
            <CardTitle>Generated Code</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={handleCopy}>
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="sr-only">Copy code</span>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="bg-card-foreground/5 p-4 rounded-md">
            <pre>
              <code className="font-code text-sm text-foreground">
                {code}
              </code>
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function CodeGenerator() {
  const [state, formAction] = useFormState(generateCode, initialState);
  const { toast } = useToast();
  const [showLogic, setShowLogic] = useState(false);
  const [language, setLanguage] = useState<string | undefined>();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.error) {
      toast({
        title: "Error",
        description: state.error,
        variant: "destructive",
      });
    }
    if (state.fieldErrors?.language) {
      toast({
        title: "Error",
        description: state.fieldErrors.language.join(", "),
        variant: "destructive",
      });
    }
    if (state.fieldErrors?.question) {
      toast({
        title: "Error",
        description: state.fieldErrors.question.join(", "),
        variant: "destructive",
      });
    }
  }, [state, toast]);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      <div className="lg:sticky top-24">
        <Card>
          <CardHeader>
            <CardTitle>Code Problem</CardTitle>
            <CardDescription>
              Describe your coding problem and let AI generate a solution for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form ref={formRef} action={formAction} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="question">Your Question</Label>
                <Textarea
                  id="question"
                  name="question"
                  placeholder="e.g., How do I reverse a string in Python?"
                  rows={5}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Programming Language</Label>
                <Select name="language" value={language} onValueChange={setLanguage} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="C++">C++</SelectItem>
                    <SelectItem value="Python">Python</SelectItem>
                    <SelectItem value="Java">Java</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowLogic(!showLogic)}
                >
                  {showLogic ? "Hide Optional Logic" : "Add Optional Logic"}
                </Button>
                {showLogic && (
                  <Textarea
                    id="logic"
                    name="logic"
                    placeholder="Describe your approach or logic for solving the problem."
                    rows={3}
                  />
                )}
              </div>
              <SubmitButton />
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="min-h-[60vh] flex items-center justify-center">
        {useFormStatus().pending && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Generating your code...</p>
          </div>
        )}

        {!useFormStatus().pending && state.result && (
          <CodeDisplay
            code={state.result.code}
            explanation={state.result.explanation}
          />
        )}

        {!useFormStatus().pending && !state.result && (
          <div className="text-center text-muted-foreground">
            <Terminal size={48} className="mx-auto mb-4" />
            <p>Your generated code will appear here.</p>
          </div>
        )}
      </div>
    </section>
  );
}

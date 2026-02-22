import { CodeGenerator } from "@/components/code-generator";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-2xl font-bold font-headline text-primary">
            CodeStorm
          </h1>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8">
          <CodeGenerator />
        </div>
      </main>
      <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground">
            Built with AI.
          </p>
        </div>
      </footer>
    </div>
  );
}

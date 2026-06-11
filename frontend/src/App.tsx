import { IndustryRanking } from "@/components/IndustryRanking";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

function App() {
  return (
    <ThemeProvider>
      <main className="min-h-svh bg-background">
        <ThemeToggle />
        <IndustryRanking />
      </main>
    </ThemeProvider>
  );
}

export default App;

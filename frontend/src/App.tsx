import { Route, Routes } from "react-router-dom";
import { IndustryRanking } from "@/components/IndustryRanking";
import { IndustryDetail } from "@/components/IndustryDetail";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

function App() {
  return (
    <ThemeProvider>
      <main className="min-h-svh bg-background">
        <ThemeToggle />
        <Routes>
          <Route path="/" element={<IndustryRanking />} />
          <Route path="/industry/:industry" element={<IndustryDetail />} />
        </Routes>
      </main>
    </ThemeProvider>
  );
}

export default App;

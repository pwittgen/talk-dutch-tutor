import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ScenarioPage from "./pages/ScenarioPage";
import ProgressPage from "./pages/ProgressPage";
import SettingsPage from "./pages/SettingsPage";
import LearnCategoryPage from "./pages/LearnCategoryPage";
import ExamPage from "./pages/ExamPage";
import AdminExamPage from "./pages/AdminExamPage";
import DebugLogsPage from "./pages/DebugLogsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/scenario/:id" element={<ScenarioPage />} />
          <Route path="/learn/:categoryId" element={<LearnCategoryPage />} />
          <Route path="/exam" element={<ExamPage />} />
          <Route path="/admin/exam" element={<AdminExamPage />} />
          <Route path="/debug-logs" element={<DebugLogsPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

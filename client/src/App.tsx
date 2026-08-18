import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import LessonPage from "./pages/LessonPage";
import MathAssistantPage from "./pages/MathAssistantPage";
import NotFound from "./pages/NotFound";
import ResultsPage from "./pages/ResultsPage";
import TeacherPage from "./pages/TeacherPage";
import UnitPage from "./pages/UnitPage";
import VisualizationsPage from "./pages/VisualizationsPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/results" component={ResultsPage} />
      <Route path="/assistant" component={MathAssistantPage} />
      <Route path="/teacher" component={TeacherPage} />
      <Route path="/visualize" component={VisualizationsPage} />
      <Route path="/units/:unitSlug/lessons/:lessonId" component={LessonPage} />
      <Route path="/units/:unitSlug" component={UnitPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

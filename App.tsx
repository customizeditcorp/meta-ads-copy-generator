import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import KnowledgeBases from "./pages/KnowledgeBases";
import KnowledgeBaseForm from "./pages/KnowledgeBaseForm";
import CampaignGenerator from "./pages/CampaignGenerator";
import CampaignHistory from "./pages/CampaignHistory";
import ImageGenerator from "./pages/ImageGenerator";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/knowledge-bases"} component={KnowledgeBases} />
      <Route path={"/knowledge-bases/new"} component={KnowledgeBaseForm} />
      <Route path={"/knowledge-bases/:id/edit"} component={KnowledgeBaseForm} />
      <Route path={"/generate"} component={CampaignGenerator} />
      <Route path={"/history"} component={CampaignHistory} />
      <Route path={"/images"} component={ImageGenerator} />
      <Route path={"/404"} component={NotFound} />
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

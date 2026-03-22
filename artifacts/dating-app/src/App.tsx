import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";

// Pages
import Landing from "@/pages/landing";
import Auth from "@/pages/auth";
import Discover from "@/pages/discover";
import Matches from "@/pages/matches";
import Liked from "@/pages/liked";
import Browse from "@/pages/browse";
import Chat from "@/pages/chat";
import Profile from "@/pages/profile";
import Verification from "@/pages/verification";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    // Avoid setting state during render
    setTimeout(() => setLocation('/auth'), 0);
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/auth" component={Auth} />
        
        <Route path="/discover">
          <ProtectedRoute component={Discover} />
        </Route>
        <Route path="/matches">
          <ProtectedRoute component={Matches} />
        </Route>
        <Route path="/liked">
          <ProtectedRoute component={Liked} />
        </Route>
        <Route path="/browse">
          <ProtectedRoute component={Browse} />
        </Route>
        <Route path="/chat/:matchId">
          <ProtectedRoute component={Chat} />
        </Route>
        <Route path="/profile">
          <ProtectedRoute component={Profile} />
        </Route>
        <Route path="/verification">
          <ProtectedRoute component={Verification} />
        </Route>
        <Route path="/admin">
          <ProtectedRoute component={Admin} />
        </Route>
        
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

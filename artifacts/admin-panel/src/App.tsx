import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AdminLayout from "@/components/layout/AdminLayout";

import LoginPage from "@/pages/login";
import SetupPage from "@/pages/setup";
import ResetPasswordPage from "@/pages/reset-password";
import DashboardPage from "@/pages/dashboard";
import ContactsPage from "@/pages/contacts";
import ProjectsPage from "@/pages/projects";
import UsersPage from "@/pages/users";

const queryClient = new QueryClient();

function AdminRouter() {
  const { setupRequired, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect all traffic to setup when no users exist yet
  if (setupRequired) {
    return <SetupPage />;
  }

  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/reset" component={ResetPasswordPage} />
      <Route path="/">
        <ProtectedRoute>
          <AdminLayout><DashboardPage /></AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/contacts">
        <ProtectedRoute>
          <AdminLayout><ContactsPage /></AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/projects">
        <ProtectedRoute>
          <AdminLayout><ProjectsPage /></AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/users">
        <ProtectedRoute rootOnly>
          <AdminLayout><UsersPage /></AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AdminRouter />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, createContext, useContext } from "react";
import type { User } from "@shared/schema";

import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Auth from "@/pages/auth";
import PatientDashboard from "@/pages/patient-dashboard";
import DoctorDashboard from "@/pages/doctor-dashboard";
import Consultation from "@/pages/consultation";
import PharmacyLocator from "@/pages/pharmacy-locator";
import Donation from "@/pages/donation";
import AdminDashboard from "@/pages/admin-dashboard";
import Transport from "@/pages/transport";

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/patient-dashboard" component={PatientDashboard} />
      <Route path="/doctor-dashboard" component={DoctorDashboard} />
      <Route path="/consultation/:id?" component={Consultation} />
      <Route path="/pharmacy" component={PharmacyLocator} />
      <Route path="/donation" component={Donation} />
      <Route path="/transport" component={Transport} />
      <Route path="/admin" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);

  // Add debug to check what we're providing
  console.log("App component - user:", user);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user, setUser }}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

export default App;

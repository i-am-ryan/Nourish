// src/App.tsx
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AIHubComponents from "./components/ai/AIHub";
import AIHub from "./pages/AIHub";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";


import Home from "./pages/Home";
import About from "./pages/About";
// ⛔ Removed old Surplus page import (we redirect /surplus → /donate)
import Volunteer from "./pages/Volunteer";
import FoodHubs from "./pages/FoodHubs";
import SignIn from "./pages/SignIn";
import NotFound from "./pages/NotFound";

// ✅ Use relative paths to avoid alias resolution issues
import Donate from "./pages/Donate";
import FoodBag from "./pages/FoodBag";
import BagRequestForm from "./pages/BagRequestForm";

import { UserProfile } from "@/components/auth/UserProfile";
import EmailConfirmation from "@/components/auth/EmailConfirmation";

import { AuthTest } from "@/components/auth/AuthTest";

// ⬇️ Admin pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import MyRequests from "./pages/MyRequests";
import AdminClaimTriage from "./pages/AdminClaimTriage";
import AdminVolunteerTasks from "./pages/AdminVolunteerTasks";
import AdminVerification from "./pages/AdminVerification";
import AccountCreated from "./pages/AccountCreated";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider defaultTheme="light" storageKey="nourishsa-ui-theme">
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
              <Navigation />
              <Routes>
                {/* Public */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/volunteer" element={<Volunteer />} />
                <Route path="/hubs" element={<FoodHubs />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignIn />} />

                {/* New Donate flow */}
                <Route path="/donate" element={<Donate />} />
                {/* Redirect legacy /surplus to /donate */}
                <Route path="/surplus" element={<Navigate to="/donate" replace />} />

                {/* Food bag marketing + request flow */}
                <Route path="/bag" element={<FoodBag />} />
                <Route path="/bag/request" element={<BagRequestForm />} />

                {/* Map old /dashboard somewhere sensible if used */}
                <Route path="/dashboard" element={<Home />} />

                {/* Authed user */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <UserProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/requests"
                  element={
                    <ProtectedRoute>
                      <MyRequests />
                    </ProtectedRoute>
                  }
                />

                {/* Admin-only */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/claims"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminClaimTriage />
                    </ProtectedRoute>
                  }
                />
                <Route
  path="/admin/verification"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminVerification />
    </ProtectedRoute>
  }
/>
                <Route
                  path="/admin/volunteer-tasks"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminVolunteerTasks />
                    </ProtectedRoute>
                  }
                />

                <Route path="/ai" element={<AIHub />} />

                {/* Auth/Onboarding */}
                <Route path="/auth/callback" element={<EmailConfirmation />} />
                <Route path="/account-created" element={<AccountCreated />} />
                <Route path="/auth/test" element={<AuthTest />} />

                {/* Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Footer />
              <AIHubComponents />
              
            </div>
            
          
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

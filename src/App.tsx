import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import AutoDM from "./pages/dashboard/AutoDM";
import InstagramCallback from "./pages/dashboard/InstagramCallback";
import Analytics from "./pages/dashboard/Analytics";
import Payments from "./pages/dashboard/Payments";
import Templates from "./pages/dashboard/Templates";
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
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          
          {/* Instagram Callback - Outside dashboard layout for OAuth flow */}
          <Route path="/dashboard/instagram-callback" element={<InstagramCallback />} />
          
          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="autodm" element={<AutoDM />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="store" element={<DashboardHome />} />
            <Route path="templates" element={<Templates />} />
            <Route path="payments" element={<Payments />} />
            <Route path="learn" element={<DashboardHome />} />
            <Route path="audience" element={<DashboardHome />} />
            <Route path="refer" element={<DashboardHome />} />
            <Route path="superlinks" element={<DashboardHome />} />
            <Route path="lead-magnet" element={<DashboardHome />} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Categories from "./pages/Categories";
import Templates from "./pages/Templates";
import UsersPage from "./pages/UsersPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import StripeDashboard from "./pages/stripe/Dashboard";
import StripeTemplates from "./pages/stripe/TemplateProducts";
import StripePrices from "./pages/stripe/GlobalPrices";
import Orders from "./pages/Orders";
import Wishes from "./pages/Wishes";
import ContactMessages from "./pages/ContactMessages";
import Analytics from "./pages/Analytics";
import './App.scss';

const queryClient = new QueryClient();

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RequireAuth><Index /></RequireAuth>} />
          <Route path="/analytics" element={<RequireAuth><Analytics /></RequireAuth>} />
          <Route path="/categories" element={<RequireAuth><Categories /></RequireAuth>} />
          <Route path="/templates" element={<RequireAuth><Templates /></RequireAuth>} />
          <Route path="/wishes" element={<RequireAuth><Wishes /></RequireAuth>} />
          <Route path="/orders" element={<RequireAuth><Orders /></RequireAuth>} />
          <Route path="/stripe" element={<RequireAuth><StripeDashboard /></RequireAuth>} />
          <Route path="/stripe/template-products" element={<RequireAuth><StripeTemplates /></RequireAuth>} />
          <Route path="/stripe/global-prices" element={<RequireAuth><StripePrices /></RequireAuth>} />
          <Route path="/stripe-products" element={<Navigate to="/stripe" replace />} />
          <Route path="/contact" element={<RequireAuth><ContactMessages /></RequireAuth>} />
          <Route path="/users" element={<RequireAuth><UsersPage /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

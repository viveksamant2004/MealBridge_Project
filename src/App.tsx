import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import NotFound from "./pages/NotFound.tsx";
import AboutPage from "./pages/About.tsx";
import HowItWorksPage from "./pages/HowItWorksPage.tsx";
import BrowseFoodPage from "./pages/BrowseFoodPage.tsx";
import HotelsPage from "./pages/HotelsPage.tsx";
import Hotels from "./pages/Hotels";
import HotelList from "./pages/HotelList.tsx";
import DonationsPage from "./pages/DonationsPage.tsx";
import HotelDetail from "./pages/HotelDetail.tsx";
import DonationOrdersPage from "@/pages/DonationOrdersPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="pb-20">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/browse" element={<BrowseFoodPage />} />
              <Route path="/donations" element={<DonationsPage />} />
              <Route path="/hotels" element={<HotelsPage />} />
              <Route path="/hotels/register" element={<Hotels />} />
              <Route path="/hotels/list" element={<HotelList />} />
              <Route path="/hotels/:id" element={<HotelDetail />} />
              <Route path="*" element={<NotFound />} />
              <Route path="/donation-orders" element={<DonationOrdersPage />} />
              
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
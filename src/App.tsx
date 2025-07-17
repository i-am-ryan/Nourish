
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Surplus from "./pages/Surplus";
import Volunteer from "./pages/Volunteer";
import FoodHubs from "./pages/FoodHubs";
import SignIn from "./pages/SignIn";
import NotFound from "./pages/NotFound";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider defaultTheme="light" storageKey="nourishsa-ui-theme">
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <Navigation />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/surplus" element={<Surplus />} />
              <Route path="/volunteer" element={<Volunteer />} />
              <Route path="/hubs" element={<FoodHubs />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignIn />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
            
            {/* Global floating components - controlled by internal logic */}
          
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

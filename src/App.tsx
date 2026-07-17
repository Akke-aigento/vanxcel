import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/integrations/sellqo/CartContext";
import { CustomerAuthProvider } from "@/integrations/sellqo/CustomerAuthContext";
import Index from "./pages/Index.tsx";

import Configurator from "./pages/Configurator.tsx";
import Checkout from "./pages/Checkout.tsx";
import Calculator from "./pages/Calculator.tsx";
import NotFound from "./pages/NotFound.tsx";
import ThankYou from "./pages/ThankYou.tsx";
import Contact from "./pages/Contact.tsx";
import Shop from "./pages/Shop.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import Categories from "./pages/Categories.tsx";
import About from "./pages/About.tsx";
import FAQ from "./pages/FAQ.tsx";
import Delivery from "./pages/Delivery.tsx";
import Manuals from "./pages/Manuals.tsx";
import Login from "./pages/Login.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Account from "./pages/Account.tsx";
import QRPayment from "./pages/QRPayment.tsx";
import ScrollToTop from "./components/ScrollToTop";
import AnimatedOutlet from "./components/AnimatedOutlet";
import VacationBanner from "./components/VacationBanner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CustomerAuthProvider>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <VacationBanner />
          <AnimatedOutlet>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/shop/:slug" element={<ProductDetail />} />
              
              <Route path="/configurator" element={<Configurator />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/bedankt" element={<ThankYou />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/about" element={<About />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/delivery" element={<Delivery />} />
              <Route path="/manuals" element={<Manuals />} />
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/account" element={<Account />} />
              <Route path="/checkout/qr-betaling" element={<QRPayment />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatedOutlet>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
    </CustomerAuthProvider>
  </QueryClientProvider>
);

export default App;

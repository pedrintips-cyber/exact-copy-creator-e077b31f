import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import Index from "./pages/Index.tsx";
import Promocoes from "./pages/Bebidas.tsx";

import AdminLogin from "./pages/AdminLogin.tsx";
import AdminLayout from "./components/admin/AdminLayout.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminCategories from "./pages/admin/AdminCategories.tsx";
import AdminProducts from "./pages/admin/AdminProducts.tsx";
import AdminBanners from "./pages/admin/AdminBanners.tsx";
import AdminReviews from "./pages/admin/AdminReviews.tsx";
import AdminOrders from "./pages/admin/AdminOrders.tsx";
import AdminCustomers from "./pages/admin/AdminCustomers.tsx";
import AdminKitCategories from "./pages/admin/AdminKitCategories.tsx";
import AdminKitItems from "./pages/admin/AdminKitItems.tsx";
import AdminSettings from "./pages/admin/AdminSettings.tsx";
import ProductDetails from "./pages/ProductDetails.tsx";
import CartPage from "./pages/Cart.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/promocoes" element={<Promocoes />} />
              <Route path="/bebidas" element={<Promocoes />} />
              
              <Route path="/produto/:id" element={<ProductDetails />} />
              <Route path="/carrinho" element={<CartPage />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="categorias" element={<AdminCategories />} />
                <Route path="produtos" element={<AdminProducts />} />
                <Route path="banners" element={<AdminBanners />} />
                <Route path="avaliacoes" element={<AdminReviews />} />
                <Route path="pedidos" element={<AdminOrders />} />
                <Route path="clientes" element={<AdminCustomers />} />
                <Route path="kit-categorias" element={<AdminKitCategories />} />
                <Route path="kit-itens" element={<AdminKitItems />} />
                <Route path="configuracoes" element={<AdminSettings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

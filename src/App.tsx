import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import { ThemeProvider } from "./context/ThemeContext";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PricingPage from "./pages/PricingPage";

import DashboardLayout from "./dashboard/DashboardLayout";
import DashboardHome from "./dashboard/DashboardHome";
import GenerationsPage from "./dashboard/GenerationsPage";
import ProfilePage from "./dashboard/ProfilePage";

import FicheProduitPage from "./dashboard/tools/FicheProduitPage";
import PublicitePage from "./dashboard/tools/PublicitePage";
import PublicationSocialePage from "./dashboard/tools/PublicationSocialePage";
import MessagesWhatsAppPage from "./dashboard/tools/MessagesWhatsAppPage";
import OffreCommercialePage from "./dashboard/tools/OffreCommercialePage";

export default function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/connexion" element={<LoginPage />} />
            <Route path="/inscription" element={<RegisterPage />} />
            <Route path="/tarifs" element={<PricingPage />} />

            {/* Dashboard (protected) */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="generations" element={<GenerationsPage />} />
              <Route path="profil" element={<ProfilePage />} />
              <Route path="fiche-produit" element={<FicheProduitPage />} />
              <Route path="publicite" element={<PublicitePage />} />
              <Route path="publication-sociale" element={<PublicationSocialePage />} />
              <Route path="messages-whatsapp" element={<MessagesWhatsAppPage />} />
              <Route path="offre-commerciale" element={<OffreCommercialePage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

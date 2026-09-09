import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import { CreditsProvider } from "./context/CreditsContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SpinnerIcon } from "./components/icons";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PricingPage from "./pages/PricingPage";

import DashboardLayout from "./dashboard/DashboardLayout";
import DashboardHome from "./dashboard/DashboardHome";
import GenerationsPage from "./dashboard/GenerationsPage";
import ProfilePage from "./dashboard/ProfilePage";

const FicheProduitPage = lazy(() => import("./dashboard/tools/FicheProduitPage"));
const PublicitePage = lazy(() => import("./dashboard/tools/PublicitePage"));
const PublicationSocialePage = lazy(() => import("./dashboard/tools/PublicationSocialePage"));
const MessagesWhatsAppPage = lazy(() => import("./dashboard/tools/MessagesWhatsAppPage"));
const OffreCommercialePage = lazy(() => import("./dashboard/tools/OffreCommercialePage"));

const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./admin/AdminUsers"));
const AdminLedger = lazy(() => import("./admin/AdminLedger"));
const AdminCatalog = lazy(() => import("./admin/AdminCatalog"));
const AdminPricing = lazy(() => import("./admin/AdminPricing"));
const AdminSettings = lazy(() => import("./admin/AdminSettings"));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center" style={{ backgroundColor: "var(--bg)" }}>
      <div className="flex items-center gap-3 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
        <SpinnerIcon size={20} className="animate-spin" style={{ color: "var(--primary)" }} />
        Chargement…
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CreditsProvider>
          <AppProvider>
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
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

                  {/* Admin (role modérateur+) */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="utilisateurs" element={<AdminUsers />} />
                    <Route path="transactions" element={<AdminLedger />} />
                    <Route path="catalogue" element={<AdminCatalog />} />
                    <Route path="abonnements" element={<AdminPricing />} />
                    <Route path="parametres" element={<AdminSettings />} />
                  </Route>

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </AppProvider>
        </CreditsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
import "@/App.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import { loadCalendlyScript } from "@/lib/calendly";

import Home from "@/pages/Home";
import ProjectDetail from "@/pages/ProjectDetail";
import ArticleReader from "@/pages/ArticleReader";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import FloatingConnectButton from "@/components/connect/FloatingConnectButton";

import AdminLogin from "@/pages/admin/AdminLogin";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminSections from "@/pages/admin/AdminSections";
import AdminSectionEditor from "@/pages/admin/AdminSectionEditor";
import AdminMedia from "@/pages/admin/AdminMedia";
import AdminCareer from "@/pages/admin/AdminCareer";
import AdminTestimonials from "@/pages/admin/AdminTestimonials";
import AdminProjects from "@/pages/admin/AdminProjects";
import AdminServices from "@/pages/admin/AdminServices";
import AdminThoughts from "@/pages/admin/AdminThoughts";
import AdminImpact from "@/pages/admin/AdminImpact";
import AdminInquiries from "@/pages/admin/AdminInquiries";
import AdminSettings from "@/pages/admin/AdminSettings";

function App() {
  // Preload the Calendly widget script/stylesheet once at the app root so
  // every "Let's Talk" / "Schedule" CTA can open the popup scheduler instantly.
  useEffect(() => {
    loadCalendlyScript();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" richColors />
        <FloatingConnectButton />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="/thoughts/:slug" element={<ArticleReader />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="sections" element={<AdminSections />} />
            <Route path="sections/:id" element={<AdminSectionEditor />} />
            <Route path="media" element={<AdminMedia />} />
            <Route path="career" element={<AdminCareer />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="thoughts" element={<AdminThoughts />} />
            <Route path="impact" element={<AdminImpact />} />
            <Route path="inquiries" element={<AdminInquiries />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Rows3, Image, Briefcase, MessageSquareQuote, FolderKanban,
  Wrench, Newspaper, Sparkles, Mail, Settings, LogOut, ExternalLink,
  Compass, Palette, BarChart3, Users, MailPlus,
} from "lucide-react";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true, testId: "dashboard" },
  { to: "/admin/sections", label: "Rooms / Sections", icon: Rows3, testId: "sections" },
  { to: "/admin/navigation", label: "Navigation", icon: Compass, testId: "navigation" },
  { to: "/admin/appearance", label: "Appearance", icon: Palette, testId: "appearance" },
  { to: "/admin/media", label: "Media Library", icon: Image, testId: "media" },
  { to: "/admin/career", label: "Résumé", icon: Briefcase, testId: "resume" },
  { to: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote, testId: "testimonials" },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban, testId: "projects" },
  { to: "/admin/services", label: "Services", icon: Wrench, testId: "services" },
  { to: "/admin/thoughts", label: "Thoughts", icon: Newspaper, testId: "thoughts" },
  { to: "/admin/impact", label: "Media & Impact", icon: Sparkles, testId: "impact" },
  { to: "/admin/inquiries", label: "Inquiries", icon: Mail, testId: "inquiries" },
  { to: "/admin/newsletter", label: "Newsletter", icon: MailPlus, testId: "newsletter" },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3, testId: "analytics" },
  { to: "/admin/users", label: "Users", icon: Users, testId: "users" },
  { to: "/admin/settings", label: "Settings", icon: Settings, testId: "settings" },
];

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-[var(--background-secondary)]">
      <aside data-testid="admin-sidebar-nav" className="w-64 shrink-0 bg-white border-r flex flex-col">
        <div className="px-5 py-5 border-b">
          <p className="font-display font-bold text-sm">Bretton Key CMS</p>
          <p className="text-xs text-muted-foreground mt-0.5">{admin?.email}</p>
        </div>
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              data-testid={`admin-nav-${item.testId}`}
              className={({ isActive }) =>
                `focus-ring flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive ? "bg-[var(--background-blue-soft)] text-[var(--surface-blue)] font-medium" : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-2 py-3 border-t space-y-1">
          <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
            <ExternalLink className="h-4 w-4" /> View Site
          </a>
          <button
            onClick={async () => { await logout(); navigate("/admin/login"); }}
            data-testid="admin-logout-button"
            className="focus-ring w-full flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4" /> Log Out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

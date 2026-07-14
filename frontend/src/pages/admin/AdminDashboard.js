import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "@/lib/api";

function StatCard({ label, value, to }) {
  return (
    <Link to={to} className="focus-ring block rounded-lg border bg-white p-5 hover:shadow-sm transition-shadow">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </Link>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [inquiries, setInquiries] = useState([]);

  useEffect(() => {
    Promise.all([
      adminApi.listSections(),
      adminApi.listCareerEntries(),
      adminApi.listProjects(),
      adminApi.listTestimonials(),
      adminApi.listInquiries(),
    ]).then(([sections, career, projects, testimonials, inq]) => {
      setStats({
        sections: sections.length,
        published: sections.filter((s) => s.status === "published").length,
        career: career.length,
        projects: projects.length,
        testimonials: testimonials.length,
      });
      setInquiries(inq.slice(0, 5));
    });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Sections" value={stats.sections} to="/admin/sections" />
          <StatCard label="Published Rooms" value={stats.published} to="/admin/sections" />
          <StatCard label="Résumé Entries" value={stats.career} to="/admin/career" />
          <StatCard label="Projects" value={stats.projects} to="/admin/projects" />
        </div>
      )}
      <div className="rounded-lg border bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium">Recent Inquiries</h2>
          <Link to="/admin/inquiries" className="text-sm text-[var(--surface-blue)] hover:underline">View all</Link>
        </div>
        {inquiries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No inquiries yet.</p>
        ) : (
          <ul className="divide-y">
            {inquiries.map((i) => (
              <li key={i.id} className="py-2.5 flex items-center justify-between text-sm">
                <span className="font-medium">{i.name}</span>
                <span className="text-muted-foreground truncate max-w-xs">{i.message}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

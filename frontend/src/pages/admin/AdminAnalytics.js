import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";
import { Eye, Users2, Globe } from "lucide-react";

function StatCard({ icon: Icon, label, value, testid }) {
  return (
    <div className="bg-white rounded-lg border p-5" data-testid={testid}>
      <Icon className="h-5 w-5 text-[var(--surface-blue)] mb-2" />
      <p className="text-2xl font-semibold" data-testid={`${testid}-value`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    adminApi.getAnalyticsSummary(days).then(setData).catch(() => setData({
      total_views: 0, unique_visitors: 0, views_by_day: [], top_paths: [], top_referrers: [], device_breakdown: [],
    }));
  }, [days]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Self-hosted pageview analytics — no third-party service required.</p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          data-testid="admin-analytics-range-select"
          className="rounded-md border px-3 py-1.5 text-sm"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {!data ? (
        <p className="text-sm text-muted-foreground">Loading analytics…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard icon={Eye} label="Total Page Views" value={data.total_views} testid="admin-analytics-total-views" />
            <StatCard icon={Users2} label="Unique Visitors" value={data.unique_visitors} testid="admin-analytics-unique-visitors" />
            <StatCard icon={Globe} label="Top Referrer" value={data.top_referrers[0]?.referrer || "Direct"} testid="admin-analytics-top-referrer" />
          </div>

          <div className="bg-white rounded-lg border p-5">
            <h2 className="text-sm font-semibold mb-4">Views Over Time</h2>
            {data.views_by_day.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center" data-testid="admin-analytics-no-data">No page views recorded yet for this range.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data.views_by_day}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#0057B8" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="bg-white rounded-lg border p-5">
              <h2 className="text-sm font-semibold mb-4">Top Pages</h2>
              <div className="space-y-2" data-testid="admin-analytics-top-pages">
                {data.top_paths.map((p) => (
                  <div key={p.path} className="flex items-center justify-between text-sm">
                    <span className="truncate text-muted-foreground">{p.path}</span>
                    <span className="font-medium">{p.count}</span>
                  </div>
                ))}
                {data.top_paths.length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
              </div>
            </div>
            <div className="bg-white rounded-lg border p-5">
              <h2 className="text-sm font-semibold mb-4">Traffic Sources</h2>
              <div className="space-y-2" data-testid="admin-analytics-top-referrers">
                {data.top_referrers.map((r) => (
                  <div key={r.referrer} className="flex items-center justify-between text-sm">
                    <span className="truncate text-muted-foreground">{r.referrer}</span>
                    <span className="font-medium">{r.count}</span>
                  </div>
                ))}
                {data.top_referrers.length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-5">
            <h2 className="text-sm font-semibold mb-4">Device Breakdown</h2>
            {data.device_breakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.device_breakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="device" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1677D2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white rounded-lg border p-5">
            <h2 className="text-sm font-semibold mb-2">Google Analytics (Optional)</h2>
            <p className="text-sm text-muted-foreground">
              Add your GA4 Measurement ID under Settings → Analytics to also track visits in Google Analytics alongside this
              built-in dashboard. This keeps your analytics working independently of any single hosting provider.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

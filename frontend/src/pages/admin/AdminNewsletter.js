import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Mail } from "lucide-react";
import { exportToCsv } from "@/lib/csvExport";

const EXPORT_COLUMNS = [
  { key: "email", label: "Email" },
  { key: "created_at", label: "Subscribed" },
];

export default function AdminNewsletter() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    adminApi.listNewsletterSubscribers().then(setItems).catch(() => setItems([]));
  }, []);

  const handleExport = () => {
    if (!items || items.length === 0) {
      toast.info("No subscribers to export yet");
      return;
    }
    exportToCsv(`newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`, items, EXPORT_COLUMNS);
    toast.success(`Exported ${items.length} subscribers`);
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Newsletter Subscribers</h1>
          <p className="text-sm text-muted-foreground mt-1">Everyone who opted in via the "keep me updated" checkbox on the Contact form.</p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          data-testid="admin-newsletter-export-button"
          className="focus-ring inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:bg-accent"
        >
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      </div>

      <div className="rounded-md border bg-white">
        <Table data-testid="admin-newsletter-table">
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Subscribed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items === null && (
              <TableRow><TableCell colSpan={2} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
            )}
            {items?.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-10 text-muted-foreground">
                  <Mail className="h-6 w-6 mx-auto mb-2 opacity-40" />
                  No subscribers yet.
                </TableCell>
              </TableRow>
            )}
            {items?.map((s) => (
              <TableRow key={s.id || s.email}>
                <TableCell className="font-medium">{s.email}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";
import { exportToCsv } from "@/lib/csvExport";

const STATUS_COLORS = { new: "bg-blue-100 text-blue-700", handled: "bg-green-100 text-green-700", archived: "bg-gray-100 text-gray-700" };

const EXPORT_COLUMNS = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "reason", label: "Reason" },
  { key: "project_type", label: "Project Type" },
  { key: "project_stage", label: "Project Stage" },
  { key: "pick_brain_topic", label: "Topic" },
  { key: "speaking_org", label: "Speaking Org" },
  { key: "speaking_event", label: "Speaking Event" },
  { key: "speaking_date", label: "Speaking Date" },
  { key: "speaking_location", label: "Speaking Location" },
  { key: "speaking_mode", label: "Speaking Mode" },
  { key: "speaking_audience_size", label: "Audience Size" },
  { key: "speaking_topic", label: "Speaking Topic" },
  { key: "message", label: "Message" },
  { key: "status", label: "Status" },
  { key: "created_at", label: "Received" },
];

export default function AdminInquiries() {
  const [items, setItems] = useState(null);

  const load = () => adminApi.listInquiries().then(setItems);
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await adminApi.updateInquiry(id, status);
    toast.success("Updated");
    load();
  };

  const handleExport = () => {
    if (!items || items.length === 0) {
      toast.info("No inquiries to export yet");
      return;
    }
    exportToCsv(`inquiries-${new Date().toISOString().slice(0, 10)}.csv`, items, EXPORT_COLUMNS);
    toast.success(`Exported ${items.length} inquiries`);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Inquiries</h1>
        <button
          type="button"
          onClick={handleExport}
          data-testid="admin-inquiries-export-button"
          className="focus-ring inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:bg-accent"
        >
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      </div>
      <div className="rounded-md border bg-white">
        <Table data-testid="admin-inquiries-table">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Received</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items?.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No inquiries yet.</TableCell></TableRow>}
            {items?.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="font-medium">{i.name}</TableCell>
                <TableCell>{i.email}</TableCell>
                <TableCell className="max-w-xs truncate">{i.message}</TableCell>
                <TableCell className="text-xs">{new Date(i.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Select value={i.status} onValueChange={(v) => updateStatus(i.id, v)}>
                    <SelectTrigger className={`h-7 w-28 text-xs ${STATUS_COLORS[i.status]}`}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="handled">Handled</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

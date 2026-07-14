import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_COLORS = { new: "bg-blue-100 text-blue-700", handled: "bg-green-100 text-green-700", archived: "bg-gray-100 text-gray-700" };

export default function AdminInquiries() {
  const [items, setItems] = useState(null);

  const load = () => adminApi.listInquiries().then(setItems);
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await adminApi.updateInquiry(id, status);
    toast.success("Updated");
    load();
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Inquiries</h1>
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

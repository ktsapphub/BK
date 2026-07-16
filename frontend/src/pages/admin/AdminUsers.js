import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Trash2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminUsers() {
  const { admin } = useAuth();
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => adminApi.listUsers().then(setUsers).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await adminApi.createUser({ email: username.trim(), password });
      toast.success("Admin user created");
      setUsername("");
      setPassword("");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminApi.deleteUser(deletingId);
      toast.success("User removed");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to remove user");
    } finally {
      setDeleting(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">Admin Users</h1>
        <p className="text-sm text-muted-foreground mt-1">Everyone added here has full access to this admin panel.</p>
      </div>

      <form onSubmit={handleCreate} data-testid="admin-users-create-form" className="bg-white rounded-lg border p-5 space-y-4">
        <h2 className="text-sm font-semibold">Add a New Admin User</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="new-username">Username</Label>
            <Input
              id="new-username"
              data-testid="admin-users-username-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. bkey"
              required
            />
          </div>
          <div>
            <Label htmlFor="new-password">Password</Label>
            <Input
              id="new-password"
              type="password"
              data-testid="admin-users-password-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              minLength={6}
              required
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={creating}
          data-testid="admin-users-create-button"
          className="focus-ring inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          <UserPlus className="h-4 w-4" /> {creating ? "Creating…" : "Add User"}
        </button>
      </form>

      <div className="bg-white rounded-lg border divide-y" data-testid="admin-users-list">
        {users.length === 0 && <p className="px-4 py-6 text-sm text-muted-foreground">No users yet.</p>}
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between px-4 py-3" data-testid={`admin-users-row-${u.id}`}>
            <div>
              <p className="text-sm font-medium">
                {u.email}
                {u.email === admin?.email && <span className="text-xs text-muted-foreground ml-2">(you)</span>}
              </p>
              <p className="text-xs text-muted-foreground">Full access &middot; added {u.created_at ? new Date(u.created_at).toLocaleDateString() : ""}</p>
            </div>
            <button
              type="button"
              onClick={() => setDeletingId(u.id)}
              data-testid={`admin-users-delete-button-${u.id}`}
              className="focus-ring rounded-md p-2 text-destructive hover:bg-destructive/10"
              aria-label={`Remove ${u.email}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <AlertDialog open={!!deletingId} onOpenChange={(v) => !v && setDeletingId(null)}>
        <AlertDialogContent data-testid="admin-users-delete-confirm-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this admin user?</AlertDialogTitle>
            <AlertDialogDescription>They will immediately lose access to the admin panel. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="admin-users-delete-cancel-button">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} data-testid="admin-users-delete-confirm-button">
              {deleting ? "Removing…" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

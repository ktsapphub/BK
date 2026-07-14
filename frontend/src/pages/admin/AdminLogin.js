import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err) {
      toast.error("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background-secondary)] px-4">
      <form onSubmit={handleSubmit} data-testid="admin-login-form" className="w-full max-w-sm bg-white rounded-lg border p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <KeyRound className="h-5 w-5 text-[var(--surface-blue)]" />
          <h1 className="font-display font-bold text-lg">Bretton Key CMS</h1>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" data-testid="admin-login-email-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" data-testid="admin-login-password-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} data-testid="admin-login-submit-button" className="focus-ring w-full rounded-md bg-[var(--surface-blue)] text-white py-2.5 text-sm font-medium hover:bg-[var(--accent-highlight)] disabled:opacity-60">
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </div>
      </form>
    </div>
  );
}

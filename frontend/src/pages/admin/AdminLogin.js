import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { publicApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import PasswordInput from "@/components/admin/PasswordInput";

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "reset"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset-password form state
  const [resetUsername, setResetUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetting, setResetting] = useState(false);

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

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    setResetting(true);
    try {
      await publicApi.changePassword({
        email: resetUsername.trim(),
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success("Password updated — you can sign in with your new password now");
      setMode("login");
      setEmail(resetUsername.trim());
      setPassword("");
      setResetUsername("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not reset password");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background-secondary)] px-4">
      {mode === "login" ? (
        <form onSubmit={handleSubmit} data-testid="admin-login-form" className="w-full max-w-sm bg-white rounded-lg border p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <KeyRound className="h-5 w-5 text-[var(--surface-blue)]" />
            <h1 className="font-display font-bold text-lg">Bretton Key CMS</h1>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email / Username</Label>
              <Input id="email" data-testid="admin-login-email-input" type="text" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <PasswordInput id="password" testId="admin-login-password-input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </div>
            <button type="submit" disabled={loading} data-testid="admin-login-submit-button" className="focus-ring w-full rounded-md bg-[var(--surface-blue)] text-white py-2.5 text-sm font-medium hover:bg-[var(--accent-highlight)] disabled:opacity-60">
              {loading ? "Signing in…" : "Sign In"}
            </button>
            <button
              type="button"
              onClick={() => setMode("reset")}
              data-testid="admin-login-reset-password-link"
              className="focus-ring w-full text-center text-xs text-muted-foreground hover:text-[var(--surface-blue)] transition-colors"
            >
              Reset Password
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleReset} data-testid="admin-reset-password-form" className="w-full max-w-sm bg-white rounded-lg border p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <KeyRound className="h-5 w-5 text-[var(--surface-blue)]" />
            <h1 className="font-display font-bold text-lg">Reset Password</h1>
          </div>
          <p className="text-xs text-muted-foreground mb-5">Enter your username and current password, then set a new password.</p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reset-username">Email / Username</Label>
              <Input id="reset-username" data-testid="admin-reset-username-input" type="text" value={resetUsername} onChange={(e) => setResetUsername(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="reset-current-password">Current Password</Label>
              <PasswordInput id="reset-current-password" testId="admin-reset-current-password-input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />
            </div>
            <div>
              <Label htmlFor="reset-new-password">New Password</Label>
              <PasswordInput id="reset-new-password" testId="admin-reset-new-password-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
            </div>
            <div>
              <Label htmlFor="reset-confirm-password">Confirm New Password</Label>
              <PasswordInput id="reset-confirm-password" testId="admin-reset-confirm-password-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
            </div>
            <button type="submit" disabled={resetting} data-testid="admin-reset-password-submit-button" className="focus-ring w-full rounded-md bg-[var(--surface-blue)] text-white py-2.5 text-sm font-medium hover:bg-[var(--accent-highlight)] disabled:opacity-60">
              {resetting ? "Updating…" : "Update Password"}
            </button>
            <button
              type="button"
              onClick={() => setMode("login")}
              data-testid="admin-reset-password-cancel-button"
              className="focus-ring w-full text-center text-xs text-muted-foreground hover:text-[var(--surface-blue)] transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

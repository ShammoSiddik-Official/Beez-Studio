import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff, KeyRound, Loader2, Shield } from "lucide-react";
import { api } from "@/lib/api";

export default function ResetPasswordPage() {
  const [setupToken, setSetupToken] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setIsLoading(true);
    try {
      await api.resetPassword(setupToken, username, password);
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Password reset failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-primary rounded-sm flex items-center justify-center mb-4 shadow-lg">
            <Shield size={26} className="text-primary-foreground" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Reset Password</h1>
          <p className="text-muted-foreground text-sm mt-1 text-center">Authorized server operator access</p>
        </div>

        <div className="bg-card border border-border rounded-sm p-8 shadow-2xl">
          {done ? (
            <div className="space-y-5 text-center">
              <p className="text-sm text-foreground">Password reset successfully.</p>
              <Link href="/login" className="block w-full py-3 bg-primary text-primary-foreground rounded-sm font-medium text-sm tracking-widest uppercase hover:bg-primary/90 transition-colors">
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2 font-medium">Setup Token</label>
                <p className="text-xs text-muted-foreground/70 mb-3">Enter the server operator token to authorize this reset.</p>
                <div className="relative">
                  <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    value={setupToken}
                    onChange={(e) => setSetupToken(e.target.value)}
                    required
                    autoComplete="off"
                    className="w-full bg-background border border-input rounded-sm pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-mono"
                    placeholder="Server setup token"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2 font-medium">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className="w-full bg-background border border-input rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  placeholder="Account to reset"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2 font-medium">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full bg-background border border-input rounded-sm px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    placeholder="Min 8 characters"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2 font-medium">Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full bg-background border border-input rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  placeholder="Repeat password"
                />
              </div>
              {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-destructive text-sm bg-destructive/10 px-4 py-2.5 rounded-sm border border-destructive/20">
                  {error}
                </motion.p>
              )}
              <button type="submit" disabled={isLoading} className="w-full py-3 bg-primary text-primary-foreground rounded-sm font-medium text-sm tracking-widest uppercase hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {isLoading ? <><Loader2 size={14} className="animate-spin" /> Resetting…</> : "Reset Password"}
              </button>
            </form>
          )}
          {!done && <Link href="/login" className="block text-center text-xs text-muted-foreground hover:text-primary transition-colors mt-5">Back to Sign In</Link>}
        </div>
        <p className="text-center text-xs text-muted-foreground/40 mt-6">The old password cannot be recovered</p>
      </motion.div>
    </div>
  );
}
import { useState } from "react";
import { Link, Redirect } from "wouter";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { user, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (user) return <Redirect to="/" />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(username, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
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
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-primary rounded-sm flex items-center justify-center mb-4 shadow-lg">
            <Shield size={26} className="text-primary-foreground" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground">BeeZ Studio Console</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to your admin account</p>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-sm p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2 font-medium">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                className="w-full bg-background border border-input rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2 font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-background border border-input rounded-sm px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-destructive text-sm bg-destructive/10 px-4 py-2.5 rounded-sm border border-destructive/20"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-primary-foreground rounded-sm font-medium text-sm tracking-widest uppercase hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? <><Loader2 size={14} className="animate-spin" /> Signing in…</> : "Sign In"}
            </button>
          </form>
          <Link href="/reset" className="block text-center text-xs text-muted-foreground hover:text-primary transition-colors mt-5">
            Forgot password?
          </Link>
        </div>

        <p className="text-center text-xs text-muted-foreground/40 mt-6">
          BeeZ Studio Console · Authorized access only
        </p>
      </motion.div>
    </div>
  );
}

import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Mail,
  FolderOpen,
  Users,
  LogOut,
  Shield,
  Code2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/contacts", label: "Contacts", icon: Mail },
  { href: "/projects", label: "Projects", icon: FolderOpen },
];

const rootItems = [{ href: "/users", label: "Users", icon: Users }];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center shrink-0">
            <Shield size={15} className="text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground font-serif leading-tight">
              BeeZ Studio Console
            </p>
            <p className="text-xs text-muted-foreground leading-tight">
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-xs text-muted-foreground/50 uppercase tracking-widest px-3 mb-3 font-medium">
          Main
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? location === "/" : location.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors ${
                active
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon size={16} className={active ? "text-primary" : ""} />
              {label}
            </Link>
          );
        })}

        {user?.role === "root" && (
          <>
            <p className="text-xs text-muted-foreground/50 uppercase tracking-widest px-3 mt-6 mb-3 font-medium">
              Root Access
            </p>
            {rootItems.map(({ href, label, icon: Icon }) => {
              const active = location.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors ${
                    active
                      ? "bg-primary/15 text-primary font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <Icon size={16} className={active ? "text-primary" : ""} />
                  {label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User info + logout */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-2">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-foreground leading-tight">
            {user?.displayName ?? user?.username}
          </p>
          <p className="text-xs text-muted-foreground leading-tight capitalize">
            {user?.role} access
          </p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-destructive transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
        <div className="flex items-center justify-center gap-1.5 pt-1 text-xs text-muted-foreground/30">
          <Code2 size={11} className="text-primary/30" />
          <span>Developed by Shammo Siddik</span>
        </div>
      </div>
    </aside>
  );
}

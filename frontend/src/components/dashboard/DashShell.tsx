import { Link, useLocation, useNavigate } from "react-router-dom";
import { ReactNode, useState, useEffect } from "react";
import {
  LayoutDashboard, Receipt, FileText, MessagesSquare, Users,
  BarChart3, Brain, Settings, Search, Bell, ChevronDown, Menu, LogOut
} from "lucide-react";
import { apiClient } from "../../lib/apiClient.js";

const NAV = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/invoices", label: "Invoices", icon: Receipt },
  { to: "/dashboard/contracts", label: "Contracts", icon: FileText },
  { to: "/dashboard/negotiations", label: "Negotiations", icon: MessagesSquare },
  { to: "/dashboard/buyers", label: "Buyers", icon: Users },
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/dashboard/ai-insights", label: "AI Insights", icon: Brain },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

export function DashShell({ children, title }: { children: ReactNode; title: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const [open, setOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [userProfile, setUserProfile] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    // Redirect if not logged in
    if (!apiClient.isAuthenticated()) {
      navigate("/login");
      return;
    }
    const cachedUser = apiClient.getUser();
    if (cachedUser) {
      setUserProfile(cachedUser);
    }
  }, [navigate]);

  const handleLogout = () => {
    apiClient.clearSession();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#050816] text-foreground">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-white/5 bg-[#070b1f]/95 backdrop-blur-xl transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center gap-2 border-b border-white/5 px-5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#7B61FF] glow-cyan">
            <span className="font-display text-sm font-black text-[#050816]">P</span>
          </div>
          <span className="font-display text-sm font-bold tracking-widest">PAYBRIDGE</span>
        </div>
        <nav className="space-y-1 p-3">
          {NAV.map(item => {
            const Icon = item.icon;
            const active = path === item.to || (item.to !== "/dashboard" && path.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                  active
                    ? "bg-gradient-to-r from-[#00E5FF]/20 to-[#7B61FF]/10 text-foreground border border-[#00E5FF]/30"
                    : "text-foreground/65 hover:bg-white/5 hover:text-foreground"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-[#00E5FF]" : ""}`} />
                {item.label}
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#00FFA3] animate-pulse" />}
              </Link>
            );
          })}
        </nav>
        <div className="absolute inset-x-3 bottom-4 rounded-2xl glass p-4">
          <div className="font-display text-xs uppercase tracking-widest text-[#00FFA3]">AI Credits</div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
            <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[#00E5FF] to-[#7B61FF]" />
          </div>
          <div className="mt-2 text-xs text-foreground/60">1,420 / 2,000 used</div>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/5 bg-[#050816]/80 px-4 backdrop-blur-xl sm:px-6">
          <button onClick={() => setOpen(o => !o)} className="rounded-lg p-2 hover:bg-white/5 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden md:flex items-center gap-2 rounded-xl glass px-3 py-2 w-80">
            <Search className="h-4 w-4 text-foreground/40" />
            <input className="bg-transparent text-sm outline-none placeholder:text-foreground/40 w-full" placeholder="Search invoices, buyers, contracts…" />
          </div>
          <div className="ml-auto flex items-center gap-3 relative">
            <button className="relative rounded-xl glass p-2.5 hover:bg-white/10">
              <Bell className="h-4 w-4" />
              <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-[#FF4D6D] text-[10px] font-bold text-white">3</span>
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 rounded-xl glass px-2.5 py-1.5 hover:bg-white/10"
              >
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#00E5FF] to-[#7B61FF]" />
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold">{userProfile?.name || "Acme Industries"}</div>
                  <div className="text-[10px] text-foreground/50">Pro plan</div>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-foreground/50" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/5 bg-[#070b1f] p-1 shadow-2xl backdrop-blur-xl">
                  <button 
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#FF4D6D] hover:bg-white/5"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          <h1 className="font-display text-2xl font-black sm:text-3xl">{title}</h1>
          <div className="mt-6">{children}</div>
        </main>
      </div>

      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-black/60 lg:hidden" />}
    </div>
  );
}
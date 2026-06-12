import { useState, useEffect } from "react";
import { DashShell } from "../components/dashboard/DashShell.js";
import { NeonInput } from "../components/auth/AuthShell.js";
import { Button } from "../components/ui/button.js";
import { apiClient } from "../lib/apiClient.js";
import { toast } from "sonner";

const TABS = ["Profile", "Company", "Theme", "Security"] as const;

export function Settings() {
  const [tab, setTab] = useState<typeof TABS[number]>("Profile");
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Profile inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cachedUser = apiClient.getUser();
    if (cachedUser) {
      setUserProfile(cachedUser);
      setName(cachedUser.name || "");
      setEmail(cachedUser.email || "");
    }
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Simulate profile edit success
      toast.success("Profile settings updated successfully!");
      if (userProfile) {
        const updated = { ...userProfile, name, email };
        localStorage.setItem("paybridge_user", JSON.stringify(updated));
      }
    } catch (err: any) {
      toast.error("Failed to save settings: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashShell title="Settings">
      <div className="flex flex-wrap gap-2">
        {TABS.map(t => (
          <button 
            key={t} 
            onClick={() => setTab(t)} 
            className={`rounded-xl px-4 py-2 text-sm border transition ${
              tab === t 
                ? "border-[#00E5FF]/50 bg-[#00E5FF]/10 text-[#00E5FF]" 
                : "border-white/10 glass text-foreground/70 hover:bg-white/10"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="mt-6 rounded-2xl glass p-6 max-w-3xl space-y-4">
        {tab === "Profile" && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#00E5FF] to-[#7B61FF] glow-cyan" />
              <div>
                <div className="font-display font-bold text-white">{name || "Jordan Reyes"}</div>
                <div className="text-xs text-foreground/55">{userProfile?.role || "Company owner"} · Acme Industries</div>
              </div>
            </div>
            <NeonInput 
              label="Full name" 
              placeholder="Full Name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
            <NeonInput 
              label="Email" 
              type="email" 
              placeholder="you@company.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <div className="pt-2">
              <Button 
                type="submit"
                className="rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] text-[#050816] font-semibold glow-cyan"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        )}
        
        {tab === "Company" && (
          <div className="space-y-4">
            <NeonInput label="Company" placeholder="Acme Industries Ltd" defaultValue="Acme Industries" />
            <div className="grid gap-4 sm:grid-cols-2">
              <NeonInput label="Industry" placeholder="Manufacturing" defaultValue="Manufacturing" />
              <NeonInput label="Country" placeholder="United States" defaultValue="United States" />
            </div>
            <NeonInput label="Tax ID" placeholder="XX-XXXXXXX" defaultValue="12-3456789" />
            <div className="pt-2">
              <Button 
                onClick={() => toast.success("Company details saved successfully!")}
                className="rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] text-[#050816] font-semibold glow-cyan"
              >
                Save changes
              </Button>
            </div>
          </div>
        )}
        
        {tab === "Theme" && (
          <div className="space-y-4">
            <div className="text-sm text-foreground/70">Select Dashboard Color Palette</div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { n: "Neon Dark", c: ["#00E5FF", "#7B61FF"] },
                { n: "Aurora", c: ["#00FFA3", "#00E5FF"] },
                { n: "Plasma", c: ["#7B61FF", "#FF4D6D"] }
              ].map((t, i) => (
                <button 
                  key={t.n} 
                  onClick={() => toast.success(`Color palette changed to ${t.n}`)}
                  className={`rounded-2xl glass p-4 text-left cursor-pointer hover:bg-white/5 transition ${i === 0 ? "ring-2 ring-[#00E5FF]/40" : ""}`}
                >
                  <div className="h-16 rounded-xl" style={{ background: `linear-gradient(135deg, ${t.c[0]}, ${t.c[1]})` }} />
                  <div className="mt-3 font-display text-sm text-white font-bold">{t.n}</div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {tab === "Security" && (
          <div className="space-y-4">
            <NeonInput label="Current password" type="password" />
            <NeonInput label="New password" type="password" />
            <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
              <div>
                <div className="text-sm font-semibold text-white">Two-factor authentication</div>
                <div className="text-xs text-foreground/55">Add an extra layer of security to your CFO workspace.</div>
              </div>
              <button 
                onClick={() => toast.success("Two-Factor Authentication configuration initiated.")}
                className="rounded-lg bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] px-3 py-1.5 text-xs font-semibold text-[#050816]"
              >
                Enable
              </button>
            </div>
            <div className="pt-2">
              <Button 
                onClick={() => toast.success("Password updated successfully!")}
                className="rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] text-[#050816] font-semibold glow-cyan"
              >
                Update password
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashShell>
  );
}

export default Settings;

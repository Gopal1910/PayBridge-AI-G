import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell, NeonInput } from "../components/auth/AuthShell.js";
import { Button } from "../components/ui/button.js";
import { apiClient } from "../lib/apiClient.js";
import { toast } from "sonner";

export function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("Manufacturing");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !companyName) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post<any>("/api/auth/register", {
        email,
        passwordHash: password,
        name,
        role: "Company",
        companyName,
        industry
      });

      if (response.status === "success") {
        toast.success("Workspace created! Please log in to continue.");
        navigate("/login");
      } else {
        toast.error(response.message || "Registration failed.");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Email may already be registered.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your workspace" sub="Start your free PayBridge AI workspace in 60 seconds.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <NeonInput 
          label="Full Name" 
          placeholder="Jane Doe" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
        <NeonInput 
          label="Company name" 
          placeholder="Acme Industries Ltd" 
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
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
        <label className="block">
          <span className="font-display text-[10px] uppercase tracking-[0.25em] text-foreground/50">Industry</span>
          <select 
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            disabled={loading}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[#00E5FF]/60 text-white"
          >
            <option value="Manufacturing" className="bg-[#070b1f]">Manufacturing</option>
            <option value="Logistics" className="bg-[#070b1f]">Logistics</option>
            <option value="SaaS" className="bg-[#070b1f]">SaaS</option>
            <option value="Retail" className="bg-[#070b1f]">Retail</option>
            <option value="Healthcare" className="bg-[#070b1f]">Healthcare</option>
            <option value="Other" className="bg-[#070b1f]">Other</option>
          </select>
        </label>
        <NeonInput 
          label="Password" 
          type="password" 
          placeholder="At least 6 characters" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        <Button 
          type="submit" 
          className="w-full rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] text-[#050816] font-semibold h-11 glow-cyan"
          disabled={loading}
        >
          {loading ? "Creating workspace..." : "Create account"}
        </Button>
        <p className="text-center text-xs text-foreground/50">
          Already have one? <Link to="/login" className="text-[#00E5FF] hover:underline">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default Register;

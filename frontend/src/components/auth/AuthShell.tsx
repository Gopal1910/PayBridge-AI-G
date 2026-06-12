import { Link } from "react-router-dom";
import { ParticleField, NetworkMesh } from "../../components/fx/ParticleField.js";

export function AuthShell({ children, title, sub }: { children: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816]">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left: visual */}
        <div className="relative hidden lg:block overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-40" />
          <NetworkMesh />
          <ParticleField count={30} />
          <div className="absolute left-10 top-10 z-10 flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#7B61FF] glow-cyan">
              <span className="font-display text-sm font-black text-[#050816]">P</span>
            </div>
            <span className="font-display font-bold tracking-widest">PAYBRIDGE</span>
          </div>
          <div className="relative z-10 flex h-full flex-col items-center justify-center p-12 text-center">
            <div className="relative">
              <div className="absolute -inset-10 rounded-full bg-[#00E5FF]/20 blur-3xl" />
              <div className="relative h-40 w-40 rounded-full border border-[#00E5FF]/30 animate-spin-slow">
                <div className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-[#00E5FF] glow-cyan" />
              </div>
              <div className="absolute inset-6 rounded-full border border-[#7B61FF]/30" style={{ animation: "spin-slow 14s linear infinite reverse" }}>
                <div className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#7B61FF] glow-violet" />
              </div>
              <div className="absolute inset-12 rounded-full bg-gradient-to-br from-[#00E5FF] to-[#7B61FF]" />
            </div>
            <h2 className="mt-12 font-display text-3xl font-black neon-text animate-gradient">PAYBRIDGE AI</h2>
            <p className="mt-3 max-w-sm text-sm text-foreground/60">B2B payment intelligence built for SMEs who refuse to chase invoices.</p>
          </div>
        </div>
        {/* Right: form */}
        <div className="relative flex items-center justify-center p-6 sm:p-10">
          <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[#00E5FF] to-[#7B61FF]">
              <span className="font-display text-xs font-black text-[#050816]">P</span>
            </div>
            <span className="font-display text-sm font-bold tracking-widest">PAYBRIDGE</span>
          </div>
          <div className="w-full max-w-md">
            <h1 className="font-display text-3xl font-black">{title}</h1>
            <p className="mt-2 text-sm text-foreground/60">{sub}</p>
            <div className="mt-8">{children}</div>
            <Link to="/" className="mt-8 block text-center text-xs text-foreground/40 hover:text-[#00E5FF]">← Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NeonInput({ 
  label, 
  type = "text", 
  placeholder,
  value,
  onChange,
  disabled,
  defaultValue
}: { 
  label: string; 
  type?: string; 
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="font-display text-[10px] uppercase tracking-[0.25em] text-foreground/50">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground outline-none transition focus:border-[#00E5FF]/60 focus:bg-white/8 focus:shadow-[0_0_0_4px_rgba(0,229,255,0.15)]"
      />
    </label>
  );
}
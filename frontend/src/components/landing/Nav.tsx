import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto mt-4 max-w-7xl px-4">
        <div className="glass-strong flex items-center justify-between rounded-2xl px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#7B61FF] glow-cyan">
              <span className="font-display text-sm font-black text-[#050816]">P</span>
            </div>
            <span className="font-display text-base font-bold tracking-widest">PAYBRIDGE</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-foreground/70 md:flex">
            <a href="#features" className="hover:text-[#00E5FF] transition-colors">Features</a>
            <a href="#demo" className="hover:text-[#00E5FF] transition-colors">Demo</a>
            <a href="#how" className="hover:text-[#00E5FF] transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-[#00E5FF] transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-[#00E5FF] transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden sm:block text-sm text-foreground/80 hover:text-[#00E5FF] transition-colors">Sign in</Link>
            <Button asChild className="rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] text-[#050816] font-semibold hover:opacity-90 glow-cyan">
              <Link to="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
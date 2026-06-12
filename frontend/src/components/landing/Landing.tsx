import { Link } from "react-router-dom";
import {
  ArrowRight, Play, FileText, Brain, Receipt, ShieldCheck, TrendingUp,
  Wallet, BellRing, Activity, Upload, BarChart3, MessageSquareText,
  Check, ChevronDown, Building2, Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart, Area, ResponsiveContainer, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, Tooltip, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { Nav } from "./Nav";
import { Counter } from "@/components/fx/Counter";
import { NetworkMesh, ParticleField, OrbitalLoader } from "@/components/fx/ParticleField";

const FEATURES = [
  { icon: Brain, title: "AI Contract Analyzer", desc: "Upload contracts. Get risk flags, hidden penalties, and renegotiation levers in seconds.", color: "from-[#00E5FF] to-[#7B61FF]" },
  { icon: MessageSquareText, title: "Payment Negotiation Engine", desc: "AI-suggested fair terms backed by industry benchmarks and buyer history.", color: "from-[#7B61FF] to-[#00FFA3]" },
  { icon: Receipt, title: "Invoice Tracking", desc: "Real-time status across every buyer, every channel — never lose an invoice again.", color: "from-[#00FFA3] to-[#00E5FF]" },
  { icon: ShieldCheck, title: "Buyer Trust Score", desc: "Dynamic credibility rating fed by payment history, sentiment, and macro signals.", color: "from-[#00E5FF] to-[#FF4D6D]" },
  { icon: TrendingUp, title: "Working Capital Forecast", desc: "12-week cash projection with scenario modeling and confidence intervals.", color: "from-[#7B61FF] to-[#00E5FF]" },
  { icon: Wallet, title: "Early Payment Recommendation", desc: "Detect when to take a discount vs hold — optimized for your liquidity curve.", color: "from-[#00FFA3] to-[#7B61FF]" },
  { icon: Activity, title: "Risk Dashboard", desc: "Portfolio-wide risk exposure with drill-down to buyer, sector, geography.", color: "from-[#FF4D6D] to-[#7B61FF]" },
  { icon: BellRing, title: "Smart Alerts", desc: "Proactive nudges on delays, anomalies, and renegotiation windows.", color: "from-[#00E5FF] to-[#00FFA3]" },
];

const cashflow = Array.from({ length: 12 }).map((_, i) => ({
  m: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  in: 40 + Math.round(Math.sin(i / 1.6) * 18) + i * 4,
  out: 38 + Math.round(Math.cos(i / 1.4) * 12) + i * 3,
}));
const delays = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => ({ d, v: 6 + ((i * 7) % 11) }));
const buyers = [
  { n: "Acme Corp", v: 92 },{ n: "Nimbus Ltd", v: 87 },{ n: "Vortex Inc", v: 74 },{ n: "Orbital", v: 68 },{ n: "Quanta", v: 61 },
];
const risk = [
  { name: "Low", v: 58, c: "#00FFA3" },
  { name: "Med", v: 27, c: "#00E5FF" },
  { name: "High", v: 11, c: "#7B61FF" },
  { name: "Critical", v: 4, c: "#FF4D6D" },
];

export function Landing() {
  const [openFeat, setOpenFeat] = useState<number | null>(0);
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#050816] text-foreground">
      <Nav />
      <Hero />
      <Problem />
      <Features openIdx={openFeat} setOpen={setOpenFeat} />
      <ProductDemo />
      <HowItWorks />
      <LiveAnalytics />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative isolate pt-32 pb-28 sm:pt-40 sm:pb-36">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <NetworkMesh className="opacity-60" />
      <ParticleField count={36} />
      <div className="absolute left-1/2 top-1/3 -z-10 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#00E5FF]/10 blur-[120px]" />
      <div className="absolute right-10 top-40 -z-10 h-[300px] w-[300px] rounded-full bg-[#7B61FF]/20 blur-[100px]" />

      <div className="relative mx-auto max-w-6xl px-4 text-center">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-foreground/80">
          <Sparkles className="h-3.5 w-3.5 text-[#00FFA3]" />
          <span>AI Payment Intelligence · Live for SMEs</span>
        </div>
        <h1 className="font-display text-5xl font-black leading-[0.95] sm:text-7xl md:text-8xl">
          <span className="neon-text animate-gradient">PAYBRIDGE</span>{" "}
          <span className="text-foreground">AI</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-foreground/70 sm:text-lg">
          AI-powered B2B Payment Intelligence. Negotiate fair terms with large buyers,
          predict cashflow, and unlock working capital — without chasing emails.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] text-[#050816] font-semibold hover:opacity-90 glow-cyan h-12 px-6">
            <Link to="/register">Start Negotiation <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-xl glass border-white/15 text-foreground hover:bg-white/5 h-12 px-6">
            <a href="#demo"><Play className="mr-2 h-4 w-4" /> Watch Demo</a>
          </Button>
        </div>

        {/* Floating preview card */}
        <div className="relative mx-auto mt-20 max-w-4xl">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#00E5FF] via-[#7B61FF] to-[#00FFA3] opacity-40 blur-2xl animate-gradient" />
          <Card className="relative glass-strong overflow-hidden rounded-3xl border-white/10 p-1 animate-float-slow">
            <div className="grid gap-4 rounded-[1.4rem] bg-[#050816]/80 p-6 md:grid-cols-3">
              <MetricCard label="Payment Delays Reduced" value={<Counter to={47} suffix="%" />} accent="#00E5FF" />
              <MetricCard label="Capital Saved" value={<><span className="text-foreground/60 text-2xl">$</span><Counter to={128} suffix="M+" /></>} accent="#7B61FF" />
              <MetricCard label="SMEs Supported" value={<Counter to={12400} suffix="+" />} accent="#00FFA3" />
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

function MetricCard({ label, value, accent }: { label: string; value: React.ReactNode; accent: string }) {
  return (
    <div className="group relative rounded-2xl glass p-5 transition-all hover:-translate-y-1">
      <div className="text-xs uppercase tracking-widest text-foreground/50">{label}</div>
      <div className="mt-3 font-display text-4xl font-black" style={{ color: accent, textShadow: `0 0 24px ${accent}55` }}>
        {value}
      </div>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/5">
        <div className="h-full w-3/4 rounded-full" style={{ background: accent, boxShadow: `0 0 12px ${accent}` }} />
      </div>
    </div>
  );
}

function Problem() {
  const steps = [
    { l: "SME", c: "#00E5FF" }, { l: "Invoice", c: "#00E5FF" },
    { l: "Buyer Delay", c: "#FF4D6D" }, { l: "Cash Crunch", c: "#FF4D6D" },
    { l: "Loan", c: "#7B61FF" }, { l: "Solution", c: "#00FFA3" },
  ];
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader eyebrow="The Problem" title="Why SMEs bleed working capital" sub="Every late invoice ripples into expensive credit. We map the chain — then break it." />
        <div className="mt-14 grid gap-3 sm:grid-cols-3 md:grid-cols-6">
          {steps.map((s, i) => (
            <div key={i} className="relative">
              <div className="glass rounded-2xl p-5 text-center transition-transform hover:-translate-y-1" style={{ borderColor: `${s.c}33` }}>
                <div className="mx-auto grid h-10 w-10 place-items-center rounded-full" style={{ background: `${s.c}22`, color: s.c, boxShadow: `0 0 16px ${s.c}55` }}>
                  {i + 1}
                </div>
                <div className="mt-3 font-display text-sm font-bold uppercase tracking-wider">{s.l}</div>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-2 z-10 h-px w-4" style={{ background: `linear-gradient(90deg, ${s.c}, ${steps[i+1].c})` }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features({ openIdx, setOpen }: { openIdx: number | null; setOpen: (n: number | null) => void }) {
  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader eyebrow="Features" title="An operating system for getting paid" sub="Eight focused modules that work together — built for finance teams who hate spreadsheets." />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            const open = openIdx === i;
            return (
              <div
                key={i}
                onMouseEnter={() => setOpen(i)}
                onMouseLeave={() => setOpen(null)}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl glass p-5 transition-all duration-300 ${open ? "-translate-y-1 glow-cyan" : ""}`}
              >
                <div className={`absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-20 bg-gradient-to-br ${f.color}`} />
                <div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${f.color}`}>
                  <Icon className="h-5 w-5 text-[#050816]" />
                </div>
                <div className="mt-4 font-display text-base font-bold">{f.title}</div>
                <div className={`mt-2 text-sm text-foreground/65 transition-all ${open ? "max-h-40" : "max-h-10 overflow-hidden"}`}>
                  {f.desc}
                </div>
                <div className={`mt-3 inline-flex items-center gap-1 text-xs text-[#00E5FF] transition-opacity ${open ? "opacity-100" : "opacity-0"}`}>
                  Learn more <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProductDemo() {
  return (
    <section id="demo" className="relative py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader eyebrow="Product" title="See PayBridge in motion" sub="A live look at how AI shapes every step of your AR workflow." />
        <div className="relative mx-auto mt-14 max-w-5xl">
          {/* MacBook frame */}
          <div className="relative rounded-t-3xl border border-white/10 bg-gradient-to-b from-white/8 to-white/3 p-3 shadow-2xl">
            <div className="absolute left-1/2 top-1.5 h-1 w-16 -translate-x-1/2 rounded-full bg-white/10" />
            <div className="overflow-hidden rounded-2xl bg-[#050816] glass-strong">
              <Tabs defaultValue="contract">
                <div className="flex items-center gap-2 border-b border-white/5 px-3 py-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FF4D6D]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#00E5FF]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#00FFA3]" />
                  <TabsList className="ml-3 bg-white/5">
                    <TabsTrigger value="contract">Contract Upload</TabsTrigger>
                    <TabsTrigger value="invoice">Invoice</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="negotiate">Negotiation</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="contract" className="p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="neon-border rounded-xl p-6 text-center">
                      <Upload className="mx-auto h-10 w-10 text-[#00E5FF]" />
                      <div className="mt-3 font-display text-sm">Drop contract PDF here</div>
                      <div className="text-xs text-foreground/50 mt-1">or browse · max 25MB</div>
                    </div>
                    <div className="rounded-xl glass p-4 text-left text-sm">
                      <div className="font-display text-xs uppercase text-[#00FFA3] tracking-widest">AI Findings</div>
                      <ul className="mt-3 space-y-2 text-foreground/80">
                        <li>· Net-90 term flagged — industry median Net-45</li>
                        <li>· No late-fee clause detected</li>
                        <li>· Penalty for early termination: 2.5% (high)</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="invoice" className="p-6">
                  <DemoInvoiceTable />
                </TabsContent>
                <TabsContent value="analytics" className="p-4">
                  <div className="h-72">
                    <ResponsiveContainer>
                      <AreaChart data={cashflow}>
                        <defs>
                          <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.6} />
                            <stop offset="100%" stopColor="#00E5FF" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="m" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                        <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                        <Tooltip contentStyle={{ background: "#0a0e24", border: "1px solid rgba(0,229,255,0.3)", borderRadius: 12 }} />
                        <Area dataKey="in" stroke="#00E5FF" fill="url(#g1)" strokeWidth={2} />
                        <Area dataKey="out" stroke="#7B61FF" fill="transparent" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                <TabsContent value="negotiate" className="p-6">
                  <div className="space-y-3 text-sm">
                    <div className="rounded-2xl rounded-tl-sm bg-white/5 p-3 max-w-md">Buyer offers Net-90, no early discount.</div>
                    <div className="ml-auto max-w-md rounded-2xl rounded-tr-sm bg-gradient-to-br from-[#00E5FF]/20 to-[#7B61FF]/20 border border-[#00E5FF]/30 p-3">
                      <div className="text-xs text-[#00FFA3] mb-1">AI Recommendation</div>
                      Counter with <b>Net-45 + 1.5% early-pay discount</b>. Win probability: 78%. Adds <b>$24k</b> liquidity this quarter.
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          <div className="mx-auto h-3 w-[110%] -ml-[5%] rounded-b-3xl bg-gradient-to-b from-white/10 to-white/2 shadow-[0_30px_60px_-20px_rgba(0,229,255,0.3)]" />
        </div>
      </div>
    </section>
  );
}

function DemoInvoiceTable() {
  const rows = [
    { id: "INV-2049", b: "Acme Corp", a: "$12,400", s: "Paid", c: "#00FFA3" },
    { id: "INV-2050", b: "Nimbus Ltd", a: "$8,920", s: "Pending", c: "#00E5FF" },
    { id: "INV-2051", b: "Vortex Inc", a: "$24,000", s: "Overdue", c: "#FF4D6D" },
    { id: "INV-2052", b: "Orbital", a: "$5,100", s: "Negotiating", c: "#7B61FF" },
  ];
  return (
    <div className="overflow-hidden rounded-xl border border-white/5">
      <table className="w-full text-left text-sm">
        <thead className="bg-white/5 text-xs uppercase tracking-widest text-foreground/50">
          <tr><th className="p-3">Invoice</th><th className="p-3">Buyer</th><th className="p-3">Amount</th><th className="p-3">Status</th></tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} className="border-t border-white/5">
              <td className="p-3 font-mono">{r.id}</td>
              <td className="p-3">{r.b}</td>
              <td className="p-3">{r.a}</td>
              <td className="p-3">
                <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: `${r.c}22`, color: r.c }}>{r.s}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { i: Upload, t: "Upload Invoice", d: "Drop a PDF or sync your ERP — we ingest everything." },
    { i: Brain, t: "AI Analysis", d: "Risk, sentiment, and historical benchmarks computed in seconds." },
    { i: TrendingUp, t: "Payment Optimization", d: "Counter-terms, early-pay calls, and prioritization queue." },
    { i: BarChart3, t: "Results", d: "Working capital up, days-sales-outstanding down. Forever." },
  ];
  return (
    <section id="how" className="relative py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader eyebrow="How it works" title="Four steps from invoice to liquidity" />
        <div className="relative mt-14">
          <svg className="pointer-events-none absolute left-0 right-0 top-12 hidden md:block" height="2" width="100%">
            <line x1="0" y1="1" x2="100%" y2="1" stroke="url(#flow)" strokeWidth="2" strokeDasharray="6 6" className="animate-dash" />
            <defs>
              <linearGradient id="flow" x1="0" x2="1">
                <stop offset="0" stopColor="#00E5FF" />
                <stop offset="0.5" stopColor="#7B61FF" />
                <stop offset="1" stopColor="#00FFA3" />
              </linearGradient>
            </defs>
          </svg>
          <div className="grid gap-6 md:grid-cols-4">
            {steps.map((s, i) => {
              const Icon = s.i;
              return (
                <div key={i} className="relative glass rounded-2xl p-6">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#00E5FF] to-[#7B61FF] glow-cyan">
                    <Icon className="h-5 w-5 text-[#050816]" />
                  </div>
                  <div className="mt-1 font-display text-xs uppercase tracking-widest text-foreground/40">Step {i + 1}</div>
                  <div className="font-display text-lg font-bold">{s.t}</div>
                  <p className="mt-2 text-sm text-foreground/65">{s.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function LiveAnalytics() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader eyebrow="Live analytics" title="A dashboard that thinks ahead" sub="Forecasts, rankings, and risk distribution — synthesized into one calm view." />
        <div className="mt-14 grid gap-4 md:grid-cols-4">
          <KPI label="Revenue" value="$1.42M" delta="+12.4%" color="#00E5FF" />
          <KPI label="Invoices" value="312" delta="+18" color="#7B61FF" />
          <KPI label="Predictions" value="94%" delta="acc." color="#00FFA3" />
          <KPI label="Negotiation Score" value="A+" delta="top 5%" color="#FF4D6D" />
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <ChartCard title="Cash Flow" className="lg:col-span-2">
            <ResponsiveContainer>
              <AreaChart data={cashflow}>
                <defs>
                  <linearGradient id="cf1" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#00E5FF" stopOpacity={0.6}/><stop offset="100%" stopColor="#00E5FF" stopOpacity={0}/></linearGradient>
                  <linearGradient id="cf2" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#7B61FF" stopOpacity={0.5}/><stop offset="100%" stopColor="#7B61FF" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="m" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <Tooltip contentStyle={{ background: "#0a0e24", border: "1px solid rgba(0,229,255,0.3)", borderRadius: 12 }} />
                <Area dataKey="in" stroke="#00E5FF" fill="url(#cf1)" strokeWidth={2} />
                <Area dataKey="out" stroke="#7B61FF" fill="url(#cf2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Risk Distribution">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={risk} dataKey="v" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {risk.map((r) => <Cell key={r.name} fill={r.c} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#0a0e24", border: "1px solid rgba(0,229,255,0.3)", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Delayed Payments (7d)">
            <ResponsiveContainer>
              <BarChart data={delays}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="d" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <Tooltip contentStyle={{ background: "#0a0e24", border: "1px solid rgba(0,229,255,0.3)", borderRadius: 12 }} />
                <Bar dataKey="v" fill="#FF4D6D" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Buyer Ranking" className="lg:col-span-2">
            <div className="space-y-3 px-2 pt-2">
              {buyers.map(b => (
                <div key={b.n} className="flex items-center gap-3">
                  <div className="w-28 text-sm">{b.n}</div>
                  <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                    <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#00E5FF] to-[#7B61FF]" style={{ width: `${b.v}%` }} />
                  </div>
                  <div className="w-10 text-right font-mono text-sm">{b.v}</div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>
    </section>
  );
}

function ChartCard({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`glass rounded-2xl p-4 ${className}`}>
      <div className="mb-2 flex items-center justify-between">
        <div className="font-display text-xs uppercase tracking-widest text-foreground/60">{title}</div>
        <div className="h-2 w-2 rounded-full bg-[#00FFA3] animate-pulse" />
      </div>
      <div className="h-56">{children}</div>
    </div>
  );
}

function KPI({ label, value, delta, color }: { label: string; value: string; delta: string; color: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="text-xs uppercase tracking-widest text-foreground/50">{label}</div>
      <div className="mt-2 font-display text-3xl font-black" style={{ color, textShadow: `0 0 18px ${color}55` }}>{value}</div>
      <div className="mt-1 text-xs text-foreground/60">{delta}</div>
    </div>
  );
}

function Testimonials() {
  const items = [
    { q: "Cut our DSO by 19 days in one quarter. The negotiation engine pays for itself.", a: "Maya R.", r: "CFO, Helix Robotics" },
    { q: "Finally a tool finance and ops both open every morning.", a: "Daniel K.", r: "COO, Northwind Logistics" },
    { q: "Buyer trust scores predicted two late payments before our team noticed.", a: "Priya S.", r: "Treasurer, Solace Foods" },
    { q: "We unlocked a $400k credit line by sharing PayBridge forecasts with our bank.", a: "Tom L.", r: "Founder, Quanta Labs" },
    { q: "The AI contract analyzer flagged a clause we'd missed for 3 years.", a: "Ines V.", r: "Legal Ops, Bloom & Co" },
  ];
  const loop = [...items, ...items];
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader eyebrow="Customers" title="Loved by finance teams" />
      </div>
      <div className="mt-12 group relative">
        <div className="flex gap-4 animate-[marquee_40s_linear_infinite]" style={{ width: "max-content" }}>
          {loop.map((t, i) => (
            <div key={i} className="w-[340px] shrink-0 glass rounded-2xl p-6">
              <div className="text-sm text-foreground/85">"{t.q}"</div>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#00E5FF] to-[#7B61FF]" />
                <div>
                  <div className="text-sm font-semibold">{t.a}</div>
                  <div className="text-xs text-foreground/55">{t.r}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </section>
  );
}

function Pricing() {
  const tiers = [
    { n: "Starter", p: 0, d: "For solo founders testing the waters.", f: ["Up to 20 invoices/mo", "AI contract analyzer (3/mo)", "Basic risk dashboard", "Email support"], cta: "Start free", highlight: false },
    { n: "Growth", p: 89, d: "Most popular for scaling SMEs.", f: ["Unlimited invoices", "Full negotiation engine", "Buyer trust scoring", "Forecasting & alerts", "Priority support"], cta: "Start trial", highlight: true },
    { n: "Enterprise", p: 0, d: "Custom rollout for finance teams.", f: ["ERP integrations", "SSO + SOC2 controls", "Dedicated AI tuning", "Success manager", "Custom SLAs"], cta: "Talk to sales", highlight: false },
  ];
  return (
    <section id="pricing" className="relative py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader eyebrow="Pricing" title="Pay for outcomes, not seats" />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {tiers.map((t) => (
            <div key={t.n} className={`group relative rounded-3xl p-[1px] transition-all hover:-translate-y-1 ${t.highlight ? "bg-gradient-to-br from-[#00E5FF] via-[#7B61FF] to-[#00FFA3] animate-gradient glow-cyan" : "bg-white/10"}`}>
              <div className="h-full rounded-[1.4rem] bg-[#0a0e24]/90 backdrop-blur p-7">
                <div className="flex items-center justify-between">
                  <div className="font-display text-lg font-bold">{t.n}</div>
                  {t.highlight && <span className="rounded-full bg-[#00FFA3]/20 px-2 py-0.5 text-xs text-[#00FFA3]">Popular</span>}
                </div>
                <p className="mt-1 text-sm text-foreground/60">{t.d}</p>
                <div className="mt-5 font-display text-4xl font-black">
                  {t.n === "Enterprise" ? "Custom" : t.p === 0 ? "$0" : `$${t.p}`}
                  {t.p > 0 && <span className="text-base font-normal text-foreground/50">/mo</span>}
                </div>
                <ul className="mt-6 space-y-2.5 text-sm">
                  {t.f.map(item => (
                    <li key={item} className="flex items-center gap-2"><Check className="h-4 w-4 text-[#00FFA3]" /> {item}</li>
                  ))}
                </ul>
                <Button asChild className={`mt-7 w-full rounded-xl ${t.highlight ? "bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] text-[#050816]" : "bg-white/5 hover:bg-white/10"} h-11`}>
                  <Link to="/register">{t.cta}</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    { q: "How does PayBridge handle our existing accounting tools?", a: "We integrate with QuickBooks, Xero, NetSuite, SAP, and most major ERPs via secure APIs. Imports happen in minutes." },
    { q: "Is my contract and invoice data private?", a: "Yes — data is encrypted at rest and in transit. Customer data never trains our shared models." },
    { q: "Do I need a finance team to use it?", a: "No. PayBridge ships with sensible defaults; solo founders see value on day one." },
    { q: "How accurate are the AI predictions?", a: "Our buyer-delay models hit 92–96% accuracy on 30-day forecasts in production usage." },
    { q: "Can I cancel any time?", a: "Yes, monthly plans cancel any time. Annual plans get a prorated refund inside 30 days." },
  ];
  return (
    <section id="faq" className="relative py-24">
      <div className="mx-auto max-w-3xl px-4">
        <SectionHeader eyebrow="FAQ" title="Questions, answered" />
        <Accordion type="single" collapsible className="mt-10 space-y-3">
          {items.map((it, i) => (
            <AccordionItem key={i} value={`i${i}`} className="glass rounded-2xl border-0 px-5">
              <AccordionTrigger className="text-left font-display text-sm uppercase tracking-wider hover:no-underline">
                {it.q}
              </AccordionTrigger>
              <AccordionContent className="text-foreground/70">{it.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-white/5 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-foreground/55 sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-[#00E5FF] to-[#7B61FF]">
            <span className="font-display text-xs font-black text-[#050816]">P</span>
          </div>
          <span className="font-display tracking-widest">PAYBRIDGE AI</span>
        </div>
        <div>© 2026 PayBridge AI. All rights reserved.</div>
        <div className="flex gap-5">
          <a href="#" className="hover:text-[#00E5FF]">Privacy</a>
          <a href="#" className="hover:text-[#00E5FF]">Terms</a>
          <a href="#" className="hover:text-[#00E5FF]">Contact</a>
        </div>
      </div>
    </footer>
  );
}

function SectionHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="text-center">
      <div className="inline-block rounded-full glass px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#00E5FF]">{eyebrow}</div>
      <h2 className="mx-auto mt-4 max-w-3xl font-display text-3xl font-black sm:text-5xl">{title}</h2>
      {sub && <p className="mx-auto mt-3 max-w-2xl text-foreground/65">{sub}</p>}
    </div>
  );
}

// avoid unused-import warnings for icons used conditionally
void Building2; void FileText; void OrbitalLoader; void ChevronDown;
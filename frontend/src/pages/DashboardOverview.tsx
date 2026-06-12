import { useState, useEffect } from "react";
import { DashShell } from "../components/dashboard/DashShell.js";
import { Counter } from "../components/fx/Counter.js";
import {
  AreaChart, Area, ResponsiveContainer, LineChart, Line, BarChart, Bar,
  Tooltip, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { TrendingUp, TrendingDown, Wallet, AlertTriangle, DollarSign } from "lucide-react";
import { apiClient } from "../lib/apiClient.js";
import { toast } from "sonner";

interface OverviewMetrics {
  workingCapitalIndex: number;
  totalInvoiced: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  averageDso: number;
  overdueCount: number;
}

export function DashboardOverview() {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [overviewRes, analyticsRes] = await Promise.all([
          apiClient.get<any>("/api/dashboard/overview"),
          apiClient.get<any>("/api/dashboard/analytics")
        ]);

        if (overviewRes.status === "success") {
          setMetrics(overviewRes.data);
        }
        if (analyticsRes.status === "success") {
          setAnalytics(analyticsRes.data);
        }
      } catch (err: any) {
        logger.error("Error loading dashboard data: " + err.message);
        toast.error("Failed to load live dashboard statistics.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Format Recharts data based on active cashflowForecast or fallback to dummy
  const chartData = analytics?.cashflowForecast || [
    { month: "June", inflow: 45000, outflow: 38000, forecast: 7000 },
    { month: "July", inflow: 52000, outflow: 41000, forecast: 11000 },
    { month: "August", inflow: 58000, outflow: 43000, forecast: 15000 }
  ];

  const barData = [
    { n: "Paid", v: metrics?.totalPaid || 0 },
    { n: "Pending", v: metrics?.totalPending || 0 },
    { n: "Overdue", v: metrics?.totalOverdue || 0 }
  ];

  const recentAlerts = analytics?.topInsights || [
    "Improving average DSO to 30 days would unlock approximately $12k in operating cash.",
    "Concentration risk in top 2 buyers represents 42% of total receivables.",
    "Fast-tracking pending collections will boost your working capital reserve immediately."
  ];

  return (
    <DashShell title="Overview">
      {loading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#00E5FF] border-t-transparent"></div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Widget 
              label="Working Capital" 
              value={<><span className="text-foreground/60 text-xl">$</span><Counter to={Math.round((metrics?.totalInvoiced || 0) / 1000)} suffix="k" /></>} 
              icon={Wallet} 
              delta="+8.2%" 
              up 
              color="#00E5FF" 
            />
            <Widget 
              label="Pending Payments" 
              value={<><span className="text-foreground/60 text-xl">$</span><Counter to={Math.round((metrics?.totalPending || 0) / 1000)} suffix="k" /></>} 
              icon={DollarSign} 
              delta="−4.1%" 
              up={false} 
              color="#7B61FF" 
            />
            <Widget 
              label="Working Capital Health" 
              value={<Counter to={metrics?.workingCapitalIndex || 95} suffix="/100" />} 
              icon={AlertTriangle} 
              delta="Live" 
              up 
              color="#00FFA3" 
            />
            <Widget 
              label="Average Collection Cycle" 
              value={<Counter to={metrics?.averageDso || 34} suffix=" days" />} 
              icon={TrendingUp} 
              delta="Median 30d" 
              up 
              color="#FF4D6D" 
            />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <Card title="Cash Flow Projection" className="lg:col-span-2">
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="ov1" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.5}/>
                      <stop offset="100%" stopColor="#00E5FF" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="ov2" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#7B61FF" stopOpacity={0.4}/>
                      <stop offset="100%" stopColor="#7B61FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "#0a0e24", border: "1px solid rgba(0,229,255,0.3)", borderRadius: 12 }} />
                  <Area dataKey="inflow" stroke="#00E5FF" fill="url(#ov1)" strokeWidth={2} name="Cash Inflow" />
                  <Area dataKey="outflow" stroke="#7B61FF" fill="url(#ov2)" strokeWidth={2} name="Cash Outflow" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Volume Distribution">
              <ResponsiveContainer>
                <BarChart data={barData}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="n" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "#0a0e24", border: "1px solid rgba(0,229,255,0.3)", borderRadius: 12 }} />
                  <Bar dataKey="v" fill="#00E5FF" radius={[6,6,0,0]} name="Volume ($)" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card title="AI Copilot Action Items" className="lg:col-span-3 h-auto">
              <ul className="space-y-3 px-1 text-sm pb-4">
                {recentAlerts.map((a: string, i: number) => {
                  const colors = ["#FF4D6D", "#00E5FF", "#00FFA3", "#7B61FF"];
                  const activeColor = colors[i % colors.length];
                  return (
                    <li key={i} className="flex items-start gap-3 rounded-lg p-2.5 hover:bg-white/5 border border-white/5 bg-white/[0.01]">
                      <span className="mt-1.5 h-2.5 w-2.5 rounded-full" style={{ background: activeColor, boxShadow: `0 0 8px ${activeColor}` }} />
                      <span className="text-foreground/80">{a}</span>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </div>
        </>
      )}
    </DashShell>
  );
}

function Widget({ label, value, icon: Icon, delta, up, color }: any) {
  return (
    <div className="group relative overflow-hidden rounded-2xl glass p-5 transition-all hover:-translate-y-1">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 blur-2xl" style={{ background: color }} />
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest text-foreground/50">{label}</div>
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div className="mt-3 font-display text-3xl font-black" style={{ color, textShadow: `0 0 16px ${color}55` }}>{value}</div>
      <div className={`mt-1 flex items-center gap-1 text-xs ${up ? "text-[#00FFA3]" : "text-[#FF4D6D]"}`}>
        {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {delta}
      </div>
    </div>
  );
}

function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`glass rounded-2xl p-4 ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <div className="font-display text-xs uppercase tracking-widest text-foreground/60">{title}</div>
        <div className="h-2 w-2 rounded-full bg-[#00FFA3] animate-pulse" />
      </div>
      <div className="h-64">{children}</div>
    </div>
  );
}

const logger = {
  error: (msg: string) => console.error(msg),
  info: (msg: string) => console.log(msg)
};

export default DashboardOverview;

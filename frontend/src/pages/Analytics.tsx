import { useState, useEffect } from "react";
import { DashShell } from "../components/dashboard/DashShell.js";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { apiClient } from "../lib/apiClient.js";
import { toast } from "sonner";

export function Analytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await apiClient.get<any>("/api/analytics");
        if (res.status === "success" && res.data) {
          setAnalytics(res.data);
        }
      } catch (err: any) {
        toast.error("Failed to load analytical reports: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  // Set up mock charts if data is not loaded yet
  const months = ["Jun", "Jul", "Aug"];
  const cfData = analytics?.cashflowForecast || [
    { month: "June", inflow: 45000, outflow: 38000, forecast: 7000 },
    { month: "July", inflow: 52000, outflow: 41000, forecast: 11000 },
    { month: "August", inflow: 58000, outflow: 43000, forecast: 15000 }
  ];

  // Map low, medium, high risk counts to PieChart array
  const riskDist = analytics?.riskScoreDistribution || { low: 3, medium: 2, high: 1 };
  const pieData = [
    { name: "Low Risk", v: riskDist.low, c: "#00FFA3" },
    { name: "Medium Risk", v: riskDist.medium, c: "#00E5FF" },
    { name: "High Risk", v: riskDist.high, c: "#FF4D6D" }
  ];

  // DSO historical progress chart
  const dsoData = [
    { m: "Apr", v: (analytics?.averageDso || 34) + 6 },
    { m: "May", v: (analytics?.averageDso || 34) + 3 },
    { m: "Jun", v: analytics?.averageDso || 34 }
  ];

  const segData = [
    { m: "Paid volume", v: analytics?.totalPaid || 12000, color: "#00FFA3" },
    { m: "Pending volume", v: analytics?.totalPending || 8000, color: "#00E5FF" },
    { m: "Overdue volume", v: analytics?.totalOverdue || 4000, color: "#FF4D6D" }
  ];

  return (
    <DashShell title="Analytics">
      {loading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00E5FF] border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <Chart title="Cash Flow Forecast" className="lg:col-span-2">
            <ResponsiveContainer>
              <AreaChart data={cfData}>
                <defs>
                  <linearGradient id="a1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.5}/>
                    <stop offset="100%" stopColor="#00E5FF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="a2" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#7B61FF" stopOpacity={0.4}/>
                    <stop offset="100%" stopColor="#7B61FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <Tooltip contentStyle={{ background:"#0a0e24", border:"1px solid rgba(0,229,255,0.3)", borderRadius:12 }} />
                <Area dataKey="inflow" stroke="#00E5FF" fill="url(#a1)" strokeWidth={2} name="Inflow" />
                <Area dataKey="outflow" stroke="#7B61FF" fill="url(#a2)" strokeWidth={2} name="Outflow" />
              </AreaChart>
            </ResponsiveContainer>
          </Chart>

          <Chart title="Credit Risk Distribution">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="v" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={3}>
                  {pieData.map(r => <Cell key={r.name} fill={r.c} />)}
                </Pie>
                <Tooltip contentStyle={{ background:"#0a0e24", border:"1px solid rgba(0,229,255,0.3)", borderRadius:12 }} />
              </PieChart>
            </ResponsiveContainer>
          </Chart>

          <Chart title="Days Sales Outstanding (DSO) Progress" className="lg:col-span-2">
            <ResponsiveContainer>
              <LineChart data={dsoData}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="m" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <Tooltip contentStyle={{ background:"#0a0e24", border:"1px solid rgba(0,229,255,0.3)", borderRadius:12 }} />
                <Line dataKey="v" stroke="#00FFA3" strokeWidth={2} dot={{ fill:"#00FFA3" }} name="DSO (Days)" />
              </LineChart>
            </ResponsiveContainer>
          </Chart>

          <Chart title="Receivables Aging Breakdown">
            <ResponsiveContainer>
              <BarChart data={segData}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="m" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <Tooltip contentStyle={{ background:"#0a0e24", border:"1px solid rgba(0,229,255,0.3)", borderRadius:12 }} />
                <Bar dataKey="v" radius={[6,6,0,0]} name="Exposure ($)">
                  {segData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Chart>
        </div>
      )}
    </DashShell>
  );
}

function Chart({ title, children, className="" }: any) {
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

export default Analytics;

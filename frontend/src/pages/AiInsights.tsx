import { useState, useEffect } from "react";
import { DashShell } from "../components/dashboard/DashShell.js";
import { Brain, AlertTriangle, TrendingUp, Sparkles, Loader2, Play } from "lucide-react";
import { apiClient } from "../lib/apiClient.js";
import { toast } from "sonner";

export function AiInsights() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Sandbox State
  const [sandboxInput, setSandboxInput] = useState("Payment must be made within 90 days. Supplier agrees to a 2% early-pay discount if paid in 15 days.");
  const [sandboxResult, setSandboxResult] = useState<any>(null);
  const [runningSandbox, setRunningSandbox] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await apiClient.get<any>("/api/analytics");
        if (res.status === "success" && res.data) {
          setAnalytics(res.data);
        }
      } catch (err: any) {
        toast.error("Failed to load signals: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleRunSandbox = async () => {
    if (!sandboxInput.trim()) {
      toast.error("Please enter a payment clause to test.");
      return;
    }

    setRunningSandbox(true);
    try {
      const res = await apiClient.post<any>("/api/ai/analyze", { contractText: sandboxInput });
      if (res.status === "success") {
        setSandboxResult(res.data);
        toast.success("Payment clause evaluated by AI!");
      }
    } catch (err: any) {
      toast.error("Sandbox evaluation failed: " + err.message);
    } finally {
      setRunningSandbox(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "high": return "#FF4D6D";
      case "medium": return "#7B61FF";
      case "low": return "#00FFA3";
      default: return "#00E5FF";
    }
  };

  return (
    <DashShell title="AI Insights & Sandbox">
      {loading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00E5FF] border-t-transparent"></div>
        </div>
      ) : (
        <>
          {/* Header Card */}
          <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#070b1f] p-6 sm:p-8">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#7B61FF]/10 blur-3xl animate-float-slow" />
            <div className="absolute -left-10 bottom-0 h-56 w-56 rounded-full bg-[#00E5FF]/10 blur-3xl" />
            <div className="relative flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#00E5FF] to-[#7B61FF] glow-cyan">
                <Brain className="h-6 w-6 text-[#050816]" />
              </div>
              <div>
                <div className="font-display text-xl font-black text-white">PayBridge Intelligence Signals</div>
                <div className="text-xs text-foreground/55">Active AI model: Llama 3 (Local API Mode)</div>
              </div>
            </div>
            <p className="relative mt-5 text-foreground/80 max-w-3xl leading-relaxed text-sm">
              Your company portfolio has an overall credit score of <span className="text-[#00FFA3] font-semibold">{analytics?.riskIndex || 95}/100</span>.
              DSO is currently tracking at <span className="text-[#00E5FF] font-semibold">{analytics?.averageDso || 34} days</span>. 
              Review the detailed risk signals and counter recommendations below, or use the interactive sandbox to verify custom payment clauses.
            </p>
          </div>

          {/* Core Panels */}
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <Panel 
              title="Identified Risks" 
              color="#FF4D6D" 
              icon={AlertTriangle} 
              items={[
                { t: `Overdue collections limit`, d: `${analytics?.overdueCount || 0} invoice(s) are currently flagged as overdue. Recommend quick payment escalation.` },
                { t: "Concentration exposure risk", d: "A single buyer represents over 35% of outstanding invoice cash. Consider adding default credit insurance." }
              ]} 
            />
            <Panel 
              title="Forecasting Predictions" 
              color="#00E5FF" 
              icon={TrendingUp} 
              items={[
                { t: "Cash Inflow Projection", d: `Estimated $${((analytics?.totalInvoiced || 0) * 0.4).toLocaleString()} inflow projected for next 30 days.` },
                { t: "Average Repayment Duration", d: `Median settlement tracking stands at ${analytics?.averageDso || 34} days, beating sector standard.` }
              ]} 
            />
            <Panel 
              title="Action Recommendations" 
              color="#00FFA3" 
              icon={Sparkles} 
              items={[
                { t: "Counter term clauses", d: "Propose Net-45 on all new Net-90 offers and request a 1.5% early-pay discount for Net-15 settlement." },
                { t: "Review contract templates", d: "Audit all MSA files to ensure standard late fee clauses (1.5% monthly) are explicitly stated." }
              ]} 
            />
          </div>

          {/* Interactive AI Sandbox */}
          <div className="mt-6 rounded-2xl glass p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-[#7B61FF]" />
              <h3 className="font-display font-bold text-white text-sm uppercase tracking-wider">Interactive Payment Clause Sandbox</h3>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-xs text-foreground/50 uppercase tracking-wide">Enter custom payment terms text</label>
                <textarea 
                  className="mt-3 w-full h-36 rounded-xl border border-white/10 bg-white/5 p-4 text-xs outline-none focus:border-[#7B61FF]/60 text-white font-mono leading-relaxed"
                  value={sandboxInput}
                  onChange={(e) => setSandboxInput(e.target.value)}
                  disabled={runningSandbox}
                />
                <button 
                  onClick={handleRunSandbox}
                  disabled={runningSandbox}
                  className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] px-5 py-2.5 text-xs font-semibold text-[#050816] glow-cyan disabled:opacity-50"
                >
                  {runningSandbox ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Evaluating Clause...
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 fill-[#050816]" />
                      Run AI Test
                    </>
                  )}
                </button>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.01] p-4 flex flex-col justify-between">
                {sandboxResult ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground/50">Buyer Extracted:</span>
                      <span className="text-sm font-semibold text-white">{sandboxResult.buyerName || "Unknown"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground/50">Payment terms:</span>
                      <span className="text-sm font-mono text-[#00E5FF]">{sandboxResult.terms || "Not Specified"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground/50">Risk Evaluation:</span>
                      <span 
                        className="text-xs font-bold font-display uppercase px-2 py-0.5 rounded"
                        style={{ 
                          color: getRiskColor(sandboxResult.risk),
                          border: `1px solid ${getRiskColor(sandboxResult.risk)}44`,
                          background: `${getRiskColor(sandboxResult.risk)}11`
                        }}
                      >
                        {sandboxResult.risk}
                      </span>
                    </div>
                    <div className="border-t border-white/5 pt-3">
                      <div className="text-xs text-foreground/50">AI Rationale & Recommendation:</div>
                      <p className="mt-1 text-xs text-foreground/85 leading-relaxed italic">
                        "{sandboxResult.summary || "No recommendations available for this input clause."}"
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-xs text-foreground/30 p-8 text-center italic">
                    Submit a payment clause in the textbox on the left to verify dynamic credit and collection risks.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </DashShell>
  );
}

function Panel({ title, color, icon: Icon, items }: any) {
  return (
    <div className="rounded-2xl glass p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-4 w-4" style={{ color }} />
        <div className="font-display text-xs uppercase tracking-widest" style={{ color }}>{title}</div>
      </div>
      <div className="space-y-3">
        {items.map((it: any, i: number) => (
          <div key={i} className="rounded-xl border p-3.5 bg-white/[0.01]" style={{ borderColor: `${color}22` }}>
            <div className="text-xs font-bold text-white uppercase tracking-wide">{it.t}</div>
            <div className="mt-1.5 text-xs text-foreground/65 leading-relaxed">{it.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AiInsights;

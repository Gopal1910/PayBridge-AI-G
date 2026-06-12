import { useState, useEffect } from "react";
import { DashShell } from "../components/dashboard/DashShell.js";
import { Search, Plus, X, Users, AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "../components/ui/button.js";
import { apiClient } from "../lib/apiClient.js";
import { toast } from "sonner";

interface Buyer {
  id: string;
  name: string;
  score: number;
  history: string[];
  createdAt: string;
}

export function Buyers() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Buyer Modal State
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [score, setScore] = useState("80");
  const [creating, setCreating] = useState(false);

  const fetchBuyers = async () => {
    try {
      const res = await apiClient.get<any>("/api/buyers");
      if (res.status === "success" && res.data) {
        setBuyers(res.data);
        if (res.data.length > 0 && !selectedBuyer) {
          setSelectedBuyer(res.data[0]);
        }
      }
    } catch (err: any) {
      toast.error("Failed to load buyers: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyers();
  }, []);

  const handleCreateBuyer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !score) {
      toast.error("Please fill in buyer name and score.");
      return;
    }

    setCreating(true);
    try {
      const res = await apiClient.post<any>("/api/buyers", {
        name,
        score: parseInt(score),
        history: ["Account created manually"]
      });

      if (res.status === "success") {
        toast.success("Buyer credit profile successfully registered!");
        setShowModal(false);
        setName("");
        setScore("80");
        fetchBuyers();
      }
    } catch (err: any) {
      toast.error("Failed to register buyer: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  const getScoreColor = (sc: number) => {
    if (sc >= 80) return "#00FFA3"; // Low risk green
    if (sc >= 60) return "#7B61FF"; // Med risk purple
    return "#FF4D6D"; // High risk red
  };

  const getRiskLabel = (sc: number) => {
    if (sc >= 80) return "Low Risk";
    if (sc >= 60) return "Moderate Risk";
    return "High Risk";
  };

  const filteredBuyers = buyers.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashShell title="Buyers credit intelligence">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl glass px-3 py-2 flex-1 min-w-[200px] max-w-md">
          <Search className="h-4 w-4 text-foreground/40" />
          <input 
            className="bg-transparent text-sm outline-none placeholder:text-foreground/40 w-full text-white" 
            placeholder="Search buyers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button 
          onClick={() => setShowModal(true)}
          className="ml-auto rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] text-[#050816] font-semibold"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Buyer Profile
        </Button>
      </div>

      {loading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00E5FF] border-t-transparent"></div>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {/* Buyers Sidebar List */}
          <div className="lg:col-span-1 rounded-2xl glass p-3 h-fit">
            <div className="font-display text-xs uppercase tracking-widest text-foreground/60 px-2 py-2 border-b border-white/5 mb-2">
              Buyer Profiles ({filteredBuyers.length})
            </div>
            {filteredBuyers.length === 0 ? (
              <div className="text-xs text-foreground/40 p-4 text-center">No buyers found. Register one above!</div>
            ) : (
              <div className="space-y-1">
                {filteredBuyers.map(b => {
                  const scoreColor = getScoreColor(b.score);
                  return (
                    <div 
                      key={b.id}
                      onClick={() => setSelectedBuyer(b)}
                      className={`flex items-center justify-between rounded-xl p-3 cursor-pointer transition ${
                        selectedBuyer?.id === b.id ? "bg-white/10" : "hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Users className="h-4 w-4 text-[#00E5FF]" />
                        <span className="text-sm font-semibold text-white truncate max-w-[120px]">{b.name}</span>
                      </div>
                      <span 
                        className="text-xs font-mono font-bold px-2 py-0.5 rounded"
                        style={{ color: scoreColor, border: `1px solid ${scoreColor}44`, background: `${scoreColor}11` }}
                      >
                        {b.score}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Buyer Details Panel */}
          <div className="lg:col-span-2 rounded-2xl glass p-5 min-h-[400px]">
            {selectedBuyer ? (
              <div>
                <div className="flex flex-wrap items-center justify-between border-b border-white/5 pb-4 mb-4 gap-2">
                  <div>
                    <h2 className="font-display text-xl font-bold text-white">{selectedBuyer.name}</h2>
                    <p className="text-xs text-foreground/40 mt-1">Profile created on {new Date(selectedBuyer.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-foreground/60">PayBridge AI credit score</div>
                    <div 
                      className="text-3xl font-black mt-1 font-display" 
                      style={{ 
                        color: getScoreColor(selectedBuyer.score),
                        textShadow: `0 0 16px ${getScoreColor(selectedBuyer.score)}44` 
                      }}
                    >
                      {selectedBuyer.score}/100
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 mb-6">
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                    <div className="text-xs text-foreground/50 uppercase tracking-wide">Risk Assessment</div>
                    <div className="flex items-center gap-2 mt-2">
                      {selectedBuyer.score < 60 ? (
                        <AlertTriangle className="h-5 w-5 text-[#FF4D6D]" />
                      ) : (
                        <ShieldCheck className="h-5 w-5 text-[#00FFA3]" />
                      )}
                      <span className="font-semibold text-sm text-white">{getRiskLabel(selectedBuyer.score)}</span>
                    </div>
                    <p className="text-xs text-foreground/60 mt-1.5 leading-relaxed">
                      {selectedBuyer.score >= 80 
                        ? "Very reliable payment logs. Highly eligible for standard terms or rebates." 
                        : selectedBuyer.score >= 60 
                        ? "Payment lags are occasional. Suggest Net-30 or cash flow discounts." 
                        : "High historical defaults. Net terms must be kept below 30 days. Prepayments recommended."}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                    <div className="text-xs text-foreground/50 uppercase tracking-wide">Exposure Cap</div>
                    <div className="text-lg font-bold mt-2 text-white">
                      ${Math.round(selectedBuyer.score * 1500).toLocaleString()} USD
                    </div>
                    <div className="text-xs text-foreground/60 mt-1">
                      Recommended credit insurance coverage limit based on score matrices.
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-display text-xs uppercase tracking-wider text-foreground/60 mb-3">Repayment History & Audit Logs</h3>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {selectedBuyer.history.map((log, idx) => (
                      <div key={idx} className="flex gap-2.5 rounded-lg border border-white/5 bg-white/[0.01] p-3 text-xs text-foreground/80">
                        <span className="text-[#00E5FF]">•</span>
                        <span className="font-sans leading-relaxed">{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-foreground/40">
                Awaiting buyer details load...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Buyer Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#070b1f] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="font-display text-lg font-bold text-[#00E5FF]">Register Buyer Profile</h3>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1 text-foreground/60 hover:bg-white/5 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateBuyer} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-foreground/50 font-display">Buyer Company Name</label>
                <input 
                  type="text" 
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[#00E5FF]/60 text-white"
                  placeholder="e.g. Stark Industries"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={creating}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-foreground/50 font-display">Repayment Score (0-100)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="100"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[#00E5FF]/60 text-white"
                  placeholder="e.g. 85"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  disabled={creating}
                />
                <p className="text-[10px] text-foreground/50 mt-1">100 represents the lowest historical payment delay risk.</p>
              </div>
              <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border-white/10 hover:bg-white/5"
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] text-[#050816] font-semibold"
                  disabled={creating}
                >
                  {creating ? "Saving..." : "Create Profile"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashShell>
  );
}

export default Buyers;

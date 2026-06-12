import { useState, useEffect } from "react";
import { DashShell } from "../components/dashboard/DashShell.js";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { apiClient } from "../lib/apiClient.js";
import { toast } from "sonner";

interface Negotiation {
  id: string;
  invoiceId: string;
  buyerName: string;
  amount: number;
  originalTerms: string;
  recommendation: {
    originalTerms: string;
    suggestedTerms: string;
    earlyPaymentDiscount: string;
    workingCapitalImpact: number;
    rationale: string;
  };
  createdAt: string;
}

export function Negotiations() {
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [selectedNegotiation, setSelectedNegotiation] = useState<Negotiation | null>(null);
  const [messages, setMessages] = useState<Array<{ who: "buyer" | "you" | "ai"; t: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [drafting, setDrafting] = useState(false);

  const fetchNegotiations = async () => {
    try {
      const res = await apiClient.get<any>("/api/negotiations");
      if (res.status === "success" && res.data) {
        setNegotiations(res.data);
        if (res.data.length > 0 && !selectedNegotiation) {
          setSelectedNegotiation(res.data[0]);
        }
      }
    } catch (err: any) {
      toast.error("Failed to load negotiations: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNegotiations();
  }, []);

  // Update messages when selected negotiation changes
  useEffect(() => {
    if (selectedNegotiation) {
      const rec = selectedNegotiation.recommendation;
      setMessages([
        { 
          who: "buyer", 
          t: `We can offer ${selectedNegotiation.originalTerms} terms on this invoice of $${selectedNegotiation.amount.toLocaleString()}. Standard tier.` 
        },
        { 
          who: "ai", 
          t: `Recommendation: Counter with ${rec.suggestedTerms} offering early-pay terms "${rec.earlyPaymentDiscount}". Rationale: ${rec.rationale} Frees up ~$${rec.workingCapitalImpact.toLocaleString()} in liquid cash.` 
        }
      ]);
    } else {
      setMessages([
        { who: "buyer", t: "Please select an active negotiation log from the sidebar or upload a contract to initiate terms optimization." }
      ]);
    }
  }, [selectedNegotiation]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsgs = [...messages, { who: "you", t: chatInput }];
    setMessages(newMsgs as any);
    setChatInput("");

    // Simulate buyer typing back after a second
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { who: "buyer", t: "We have received your payment proposal. Reviewing internally and will follow up with our treasury team." }
      ]);
    }, 1500);
  };

  const handleAIDraft = () => {
    if (!selectedNegotiation) return;
    setDrafting(true);
    setTimeout(() => {
      const rec = selectedNegotiation.recommendation;
      setChatInput(`Hi, regarding this invoice, we would like to request ${rec.suggestedTerms} terms. To support this, we can offer a ${rec.earlyPaymentDiscount} discount. Let us know if this works.`);
      setDrafting(false);
      toast.success("AI draft populated into text box!");
    }, 800);
  };

  return (
    <DashShell title="Negotiations">
      {loading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00E5FF] border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Conversation list */}
          <div className="lg:col-span-1 rounded-2xl glass p-3 h-fit">
            <div className="font-display text-xs uppercase tracking-widest text-foreground/60 px-2 py-2 border-b border-white/5 mb-2">
              Active Logs ({negotiations.length})
            </div>
            {negotiations.length === 0 ? (
              <div className="text-xs text-foreground/40 p-4 text-center">
                No active terms negotiations. Create an invoice or contract to run optimization.
              </div>
            ) : (
              <div className="space-y-1">
                {negotiations.map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => setSelectedNegotiation(c)}
                    className={`rounded-xl p-3 cursor-pointer transition ${
                      selectedNegotiation?.id === c.id 
                        ? "bg-gradient-to-r from-[#00E5FF]/15 to-[#7B61FF]/10 border border-[#00E5FF]/30" 
                        : "hover:bg-white/5"
                    }`}
                  >
                    <div className="text-sm font-semibold text-white">{c.buyerName}</div>
                    <div className="text-xs text-foreground/55 flex justify-between mt-1">
                      <span>Value: ${c.amount.toLocaleString()}</span>
                      <span className="text-[#00E5FF]">{c.recommendation.suggestedTerms}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat Panel */}
          <div className="lg:col-span-2 rounded-2xl glass flex flex-col h-[600px] overflow-hidden">
            <div className="border-b border-white/5 p-4 bg-white/[0.01]">
              <div className="font-display font-bold text-white">
                {selectedNegotiation ? `${selectedNegotiation.buyerName} · Terms Revision` : "Select Active Session"}
              </div>
              <div className="text-xs text-foreground/55 mt-0.5">
                {selectedNegotiation ? "Negotiation active · Powered by Llama 3" : "Awaiting selection"}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <Bubble key={i} who={m.who} text={m.t} />
              ))}
            </div>

            {/* Terms breakdown footer */}
            {selectedNegotiation && (
              <div className="border-t border-white/5 p-4 grid gap-3 sm:grid-cols-2 bg-white/[0.01]">
                <div className="rounded-xl glass p-3 text-xs">
                  <div className="text-[10px] uppercase tracking-widest text-foreground/50">Stated Terms</div>
                  <div className="mt-1 font-semibold text-white">{selectedNegotiation.originalTerms}</div>
                </div>
                <div className="rounded-xl p-3 border border-[#00FFA3]/40 bg-[#00FFA3]/5 text-xs">
                  <div className="text-[10px] uppercase tracking-widest text-[#00FFA3]">AI Optimization recommendation</div>
                  <div className="mt-1 font-semibold text-[#00FFA3]">
                    {selectedNegotiation.recommendation.suggestedTerms} ({selectedNegotiation.recommendation.earlyPaymentDiscount})
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="border-t border-white/5 p-3 flex gap-2 bg-white/[0.02]">
              <input 
                className="flex-1 rounded-xl bg-white/5 px-4 py-2.5 text-sm outline-none placeholder:text-foreground/40 focus:bg-white/10 text-white" 
                placeholder="Type your counter proposal or draft reply..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={!selectedNegotiation}
              />
              <button 
                type="button" 
                onClick={handleAIDraft}
                disabled={!selectedNegotiation || drafting}
                className="rounded-xl glass px-3 hover:bg-white/10 text-[#00FFA3] disabled:opacity-40"
                title="Draft reply using AI recommendations"
              >
                {drafting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </button>
              <button 
                type="submit" 
                disabled={!selectedNegotiation || !chatInput.trim()}
                className="rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] px-4 text-[#050816] font-semibold disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </DashShell>
  );
}

function Bubble({ who, text }: { who: "buyer" | "you" | "ai"; text: string }) {
  if (who === "ai") {
    return (
      <div className="rounded-2xl border border-[#00FFA3]/30 bg-[#00FFA3]/5 p-3.5 text-xs max-w-2xl mx-auto font-sans leading-relaxed text-white">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#00FFA3] mb-1 font-bold">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" /> AI Negotiation Recommendation
        </div>
        {text}
      </div>
    );
  }
  if (who === "you") {
    return (
      <div className="flex justify-end">
        <div className="rounded-2xl rounded-tr-sm bg-gradient-to-br from-[#00E5FF]/20 to-[#7B61FF]/20 border border-[#00E5FF]/30 p-3 text-xs max-w-md text-white font-sans">
          {text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex">
      <div className="rounded-2xl rounded-tl-sm bg-white/5 p-3 text-xs max-w-md text-foreground/80 font-sans leading-relaxed">
        {text}
      </div>
    </div>
  );
}

export default Negotiations;

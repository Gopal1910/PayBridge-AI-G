import { useState, useEffect } from "react";
import { DashShell } from "../components/dashboard/DashShell.js";
import { Search, Filter, Download, MoreHorizontal, Plus, X } from "lucide-react";
import { Button } from "../components/ui/button.js";
import { apiClient } from "../lib/apiClient.js";
import { toast } from "sonner";

interface Invoice {
  id: string;
  buyerName: string;
  amount: number;
  dueDate: string;
  status: "pending" | "paid" | "overdue" | "dispute" | "negotiating";
}

export function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  
  // Invoice Create Modal State
  const [showModal, setShowModal] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchInvoices = async () => {
    try {
      const res = await apiClient.get<any>("/api/invoices");
      if (res.status === "success" && res.data) {
        setInvoices(res.data);
      }
    } catch (err: any) {
      toast.error("Failed to load invoices: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !amount || !dueDate) {
      toast.error("Please fill in all invoice details.");
      return;
    }

    setCreating(true);
    try {
      // Auto register or resolve buyer inside backend upload/services,
      // here we pass a generated buyerId or buyer name
      const res = await apiClient.post<any>("/api/invoices", {
        buyerId: `buyer-${Math.random().toString(36).substring(2, 6)}`,
        buyerName,
        amount: parseFloat(amount),
        dueDate,
        status: "pending"
      });

      if (res.status === "success") {
        toast.success("Invoice created successfully!");
        setShowModal(false);
        setBuyerName("");
        setAmount("");
        setDueDate("");
        // Reload list
        fetchInvoices();
      }
    } catch (err: any) {
      toast.error("Failed to create invoice: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: Invoice["status"]) => {
    try {
      const res = await apiClient.put<any>(`/api/invoices/${id}`, { status: newStatus });
      if (res.status === "success") {
        toast.success(`Invoice status updated to ${newStatus}`);
        fetchInvoices();
      }
    } catch (err: any) {
      toast.error("Failed to update status: " + err.message);
    }
  };

  // Filters and search logic
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inv.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "All" || inv.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: Invoice["status"]) => {
    switch (status.toLowerCase()) {
      case "paid": return "#00FFA3";
      case "pending": return "#00E5FF";
      case "overdue": return "#FF4D6D";
      case "negotiating": return "#7B61FF";
      default: return "#ffffff";
    }
  };

  return (
    <DashShell title="Invoices">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl glass px-3 py-2 flex-1 min-w-[200px] max-w-md">
          <Search className="h-4 w-4 text-foreground/40" />
          <input 
            className="bg-transparent text-sm outline-none placeholder:text-foreground/40 w-full text-white" 
            placeholder="Search invoices by code or buyer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {["All", "Paid", "Pending", "Overdue", "Negotiating"].map((f) => (
          <button 
            key={f} 
            onClick={() => setFilterStatus(f)}
            className={`rounded-xl px-3 py-2 text-xs font-medium border transition ${
              filterStatus === f 
                ? "border-[#00E5FF]/50 bg-[#00E5FF]/10 text-[#00E5FF]" 
                : "border-white/10 glass text-foreground/70 hover:bg-white/10"
            }`}
          >
            {f}
          </button>
        ))}

        <Button 
          onClick={() => setShowModal(true)}
          className="ml-auto rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] text-[#050816] font-semibold"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Invoice
        </Button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00E5FF] border-t-transparent"></div>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl glass">
          {filteredInvoices.length === 0 ? (
            <div className="p-8 text-center text-foreground/40">
              No invoices match the selected filter query. Create one to get started!
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-widest text-foreground/50">
                <tr>
                  <th className="p-4">Invoice</th>
                  <th className="p-4">Buyer</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map(r => {
                  const statusColor = getStatusColor(r.status);
                  return (
                    <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                      <td className="p-4 font-mono text-[#00E5FF]">INV-{r.id.substring(0, 6).toUpperCase()}</td>
                      <td className="p-4 font-semibold">{r.buyerName}</td>
                      <td className="p-4 text-right font-medium">${r.amount.toLocaleString()}</td>
                      <td className="p-4 text-foreground/70">{r.dueDate}</td>
                      <td className="p-4">
                        <span 
                          className="rounded-full px-2.5 py-1 text-xs font-medium" 
                          style={{ 
                            background: `${statusColor}22`, 
                            color: statusColor, 
                            boxShadow: `0 0 12px ${statusColor}33` 
                          }}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="p-4 text-right relative">
                        <div className="flex justify-end gap-2">
                          {r.status !== "paid" && (
                            <button 
                              onClick={() => handleUpdateStatus(r.id, "paid")}
                              className="text-xs border border-[#00FFA3]/30 px-2 py-1 rounded bg-[#00FFA3]/10 text-[#00FFA3] hover:bg-[#00FFA3]/20"
                            >
                              Mark Paid
                            </button>
                          )}
                          {r.status === "pending" && (
                            <button 
                              onClick={() => handleUpdateStatus(r.id, "negotiating")}
                              className="text-xs border border-[#7B61FF]/30 px-2 py-1 rounded bg-[#7B61FF]/10 text-[#7B61FF] hover:bg-[#7B61FF]/20"
                            >
                              Negotiate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Invoice Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#070b1f] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="font-display text-lg font-bold text-[#00E5FF]">Create New Invoice</h3>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1 text-foreground/60 hover:bg-white/5 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateInvoice} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-foreground/50 font-display">Buyer Name</label>
                <input 
                  type="text" 
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[#00E5FF]/60 text-white"
                  placeholder="e.g. Globex Corp"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  disabled={creating}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-foreground/50 font-display">Amount ($)</label>
                <input 
                  type="number" 
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[#00E5FF]/60 text-white"
                  placeholder="e.g. 15000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={creating}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-foreground/50 font-display">Due Date</label>
                <input 
                  type="date" 
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[#00E5FF]/60 text-white"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={creating}
                />
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
                  {creating ? "Creating..." : "Save Invoice"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashShell>
  );
}

export default Invoices;

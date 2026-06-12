import { useState, useEffect, useRef } from "react";
import { DashShell } from "../components/dashboard/DashShell.js";
import { Upload, FileText, ShieldAlert, ShieldCheck, Sparkles, Loader2 } from "lucide-react";
import { apiClient } from "../lib/apiClient.js";
import { toast } from "sonner";

interface ContractClause {
  title: string;
  text: string;
  risk: "low" | "medium" | "high";
  impact: string;
}

interface Contract {
  id: string;
  pdfUrl: string;
  fileName: string;
  analysis: {
    buyerName: string;
    terms: string;
    amount: number;
    risk: "low" | "medium" | "high";
    recommended: string;
    clauses: ContractClause[];
    summary: string;
  };
  createdAt: string;
}

export function Contracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchContracts = async () => {
    try {
      const res = await apiClient.get<any>("/api/contracts");
      if (res.status === "success" && res.data) {
        setContracts(res.data);
        if (res.data.length > 0 && !selectedContract) {
          setSelectedContract(res.data[0]);
        }
      }
    } catch (err: any) {
      toast.error("Failed to load contracts: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are supported for contract parsing.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      toast.info("Uploading PDF. Extracting OCR and analyzing terms...", { duration: 6000 });
      const res = await apiClient.upload<any>("/api/upload/contract", formData);
      if (res.status === "success") {
        toast.success("Contract successfully uploaded and analyzed!");
        setSelectedContract(res.data);
        fetchContracts();
      }
    } catch (err: any) {
      toast.error("Contract upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
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
    <DashShell title="Contracts">
      {loading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00E5FF] border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Upload zone */}
          <div className="lg:col-span-1 space-y-4">
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="neon-border rounded-2xl p-8 text-center transition hover:scale-[1.01] bg-white/[0.01] cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
                accept="application/pdf"
                disabled={uploading}
              />
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#00E5FF] to-[#7B61FF] glow-cyan">
                {uploading ? (
                  <Loader2 className="h-6 w-6 text-[#050816] animate-spin" />
                ) : (
                  <Upload className="h-6 w-6 text-[#050816]" />
                )}
              </div>
              <div className="mt-4 font-display text-sm font-bold">
                {uploading ? "Analyzing Contract..." : "Drop contract PDF"}
              </div>
              <div className="mt-1 text-xs text-foreground/55">
                {uploading ? "Running OCR & Llama 3..." : "or click to browse · Max 10MB"}
              </div>
            </div>

            <div className="rounded-2xl glass p-4">
              <div className="font-display text-xs uppercase tracking-widest text-foreground/60 mb-3">Contracts list</div>
              {contracts.length === 0 ? (
                <div className="text-xs text-foreground/40 p-4 text-center">No contracts parsed yet.</div>
              ) : (
                <div className="space-y-1">
                  {contracts.map(c => (
                    <div 
                      key={c.id} 
                      onClick={() => setSelectedContract(c)}
                      className={`flex items-center gap-3 rounded-lg p-2.5 cursor-pointer transition ${
                        selectedContract?.id === c.id ? "bg-white/10 text-white" : "hover:bg-white/5 text-foreground/75"
                      }`}
                    >
                      <FileText className="h-4 w-4 text-[#00E5FF]" />
                      <div className="flex-1 text-xs truncate font-semibold">{c.fileName}</div>
                      <div 
                        className="h-2 w-2 rounded-full" 
                        style={{ 
                          backgroundColor: getRiskColor(c.analysis.risk),
                          boxShadow: `0 0 8px ${getRiskColor(c.analysis.risk)}` 
                        }} 
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* PDF preview info */}
          <div className="lg:col-span-1 rounded-2xl glass p-4">
            <div className="font-display text-xs uppercase tracking-widest text-foreground/60 mb-3">
              Preview · {selectedContract?.fileName || "Select Contract"}
            </div>
            {selectedContract ? (
              <div className="aspect-[3/4] rounded-xl bg-gradient-to-br from-white/5 to-white/2 border border-white/5 p-5 text-[10px] leading-relaxed text-foreground/70 overflow-hidden relative font-sans">
                <div className="font-display text-sm text-white mb-2 uppercase tracking-wide font-black">
                  {selectedContract.analysis.buyerName || "PAYMENT AGREEMENT"}
                </div>
                <div className="text-[9px] text-foreground/40 mb-3 border-b border-white/5 pb-2">
                  Uploaded: {new Date(selectedContract.createdAt).toLocaleString()}
                </div>
                <p className="mt-2 text-white/90 italic">"{selectedContract.analysis.summary}"</p>
                <div className="mt-4 p-2.5 rounded border border-[#00E5FF]/20 bg-[#00E5FF]/5 text-xs text-white">
                  <strong>Stated Payment Term:</strong> {selectedContract.analysis.terms}
                </div>
                <div className="mt-2 p-2.5 rounded border border-[#7B61FF]/20 bg-[#7B61FF]/5 text-xs text-white">
                  <strong>Estimated Contract Value:</strong> ${selectedContract.analysis.amount.toLocaleString()}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#050816] to-transparent" />
              </div>
            ) : (
              <div className="aspect-[3/4] rounded-xl border border-dashed border-white/10 flex items-center justify-center text-xs text-foreground/40">
                Upload a contract to view its parameters.
              </div>
            )}
          </div>

          {/* AI result panel */}
          <div className="lg:col-span-1 rounded-2xl glass p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-[#00FFA3]" />
              <div className="font-display text-xs uppercase tracking-widest text-[#00FFA3]">AI Legal Evaluation</div>
            </div>

            {selectedContract ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] mb-4">
                  <div className="text-xs text-foreground/60 uppercase tracking-wide">Overall risk level</div>
                  <div 
                    className="mt-1 font-display text-xl font-bold uppercase" 
                    style={{ color: getRiskColor(selectedContract.analysis.risk) }}
                  >
                    {selectedContract.analysis.risk} Risk
                  </div>
                  <div className="text-xs text-foreground/60 mt-1">
                    AI recommendation: <strong>{selectedContract.analysis.recommended}</strong>
                  </div>
                </div>

                {selectedContract.analysis.clauses.map((clause, idx) => {
                  const clauseColor = getRiskColor(clause.risk);
                  return (
                    <div 
                      key={idx} 
                      className="rounded-xl border p-3" 
                      style={{ borderColor: `${clauseColor}33`, background: `${clauseColor}0b` }}
                    >
                      <div className="flex items-center gap-2">
                        {clause.risk === "high" || clause.risk === "medium" ? (
                          <ShieldAlert className="h-4 w-4" style={{ color: clauseColor }} />
                        ) : (
                          <ShieldCheck className="h-4 w-4" style={{ color: clauseColor }} />
                        )}
                        <div className="text-xs font-bold text-white uppercase">{clause.title}</div>
                      </div>
                      <p className="mt-1.5 text-xs text-white/80 line-clamp-2 italic">"{clause.text}"</p>
                      <p className="mt-1.5 text-[11px] text-foreground/65 border-t border-white/5 pt-1">
                        <strong>Impact:</strong> {clause.impact}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-foreground/40 p-8 text-center">
                No contract analysis selected.
              </div>
            )}
          </div>
        </div>
      )}
    </DashShell>
  );
}

export default Contracts;

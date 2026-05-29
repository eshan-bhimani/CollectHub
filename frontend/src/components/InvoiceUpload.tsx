"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getToken } from "@/lib/auth";

// Mirror the base-URL resolution used by lib/api.ts: prefer the explicit
// NEXT_PUBLIC_API_URL when set, otherwise talk to the local backend directly.
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface PSAStatus {
  connected: boolean;
  email: string | null;
  token_expires: string | null;
}

interface ImportStatus {
  id: string;
  invoice_number: string;
  auction_name: string;
  items_count: number;
  items_synced: number;
  items_pending: number;
  status: string;
  grand_total: number;
}

function authHeaders(): Record<string, string> {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// Missing or expired token must never silently fail — send the user to login.
function goToLogin(): void {
  if (typeof window !== "undefined") window.location.href = "/login";
}

export default function InvoiceUpload() {
  const [psaStatus, setPsaStatus] = useState<PSAStatus | null>(null);
  const [psaEmail, setPsaEmail] = useState("");
  const [psaPassword, setPsaPassword] = useState("");
  const [psaLoading, setPsaLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [importStatus, setImportStatus] = useState<ImportStatus | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPSAStatus = useCallback(async () => {
    if (!getToken()) {
      goToLogin();
      return;
    }
    try {
      const res = await fetch(`${API}/api/psa/status`, {
        headers: authHeaders(),
      });
      if (res.status === 401) {
        goToLogin();
        return;
      }
      if (res.ok) setPsaStatus(await res.json());
    } catch (err) {
      console.error("fetchPSAStatus failed:", err);
    }
  }, []);

  useEffect(() => {
    fetchPSAStatus();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchPSAStatus]);

  const handlePSAConnect = async () => {
    if (!psaEmail || !psaPassword) return;
    if (!getToken()) {
      goToLogin();
      return;
    }
    setPsaLoading(true);
    try {
      const res = await fetch(`${API}/api/psa/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ email: psaEmail, password: psaPassword }),
      });
      if (res.status === 401 && !getToken()) {
        goToLogin();
        return;
      }
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        // Optimistically flip to the connected state so the email + green
        // badge show immediately and the credentials form is hidden.
        setPsaStatus({
          connected: true,
          email: data.email ?? psaEmail,
          token_expires: null,
        });
        setPsaPassword("");
        fetchPSAStatus();
        showToast("PSA account connected");
      } else {
        const err = await res.json().catch(() => ({ detail: "Connection failed" }));
        showToast(err.detail);
      }
    } catch (err) {
      console.error("PSA connect failed:", err);
      showToast("Connection error");
    }
    setPsaLoading(false);
  };

  const handlePSADisconnect = async () => {
    if (!getToken()) {
      goToLogin();
      return;
    }
    try {
      const res = await fetch(`${API}/api/psa/disconnect`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.status === 401) {
        goToLogin();
        return;
      }
    } catch (err) {
      console.error("PSA disconnect failed:", err);
    }
    setPsaStatus({ connected: false, email: null, token_expires: null });
    showToast("PSA account disconnected");
  };

  const startPolling = (importId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API}/api/invoice/status/${importId}`, {
          headers: authHeaders(),
        });
        if (res.status === 401) {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          goToLogin();
          return;
        }
        if (res.ok) {
          const data: ImportStatus = await res.json();
          setImportStatus(data);
          if (data.status !== "processing") {
            if (pollRef.current) clearInterval(pollRef.current);
            pollRef.current = null;
          }
        }
      } catch (err) {
        console.error("Poll import status failed:", err);
      }
    }, 3000);
  };

  const uploadPDF = async (file: File) => {
    if (!getToken()) {
      goToLogin();
      return;
    }
    setUploading(true);
    setImportStatus(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API}/api/invoice/upload`, {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });
      if (res.status === 401) {
        setUploading(false);
        goToLogin();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setImportStatus({
          id: data.import_id,
          invoice_number: "",
          auction_name: "",
          items_count: data.items_count,
          items_synced: 0,
          items_pending: 0,
          status: "processing",
          grand_total: 0,
        });
        startPolling(data.import_id);
      } else {
        const err = await res.json().catch(() => ({ detail: "Upload failed" }));
        showToast(err.detail);
      }
    } catch (err) {
      console.error("Invoice upload failed:", err);
      showToast("Upload error");
    }
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") uploadPDF(file);
    else showToast("Please drop a PDF file");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadPDF(file);
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-white/10 backdrop-blur-md border border-white/10 text-white/90 text-sm px-4 py-2.5 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {/* PSA Connection */}
      <div className="glass-hero rounded-2xl p-5">
        <h3 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">
          PSA Account
        </h3>
        {psaStatus?.connected ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
                Connected
              </span>
              <span className="text-white/70 text-sm">{psaStatus.email}</span>
            </div>
            <button
              onClick={handlePSADisconnect}
              className="text-white/30 hover:text-red-400/80 text-xs transition-colors"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-white/40 text-sm">
              Connect your PSA account to auto-verify certs, pull card images,
              and sync to your Set Registry.
            </p>
            <input
              type="email"
              placeholder="PSA email"
              value={psaEmail}
              onChange={(e) => setPsaEmail(e.target.value)}
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/30 focus:outline-none focus:border-white/20"
            />
            <input
              type="password"
              placeholder="PSA password"
              value={psaPassword}
              onChange={(e) => setPsaPassword(e.target.value)}
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/30 focus:outline-none focus:border-white/20"
            />
            <div className="flex items-center justify-between">
              <button
                onClick={handlePSAConnect}
                disabled={psaLoading || !psaEmail || !psaPassword}
                className="px-5 py-2 rounded-xl bg-white/[0.08] border border-white/10 text-white/80 text-sm font-medium hover:bg-white/[0.12] transition-colors disabled:opacity-50"
              >
                {psaLoading ? "Connecting..." : "Connect PSA Account"}
              </button>
              <span className="text-white/25 text-[10px]">
                Encrypted &amp; never stored as plaintext
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Upload */}
      <div className="glass-hero rounded-2xl p-5">
        <h3 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">
          Invoice Import
        </h3>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-[#C8102E]/60 bg-[#C8102E]/5"
              : "border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-3 text-white/30"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          <p className="text-white/50 text-sm">
            {uploading
              ? "Uploading..."
              : "Drop an auction invoice PDF or click to browse"}
          </p>
          <p className="text-white/25 text-xs mt-1">
            Supports Sirius Auctions format
          </p>
        </div>

        {/* Import status */}
        {importStatus && (
          <div className="mt-4 p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/70 text-sm font-medium">
                {importStatus.auction_name || "Processing invoice..."}
              </span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  importStatus.status === "complete"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : importStatus.status === "failed"
                    ? "bg-red-500/20 text-red-400"
                    : importStatus.status === "partial"
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-white/10 text-white/50"
                }`}
              >
                {importStatus.status}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-[#C8102E] to-[#e8354a] rounded-full transition-all duration-500"
                style={{
                  width: `${
                    importStatus.items_count > 0
                      ? ((importStatus.items_synced + importStatus.items_pending) /
                          importStatus.items_count) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>

            <div className="flex gap-4 text-xs text-white/40">
              <span>{importStatus.items_count} total</span>
              <span className="text-emerald-400/70">
                {importStatus.items_synced} synced
              </span>
              {importStatus.items_pending > 0 && (
                <span className="text-amber-400/70">
                  {importStatus.items_pending} need review
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

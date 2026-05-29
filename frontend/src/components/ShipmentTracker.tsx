"use client";

import { useCallback, useEffect, useState } from "react";
import { getToken } from "@/lib/auth";

// Mirror the base-URL resolution used by lib/api.ts: prefer the explicit
// NEXT_PUBLIC_API_URL when set, otherwise talk to the local backend directly.
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Shipment {
  id: string;
  tracking_number: string;
  carrier: string;
  current_status: string | null;
  current_status_detail: string | null;
  eta: string | null;
  destination: string;
  delivered_at: string | null;
  is_active: boolean;
  created_at: string | null;
}

function authHeaders(): Record<string, string> {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// Missing or expired token must never silently fail — send the user to login.
function goToLogin(): void {
  if (typeof window !== "undefined") window.location.href = "/login";
}

const CARRIER_LABELS: Record<string, string> = {
  usps: "USPS",
  ups: "UPS",
  fedex: "FedEx",
};

const STATUS_COLORS: Record<string, string> = {
  DELIVERED: "bg-emerald-500/20 text-emerald-400",
  TRANSIT: "bg-amber-500/20 text-amber-400",
  OUT_FOR_DELIVERY: "bg-blue-500/20 text-blue-400",
  RETURNED: "bg-orange-500/20 text-orange-400",
  FAILURE: "bg-red-500/20 text-red-400",
};

const DESTINATION_LABELS: Record<string, string> = {
  fanatics_vault: "Fanatics Vault",
  psa_vault: "PSA Vault",
  other: "Other",
};

const PROGRESS_STEPS = ["Created", "In Transit", "Out for Delivery", "Delivered"];

function progressIndex(status: string | null): number {
  if (!status) return 0;
  if (status === "DELIVERED") return 3;
  if (status === "OUT_FOR_DELIVERY") return 2;
  if (status === "TRANSIT") return 1;
  return 0;
}

export default function ShipmentTracker() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchShipments = useCallback(async () => {
    if (!getToken()) {
      goToLogin();
      return;
    }
    try {
      const res = await fetch(`${API}/api/shipment/list`, {
        headers: authHeaders(),
      });
      if (res.status === 401) {
        goToLogin();
        return;
      }
      if (res.ok) setShipments(await res.json());
    } catch (err) {
      console.error("fetchShipments failed:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  const handleRefresh = async (id: string) => {
    if (!getToken()) {
      goToLogin();
      return;
    }
    setRefreshingId(id);
    try {
      const res = await fetch(`${API}/api/shipment/${id}/refresh`, {
        method: "POST",
        headers: authHeaders(),
      });
      if (res.status === 401) {
        setRefreshingId(null);
        goToLogin();
        return;
      }
      if (res.ok) {
        const updated: Shipment = await res.json();
        setShipments((prev) =>
          prev.map((s) => (s.id === id ? updated : s))
        );
        showToast("Tracking updated");
      }
    } catch (err) {
      console.error("Refresh failed:", err);
      showToast("Refresh failed");
    }
    setRefreshingId(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="glass-hero rounded-2xl p-5 animate-pulse h-36"
          />
        ))}
      </div>
    );
  }

  if (shipments.length === 0) {
    return (
      <div className="glass-hero rounded-2xl p-8 text-center">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto mb-3 text-white/20"
        >
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
        <p className="text-white/40 text-sm">No shipments yet</p>
        <p className="text-white/25 text-xs mt-1">
          Import an invoice with a tracking number to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-white/10 backdrop-blur-md border border-white/10 text-white/90 text-sm px-4 py-2.5 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {shipments.map((s) => {
        const step = progressIndex(s.current_status);
        const statusColor =
          STATUS_COLORS[s.current_status ?? ""] ?? "bg-white/10 text-white/50";

        return (
          <div key={s.id} className="glass-hero rounded-2xl p-5 space-y-4">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-white/80">
                  {s.tracking_number}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/[0.08] text-white/50 border border-white/[0.06]">
                  {CARRIER_LABELS[s.carrier] ?? s.carrier}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#C8102E]/10 text-[#e8354a]/80 border border-[#C8102E]/20">
                  {DESTINATION_LABELS[s.destination] ?? s.destination}
                </span>
              </div>
              <button
                onClick={() => handleRefresh(s.id)}
                disabled={refreshingId === s.id}
                className="text-xs text-white/40 hover:text-white/70 transition-colors disabled:opacity-40"
              >
                {refreshingId === s.id ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {/* Status badge + ETA */}
            <div className="flex items-center gap-3">
              {s.current_status && (
                <span
                  className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColor}`}
                >
                  {s.current_status.replace(/_/g, " ")}
                </span>
              )}
              {s.eta && (
                <span className="text-white/30 text-xs">
                  ETA:{" "}
                  {new Date(s.eta).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
              {s.current_status_detail && (
                <span className="text-white/25 text-xs truncate max-w-[200px]">
                  {s.current_status_detail}
                </span>
              )}
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-1">
              {PROGRESS_STEPS.map((label, i) => (
                <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
                  <div
                    className={`w-full h-1.5 rounded-full transition-all duration-500 ${
                      i <= step
                        ? "bg-gradient-to-r from-[#C8102E] to-[#e8354a]"
                        : "bg-white/[0.06]"
                    }`}
                  />
                  <span
                    className={`text-[10px] ${
                      i <= step ? "text-white/60" : "text-white/20"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { getToken } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface DriveStatus {
  connected: boolean;
  folders_watched: number;
}

interface DriveFolder {
  id: string;
  name: string;
}

interface WatchedFolder {
  id: string;
  folder_id: string;
  folder_name: string;
  last_polled_at: string | null;
}

function authHeaders(): Record<string, string> {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export default function DriveIntegration() {
  const [status, setStatus] = useState<DriveStatus | null>(null);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [watched, setWatched] = useState<WatchedFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(true);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/drive/status`, {
        headers: authHeaders(),
      });
      if (res.ok) {
        const data: DriveStatus = await res.json();
        setStatus(data);
        return data;
      }
    } catch {}
    return null;
  }, []);

  const fetchFolders = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/drive/folders`, {
        headers: authHeaders(),
      });
      if (res.ok) setFolders(await res.json());
    } catch {}
  }, []);

  const fetchWatched = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/drive/watched`, {
        headers: authHeaders(),
      });
      if (res.ok) setWatched(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const driveParam = params.get("drive");
    if (driveParam) {
      if (driveParam === "connected") showToast("Google Drive connected!");
      else if (driveParam === "error") showToast("Google Drive connection failed");
      params.delete("drive");
      const newUrl =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : "");
      window.history.replaceState({}, "", newUrl);
      setCollapsed(false);
    }

    fetchStatus().then((s) => {
      if (s?.connected) {
        fetchFolders();
        fetchWatched();
        if (driveParam === "connected") setCollapsed(false);
      }
    });
  }, [fetchStatus, fetchFolders, fetchWatched]);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/drive/auth`, {
        headers: authHeaders(),
      });
      if (res.ok) {
        const { auth_url } = await res.json();
        window.location.href = auth_url;
      } else {
        showToast("Failed to start Google Drive auth");
      }
    } catch {
      showToast("Connection error");
    }
    setLoading(false);
  };

  const handleDisconnect = async () => {
    await fetch(`${API}/api/drive/disconnect`, { headers: authHeaders() });
    setStatus({ connected: false, folders_watched: 0 });
    setFolders([]);
    setWatched([]);
    showToast("Google Drive disconnected");
  };

  const handleWatch = async () => {
    if (!selectedFolder) return;
    const folder = folders.find((f) => f.id === selectedFolder);
    if (!folder) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/drive/watch`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          folder_id: folder.id,
          folder_name: folder.name,
        }),
      });
      if (res.ok) {
        setSelectedFolder("");
        fetchWatched();
        showToast(`Watching "${folder.name}"`);
      } else {
        const err = await res.json().catch(() => ({ detail: "Failed" }));
        showToast(err.detail);
      }
    } catch {
      showToast("Connection error");
    }
    setLoading(false);
  };

  const handleUnwatch = async (folderId: string) => {
    await fetch(`${API}/api/drive/watch/${folderId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    fetchWatched();
  };

  if (!getToken()) return null;

  return (
    <div className="relative">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-white/10 backdrop-blur-md border border-white/10 text-white/90 text-sm px-4 py-2.5 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.07] transition-colors text-sm"
      >
        <span className="flex items-center gap-2 text-white/50 font-medium">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          Or sync from Google Drive
          {status?.connected && (
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
          )}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-white/30 transition-transform duration-200 ${
            collapsed ? "" : "rotate-180"
          }`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {!collapsed && (
        <div className="mt-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-4">
          {!status?.connected ? (
            <div className="text-center py-4">
              <p className="text-white/40 text-sm mb-4">
                Connect your Google Drive to auto-crop card images from watched
                folders.
              </p>
              <button
                onClick={handleConnect}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.08] border border-white/10 text-white/80 text-sm font-medium hover:bg-white/[0.12] transition-colors disabled:opacity-50"
              >
                {loading ? (
                  "Connecting..."
                ) : (
                  <>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                      <polyline points="10 17 15 12 10 7" />
                      <line x1="15" y1="12" x2="3" y2="12" />
                    </svg>
                    Connect Google Drive
                  </>
                )}
              </button>
            </div>
          ) : (
            <>
              {/* Folder picker */}
              <div>
                <label className="block text-white/40 text-xs font-medium uppercase tracking-wider mb-2">
                  Watch a folder
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedFolder}
                    onChange={(e) => setSelectedFolder(e.target.value)}
                    className="flex-1 bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-white/20"
                  >
                    <option value="">Select a folder...</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleWatch}
                    disabled={!selectedFolder || loading}
                    className="px-4 py-2 rounded-lg bg-[#C8102E]/80 text-white text-sm font-medium hover:bg-[#C8102E] transition-colors disabled:opacity-40"
                  >
                    Watch
                  </button>
                </div>
              </div>

              {/* Watched folders */}
              {watched.length > 0 && (
                <div>
                  <label className="block text-white/40 text-xs font-medium uppercase tracking-wider mb-2">
                    Watched folders
                  </label>
                  <div className="space-y-1.5">
                    {watched.map((w) => (
                      <div
                        key={w.id}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.05]"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-white/30 shrink-0"
                          >
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                          </svg>
                          <span className="text-white/70 text-sm truncate">
                            {w.folder_name}
                          </span>
                        </div>
                        <button
                          onClick={() => handleUnwatch(w.folder_id)}
                          className="text-white/30 hover:text-red-400 text-xs transition-colors shrink-0 ml-2"
                        >
                          Stop
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disconnect */}
              <div className="pt-1 border-t border-white/[0.05]">
                <button
                  onClick={handleDisconnect}
                  className="text-white/30 hover:text-red-400/80 text-xs transition-colors"
                >
                  Disconnect Google Drive
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
